"""Render small charts for a pixel display."""
from __future__ import annotations

from PIL import Image

RGB = tuple[int, int, int]

DEFAULT_PALETTE = ("00a0ff", "00c000", "ffc000", "ff4000", "c000ff", "00e0e0")
COLOR_MODES = ("per_bar", "by_value", "gradient")
ORIENTATIONS = ("vertical", "horizontal")


def _rgb(value: str | RGB) -> RGB:
    if isinstance(value, (tuple, list)):
        return (int(value[0]), int(value[1]), int(value[2]))
    text = value.strip().lstrip("#")
    if len(text) != 6:
        raise ValueError(f"Colour {value!r} is not rrggbb")
    return (int(text[0:2], 16), int(text[2:4], 16), int(text[4:6], 16))


def _lerp(a: RGB, b: RGB, t: float) -> RGB:
    t = min(1.0, max(0.0, t))
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))  # type: ignore[return-value]


def render_bars(
    width: int,
    height: int,
    values: list[float],
    *,
    minimum: float = 0.0,
    maximum: float | None = None,
    colors: list[str] | None = None,
    color_mode: str = "per_bar",
    color_low: str = "00c000",
    color_high: str = "ff2000",
    orientation: str = "vertical",
    gap: int = 1,
    margin: int = 0,
    bar_width: int | None = None,
    segment: int = 0,
    background: str = "000000",
    baseline: bool = False,
    baseline_color: str = "303030",
) -> Image.Image:
    """Draw a bar chart of ``values`` on a ``width`` x ``height`` canvas.

    Bars rise from the bottom (``vertical``) or grow from the left
    (``horizontal``). ``maximum`` defaults to the largest value, so the biggest
    bar fills the canvas. ``color_mode``: ``per_bar`` cycles through ``colors``,
    ``by_value`` colours each bar between ``color_low`` and ``color_high`` by
    its value, ``gradient`` fades every bar from ``color_low`` at the base to
    ``color_high`` at the far end (a VU meter look). ``segment`` > 0 cuts the
    bars into blocks of that many pixels with one pixel in between. Bars that
    do not fit on the canvas are dropped.
    """
    if width <= 0 or height <= 0:
        raise ValueError("The canvas must be at least 1x1")
    if color_mode not in COLOR_MODES:
        raise ValueError(f"color_mode must be one of {', '.join(COLOR_MODES)}")
    if orientation not in ORIENTATIONS:
        raise ValueError(f"orientation must be one of {', '.join(ORIENTATIONS)}")
    values = [float(v) for v in values]
    if not values:
        raise ValueError("At least one value is needed")
    if maximum is None:
        maximum = max(max(values), minimum)
    if maximum <= minimum:
        maximum = minimum + 1.0
    span = maximum - minimum

    margin = max(0, int(margin))
    gap = max(0, int(gap))
    segment = max(0, int(segment))
    vertical = orientation == "vertical"
    area_w, area_h = max(1, width - 2 * margin), max(1, height - 2 * margin)
    across = area_w if vertical else area_h  # the axis the bars are laid out along
    length = area_h if vertical else area_w  # the axis the bars grow along
    count = len(values)
    if not bar_width or int(bar_width) <= 0:
        bar_width = max(1, (across - gap * (count - 1)) // count)
    bar_width = int(bar_width)
    total = count * bar_width + (count - 1) * gap
    start = margin + max(0, (across - total) // 2)

    palette = [_rgb(c) for c in (colors or DEFAULT_PALETTE)]
    low, high = _rgb(color_low), _rgb(color_high)
    image = Image.new("RGB", (width, height), _rgb(background))
    pixels = image.load()

    if baseline:
        line = _rgb(baseline_color)
        if vertical:
            y = margin + area_h - 1
            for x in range(margin, margin + area_w):
                pixels[x, y] = line
        else:
            x = margin
            for y in range(margin, margin + area_h):
                pixels[x, y] = line

    for index, value in enumerate(values):
        fraction = min(1.0, max(0.0, (value - minimum) / span))
        bar_length = int(round(fraction * length))
        if fraction > 0 and bar_length == 0:
            bar_length = 1
        first = start + index * (bar_width + gap)
        if first >= margin + across:
            break
        last = min(first + bar_width, margin + across)
        bar_colour = _lerp(low, high, fraction) if color_mode == "by_value" else palette[index % len(palette)]
        for step in range(bar_length):
            if segment and step % (segment + 1) == segment:
                continue
            colour = _lerp(low, high, step / max(1, length - 1)) if color_mode == "gradient" else bar_colour
            if vertical:
                y = margin + area_h - 1 - step
                for x in range(first, last):
                    pixels[x, y] = colour
            else:
                x = margin + step
                for y in range(first, last):
                    pixels[x, y] = colour
    return image
