"""Image upload plans using pypixelcolor."""
from __future__ import annotations

import io

from PIL import Image
from pypixelcolor.commands.send_image import send_image_hex
from pypixelcolor.lib.device_info import DeviceInfo
from pypixelcolor.lib.transport.send_plan import SendPlan


def make_image_plan(
    image_bytes: bytes,
    file_extension: str = ".png",
    resize_method: str = "crop",
    device_info: DeviceInfo | None = None,
    save_slot: int = 0,
) -> SendPlan:
    """Build an image/GIF upload plan.

    Args:
        image_bytes: Raw image file bytes (PNG, GIF, JPEG, ...)
        file_extension: Extension indicating the image type (default ``.png``)
        resize_method: ``crop`` (fill and crop) or ``fit`` (letterbox)
        device_info: Device info used for resizing to the panel dimensions
        save_slot: Storage slot (0 = show directly, 1-255 = store in slot)
    """
    return send_image_hex(
        hex_string=image_bytes.hex(),
        file_extension=file_extension,
        resize_method=resize_method,
        device_info=device_info,
        save_slot=save_slot,
    )


def image_to_png_bytes(image: Image.Image) -> bytes:
    """Encode a PIL image as PNG."""
    if image.mode != "RGB":
        image = image.convert("RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def frames_to_gif_bytes(frames: list[Image.Image], durations: list[int], loop: int = 0) -> bytes:
    """Encode a list of RGB frames as an animated GIF."""
    if not frames:
        raise ValueError("At least one frame is required")
    palette_frames = [
        frame.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
        for frame in frames
    ]
    if len(durations) != len(frames):
        durations = (list(durations) + [100] * len(frames))[: len(frames)]
    buffer = io.BytesIO()
    if len(palette_frames) == 1:
        palette_frames[0].save(
            buffer,
            format="GIF",
            save_all=True,
            duration=int(durations[0]),
            loop=loop,
            disposal=2,
            optimize=False,
        )
    else:
        palette_frames[0].save(
            buffer,
            format="GIF",
            save_all=True,
            append_images=palette_frames[1:],
            duration=[int(d) for d in durations],
            loop=loop,
            disposal=[2] * len(palette_frames),
            optimize=False,
        )
    return buffer.getvalue()


def split_gif_frames(data: bytes) -> tuple[list[Image.Image], list[int], int]:
    """Decode an animated image into RGB frames, per-frame durations (ms) and loop count."""
    from PIL import ImageSequence

    image = Image.open(io.BytesIO(data))
    frames: list[Image.Image] = []
    durations: list[int] = []
    for frame in ImageSequence.Iterator(image):
        rgba = frame.convert("RGBA")
        background = Image.new("RGBA", rgba.size, (0, 0, 0, 255))
        frames.append(Image.alpha_composite(background, rgba).convert("RGB"))
        durations.append(int(frame.info.get("duration", image.info.get("duration", 100)) or 100))
    loop = int(image.info.get("loop", 0) or 0)
    return frames, durations, loop
