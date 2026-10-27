"""Select platform for iPIXEL Color."""
from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.select import SelectEntity, SelectEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import (
    AVAILABLE_CLOCK_STYLES,
    AVAILABLE_EFFECTS,
    AVAILABLE_MODES,
    AVAILABLE_ORIENTATIONS,
    AVAILABLE_RHYTHM_STYLES,
    DEFAULT_CLOCK_STYLE,
    DEFAULT_EFFECT,
    DEFAULT_FONT,
    DEFAULT_MODE,
    DEFAULT_NATIVE_FONT,
    DEFAULT_RHYTHM_STYLE,
    DOMAIN,
)
from .entity import iPIXELDeviceEntity, iPIXELSettingEntity
from .fonts import get_available_fonts
from .runtime import iPIXELRuntime

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, kw_only=True)
class iPIXELSettingSelectDescription(SelectEntityDescription):
    """Describes a select setting."""

    setting: str
    default: str


SETTING_SELECTS: tuple[iPIXELSettingSelectDescription, ...] = (
    iPIXELSettingSelectDescription(
        key="mode_select",
        translation_key="mode",
        icon="mdi:view-dashboard-variant",
        setting="mode",
        options=AVAILABLE_MODES,
        default=DEFAULT_MODE,
    ),
    iPIXELSettingSelectDescription(
        key="clock_style_select",
        translation_key="clock_style",
        icon="mdi:clock-outline",
        setting="clock_style",
        options=AVAILABLE_CLOCK_STYLES,
        default=DEFAULT_CLOCK_STYLE,
        entity_category=EntityCategory.CONFIG,
    ),
    iPIXELSettingSelectDescription(
        key="effect_select",
        translation_key="effect",
        icon="mdi:image-filter-vintage",
        setting="effect",
        options=AVAILABLE_EFFECTS,
        default=DEFAULT_EFFECT,
        entity_category=EntityCategory.CONFIG,
    ),
    iPIXELSettingSelectDescription(
        key="rhythm_style_select",
        translation_key="rhythm_style",
        icon="mdi:equalizer",
        setting="rhythm_style",
        options=AVAILABLE_RHYTHM_STYLES,
        default=DEFAULT_RHYTHM_STYLE,
        entity_category=EntityCategory.CONFIG,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up select entities."""
    runtime: iPIXELRuntime = hass.data[DOMAIN][entry.entry_id]
    fonts = await hass.async_add_executor_job(get_available_fonts)
    entities: list[SelectEntity] = [
        iPIXELSettingSelect(runtime, description) for description in SETTING_SELECTS
    ]
    entities += [iPIXELFontSelect(runtime, fonts), iPIXELOrientationSelect(runtime)]
    async_add_entities(entities)


class iPIXELSettingSelect(iPIXELSettingEntity, SelectEntity):
    """A select setting used when rendering content."""

    entity_description: iPIXELSettingSelectDescription

    def __init__(self, runtime: iPIXELRuntime, description: iPIXELSettingSelectDescription) -> None:
        """Initialise the select."""
        super().__init__(runtime, description=description)
        self.setting = description.setting
        self._attr_options = list(description.options or [])
        setattr(self.settings, self.setting, description.default)

    def _restore_from_state(self, state: State) -> None:
        if state.state in self._attr_options:
            setattr(self.settings, self.setting, state.state)

    @property
    def current_option(self) -> str | None:
        """Return the setting value."""
        return getattr(self.settings, self.setting)

    async def async_select_option(self, option: str) -> None:
        """Store the option."""
        if option not in self._attr_options:
            raise ValueError(f"Invalid option {option}")
        self._set_setting(option)


class iPIXELFontSelect(iPIXELSettingEntity, SelectEntity):
    """Font used for rendered and native text."""

    _attr_translation_key = "font"
    _attr_icon = "mdi:format-font"
    _attr_entity_category = EntityCategory.CONFIG
    setting = "font"

    def __init__(self, runtime: iPIXELRuntime, fonts: list[str]) -> None:
        """Initialise the select."""
        super().__init__(runtime, key="font_select")
        options = list(fonts)
        if DEFAULT_NATIVE_FONT not in options:
            options.insert(0, DEFAULT_NATIVE_FONT)
        self._attr_options = options
        default = DEFAULT_FONT if DEFAULT_FONT in options else options[0]
        self.settings.font = default

    def _restore_from_state(self, state: State) -> None:
        if state.state in self._attr_options:
            self.settings.font = state.state

    @property
    def current_option(self) -> str | None:
        """Return the font."""
        return self.settings.font

    async def async_select_option(self, option: str) -> None:
        """Store the font."""
        if option not in self._attr_options:
            raise ValueError(f"Invalid font {option}")
        self._set_setting(option)


class iPIXELOrientationSelect(iPIXELDeviceEntity, SelectEntity, RestoreEntity):
    """Display orientation (sent to the panels immediately)."""

    _attr_translation_key = "orientation"
    _attr_icon = "mdi:screen-rotation"
    _attr_options = AVAILABLE_ORIENTATIONS
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, runtime: iPIXELRuntime) -> None:
        """Initialise the select."""
        super().__init__(runtime, key="orientation_select")

    async def async_added_to_hass(self) -> None:
        """Restore the last orientation (not sent on startup)."""
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None and last_state.state in AVAILABLE_ORIENTATIONS:
            self.settings.orientation = last_state.state

    @property
    def current_option(self) -> str | None:
        """Return the orientation."""
        return self.settings.orientation

    async def async_select_option(self, option: str) -> None:
        """Send the orientation to the panels."""
        await self._async_run(self.runtime.async_set_orientation(option))
        self.async_write_ha_state()
