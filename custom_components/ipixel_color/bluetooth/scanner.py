"""Bluetooth device discovery for iPIXEL Color devices."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components import bluetooth
from homeassistant.core import HomeAssistant, callback

from ..const import DEVICE_NAME_PREFIX, SERVICE_UUID

_LOGGER = logging.getLogger(__name__)


def is_ipixel_service_info(service_info: bluetooth.BluetoothServiceInfoBleak) -> bool:
    """Return True if the advertisement looks like an iPIXEL panel."""
    name = service_info.name or ""
    if name.startswith(DEVICE_NAME_PREFIX):
        return True
    return SERVICE_UUID in (service_info.service_uuids or [])


@callback
def discover_ipixel_devices(
    hass: HomeAssistant, *, return_all: bool = False
) -> list[dict[str, Any]]:
    """Return connectable Bluetooth devices seen by Home Assistant.

    Each entry has ``address``, ``name``, ``rssi`` and ``is_compatible``.
    """
    devices: list[dict[str, Any]] = []
    for service_info in bluetooth.async_discovered_service_info(hass, connectable=True):
        compatible = is_ipixel_service_info(service_info)
        if not compatible and not return_all:
            continue
        devices.append(
            {
                "address": service_info.address,
                "name": service_info.name or f"Unknown {service_info.address[-5:]}",
                "rssi": service_info.rssi,
                "is_compatible": compatible,
            }
        )
    devices.sort(key=lambda d: (not d["is_compatible"], d["name"].lower()))
    _LOGGER.debug("Bluetooth discovery found %d device(s)", len(devices))
    return devices
