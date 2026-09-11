"""Sensor platform for iPIXEL Color device information."""
from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .display.composite import CompositeDisplay
from .display.panel import PanelDisplay
from .entity import iPIXELEntity
from .runtime import iPIXELRuntime

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, kw_only=True)
class iPIXELSensorDescription(SensorEntityDescription):
    """Describes a sensor."""

    value_fn: Callable[[iPIXELRuntime], Any]


def _panel_info(runtime: iPIXELRuntime, attribute: str) -> Any:
    display = runtime.display
    if isinstance(display, PanelDisplay) and display.api.device_info is not None:
        from .device.info import device_info_to_dict

        return device_info_to_dict(display.api.device_info).get(attribute)
    return None


COMMON_SENSORS: tuple[iPIXELSensorDescription, ...] = (
    iPIXELSensorDescription(
        key="width",
        translation_key="width",
        icon="mdi:monitor",
        native_unit_of_measurement="px",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda runtime: runtime.display.width or None,
    ),
    iPIXELSensorDescription(
        key="height",
        translation_key="height",
        icon="mdi:monitor",
        native_unit_of_measurement="px",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda runtime: runtime.display.height or None,
    ),
)

PANEL_SENSORS: tuple[iPIXELSensorDescription, ...] = (
    iPIXELSensorDescription(
        key="device_type_str",
        translation_key="device_type",
        icon="mdi:chip",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda runtime: _panel_info(runtime, "device_type_str"),
    ),
    iPIXELSensorDescription(
        key="mcu_version",
        translation_key="mcu_version",
        icon="mdi:memory",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda runtime: _panel_info(runtime, "mcu_version"),
    ),
    iPIXELSensorDescription(
        key="wifi_version",
        translation_key="wifi_version",
        icon="mdi:wifi",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda runtime: _panel_info(runtime, "wifi_version"),
    ),
)

GROUP_SENSORS: tuple[iPIXELSensorDescription, ...] = (
    iPIXELSensorDescription(
        key="panel_count",
        translation_key="panel_count",
        icon="mdi:view-grid",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda runtime: (
            f"{len(runtime.display.panels)}/{len(runtime.display.members)}"
            if isinstance(runtime.display, CompositeDisplay)
            else None
        ),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensors."""
    runtime: iPIXELRuntime = hass.data[DOMAIN][entry.entry_id]
    descriptions = COMMON_SENSORS + (GROUP_SENSORS if runtime.is_group else PANEL_SENSORS)
    async_add_entities(iPIXELSensor(runtime, description) for description in descriptions)


class iPIXELSensor(iPIXELEntity, SensorEntity):
    """Diagnostic sensor fed from the runtime."""

    entity_description: iPIXELSensorDescription

    def __init__(self, runtime: iPIXELRuntime, description: iPIXELSensorDescription) -> None:
        """Initialise the sensor."""
        super().__init__(runtime, description=description)

    @property
    def native_value(self) -> Any:
        """Return the value."""
        return self.entity_description.value_fn(self.runtime)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Expose the layout of a combined display on the width sensor."""
        if self.entity_description.key != "width" or not isinstance(self.runtime.display, CompositeDisplay):
            return None
        layout = self.runtime.display.layout
        return {
            "tiles": [
                {"panel": tile.key, "x": tile.x, "y": tile.y, "width": tile.width, "height": tile.height}
                for tile in layout.tiles
            ],
            "missing_panels": self.runtime.display.missing_members,
        }
