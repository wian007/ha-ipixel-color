"""Render small charts for a pixel display."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RGB = tuple[int, int, int]

DEFAULT_PALETTE = ("00a0ff", "00c000", "ffc000", "ff4000", "c000ff", "00e0e0")
COLOR_MODES = ("per_bar", "by_value", "gradient")
ORIENTATIONS = ("vertical", "horizontal")
# Bundled pixel fonts for labels: file, PIL size and the rows of the glyph band (top, height).
# Keeping the band fixed puts every glyph on the same baseline whatever the text.
LABEL_FONTS: dict[str, tuple[str, int, int, int]] = {
    "3x5": ("3x5-de.ttf", 6, 0, 5),
    "5x7": ("7x5.ttf", 8, 1, 7),
}
_FONT_DIR = Path(__file__).resolve().parent.parent / "fonts"
_PIECE_GAP = 2  # columns between two texts on one row


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


def load_label_font(name: str) -> tuple[ImageFont.FreeTypeFont, int, int]:
    """Return the PIL font, band top and band height of a bundled label font."""
    if name not in LABEL_FONTS:
        raise ValueError(f"label_font must be one of {', '.join(LABEL_FONTS)}")
    file, size, top, height = LABEL_FONTS[name]
    return ImageFont.truetype(str(_FONT_DIR / file), size), top, height


def render_text(text: str, font: tuple[ImageFont.FreeTypeFont, int, int]) -> Image.Image | None:
    """Rasterise ``text`` as an on/off mask trimmed to its ink; None when it has none."""
    face, top, height = font
    canvas = Image.new("L", (len(text) * 10 + 4, top + height + 4), 0)
    ImageDraw.Draw(canvas).text((1, 0), text, font=face, fill=255)
    canvas = canvas.point(lambda v: 255 if v > 128 else 0)
    bbox = canvas.getbbox()
    if bbox is None:
        return None
    return canvas.crop((bbox[0], top, bbox[2], top + height))


def _blit(pixels, mask: Image.Image, x: int, y: int, colour: RGB, clip: tuple[int, int, int, int]) -> None:
    """Copy the lit pixels of ``mask`` to (x, y), clipped to (x0, y0, x1, y1) exclusive."""
    source = mask.load()
    for my in range(mask.height):
        py = y + my
        if not clip[1] <= py < clip[3]:
            continue
        for mx in range(mask.width):
            px = x + mx
            if clip[0] <= px < clip[2] and source[mx, my]:
                pixels[px, py] = colour


def _row_width(pieces: list[tuple[Image.Image, RGB]]) -> int:
    return sum(m.width for m, _ in pieces) + _PIECE_GAP * (len(pieces) - 1)


def _blit_row(pixels, pieces: list[tuple[Image.Image, RGB]], x: int, y: int, clip: tuple[int, int, int, int]) -> None:
    for mask, colour in pieces:
        _blit(pixels, mask, x, y, colour, clip)
        x += mask.width + _PIECE_GAP


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
    labels: list[str] | None = None,
    label_color: str = "a0a0a0",
    label_font: str = "3x5",
    group_size: int = 1,
    group_gap: int | None = None,
    show_values: bool = False,
    value_format: str = "{:.0f}",
) -> Image.Image:
    """Draw a bar chart of ``values`` on a ``width`` x ``height`` canvas.

    Bars rise from the bottom (``vertical``) or grow from the left
    (``horizontal``). ``maximum`` defaults to the largest value, so the biggest
    bar fills the canvas. ``color_mode``: ``per_bar`` cycles through ``colors``,
    ``by_value`` colours each bar between ``color_low`` and ``color_high`` by
    its value, ``gradient`` fades every bar from ``color_low`` at the base to
    ``color_high`` at the far end (a VU meter look). ``segment`` > 0 cuts the
    bars into blocks of that many pixels with one pixel in between.

    ``group_size`` > 1 lays consecutive values out as groups (CPU and memory of
    one node, say) with ``gap`` inside a group and ``group_gap`` between groups;
    in ``per_bar`` mode the n-th bar of every group then gets the n-th colour.
    ``labels`` name the groups (or bars) in a bundled pixel font: under the bars
    of a vertical chart, on a row above each group of a horizontal one.
    ``show_values`` prints the values in the bar colours: above a vertical
    chart, right-aligned on the label row of a horizontal one. Bars and text
    that do not fit on the canvas are dropped or clipped.
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
    try:
        value_format.format(0.0)
    except (ValueError, IndexError, KeyError) as err:
        raise ValueError(f"value_format {value_format!r} is not a format like {{:.0f}}") from err

    margin = max(0, int(margin))
    gap = max(0, int(gap))
    segment = max(0, int(segment))
    group_size = max(1, int(group_size))
    labels = [str(label) for label in labels] if labels else []
    font = text_rows = None
    if labels or show_values:
        font = load_label_font(label_font)
        text_rows = font[2]
    text_block = (text_rows + 1) if text_rows else 0
    vertical = orientation == "vertical"
    count = len(values)
    groups = -(-count // group_size)
    between = gap if group_size == 1 else (gap * 2 + 1 if group_gap is None else max(0, int(group_gap)))

    area_w, area_h = max(1, width - 2 * margin), max(1, height - 2 * margin)
    # Vertical charts keep a strip under the bars for labels and one above for values;
    # horizontal charts put label and values on one row at the head of each group.
    label_strip = text_block if vertical and labels else 0
    value_strip = text_block if vertical and show_values else 0
    group_head = text_block if not vertical and (labels or show_values) else 0
    across = area_w if vertical else area_h  # the axis the bars are laid out along
    length = max(1, (area_h - label_strip - value_strip) if vertical else area_w)  # the axis they grow along
    if not bar_width or int(bar_width) <= 0:
        free = across - (groups - 1) * between - groups * ((group_size - 1) * gap + group_head)
        bar_width = max(1, free // (groups * group_size))
    bar_width = int(bar_width)
    group_span = group_head + group_size * bar_width + (group_size - 1) * gap
    total = groups * group_span + (groups - 1) * between
    start = margin + max(0, (across - total) // 2)
    base = margin + area_h - 1 - label_strip  # vertical: the row the bars stand on
    top = margin + value_strip  # vertical: the highest row a bar may reach

    palette = [_rgb(c) for c in (colors or DEFAULT_PALETTE)]
    low, high = _rgb(color_low), _rgb(color_high)
    image = Image.new("RGB", (width, height), _rgb(background))
    pixels = image.load()

    if baseline:
        line = _rgb(baseline_color)
        if vertical:
            for x in range(margin, margin + area_w):
                pixels[x, base] = line
        else:
            for y in range(margin, margin + area_h):
                pixels[margin, y] = line

    fractions = [min(1.0, max(0.0, (value - minimum) / span)) for value in values]

    def bar_colour(index: int) -> RGB:
        if color_mode == "per_bar":
            return palette[(index % group_size if group_size > 1 else index) % len(palette)]
        return _lerp(low, high, fractions[index])

    for index, fraction in enumerate(fractions):
        bar_length = int(round(fraction * length))
        if fraction > 0 and bar_length == 0:
            bar_length = 1
        group, position = divmod(index, group_size)
        first = start + group * (group_span + between) + group_head + position * (bar_width + gap)
        if first >= margin + across:
            break
        last = min(first + bar_width, margin + across)
        colour = bar_colour(index)
        for step in range(bar_length):
            if segment and step % (segment + 1) == segment:
                continue
            if color_mode == "gradient":
                colour = _lerp(low, high, step / max(1, length - 1))
            if vertical:
                y = base - step
                if y < top:
                    break
                for x in range(first, last):
                    pixels[x, y] = colour
            else:
                x = margin + step
                for y in range(first, last):
                    pixels[x, y] = colour

    if font is None:
        return image
    text_colour = _rgb(label_color)
    canvas_clip = (margin, margin, margin + area_w, margin + area_h)
    for group in range(groups):
        g_first = start + group * (group_span + between)
        if g_first >= margin + across:
            break
        g_last = min(g_first + group_span, margin + across)
        label = render_text(labels[group], font) if group < len(labels) and labels[group] else None
        value_pieces: list[tuple[Image.Image, RGB]] = []
        if show_values:
            for index in range(group * group_size, min(count, (group + 1) * group_size)):
                mask = render_text(value_format.format(values[index]), font)
                if mask is not None:
                    value_pieces.append((mask, bar_colour(index)))
        if vertical:
            # labels under the group, values above it, both centred and allowed half the gap on each side
            clip = (max(margin, g_first - between // 2), margin, min(margin + area_w, g_last + (between - between // 2)), margin + area_h)
            slot = clip[2] - clip[0]
            if label is not None:
                x = clip[0] + (slot - label.width) // 2 if label.width <= slot else clip[0]
                _blit(pixels, label, x, margin + area_h - text_rows, text_colour, clip)
            if value_pieces:
                row = _row_width(value_pieces)
                x = clip[0] + (slot - row) // 2 if row <= slot else clip[0]
                _blit_row(pixels, value_pieces, x, margin, clip)
        else:
            # one row at the head of the group: label at the left, values at the right
            y = g_first
            label_end = margin + area_w
            if value_pieces:
                row = _row_width(value_pieces)
                x = max(margin, margin + area_w - row)
                _blit_row(pixels, value_pieces, x, y, canvas_clip)
                label_end = x - _PIECE_GAP
            if label is not None:
                _blit(pixels, label, margin, y, text_colour, (margin, margin, label_end, margin + area_h))
    return image
