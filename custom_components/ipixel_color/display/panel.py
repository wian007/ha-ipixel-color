"""Display implementation for a single physical panel."""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

from PIL import Image

from ..api import iPIXELAPI
from ..exceptions import iPIXELNotAvailableError
from .base import Display, fit_to_canvas


class PanelDisplay(Display):
    """One iPIXEL panel."""

    def __init__(self, api: iPIXELAPI, *, key: str, name: str) -> None:
        """Initialise the panel display."""
        self._api = api
        self._key = key
        self._name = name

    @property
    def key(self) -> str:
        """Return the identifier used in composite layouts (config entry id)."""
        return self._key

    @property
    def api(self) -> iPIXELAPI:
        """Return the underlying API."""
        return self._api

    @property
    def name(self) -> str:
        """Return the panel name."""
        return self._name

    @property
    def width(self) -> int:
        """Return the panel width (0 when unknown)."""
        return self._api.width or 0

    @property
    def height(self) -> int:
        """Return the panel height (0 when unknown)."""
        return self._api.height or 0

    @property
    def is_connected(self) -> bool:
        """Return True when connected."""
        return self._api.is_connected

    @property
    def available(self) -> bool:
        """Return True when the panel size is known (it can be (re)connected on demand)."""
        return self._api.device_info is not None

    @property
    def panels(self) -> list[PanelDisplay]:
        """Return [self]."""
        return [self]

    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Subscribe to connection changes."""
        return self._api.add_connection_listener(listener)

    async def async_connect(self) -> None:
        """Connect to the panel."""
        await self._api.connect()

    async def async_disconnect(self) -> None:
        """Disconnect from the panel."""
        await self._api.disconnect()

    def _require_size(self) -> None:
        if not self.width or not self.height:
            raise iPIXELNotAvailableError(f"Panel {self._name} size is not known yet")

    async def async_show_image(self, image: Image.Image, *, save_slot: int = 0) -> None:
        """Show a still image."""
        await self._api.display_image(image, save_slot=save_slot)

    async def async_show_gif(
        self,
        frames: list[Image.Image],
        durations: list[int],
        *,
        loop: int = 0,
        save_slot: int = 0,
    ) -> None:
        """Show an animation."""
        await self._api.display_gif_frames(frames, durations, loop=loop, save_slot=save_slot)

    async def async_show_frame(self, image: Image.Image, brightness: int = 100) -> None:
        """Stream a frame."""
        await self._api.display_frame(image, brightness)

    async def async_set_pixels(self, pixels: list[dict]) -> None:
        """Set pixels."""
        await self._api.set_pixels(pixels)

    async def async_fill(self, color: str) -> None:
        """Fill with a colour."""
        await self._api.draw_solid_color(color)

    async def async_show_native_text(self, text: str, **kwargs: Any) -> None:
        """Show device rendered text."""
        await self._api.display_text_native(text, **kwargs)

    async def async_set_clock_mode(self, **kwargs: Any) -> None:
        """Switch to clock mode."""
        await self._api.set_clock_mode(**kwargs)

    async def async_set_rhythm_mode(self, style: int, speed: int = 4) -> None:
        """Switch to rhythm mode."""
        await self._api.set_rhythm_mode(style, speed)

    async def async_set_power(self, on: bool) -> None:
        """Set power."""
        await self._api.set_power(on)

    async def async_set_brightness(self, level: int) -> None:
        """Set brightness."""
        await self._api.set_brightness(level)

    async def async_set_orientation(self, orientation: int) -> None:
        """Set orientation."""
        await self._api.set_orientation(orientation)

    async def async_clear(self) -> None:
        """Clear the panel."""
        await self._api.clear_display()

    async def async_sync_time(self) -> None:
        """Sync time."""
        await self._api.sync_time()

    async def async_set_fun_mode(self, enable: bool) -> None:
        """Set fun mode."""
        await self._api.set_fun_mode(enable)

    async def async_call(self, method: str, *args: Any, **kwargs: Any) -> None:
        """Call an API method by name."""
        func = getattr(self._api, method)
        await func(*args, **kwargs)

    def crop_for_panel(self, image: Image.Image) -> Image.Image:
        """Resize/crop a canvas image to this panel."""
        self._require_size()
        return fit_to_canvas(image, self.width, self.height)
