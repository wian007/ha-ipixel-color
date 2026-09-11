"""Small shared helpers for the iPIXEL Color integration."""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.template import Template, is_template_string

_LOGGER = logging.getLogger(__name__)


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB components to a hex colour string (``rrggbb``)."""
    return f"{r:02x}{g:02x}{b:02x}"


def process_escapes(text: str) -> str:
    """Turn literal ``\\n`` / ``\\t`` sequences (as typed in the UI) into real characters."""
    return text.replace("\\n", "\n").replace("\\t", "\t")


async def resolve_template_variables(hass: HomeAssistant, text: str) -> str:
    """Render Home Assistant templates in ``text``.

    Supports the usual Jinja2 patterns such as ``{{ states('sensor.x') }}``
    and ``{% if ... %}``. When rendering fails the original text is returned
    and a warning is logged.
    """
    if not text or not is_template_string(text):
        return text

    try:
        template = Template(text, hass)
        return str(template.async_render(parse_result=False))
    except Exception as err:  # noqa: BLE001 - template errors are user errors
        _LOGGER.warning("Template error in '%s': %s", text, err)
        return text
