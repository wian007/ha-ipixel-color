"""Shared pytest fixtures for the iPIXEL Color integration tests.

pytest-homeassistant-custom-component (PHCC) provides a real (but sandboxed)
Home Assistant instance via the `hass` fixture, along with helpers for config
entries, entity registries, and Bluetooth device mocks.

Usage
-----
Install test dependencies first::

    pip install -r requirements_dev.txt

Then run::

    pytest tests/ -v

or via Make::

    make test
"""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── PHCC sets PYTHONPATH automatically so `homeassistant` is importable. ──────
# The marker below tells pytest-asyncio to treat every test in this package as
# asyncio without needing an explicit @pytest.mark.asyncio decorator.
pytest_plugins = "pytest_homeassistant_custom_component"


# ────────────────────────────────────────────────────────────────────────────
# Mock device constants
# ────────────────────────────────────────────────────────────────────────────
MOCK_ADDRESS = "5C:15:92:BD:AA:BB"
MOCK_NAME = "LED_BLE_TEST"


# ────────────────────────────────────────────────────────────────────────────
# Fixtures
# ────────────────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_device_info() -> MagicMock:
    """Return a mock DeviceInfo object matching a typical 32×8 iPIXEL device."""
    info = MagicMock()
    info.width = 32
    info.height = 8
    info.led_type = 1
    info.mcu_version = "1.0"
    info.wifi_version = "1.0"
    return info


@pytest.fixture
def mock_bluetooth_client(mock_device_info: MagicMock) -> MagicMock:
    """Return a mock BluetoothClient that immediately connects/disconnects."""
    client = MagicMock()
    client.connect = AsyncMock(return_value=mock_device_info)
    client.disconnect = AsyncMock()
    client.is_connected = True
    client.send_command = AsyncMock(return_value=MagicMock(success=True, data=None))
    client.send_plan = AsyncMock(return_value=MagicMock(success=True, data=None))
    return client


@pytest.fixture
def mock_api(mock_bluetooth_client: MagicMock, mock_device_info: MagicMock) -> MagicMock:
    """Return a minimal mock iPIXELAPI instance.

    All async methods return True (success) unless overridden in individual
    tests.  The mock patches the BluetoothClient so no real BLE hardware is
    required.
    """
    from custom_components.ipixel_color.api import iPIXELAPI  # noqa: PLC0415

    with patch(
        "custom_components.ipixel_color.bluetooth.client.BluetoothClient",
        return_value=mock_bluetooth_client,
    ):
        # Construct the real API but with a patched transport layer
        api = MagicMock(spec=iPIXELAPI)
        api._address = MOCK_ADDRESS
        api._device_info = mock_device_info
        api.is_connected = True
        api.power_state = True
        api.address = MOCK_ADDRESS

        # All async action methods default to success
        for method_name in (
            "connect",
            "disconnect",
            "set_power",
            "set_brightness",
            "sync_time",
            "set_orientation",
            "set_clock_mode",
            "display_text",
            "display_text_pypixelcolor",
            "display_image_url",
            "set_rhythm_mode",
            "set_pixel",
            "set_pixels",
            "set_pixels_batched",
            "draw_solid_color",
            "clear_display",
            "show_slot",
            "delete_slot",
        ):
            setattr(api, method_name, AsyncMock(return_value=True))

        api.get_device_info = AsyncMock(
            return_value={"width": 32, "height": 8, "led_type": 1}
        )

        yield api


@pytest.fixture
def mock_config_entry() -> MagicMock:
    """Return a mock ConfigEntry for the iPIXEL Color integration."""
    from homeassistant.config_entries import ConfigEntry  # noqa: PLC0415
    from custom_components.ipixel_color.const import DOMAIN, CONF_ADDRESS, CONF_NAME  # noqa: PLC0415

    entry = MagicMock(spec=ConfigEntry)
    entry.domain = DOMAIN
    entry.entry_id = "test_entry_id"
    entry.data = {
        CONF_ADDRESS: MOCK_ADDRESS,
        CONF_NAME: MOCK_NAME,
    }
    entry.runtime_data = None
    entry.async_on_unload = MagicMock()
    return entry
