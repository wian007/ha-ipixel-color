"""Color conversion utilities for iPIXEL Color integration."""
from __future__ import annotations


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert individual RGB channel values to a lowercase hex color string.

    Args:
        r: Red channel (0-255)
        g: Green channel (0-255)
        b: Blue channel (0-255)

    Returns:
        Lowercase hex string without leading '#', e.g. 'ff8800'
    """
    return f"{r:02x}{g:02x}{b:02x}"


def rgb_tuple_to_hex(rgb: tuple[int, int, int] | list[int]) -> str:
    """Convert an RGB tuple/list to a lowercase hex color string.

    Args:
        rgb: Sequence of at least three ints (r, g, b), each 0-255

    Returns:
        Lowercase hex string without leading '#', e.g. 'ff8800'
    """
    return f"{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex color string to RGB tuple.

    Args:
        hex_color: Hex color string (e.g., 'ffffff' or '#ffffff')

    Returns:
        Tuple of (red, green, blue) values from 0-255

    Raises:
        ValueError: If hex_color is invalid format
    """
    # Remove '#' if present
    hex_color = hex_color.lstrip('#')

    if len(hex_color) != 6:
        raise ValueError(f"Invalid hex color length: {hex_color} (expected 6 characters)")

    try:
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return (r, g, b)
    except ValueError as e:
        raise ValueError(f"Invalid hex color format: {hex_color}") from e


def hex_to_rgb_normalized(hex_color: str) -> tuple[float, float, float]:
    """Convert hex color string to normalized RGB tuple.

    Args:
        hex_color: Hex color string (e.g., 'ffffff')

    Returns:
        Tuple of (red, green, blue) values from 0.0-1.0
    """
    r, g, b = hex_to_rgb(hex_color)
    return (r / 255.0, g / 255.0, b / 255.0)
