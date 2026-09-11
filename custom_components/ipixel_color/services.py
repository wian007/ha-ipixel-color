"""Services of the iPIXEL Color integration.

All services target a display through ``device_id`` (a panel or a combined
display) or ``entity_id`` (any entity of that display). When only one display
is configured the target may be omitted.
"""
from __future__ import annotations

import logging
import uuid
from collections.abc import Awaitable, Callable
from typing import Any

import voluptuous as vol
from homeassistant.const import ATTR_DEVICE_ID, ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .color import hex_to_rgb, parse_color
from .const import (
    DOMAIN,
    FPS_DEFAULT,
    FPS_MAX,
    FPS_MIN,
    MODE_CLOCK,
    MODE_RHYTHM,
    MODE_TEXT,
    MODE_TEXT_IMAGE,
)
from .exceptions import iPIXELError
from .runtime import iPIXELRuntime
from .schedule import ScheduleItem

_LOGGER = logging.getLogger(__name__)

ServiceHandler = Callable[[iPIXELRuntime, ServiceCall], Awaitable[None]]

# Service names
SERVICE_DISPLAY_TEXT = "display_text"
SERVICE_UPDATE_DISPLAY = "update_display"
SERVICE_UPLOAD_GIF = "upload_gif"
SERVICE_DISPLAY_IMAGE_URL = "display_image_url"
SERVICE_DISPLAY_IMAGE_RAW_RGB = "display_image_raw_rgb"
SERVICE_DISPLAY_IMAGE_RAW_RGB_URL = "display_image_raw_rgb_url"
SERVICE_DRAW_SOLID_COLOR = "draw_solid_color"
SERVICE_DRAW_VISUALS = "draw_visuals"
SERVICE_STOP_VISUALS = "stop_visuals"
SERVICE_SET_POWER = "set_power"
SERVICE_SET_BRIGHTNESS = "set_brightness"
SERVICE_SET_ORIENTATION = "set_orientation"
SERVICE_SET_CLOCK_MODE = "set_clock_mode"
SERVICE_SET_RHYTHM_MODE = "set_rhythm_mode"
SERVICE_SET_RHYTHM_MODE_ADVANCED = "set_rhythm_mode_advanced"
SERVICE_SYNC_TIME = "sync_time"
SERVICE_SET_TIME = "set_time"
SERVICE_SET_PIXEL = "set_pixel"
SERVICE_SET_PIXELS = "set_pixels"
SERVICE_SET_PIXELS_BATCHED = "set_pixels_batched"
SERVICE_CLEAR_PIXELS = "clear_pixels"
SERVICE_CLEAR_DISPLAY = "clear_display"
SERVICE_DISPLAY_IMAGE = "display_image"
SERVICE_DISPLAY_GIF = "display_gif"
SERVICE_SHOW_SLOT = "show_slot"
SERVICE_DELETE_SLOT = "delete_slot"
SERVICE_ADD_SCHEDULE = "add_schedule"
SERVICE_REMOVE_SCHEDULE = "remove_schedule"
SERVICE_TRIGGER_SCHEDULE = "trigger_schedule"
SERVICE_SET_PLAYLIST = "set_playlist"
SERVICE_CREATE_PLAYLIST = "create_playlist"
SERVICE_START_PLAYLIST = "start_playlist"
SERVICE_STOP_PLAYLIST = "stop_playlist"
SERVICE_SET_POWER_SCHEDULE = "set_power_schedule"
SERVICE_ADD_TIME_SLOT = "add_time_slot"
SERVICE_SET_UPSIDE_DOWN = "set_upside_down"
SERVICE_SET_DEFAULT_MODE = "set_default_mode"
SERVICE_ERASE_DATA = "erase_data"
SERVICE_SET_PROGRAM_MODE = "set_program_mode"
SERVICE_SET_SCREEN = "set_screen"
SERVICE_SET_DIY_MODE = "set_diy_mode"
SERVICE_SEND_RAW_COMMAND = "send_raw_command"
SERVICE_SET_PASSWORD = "set_password"
SERVICE_VERIFY_PASSWORD = "verify_password"
SERVICE_SEND_MIX_DATA = "send_mix_data"

