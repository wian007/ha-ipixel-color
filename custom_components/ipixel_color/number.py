"""Number platform for iPIXEL Color."""
from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.number import NumberEntity, NumberEntityDescription, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN, MAX_SCHEDULE_INTERVAL_MS, MIN_SCHEDULE_INTERVAL_MS
from .entity import iPIXELDeviceEntity, iPIXELSettingEntity
from .runtime import iPIXELRuntime

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, kw_only=True)
class iPIXELSettingNumberDescription(NumberEntityDescription):
    """Describes a numeric setting."""

    setting: str
    value_type: type = int
    default: float = 0


SETTING_NUMBERS: tuple[iPIXELSettingNumberDescription, ...] = (
    iPIXELSettingNumberDescription(
        key="font_size",
        translation_key="font_size",
        icon="mdi:format-size",
        setting="font_size",
        value_type=float,
        native_min_value=0,
        native_max_value=128,
        native_step=0.5,
        mode=NumberMode.BOX,
        native_unit_of_measurement="px",
        entity_category=EntityCategory.CONFIG,
    ),
    iPIXELSettingNumberDescription(
        key="line_spacing",
        translation_key="line_spacing",
        icon="mdi:format-line-spacing",
        setting="line_spacing",
        native_min_value=0,
        native_max_value=20,
        native_step=1,
        mode=NumberMode.BOX,
        native_unit_of_measurement="px",
        entity_category=EntityCategory.CONFIG,
    ),
    iPIXELSettingNumberDescription(
        key="text_animation",
        translation_key="text_animation",
        icon="mdi:animation",
        setting="text_animation",
        native_min_value=0,
        native_max_value=7,
        native_step=1,
        mode=NumberMode.BOX,
        entity_category=EntityCategory.CONFIG,
    ),
    iPIXELSettingNumberDescription(
        key="text_speed",
        translation_key="text_speed",
        icon="mdi:speedometer",
        setting="text_speed",
        default=80,
        native_min_value=0,
        native_max_value=100,
        native_step=5,
        mode=NumberMode.SLIDER,
        entity_category=EntityCategory.CONFIG,
    ),
    iPIXELSettingNumberDescription(
        key="text_rainbow",
        translation_key="text_rainbow",
        icon="mdi:palette",
        setting="text_rainbow",
        native_min_value=0,
        native_max_value=9,
        native_step=1,
        mode=NumberMode.BOX,
        entity_category=EntityCategory.CONFIG,
    ),
    iPIXELSettingNumberDescription(
        key="rhythm_speed",
        translation_key="rhythm_speed",
        icon="mdi:speedometer",
        setting="rhythm_speed",
        default=4,
        native_min_value=0,
        native_max_value=7,
        native_step=1,
        mode=NumberMode.SLIDER,
        entity_category=EntityCategory.CONFIG,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up number entities."""
    runtime: iPIXELRuntime = hass.data[DOMAIN][entry.entry_id]
    entities: list[NumberEntity] = [
        iPIXELSettingNumber(runtime, description) for description in SETTING_NUMBERS
    ]
    entities += [iPIXELBrightnessNumber(runtime), iPIXELScheduleIntervalNumber(runtime)]
    async_add_entities(entities)


class iPIXELSettingNumber(iPIXELSettingEntity, NumberEntity):
    """A numeric setting used when rendering content."""

    entity_description: iPIXELSettingNumberDescription

    def __init__(self, runtime: iPIXELRuntime, description: iPIXELSettingNumberDescription) -> None:
        """Initialise the number."""
        super().__init__(runtime, description=description)
        self.setting = description.setting
        setattr(self.settings, self.setting, description.value_type(description.default))

    def _restore_from_state(self, state: State) -> None:
        value = self.entity_description.value_type(float(state.state))
        if self.native_min_value <= value <= self.native_max_value:
            setattr(self.settings, self.setting, value)

    @property
    def native_value(self) -> float:
        """Return the setting value."""
        return getattr(self.settings, self.setting)

    async def async_set_native_value(self, value: float) -> None:
        """Store the value."""
        self._set_setting(self.entity_description.value_type(value))


class iPIXELBrightnessNumber(iPIXELDeviceEntity, NumberEntity, RestoreEntity):
    """Display brightness (sent to the panels immediately)."""

    _attr_translation_key = "brightness"
    _attr_icon = "mdi:brightness-6"
    _attr_mode = NumberMode.SLIDER
    _attr_native_min_value = 1
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_native_unit_of_measurement = "%"

    def __init__(self, runtime: iPIXELRuntime) -> None:
        """Initialise the number."""
        super().__init__(runtime, key="brightness")

    async def async_added_to_hass(self) -> None:
        """Restore the last brightness (not sent to the device on startup)."""
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None and last_state.state not in ("unknown", "unavailable"):
            try:
                value = int(float(last_state.state))
            except (TypeError, ValueError):
                return
            if 1 <= value <= 100:
                self.settings.brightness = value

    @property
    def native_value(self) -> float:
        """Return the brightness."""
        return self.settings.brightness

    async def async_set_native_value(self, value: float) -> None:
        """Send the brightness to the panels."""
        await self._async_run(self.runtime.async_set_brightness(int(value)))
        self.async_write_ha_state()


class iPIXELScheduleIntervalNumber(iPIXELSettingEntity, NumberEntity):
    """Fallback interval between playlist items."""

    _attr_translation_key = "schedule_interval"
    _attr_icon = "mdi:timer-outline"
    _attr_mode = NumberMode.BOX
    _attr_native_min_value = MIN_SCHEDULE_INTERVAL_MS
    _attr_native_max_value = MAX_SCHEDULE_INTERVAL_MS
    _attr_native_step = 1000
    _attr_native_unit_of_measurement = "ms"
    _attr_entity_category = EntityCategory.CONFIG
    setting = "schedule_interval_ms"

    def __init__(self, runtime: iPIXELRuntime) -> None:
        """Initialise the number."""
        super().__init__(runtime, key="schedule_interval")

    def _restore_from_state(self, state: State) -> None:
        value = int(float(state.state))
        if MIN_SCHEDULE_INTERVAL_MS <= value <= MAX_SCHEDULE_INTERVAL_MS:
            self.settings.schedule_interval_ms = value

    @property
    def native_value(self) -> float:
        """Return the interval."""
        return self.settings.schedule_interval_ms

    async def async_set_native_value(self, value: float) -> None:
        """Store the interval and restart a running playlist with it."""
        self.settings.schedule_interval_ms = int(value)
        manager = self.runtime.schedule_manager
        if manager is not None and manager.is_running:
            await manager.stop_playlist_loop()
            await manager.start_playlist_loop(int(value))
        self.async_write_ha_state()
