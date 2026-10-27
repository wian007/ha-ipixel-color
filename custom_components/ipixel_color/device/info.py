"""Device information helpers for iPIXEL Color devices (thin pypixelcolor wrapper)."""
from __future__ import annotations

import logging
from typing import Any

from pypixelcolor.lib.device_info import DEVICE_TYPE_MAP, LED_SIZE_MAP, DeviceInfo
from pypixelcolor.lib.internal_commands import (
    _handle_device_info_response,
    build_get_device_info_command,
)

_LOGGER = logging.getLogger(__name__)


def device_type_string(device_info: DeviceInfo) -> str:
    """Return a human readable device type such as ``"2 32x32"``."""
    device_type_id = DEVICE_TYPE_MAP.get(device_info.device_type, -1)
    led_size = LED_SIZE_MAP.get(device_type_id)
    if led_size is None:
        return f"{device_info.device_type} (unknown)"
    return f"{device_type_id} {led_size[0]}x{led_size[1]}"


def device_info_to_dict(device_info: DeviceInfo) -> dict[str, Any]:
    """Convert a DeviceInfo object to a dictionary for sensors/diagnostics."""
    return {
        "width": device_info.width,
        "height": device_info.height,
        "device_type": device_info.device_type,
        "device_type_str": device_type_string(device_info),
        "mcu_version": device_info.mcu_version,
        "wifi_version": device_info.wifi_version,
        "password_flag": device_info.password_flag,
    }


def build_device_info_command() -> bytes:
    """Build the device info query command (also syncs the device clock)."""
    return build_get_device_info_command()


async def handle_device_info_response(client: Any, response_bytes: bytes) -> DeviceInfo:
    """Parse a device info response into a DeviceInfo object."""
    try:
        return await _handle_device_info_response(client, response_bytes)
    except Exception as err:
        _LOGGER.error("Failed to parse device info response %s: %s", response_bytes.hex(), err)
        raise ValueError("Invalid device info response") from err