TARGET_SCHEMA = {
    vol.Optional(ATTR_DEVICE_ID): vol.All(cv.ensure_list, [cv.string]),
    vol.Optional(ATTR_ENTITY_ID): vol.All(cv.ensure_list, [cv.string]),
}


def _schema(fields: dict | None = None) -> vol.Schema:
    return vol.Schema({**TARGET_SCHEMA, **(fields or {})}, extra=vol.ALLOW_EXTRA)


def _color_hex(value: Any, default: str) -> str:
    """Accept ``[r, g, b]`` or hex and return ``rrggbb``."""
    if value is None or value == "":
        return default
    r, g, b = parse_color(value, hex_to_rgb(default))
    return f"{r:02x}{g:02x}{b:02x}"


def _int_list(value: Any) -> list[int]:
    if isinstance(value, str):
        return [int(v.strip()) for v in value.split(",") if v.strip()]
    if isinstance(value, (list, tuple)):
        return [int(v) for v in value]
    if value is None:
        return []
    return [int(value)]


# ----------------------------------------------------------------------
# Target resolution
# ----------------------------------------------------------------------
@callback
def async_resolve_runtimes(hass: HomeAssistant, call: ServiceCall) -> list[iPIXELRuntime]:
    """Return the runtimes targeted by a service call."""
    runtimes: dict[str, iPIXELRuntime] = hass.data.get(DOMAIN, {})
    entry_ids: list[str] = []

    device_registry = dr.async_get(hass)
    for device_id in call.data.get(ATTR_DEVICE_ID) or []:
        device = device_registry.async_get(device_id)
        if device is None:
            raise ServiceValidationError(f"Unknown device id {device_id}")
        found = [entry_id for entry_id in device.config_entries if entry_id in runtimes]
        if not found:
            raise ServiceValidationError(
                f"Device {device.name or device_id} is not a loaded iPIXEL display"
            )
        entry_ids.extend(found)

    entity_registry = er.async_get(hass)
    for entity_id in call.data.get(ATTR_ENTITY_ID) or []:
        entity = entity_registry.async_get(entity_id)
        if entity is None or entity.platform != DOMAIN or entity.config_entry_id not in runtimes:
            raise ServiceValidationError(f"{entity_id} is not an entity of a loaded iPIXEL display")
        entry_ids.append(entity.config_entry_id)

    if not entry_ids:
        if len(runtimes) == 1:
            entry_ids = list(runtimes)
        elif not runtimes:
            raise ServiceValidationError("No iPIXEL display is configured")
        else:
            raise ServiceValidationError(
                "Specify device_id or entity_id; more than one iPIXEL display is configured"
            )

    seen: list[str] = []
    for entry_id in entry_ids:
        if entry_id not in seen:
            seen.append(entry_id)
    return [runtimes[entry_id] for entry_id in seen]


def _wrap(hass: HomeAssistant, handler: ServiceHandler) -> Callable[[ServiceCall], Awaitable[None]]:
    """Run a handler for every targeted display and surface errors."""

    async def _service(call: ServiceCall) -> None:
        errors: list[str] = []
        for runtime in async_resolve_runtimes(hass, call):
            try:
                await handler(runtime, call)
            except ServiceValidationError:
                raise
            except iPIXELError as err:
                errors.append(f"{runtime.name}: {err}")
            except HomeAssistantError as err:
                errors.append(f"{runtime.name}: {err}")
            except Exception as err:  # noqa: BLE001
                _LOGGER.exception("Unexpected error in service %s", call.service)
                errors.append(f"{runtime.name}: {err}")
        if errors:
            raise HomeAssistantError("; ".join(errors))

    return _service


