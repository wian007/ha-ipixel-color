"""Put a line of text under (or above) an image: a doorbell with "Voordeur" below it."""

from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont

from ..fonts import get_font_path
from .charts import LABEL_FONTS, load_label_font, render_text

POSITIONS = ("bottom", "top")


def _hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)


def _text_mask(text: str, font: str, size: int) -> Image.Image | None:
    """Rasterise ``text`` as an "L" mask: a bundled pixel font or any installed TTF."""
    if font in LABEL_FONTS:
        return render_text(text, load_label_font(font))
    path = get_font_path(font)
    if path is None:
        raise ValueError(f"Unknown caption font {font!r}; use {', '.join(LABEL_FONTS)} or a font file name")
    face = ImageFont.truetype(str(path), max(4, size))
    left, top, right, bottom = face.getbbox(text)
    if right <= left or bottom <= top:
        return None
    mask = Image.new("L", (right - left + 2, bottom - top + 2), 0)
    ImageDraw.Draw(mask).text((1 - left, 1 - top), text, font=face, fill=255)
    return mask.point(lambda v: 255 if v >= 128 else 0)


def add_caption(
    frames: list[Image.Image],
    width: int,
    height: int,
    text: str,
    *,
    font: str = "5x7",
    size: int = 10,
    color: str = "ffffff",
    background: str = "000000",
    position: str = "bottom",
) -> list[Image.Image]:
    """Return ``width`` x ``height`` frames: the image scaled into the room left by a text band.

    The band is as high as the text plus one pixel above and below; the picture keeps its
    aspect ratio and is centred in the rest (never cropped).
    """
    from ..display.base import fit_to_canvas

    if position not in POSITIONS:
        raise ValueError(f"caption_position must be one of {', '.join(POSITIONS)}")
    mask = _text_mask(text.strip(), font, size) if text.strip() else None
    band = min(height - 1, mask.height + 2) if mask is not None else 0
    room = height - band
    fill = _hex_rgb(color)
    back = _hex_rgb(background)
    picture_top = band if position == "top" else 0
    band_top = 0 if position == "top" else room

    out: list[Image.Image] = []
    for frame in frames:
        image = frame.convert("RGB") if frame.mode != "RGB" else frame
        scale = min(width / image.width, room / image.height)
        picture = (
            fit_to_canvas(image, width, room)
            if abs(image.width / image.height - width / room) < 0.01
            else image.resize(
                (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
                Image.Resampling.LANCZOS if scale < 1 else Image.Resampling.NEAREST,
            )
        )
        canvas = Image.new("RGB", (width, height), back)
        canvas.paste(picture, ((width - picture.width) // 2, picture_top + (room - picture.height) // 2))
        if mask is not None:
            text_layer = Image.new("RGB", mask.size, fill)
            canvas.paste(text_layer, ((width - mask.width) // 2, band_top + 1), mask)
        out.append(canvas)
    return out
