"""Clock mode commands for iPIXEL Color devices using pypixelcolor."""
from __future__ import annotations

from pypixelcolor.commands.set_clock_mode import set_clock_mode
from pypixelcolor.commands.set_time import set_time


def _first_window_bytes(plan) -> bytes:
    windows = list(plan.windows)
    if not windows:
        raise ValueError("pypixelcolor returned an empty plan")
    return windows[0].data


def make_clock_mode_command(
    style: int = 1,
    date: str = "",
    show_date: bool = True,
    format_24: bool = True,
) -> bytes:
    """Build the clock mode command.

    Args:
        style: Clock style (0-8)
        date: Date as DD/MM/YYYY (today when empty)
        show_date: Show the date next to the time
        format_24: Use a 24 hour clock
    """
    return _first_window_bytes(
        set_clock_mode(style=style, date=date, show_date=show_date, format_24=format_24)
    )


def make_time_command(
    hour: int | None = None,
    minute: int | None = None,
    second: int | None = None,
) -> bytes:
    """Build the set-time command (current time when arguments are None)."""
    return _first_window_bytes(set_time(hour=hour, minute=minute, second=second))
