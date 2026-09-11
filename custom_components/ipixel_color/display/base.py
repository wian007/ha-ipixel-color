"""Abstract display used by the runtime, entities and services.

A display is either a single physical panel (:class:`PanelDisplay`) or a
combination of panels that behaves like one large screen
(:class:`CompositeDisplay`). Everything that Home Assistant renders itself
(text images, GIFs, the draw_visuals canvas, pixels) is spread over the
member panels of a combined display; native device features (device rendered
scrolling text, clock, rhythm mode, brightness, power, ...) are sent to every
member panel.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any

from PIL import Image


class Display(ABC):
    """Common interface for a single panel or a combined display."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Return the display name."""

    @property
    @abstractmethod
    def width(self) -> int:
        """Return the canvas width in pixels."""

    @property
    @abstractmethod
    def height(self) -> int:
        """Return the canvas height in pixels."""

    @property
    @abstractmethod
    def is_connected(self) -> bool:
        """Return True when (all) panels are connected."""

    @property
    @abstractmethod
    def available(self) -> bool:
        """Return True when the display can be used (at least one panel)."""

    @property
    @abstractmethod
    def panels(self) -> list[Any]:
        """Return the underlying :class:`PanelDisplay` objects."""

    @abstractmethod
    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Subscribe to connection state changes; returns an unsubscribe callable."""

    @abstractmethod
    async def async_connect(self) -> None:
        """Connect to all panels."""

    @abstractmethod
    async def async_disconnect(self) -> None:
        """Disconnect from all panels."""

    # --- content rendered by Home Assistant (spread over the canvas) ---
    @abstractmethod
    async def async_show_image(self, image: Image.Image, *, save_slot: int = 0) -> None:
        """Show a still RGB image of canvas size."""

    @abstractmethod
    async def async_show_gif(
        self,
        frames: list[Image.Image],
        durations: list[int],
        *,
        loop: int = 0,
        save_slot: int = 0,
    ) -> None:
        """Show an animation from canvas sized frames."""

    @abstractmethod
    async def async_show_frame(self, image: Image.Image, brightness: int = 100) -> None:
        """Stream a canvas sized frame (raw RGB, fast, not stored on device)."""

    @abstractmethod
    async def async_set_pixels(self, pixels: list[dict]) -> None:
        """Set pixels given in canvas coordinates (fun mode must be on)."""

    @abstractmethod
    async def async_fill(self, color: str) -> None:
        """Fill the whole canvas with one colour."""

    # --- native device features (sent to every panel) ---
    @abstractmethod
    async def async_show_native_text(self, text: str, **kwargs: Any) -> None:
        """Show device rendered text."""

    @abstractmethod
    async def async_set_clock_mode(self, **kwargs: Any) -> None:
        """Switch to clock mode."""

    @abstractmethod
    async def async_set_rhythm_mode(self, style: int, speed: int = 4) -> None:
        """Switch to rhythm mode."""

    @abstractmethod
    async def async_set_power(self, on: bool) -> None:
        """Set power."""

    @abstractmethod
    async def async_set_brightness(self, level: int) -> None:
        """Set brightness."""

    @abstractmethod
    async def async_set_orientation(self, orientation: int) -> None:
        """Set orientation."""

    @abstractmethod
    async def async_clear(self) -> None:
        """Clear the display."""

    @abstractmethod
    async def async_sync_time(self) -> None:
        """Sync the time."""

    @abstractmethod
    async def async_set_fun_mode(self, enable: bool) -> None:
        """Enable/disable fun (pixel) mode."""

    @abstractmethod
    async def async_call(self, method: str, *args: Any, **kwargs: Any) -> None:
        """Call an arbitrary :class:`iPIXELAPI` method on every panel."""

    async def async_show_image_bytes(
        self,
        data: bytes,
        file_extension: str = ".png",
        *,
        save_slot: int = 0,
    ) -> Image.Image:
        """Decode an image/GIF file and show it; returns the first frame (canvas sized)."""
        from ..device.image import split_gif_frames

        frames, durations, loop = split_gif_frames(data)
        sized = [fit_to_canvas(frame, self.width, self.height) for frame in frames]
        if len(sized) == 1:
            await self.async_show_image(sized[0], save_slot=save_slot)
        else:
            await self.async_show_gif(sized, durations, loop=loop, save_slot=save_slot)
        return sized[0]


def fit_to_canvas(image: Image.Image, width: int, height: int) -> Image.Image:
    """Scale an image to fill ``width``x``height`` and centre-crop the excess."""
    if image.mode != "RGB":
        image = image.convert("RGB")
    if image.size == (width, height):
        return image
    scale = max(width / image.width, height / image.height)
    new_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resampling = Image.Resampling.LANCZOS if scale < 1 else Image.Resampling.NEAREST
    resized = image.resize(new_size, resampling)
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))
