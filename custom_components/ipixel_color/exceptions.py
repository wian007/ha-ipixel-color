"""Custom exceptions for the iPIXEL Color integration."""
from __future__ import annotations

from homeassistant.exceptions import HomeAssistantError


class iPIXELError(HomeAssistantError):
    """Base iPIXEL error."""


class iPIXELConnectionError(iPIXELError):
    """Raised when the Bluetooth connection cannot be established or is lost."""


class iPIXELTimeoutError(iPIXELError):
    """Raised when the device does not acknowledge a command in time."""


class iPIXELCommandError(iPIXELError):
    """Raised when a command is rejected or cannot be built."""


class iPIXELNotAvailableError(iPIXELError):
    """Raised when a (member) display is not available."""
