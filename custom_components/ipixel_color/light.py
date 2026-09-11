"""Light platform for iPIXEL Color - colour pickers for text and background."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_RGB_COLOR,
    ColorMode,
    LightEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity import iPIXELSettingEntity
from .runtime import ColorSetting, iPIXELRuntime

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up colour pickers."""
    runtime: iPIXELRuntime = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        [
            iPIXELColorLight(runtime, "text_color", "text_color", (255, 255, 255)),
            iPIXELColorLight(runtime, "background_color", "background_color", (0, 0, 0)),
        ]
    )


class iPIXELColorLight(iPIXELSettingEntity, LightEntity):
    """A colour picker implemented as an RGB light (no physical light is controlled)."""

    _attr_color_mode = ColorMode.RGB
    _attr_supported_color_modes = {ColorMode.RGB}
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(
        self,
        runtime: iPIXELRuntime,
        key: str,
        setting: str,
        default_rgb: tuple[int, int, int],
    ) -> None:
        """Initialise the colour picker."""
        super().__init__(runtime, key=key)
        self._attr_translation_key = key
        self.setting = setting
        setattr(self.settings, setting, ColorSetting(rgb=default_rgb))

    @property
    def _color(self) -> ColorSetting:
        return getattr(self.settings, self.setting)

    def _restore_from_state(self, state: State) -> None:
        color = self._color
        color.is_on = state.state == "on"
        rgb = state.attributes.get(ATTR_RGB_COLOR)
        if rgb and len(rgb) >= 3:
            color.rgb = (int(rgb[0]), int(rgb[1]), int(rgb[2]))
        brightness = state.attributes.get(ATTR_BRIGHTNESS)
        if brightness:
            color.brightness = int(brightness)

    @property
    def is_on(self) -> bool:
        """Return True unless the colour is switched off (= black)."""
        return self._color.is_on

    @property
    def rgb_color(self) -> tuple[int, int, int]:
        """Return the colour."""
        return self._color.rgb

    @property
    def brightness(self) -> int:
        """Return the brightness."""
        return self._color.brightness

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Set the colour."""
        color = self._color
        if ATTR_RGB_COLOR in kwargs:
            rgb = kwargs[ATTR_RGB_COLOR]
            color.rgb = (int(rgb[0]), int(rgb[1]), int(rgb[2]))
        if ATTR_BRIGHTNESS in kwargs:
            color.brightness = int(kwargs[ATTR_BRIGHTNESS])
        color.is_on = True
        self.runtime.async_setting_changed(self.setting)
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Switch the colour off (rendered as black / no background)."""
        self._color.is_on = False
        self.runtime.async_setting_changed(self.setting)
        self.async_write_ha_state()
