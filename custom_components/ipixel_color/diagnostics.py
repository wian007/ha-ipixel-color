"""Diagnostics support for iPIXEL Color."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .display.composite import CompositeDisplay
from .display.panel import PanelDisplay
from .runtime import iPIXELRuntime


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    runtime: iPIXELRuntime | None = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    data: dict[str, Any] = {
        "entry": {"title": entry.title, "data": dict(entry.data), "options": dict(entry.options)},
    }
    if runtime is None:
        data["runtime"] = None
        return data

    display = runtime.display
    info: dict[str, Any] = {
        "name": display.name,
        "type": "group" if runtime.is_group else "panel",
        "width": display.width,
        "height": display.height,
        "is_connected": display.is_connected,
        "available": display.available,
        "last_error": runtime.last_error,
    }
    if isinstance(display, PanelDisplay):
        from .device.info import device_info_to_dict

        device_info = display.api.device_info
        info["device_info"] = device_info_to_dict(device_info) if device_info else None
    elif isinstance(display, CompositeDisplay):
        info["members"] = [{"key": m.key, "row": m.row, "col": m.col} for m in display.members]
        info["missing_members"] = display.missing_members
        info["tiles"] = [
            {"panel": t.key, "x": t.x, "y": t.y, "width": t.width, "height": t.height}
            for t in display.layout.tiles
        ]
    data["display"] = info
    data["settings"] = runtime.settings.as_dict()
    manager = runtime.schedule_manager
    if manager is not None:
        data["schedule"] = {
            "items": manager.schedule_count,
            "playlists": manager.playlist_count,
            "running": manager.is_running,
        }
    return data
