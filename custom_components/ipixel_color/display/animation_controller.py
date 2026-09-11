"""Animation controller for the draw_visuals service.

Renders frames with :class:`VisualRenderer` at a target FPS and streams them
to the display (a single panel or a combined display) with frame diffing.
"""
from __future__ import annotations

import asyncio
import logging
import time
from typing import TYPE_CHECKING

from PIL import Image

from ..const import FPS_DEFAULT, FPS_MAX, FPS_MIN
from ..exceptions import iPIXELError

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from ..runtime import iPIXELRuntime
    from .visual_renderer import PreparedElement, VisualRenderer

_LOGGER = logging.getLogger(__name__)


class AnimationController:
    """Manages animation loops with FPS control."""

    def __init__(self, hass: HomeAssistant, runtime: iPIXELRuntime) -> None:
        """Initialise the controller."""
        self._hass = hass
        self._runtime = runtime
        self._renderer: VisualRenderer | None = None
        self._running = False
        self._task: asyncio.Task | None = None
        self._elements: list[PreparedElement] = []
        self._bg_color: tuple[int, int, int] = (0, 0, 0)
        self._fps: int = FPS_DEFAULT
        self._brightness: int = 100
        self._start_time: float = 0.0
        self._last_frame_bytes: bytes | None = None

    @property
    def is_running(self) -> bool:
        """Return True while an animation loop is active."""
        return self._running and self._task is not None

    async def start(
        self,
        renderer: VisualRenderer,
        elements: list[PreparedElement],
        bg_color: tuple[int, int, int],
        fps: int = FPS_DEFAULT,
        brightness: int = 100,
    ) -> None:
        """Start rendering; animates when needed, otherwise sends one frame."""
        await self.stop()

        self._renderer = renderer
        self._elements = elements
        self._bg_color = bg_color
        self._fps = max(FPS_MIN, min(int(fps), FPS_MAX))
        self._brightness = brightness
        self._start_time = time.time()
        self._last_frame_bytes = None
        self._running = True

        if renderer.detect_animation(elements):
            _LOGGER.info(
                "%s: starting animation loop (%d elements, %d FPS)",
                self._runtime.name,
                len(elements),
                self._fps,
            )
            self._task = self._hass.async_create_background_task(
                self._animation_loop(), name="ipixel_animation_loop"
            )
        else:
            _LOGGER.info("%s: rendering static frame (%d elements)", self._runtime.name, len(elements))
            try:
                await self._render_and_send(0.0)
            finally:
                self._running = False

    async def stop(self) -> None:
        """Stop the animation loop."""
        self._running = False
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def _animation_loop(self) -> None:
        frame_interval = 1.0 / self._fps
        frame_count = 0
        failures = 0
        try:
            while self._running:
                loop_start = time.time()
                try:
                    await self._render_and_send(loop_start - self._start_time)
                    failures = 0
                except iPIXELError as err:
                    failures += 1
                    _LOGGER.warning("%s: frame %d failed: %s", self._runtime.name, frame_count, err)
                    if failures >= 5:
                        _LOGGER.error("%s: stopping animation after repeated failures", self._runtime.name)
                        break
                    await asyncio.sleep(1.0)
                    continue
                frame_count += 1
                elapsed = time.time() - loop_start
                await asyncio.sleep(max(0.01, frame_interval - elapsed))
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            _LOGGER.exception("%s: animation loop crashed", self._runtime.name)
        finally:
            self._running = False
            _LOGGER.debug("%s: animation loop ended after %d frames", self._runtime.name, frame_count)

    async def _render_and_send(self, frame_time: float) -> None:
        assert self._renderer is not None
        frame: Image.Image = self._renderer.render_frame(self._elements, self._bg_color, frame_time)
        frame_bytes = frame.tobytes()
        if frame_bytes == self._last_frame_bytes:
            return
        await self._runtime.display.async_show_frame(frame, self._brightness)
        self._last_frame_bytes = frame_bytes
        self._runtime.set_last_frame(frame)

    def update_elements(self, elements: list[PreparedElement]) -> None:
        """Replace the elements while the loop keeps running."""
        self._elements = elements

    def update_background(self, bg_color: tuple[int, int, int]) -> None:
        """Change the background colour while running."""
        self._bg_color = bg_color

    def update_brightness(self, brightness: int) -> None:
        """Change the brightness while running."""
        self._brightness = max(1, min(100, brightness))
