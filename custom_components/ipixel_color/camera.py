"""Camera platform showing a preview of the last rendered frame."""
from __future__ import annotations

import logging

from homeassistant.components.camera import Camera, CameraEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity import iPIXELEntity
from .runtime import iPIXELRuntime

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the preview camera."""
    runtime: iPIXELRuntime = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([iPIXELCamera(runtime)])


class iPIXELCamera(iPIXELEntity, Camera):
    """Shows the last frame Home Assistant rendered for the display.

    Native device modes (device rendered text, clock, rhythm) have no preview.
    """

    _attr_translation_key = "preview"
    _attr_is_streaming = False
    _attr_supported_features = CameraEntityFeature(0)

    def __init__(self, runtime: iPIXELRuntime) -> None:
        """Initialise the camera."""
        Camera.__init__(self)
        iPIXELEntity.__init__(self, runtime, key="camera_preview")

    async def async_camera_image(
        self, width: int | None = None, height: int | None = None
    ) -> bytes | None:
        """Return the last rendered frame as PNG."""
        return self.runtime.last_frame_png

    @property
    def frame_interval(self) -> float:
        """Refresh quickly so animations look live in the UI."""
        return 0.2
