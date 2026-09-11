"""Colour conversion helpers."""
from __future__ import annotations

from .common import rgb_to_hex

__all__ = ["hex_to_rgb", "hex_to_rgb_normalized", "rgb_to_hex", "parse_color"]


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert ``rrggbb`` / ``#rrggbb`` to an RGB tuple."""
    hex_color = hex_color.strip().lstrip("#")
    if len(hex_color) != 6:
        raise ValueError(f"Invalid hex color length: {hex_color} (expected 6 characters)")
    try:
        return (int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16))
    except ValueError as err:
        raise ValueError(f"Invalid hex color format: {hex_color}") from err


def hex_to_rgb_normalized(hex_color: str) -> tuple[float, float, float]:
    """Convert a hex colour to 0.0-1.0 floats."""
    r, g, b = hex_to_rgb(hex_color)
    return (r / 255.0, g / 255.0, b / 255.0)


def parse_color(value, default: tuple[int, int, int] = (255, 255, 255)) -> tuple[int, int, int]:
    """Parse a colour given as hex string or ``[r, g, b]`` list."""
    if isinstance(value, (list, tuple)) and len(value) >= 3:
        return (int(value[0]), int(value[1]), int(value[2]))
    if isinstance(value, str):
        try:
            return hex_to_rgb(value)
        except ValueError:
            return default
    return default
