"""Text platform for iPIXEL Color."""
from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.text import TextEntity, TextEntityDescription, TextMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity import iPIXELSettingEntity
from .runtime import iPIXELRuntime

_LOGGER = logging.getLogger(__name__)

# Home Assistant states are limited to 255 characters.
MAX_TEXT_LENGTH = 255


@dataclass(frozen=True, kw_only=True)
class iPIXELTextDescription(TextEntityDescription):
    """Describes a text setting."""

    setting: str


TEXTS: tuple[iPIXELTextDescription, ...] = (
    iPIXELTextDescription(
        key="text_display",
        translation_key="display",
        icon="mdi:message-text",
        setting="text",
        native_max=MAX_TEXT_LENGTH,
        mode=TextMode.TEXT,
    ),
    iPIXELTextDescription(
        key="gif_url",
        translation_key="gif_url",
        icon="mdi:link-variant",
        setting="gif_url",
        native_max=MAX_TEXT_LENGTH,
        mode=TextMode.TEXT,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up text entities."""
    runtime: iPIXELRuntime = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(iPIXELText(runtime, description) for description in TEXTS)


class iPIXELText(iPIXELSettingEntity, TextEntity):
    """Text entered by the user (supports templates and ``\\n``)."""

    entity_description: iPIXELTextDescription
    _attr_native_min = 0

    def __init__(self, runtime: iPIXELRuntime, description: iPIXELTextDescription) -> None:
        """Initialise the text entity."""
        super().__init__(runtime, description=description)
        self.setting = description.setting

    def _restore_from_state(self, state: State) -> None:
        setattr(self.settings, self.setting, state.state or "")

    @property
    def native_value(self) -> str | None:
        """Return the text."""
        return getattr(self.settings, self.setting)

    async def async_set_value(self, value: str) -> None:
        """Store the text (rendered when auto update is on)."""
        self._set_setting(value)
