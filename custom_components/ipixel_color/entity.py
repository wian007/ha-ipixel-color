"""Base entity classes for the iPIXEL Color integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import State, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import Entity, EntityDescription
from homeassistant.helpers.restore_state import RestoreEntity

from .exceptions import iPIXELError
from .runtime import iPIXELRuntime

_LOGGER = logging.getLogger(__name__)


class iPIXELEntity(Entity):
    """Base class for all entities of a display (panel or combined display)."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        runtime: iPIXELRuntime,
        key: str | None = None,
        description: EntityDescription | None = None,
    ) -> None:
        """Initialise the entity."""
        self.runtime = runtime
        if description is not None:
            self.entity_description = description
            key = description.key
        if key is None:
            raise ValueError("Either key or description is required")
        self._attr_unique_id = f"{runtime.unique_prefix}_{key}"
        self._attr_device_info = runtime.device_info

    async def async_added_to_hass(self) -> None:
        """Subscribe to runtime updates."""
        await super().async_added_to_hass()
        self.async_on_remove(self.runtime.async_add_listener(self._handle_runtime_update))

    @callback
    def _handle_runtime_update(self) -> None:
        self.async_write_ha_state()

    @property
    def settings(self):
        """Shortcut to the display settings."""
        return self.runtime.settings

    async def _async_run(self, coro) -> None:
        """Await a display operation and surface errors to the UI."""
        try:
            await coro
        except iPIXELError as err:
            raise HomeAssistantError(str(err)) from err


class iPIXELDeviceEntity(iPIXELEntity):
    """Entity that needs the (combined) display to be usable."""

    @property
    def available(self) -> bool:
        """Return True when at least one panel with a known size is loaded."""
        return self.runtime.available


class iPIXELSettingEntity(iPIXELEntity, RestoreEntity):
    """Entity that stores a value in the runtime settings and restores it on start."""

    setting: str = ""

    async def async_added_to_hass(self) -> None:
        """Restore the previous value into the settings."""
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is None or last_state.state in ("unknown", "unavailable"):
            return
        try:
            self._restore_from_state(last_state)
        except (ValueError, TypeError) as err:
            _LOGGER.debug("Could not restore %s from %s: %s", self.entity_id, last_state.state, err)
            return
        # Restoring must never trigger a device update; only refresh template tracking.
        self.runtime.async_settings_restored()

    def _restore_from_state(self, state: State) -> None:
        """Apply a restored state to the settings (override in subclasses)."""
        raise NotImplementedError

    def _set_setting(self, value: Any) -> None:
        """Store a new value and notify the runtime."""
        setattr(self.settings, self.setting, value)
        self.runtime.async_setting_changed(self.setting)
        self.async_write_ha_state()
