"""Native text display plans using pypixelcolor."""
from __future__ import annotations


from pypixelcolor.commands.send_text import send_text
from pypixelcolor.lib.device_info import DeviceInfo
from pypixelcolor.lib.transport.send_plan import SendPlan


def make_text_plan(
    text: str,
    color: str = "ffffff",
    bg_color: str | None = None,
    font: str = "UNIFONT",
    animation: int = 0,
    speed: int = 80,
    rainbow_mode: int = 0,
    save_slot: int = 0,
    char_height: int | None = None,
    device_info: DeviceInfo | None = None,
) -> SendPlan:
    """Build a native (device rendered) text plan.

    Args:
        text: Text to display (supports inline colour tags and emojis)
        color: Text colour as hex (``ffffff``)
        bg_color: Background colour as hex or None for none
        font: Built-in font name (``UNIFONT``) or path to a TTF/OTF file
        animation: 0=static, 1=scroll left, 2=scroll right, 3=up, 4=down, 5=blink, 6=fade, 7=snow
        speed: Animation speed (0-100)
        rainbow_mode: Rainbow colour mode (0-9)
        save_slot: Storage slot (0 = show directly)
        char_height: Character height override (auto from device info if None)
        device_info: Device info (used for the character height)
    """
    return send_text(
        text=text,
        color=color,
        bg_color=bg_color,
        font=font,
        animation=animation,
        speed=speed,
        rainbow_mode=rainbow_mode,
        save_slot=save_slot,
        char_height=char_height,
        device_info=device_info,
    )