# ----------------------------------------------------------------------
# Handlers
# ----------------------------------------------------------------------
async def handle_display_text(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Show text (native device text by default, or rendered as an image)."""
    text = call.data.get("text", "")
    if not text:
        raise ServiceValidationError("No text provided")
    mode = call.data.get("mode", MODE_TEXT)
    overrides: dict[str, Any] = {
        "text_color": _color_hex(call.data.get("color_fg", call.data.get("text_color")), "ffffff"),
        "bg_color": _color_hex(call.data.get("color_bg", call.data.get("bg_color")), "000000"),
    }
    if call.data.get("font"):
        overrides["font"] = call.data["font"]
    if call.data.get("effect") is not None and call.data.get("effect") != "":
        overrides["animation"] = int(call.data["effect"])
    if call.data.get("speed") is not None:
        overrides["speed"] = int(call.data["speed"])
    if call.data.get("rainbow_mode") is not None:
        overrides["rainbow_mode"] = int(call.data["rainbow_mode"])
    if call.data.get("matrix_height"):
        overrides["font_size"] = float(call.data["matrix_height"])
    if call.data.get("font_size"):
        overrides["font_size"] = float(call.data["font_size"])
    await runtime.async_update_display(text, mode=mode, overrides=overrides)


async def handle_update_display(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Re-render the current entity settings."""
    await runtime.async_update_display()


async def handle_display_image_url(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Download and show an image or GIF."""
    url = call.data.get("url") or call.data.get("gif_url")
    if not url:
        raise ServiceValidationError("No URL provided")
    slot = int(call.data.get("buffer_slot", 0) or 0)
    data, extension = await runtime.async_fetch_image(url)
    await runtime.async_show_image_bytes(data, extension, effect=call.data.get("effect"), save_slot=slot)


async def handle_display_image_raw_rgb(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Stream an image file from disk using the raw RGB protocol."""
    from PIL import Image

    path = call.data.get("image_path")
    if not path:
        raise ServiceValidationError("No image_path provided")
    if not runtime.hass.config.is_allowed_path(path):
        raise ServiceValidationError(f"Path {path} is not in allowlist_external_dirs")
    brightness = int(call.data.get("brightness", 100))

    def _load() -> Image.Image:
        with Image.open(path) as image:
            return image.convert("RGB")

    try:
        image = await runtime.hass.async_add_executor_job(_load)
    except FileNotFoundError as err:
        raise ServiceValidationError(f"Image not found: {path}") from err
    await _show_frame(runtime, image, brightness)


async def handle_display_image_raw_rgb_url(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Download an image and stream it using the raw RGB protocol."""
    import io

    from PIL import Image

    url = call.data.get("url")
    if not url:
        raise ServiceValidationError("No URL provided")
    brightness = int(call.data.get("brightness", 100))
    data, _ = await runtime.async_fetch_image(url)
    image = await runtime.hass.async_add_executor_job(lambda: Image.open(io.BytesIO(data)).convert("RGB"))
    await _show_frame(runtime, image, brightness)


async def _show_frame(runtime: iPIXELRuntime, image, brightness: int) -> None:
    from .display.base import fit_to_canvas

    width, height = runtime.display.width, runtime.display.height
    if not width or not height:
        raise HomeAssistantError(f"{runtime.name} is not available")
    canvas = fit_to_canvas(image, width, height)
    await runtime.display.async_show_frame(canvas, brightness)
    runtime.set_last_frame(canvas)


async def handle_draw_solid_color(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Fill the display with one colour."""
    color = _color_hex(call.data.get("color"), "000000")
    await runtime.display.async_fill(color)
    from PIL import Image

    if runtime.display.width and runtime.display.height:
        runtime.set_last_frame(
            Image.new("RGB", (runtime.display.width, runtime.display.height), hex_to_rgb(color))
        )


async def handle_draw_visuals(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Render multiple elements (text, scrolling text, images, pixels) with animation."""
    from homeassistant.helpers.aiohttp_client import async_get_clientsession

    from .display.font_cache import get_font_cache
    from .display.visual_renderer import VisualRenderer

    elements = call.data.get("elements") or []
    if not elements:
        raise ServiceValidationError("No elements provided")
    width, height = runtime.display.width, runtime.display.height
    if not width or not height:
        raise HomeAssistantError(f"{runtime.name} is not available")

    bg_color = parse_color(call.data.get("background", [0, 0, 0]), (0, 0, 0))
    fps = max(FPS_MIN, min(int(call.data.get("fps", FPS_DEFAULT)), FPS_MAX))
    brightness = int(call.data.get("brightness", 100))

    session = async_get_clientsession(runtime.hass)
    renderer = VisualRenderer(width, height, get_font_cache(), session)
    prepared = await renderer.prepare_elements(elements, session)
    controller = runtime.get_animation_controller()
    await controller.start(renderer, prepared, bg_color, fps, brightness)


async def handle_stop_visuals(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Stop a running draw_visuals animation."""
    if runtime.animation_controller is not None:
        await runtime.animation_controller.stop()


async def handle_set_power(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Power on/off."""
    await runtime.async_set_power(bool(call.data.get("on", True)))


async def handle_set_brightness(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Set brightness."""
    level = call.data.get("level", call.data.get("brightness", 50))
    await runtime.async_set_brightness(int(level))


async def handle_set_orientation(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Set orientation (0-3 or 0/90/180/270)."""
    value = call.data.get("orientation", 0)
    if isinstance(value, str) and value in ("0", "90", "180", "270"):
        await runtime.async_set_orientation(value)
    else:
        number = int(value)
        await runtime.async_set_orientation({0: "0", 90: "90", 180: "180", 270: "270"}.get(number, number))


async def handle_set_clock_mode(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Clock mode."""
    await runtime.async_update_display(
        mode=MODE_CLOCK,
        overrides={
            "clock_style": int(call.data.get("style", 1)),
            "show_date": bool(call.data.get("show_date", True)),
            "format_24": bool(call.data.get("format_24", True)),
            "date": call.data.get("date", "") or "",
        },
    )


async def handle_set_rhythm_mode(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Rhythm (music visualiser) mode."""
    await runtime.async_update_display(
        mode=MODE_RHYTHM,
        overrides={
            "rhythm_style": int(call.data.get("style", 0)),
            "rhythm_speed": int(call.data.get("speed", 4)),
        },
    )


async def handle_set_rhythm_mode_advanced(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Rhythm mode with 11 band levels."""
    levels = _int_list(call.data.get("levels"))
    if len(levels) != 11:
        raise ServiceValidationError("Exactly 11 frequency levels are required")
    await runtime.display.async_call("set_rhythm_mode_advanced", int(call.data.get("style", 0)), levels)


async def handle_sync_time(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Sync time."""
    await runtime.display.async_sync_time()


async def handle_set_time(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Set a specific time."""
    await runtime.display.async_call(
        "set_time",
        int(call.data.get("hour", 0)),
        int(call.data.get("minute", 0)),
        int(call.data.get("second", 0)),
    )


async def handle_set_pixel(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Set one pixel (canvas coordinates)."""
    pixel = {
        "x": int(call.data.get("x", 0)),
        "y": int(call.data.get("y", 0)),
        "color": _color_hex(call.data.get("color"), "ffffff"),
    }
    await runtime.display.async_set_fun_mode(True)
    runtime.settings.fun_mode = True
    await runtime.display.async_set_pixels([pixel])


async def handle_set_pixels(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Set several pixels (canvas coordinates), batched per colour."""
    pixels = call.data.get("pixels") or []
    if isinstance(pixels, str):
        import json

        try:
            pixels = json.loads(pixels)
        except ValueError as err:
            raise ServiceValidationError(f"pixels is not valid JSON: {err}") from err
    if not pixels:
        raise ServiceValidationError("No pixels provided")
    normalised = [
        {"x": int(p.get("x", 0)), "y": int(p.get("y", 0)), "color": _color_hex(p.get("color"), "ffffff")}
        for p in pixels
    ]
    await runtime.display.async_set_fun_mode(True)
    runtime.settings.fun_mode = True
    await runtime.display.async_set_pixels(normalised)


async def handle_clear_pixels(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Clear the display."""
    await runtime.display.async_clear()
    runtime.set_last_frame(None)


async def handle_show_slot(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Show a stored slot."""
    await runtime.display.async_call("show_slot", int(call.data.get("slot", 0)))


async def handle_delete_slot(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Delete a stored slot."""
    await runtime.display.async_call("delete_slot", int(call.data.get("slot", 0)))


async def handle_set_upside_down(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Flip 180 degrees."""
    await runtime.display.async_call(
        "set_upside_down", bool(call.data.get("upside_down", call.data.get("enabled", False)))
    )


async def handle_set_default_mode(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Factory default mode."""
    await runtime.display.async_call("set_default_mode")


async def handle_erase_data(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Erase stored buffers."""
    erase_all = bool(call.data.get("erase_all", False))
    buffers = None if erase_all else _int_list(call.data.get("buffers"))
    if not erase_all and not buffers:
        raise ServiceValidationError("Specify buffers or erase_all")
    await runtime.display.async_call("erase_data", buffers, erase_all)


async def handle_set_program_mode(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Cycle stored screens."""
    buffers = _int_list(call.data.get("buffers"))
    if not buffers:
        raise ServiceValidationError("No buffers specified")
    await runtime.display.async_call("set_program_mode", buffers)


async def handle_set_screen(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Select a screen buffer."""
    await runtime.display.async_call("set_screen", int(call.data.get("screen", 1)))


async def handle_set_diy_mode(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """DIY mode."""
    if call.data.get("mode") is not None:
        mode = int(call.data["mode"])
    elif call.data.get("enable") is not None:
        mode = 1 if call.data["enable"] else 0
    else:
        mode = 1
    await runtime.display.async_call("set_diy_mode", mode)


async def handle_send_raw_command(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Send raw bytes."""
    hex_data = call.data.get("hex_data", "")
    if not hex_data:
        raise ServiceValidationError("No hex_data provided")
    await runtime.display.async_call("send_raw_command", hex_data)


async def handle_set_password(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Password protection."""
    await runtime.display.async_call(
        "set_password", bool(call.data.get("enabled", True)), str(call.data.get("password", ""))
    )


async def handle_verify_password(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Verify password."""
    await runtime.display.async_call("verify_password", str(call.data.get("password", "")))


async def handle_send_mix_data(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Send raw mixed data."""
    hex_data = call.data.get("hex_data", "")
    if not hex_data:
        raise ServiceValidationError("No hex_data provided")
    await runtime.display.async_call("send_mix_data_raw", hex_data, int(call.data.get("screen_slot", 1)))


# --- schedules / playlists ---
def _manager(runtime: iPIXELRuntime):
    if runtime.schedule_manager is None:
        raise HomeAssistantError(f"{runtime.name} has no schedule manager")
    return runtime.schedule_manager


async def handle_add_schedule(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Add a content item to the schedule library."""
    manager = _manager(runtime)
    item = ScheduleItem(
        id=call.data.get("schedule_id") or str(uuid.uuid4())[:8],
        name=call.data.get("name", "Unnamed"),
        text=call.data.get("text", ""),
        mode=call.data.get("mode", MODE_TEXT_IMAGE),
        duration_ms=int(call.data.get("duration_ms", 5000)),
        gif_url=call.data.get("gif_url"),
        color=_color_hex(call.data.get("color_fg"), "ffffff"),
        bg_color=_color_hex(call.data.get("color_bg"), "000000"),
        slot=int(call.data["slot"]) if call.data.get("slot") not in (None, "") else None,
    )
    await manager.add_schedule(item)


async def handle_remove_schedule(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Remove a schedule item."""
    schedule_id = call.data.get("schedule_id")
    if not schedule_id:
        raise ServiceValidationError("schedule_id is required")
    if not await _manager(runtime).remove_schedule(schedule_id):
        raise ServiceValidationError(f"Unknown schedule {schedule_id}")


async def handle_trigger_schedule(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Show a schedule item now."""
    schedule_id = call.data.get("schedule_id")
    if not schedule_id:
        raise ServiceValidationError("schedule_id is required")
    if not await _manager(runtime).trigger_schedule(schedule_id):
        raise ServiceValidationError(f"Unknown schedule {schedule_id}")


async def handle_set_playlist(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Set the default playlist order."""
    ids = call.data.get("schedule_ids", "")
    schedule_ids = [s.strip() for s in ids.split(",")] if isinstance(ids, str) else list(ids)
    schedule_ids = [s for s in schedule_ids if s]
    if not schedule_ids:
        raise ServiceValidationError("schedule_ids is required")
    await _manager(runtime).set_playlist(schedule_ids)


async def handle_create_playlist(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Create a playlist."""
    await _manager(runtime).create_playlist(
        call.data.get("name", "New Playlist"),
        item_ids=[s for s in (call.data.get("schedule_ids") or [])] or None,
        loop=bool(call.data.get("loop", True)),
        shuffle=bool(call.data.get("shuffle", False)),
    )


async def handle_start_playlist(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Start a playlist."""
    if not await _manager(runtime).start_playlist(call.data.get("playlist_id") or None):
        raise HomeAssistantError("No valid playlist to start")


async def handle_stop_playlist(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Stop the playlist."""
    await _manager(runtime).stop_playlist_loop()


async def handle_set_power_schedule(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Configure automatic power on/off."""
    manager = _manager(runtime)
    enabled = bool(call.data.get("enabled", True))
    await manager.set_power_schedule(
        enabled,
        str(call.data.get("on_time", "07:00"))[:5],
        str(call.data.get("off_time", "22:00"))[:5],
        call.data.get("days"),
    )
    if enabled:
        await manager.start_power_schedule_monitoring()
    else:
        manager.stop_power_schedule_monitoring()


async def handle_add_time_slot(runtime: iPIXELRuntime, call: ServiceCall) -> None:
    """Play a playlist during a time window."""
    manager = _manager(runtime)
    await manager.add_time_slot(
        call.data.get("name", "Time Slot"),
        call.data.get("playlist_id", ""),
        str(call.data.get("start_time", "00:00"))[:5],
        str(call.data.get("end_time", "23:59"))[:5],
        call.data.get("days"),
        int(call.data.get("priority", 0)),
    )
    await manager.start_time_slot_monitoring()


SERVICES: dict[str, tuple[ServiceHandler, vol.Schema]] = {
    SERVICE_DISPLAY_TEXT: (
        handle_display_text,
        _schema(
            {
                vol.Required("text"): cv.string,
                vol.Optional("mode", default=MODE_TEXT): vol.In([MODE_TEXT, MODE_TEXT_IMAGE]),
            }
        ),
    ),
    SERVICE_UPDATE_DISPLAY: (handle_update_display, _schema()),
    SERVICE_UPLOAD_GIF: (handle_display_image_url, _schema()),
    SERVICE_DISPLAY_IMAGE_URL: (handle_display_image_url, _schema()),
    SERVICE_DISPLAY_IMAGE_RAW_RGB: (handle_display_image_raw_rgb, _schema()),
    SERVICE_DISPLAY_IMAGE_RAW_RGB_URL: (handle_display_image_raw_rgb_url, _schema()),
    SERVICE_DRAW_SOLID_COLOR: (handle_draw_solid_color, _schema()),
    SERVICE_DRAW_VISUALS: (handle_draw_visuals, _schema()),
    SERVICE_STOP_VISUALS: (handle_stop_visuals, _schema()),
    SERVICE_SET_POWER: (handle_set_power, _schema({vol.Optional("on", default=True): cv.boolean})),
    SERVICE_SET_BRIGHTNESS: (
        handle_set_brightness,
        _schema(
            {
                vol.Optional("level"): vol.All(vol.Coerce(int), vol.Range(min=1, max=100)),
                vol.Optional("brightness"): vol.All(vol.Coerce(int), vol.Range(min=1, max=100)),
            }
        ),
    ),
    SERVICE_SET_ORIENTATION: (handle_set_orientation, _schema()),
    SERVICE_SET_CLOCK_MODE: (handle_set_clock_mode, _schema()),
    SERVICE_SET_RHYTHM_MODE: (handle_set_rhythm_mode, _schema()),
    SERVICE_SET_RHYTHM_MODE_ADVANCED: (handle_set_rhythm_mode_advanced, _schema()),
    SERVICE_SYNC_TIME: (handle_sync_time, _schema()),
    SERVICE_SET_TIME: (handle_set_time, _schema()),
    SERVICE_SET_PIXEL: (handle_set_pixel, _schema()),
    SERVICE_SET_PIXELS: (handle_set_pixels, _schema()),
    SERVICE_SET_PIXELS_BATCHED: (handle_set_pixels, _schema()),
    SERVICE_CLEAR_PIXELS: (handle_clear_pixels, _schema()),
    SERVICE_CLEAR_DISPLAY: (handle_clear_pixels, _schema()),
    SERVICE_DISPLAY_IMAGE: (handle_display_image_url, _schema()),
    SERVICE_DISPLAY_GIF: (handle_display_image_url, _schema()),
    SERVICE_SHOW_SLOT: (handle_show_slot, _schema()),
    SERVICE_DELETE_SLOT: (handle_delete_slot, _schema()),
    SERVICE_ADD_SCHEDULE: (handle_add_schedule, _schema()),
    SERVICE_REMOVE_SCHEDULE: (handle_remove_schedule, _schema()),
    SERVICE_TRIGGER_SCHEDULE: (handle_trigger_schedule, _schema()),
    SERVICE_SET_PLAYLIST: (handle_set_playlist, _schema()),
    SERVICE_CREATE_PLAYLIST: (handle_create_playlist, _schema()),
    SERVICE_START_PLAYLIST: (handle_start_playlist, _schema()),
    SERVICE_STOP_PLAYLIST: (handle_stop_playlist, _schema()),
    SERVICE_SET_POWER_SCHEDULE: (handle_set_power_schedule, _schema()),
    SERVICE_ADD_TIME_SLOT: (handle_add_time_slot, _schema()),
    SERVICE_SET_UPSIDE_DOWN: (handle_set_upside_down, _schema()),
    SERVICE_SET_DEFAULT_MODE: (handle_set_default_mode, _schema()),
    SERVICE_ERASE_DATA: (handle_erase_data, _schema()),
    SERVICE_SET_PROGRAM_MODE: (handle_set_program_mode, _schema()),
    SERVICE_SET_SCREEN: (handle_set_screen, _schema()),
    SERVICE_SET_DIY_MODE: (handle_set_diy_mode, _schema()),
    SERVICE_SEND_RAW_COMMAND: (handle_send_raw_command, _schema()),
    SERVICE_SET_PASSWORD: (handle_set_password, _schema()),
    SERVICE_VERIFY_PASSWORD: (handle_verify_password, _schema()),
    SERVICE_SEND_MIX_DATA: (handle_send_mix_data, _schema()),
}


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register all services once."""
    for name, (handler, schema) in SERVICES.items():
        if not hass.services.has_service(DOMAIN, name):
            hass.services.async_register(DOMAIN, name, _wrap(hass, handler), schema=schema)
