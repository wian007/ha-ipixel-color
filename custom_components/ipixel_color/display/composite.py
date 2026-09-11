"""Display implementation that combines several panels into one screen."""
from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from PIL import Image

from ..exceptions import iPIXELError, iPIXELNotAvailableError
from .base import Display
from .layout import Layout, PanelSpec, Tile, compute_layout
from .panel import PanelDisplay

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class MemberSpec:
    """A member of a combined display."""

    key: str
    row: int
    col: int


class CompositeDisplay(Display):
    """Several panels acting as one large display.

    Panels are resolved lazily through ``resolver`` (a callable returning the
    :class:`PanelDisplay` for a member key, or ``None`` when that panel is not
    loaded). This keeps the group working when member panels are reloaded or
    temporarily unavailable.
    """

    def __init__(
        self,
        *,
        name: str,
        members: list[MemberSpec],
        resolver: Callable[[str], PanelDisplay | None],
    ) -> None:
        """Initialise the composite display."""
        self._name = name
        self._members = list(members)
        self._resolver = resolver
        self._listeners: list[Callable[[], None]] = []
        self._panel_unsubs: dict[str, Callable[[], None]] = {}

    # ------------------------------------------------------------------
    # Membership / layout
    # ------------------------------------------------------------------
    @property
    def members(self) -> list[MemberSpec]:
        """Return the configured members."""
        return list(self._members)

    def _resolve_all(self) -> dict[str, PanelDisplay]:
        found: dict[str, PanelDisplay] = {}
        for member in self._members:
            panel = self._resolver(member.key)
            if panel is not None:
                found[member.key] = panel
        # Make sure we forward connection changes of every resolved panel.
        for key, panel in found.items():
            if key not in self._panel_unsubs:
                self._panel_unsubs[key] = panel.add_listener(self._notify)
        return found

    @property
    def panels(self) -> list[PanelDisplay]:
        """Return the currently loaded member panels in layout order."""
        resolved = self._resolve_all()
        return [resolved[m.key] for m in sorted(self._members, key=lambda m: (m.row, m.col)) if m.key in resolved]

    @property
    def layout(self) -> Layout:
        """Return the pixel layout of all *known-size* member panels."""
        resolved = self._resolve_all()
        specs = [
            PanelSpec(key=m.key, row=m.row, col=m.col, width=p.width, height=p.height)
            for m in self._members
            if (p := resolved.get(m.key)) is not None and p.width and p.height
        ]
        return compute_layout(specs)

    def _tiles(self) -> list[tuple[Tile, PanelDisplay]]:
        resolved = self._resolve_all()
        layout = self.layout
        tiles = [(tile, resolved[tile.key]) for tile in layout.tiles if tile.key in resolved]
        if not tiles:
            raise iPIXELNotAvailableError(
                f"No panels of combined display '{self._name}' are available"
            )
        return tiles

    @property
    def name(self) -> str:
        """Return the display name."""
        return self._name

    @property
    def width(self) -> int:
        """Return the combined width."""
        return self.layout.width

    @property
    def height(self) -> int:
        """Return the combined height."""
        return self.layout.height

    @property
    def is_connected(self) -> bool:
        """Return True when every configured panel is loaded and connected."""
        resolved = self._resolve_all()
        return len(resolved) == len(self._members) and all(p.is_connected for p in resolved.values())

    @property
    def available(self) -> bool:
        """Return True when at least one panel with a known size is loaded."""
        return bool(self.layout.tiles)

    @property
    def missing_members(self) -> list[str]:
        """Return keys of members that are not loaded right now."""
        resolved = self._resolve_all()
        return [m.key for m in self._members if m.key not in resolved]

    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Subscribe to connection changes of any member."""
        self._listeners.append(listener)
        self._resolve_all()

        def _remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return _remove

    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    def shutdown(self) -> None:
        """Unsubscribe from member panels."""
        for unsub in self._panel_unsubs.values():
            unsub()
        self._panel_unsubs.clear()
        self._listeners.clear()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    async def _gather(self, calls: list[tuple[str, Any]]) -> None:
        """Run coroutines concurrently; log partial failures, raise if all fail."""
        if not calls:
            raise iPIXELNotAvailableError(
                f"No panels of combined display '{self._name}' are available"
            )
        results = await asyncio.gather(*(coro for _, coro in calls), return_exceptions=True)
        failures = [(name, err) for (name, _), err in zip(calls, results) if isinstance(err, BaseException)]
        for name, err in failures:
            if isinstance(err, asyncio.CancelledError):
                raise err
            _LOGGER.warning("Panel '%s' of '%s' failed: %s", name, self._name, err)
        if failures and len(failures) == len(calls):
            _, first = failures[0]
            if isinstance(first, iPIXELError):
                raise first
            raise iPIXELError(f"All panels of '{self._name}' failed: {first}") from first

    async def _broadcast(self, method: str, *args: Any, **kwargs: Any) -> None:
        panels = self.panels
        await self._gather([(p.name, getattr(p, method)(*args, **kwargs)) for p in panels])

    def _prepare_canvas(self, image: Image.Image) -> Image.Image:
        if image.mode != "RGB":
            image = image.convert("RGB")
        width, height = self.width, self.height
        if image.size != (width, height):
            from .base import fit_to_canvas

            image = fit_to_canvas(image, width, height)
        return image

    # ------------------------------------------------------------------
    # Connection
    # ------------------------------------------------------------------
    async def async_connect(self) -> None:
        """Connect to all loaded member panels."""
        await self._broadcast("async_connect")

    async def async_disconnect(self) -> None:
        """Disconnect from all loaded member panels."""
        await self._broadcast("async_disconnect")

    # ------------------------------------------------------------------
    # Canvas content
    # ------------------------------------------------------------------
    async def async_show_image(self, image: Image.Image, *, save_slot: int = 0) -> None:
        """Slice a still image over the panels."""
        canvas = self._prepare_canvas(image)
        calls = [
            (panel.name, panel.async_show_image(canvas.crop(tile.box), save_slot=save_slot))
            for tile, panel in self._tiles()
        ]
        await self._gather(calls)

    async def async_show_gif(
        self,
        frames: list[Image.Image],
        durations: list[int],
        *,
        loop: int = 0,
        save_slot: int = 0,
    ) -> None:
        """Slice every frame over the panels and upload one GIF per panel.

        The panels start playing as soon as their own upload finishes, so
        playback across panels is synchronised on a best-effort basis.
        """
        canvases = [self._prepare_canvas(frame) for frame in frames]
        calls = []
        for tile, panel in self._tiles():
            tile_frames = [canvas.crop(tile.box) for canvas in canvases]
            calls.append(
                (panel.name, panel.async_show_gif(tile_frames, durations, loop=loop, save_slot=save_slot))
            )
        await self._gather(calls)

    async def async_show_frame(self, image: Image.Image, brightness: int = 100) -> None:
        """Stream a frame to all panels concurrently."""
        canvas = self._prepare_canvas(image)
        calls = [
            (panel.name, panel.async_show_frame(canvas.crop(tile.box), brightness))
            for tile, panel in self._tiles()
        ]
        await self._gather(calls)

    async def async_set_pixels(self, pixels: list[dict]) -> None:
        """Route pixels in canvas coordinates to the right panel."""
        layout = self.layout
        resolved = self._resolve_all()
        per_panel: dict[str, list[dict]] = {}
        for pixel in pixels:
            mapped = layout.map_point(int(pixel.get("x", 0)), int(pixel.get("y", 0)))
            if mapped is None:
                continue
            tile, local_x, local_y = mapped
            per_panel.setdefault(tile.key, []).append(
                {"x": local_x, "y": local_y, "color": pixel.get("color", "ffffff")}
            )
        calls = [
            (resolved[key].name, resolved[key].async_set_pixels(items))
            for key, items in per_panel.items()
            if key in resolved
        ]
        if not calls:
            raise iPIXELNotAvailableError("No pixels fall inside the combined display")
        await self._gather(calls)

    async def async_fill(self, color: str) -> None:
        """Fill every panel with the colour."""
        await self._broadcast("async_fill", color)

    # ------------------------------------------------------------------
    # Native features - broadcast
    # ------------------------------------------------------------------
    async def async_show_native_text(self, text: str, **kwargs: Any) -> None:
        """Send device rendered text to every panel (each panel scrolls on its own)."""
        await self._broadcast("async_show_native_text", text, **kwargs)

    async def async_set_clock_mode(self, **kwargs: Any) -> None:
        """Clock mode on every panel."""
        await self._broadcast("async_set_clock_mode", **kwargs)

    async def async_set_rhythm_mode(self, style: int, speed: int = 4) -> None:
        """Rhythm mode on every panel."""
        await self._broadcast("async_set_rhythm_mode", style, speed)

    async def async_set_power(self, on: bool) -> None:
        """Power on/off every panel."""
        await self._broadcast("async_set_power", on)

    async def async_set_brightness(self, level: int) -> None:
        """Brightness on every panel."""
        await self._broadcast("async_set_brightness", level)

    async def async_set_orientation(self, orientation: int) -> None:
        """Orientation on every panel."""
        await self._broadcast("async_set_orientation", orientation)

    async def async_clear(self) -> None:
        """Clear every panel."""
        await self._broadcast("async_clear")

    async def async_sync_time(self) -> None:
        """Sync time on every panel."""
        await self._broadcast("async_sync_time")

    async def async_set_fun_mode(self, enable: bool) -> None:
        """Fun mode on every panel."""
        await self._broadcast("async_set_fun_mode", enable)

    async def async_call(self, method: str, *args: Any, **kwargs: Any) -> None:
        """Call an API method on every panel."""
        await self._broadcast("async_call", method, *args, **kwargs)
