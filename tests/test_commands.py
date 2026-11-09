"""Tests for protocol command builders."""
import zlib

import pytest
from PIL import Image

from custom_components.ipixel_color.device.commands import (
    image_to_rgb_bytes,
    make_batch_pixel_command,
    make_brightness_command,
    make_mix_data_raw_plan,
    make_power_command,
    make_raw_rgb_chunk_command,
)
from custom_components.ipixel_color.device.image import (
    frames_to_gif_bytes,
    image_to_png_bytes,
    split_gif_frames,
)


def test_power_and_brightness():
    assert make_power_command(True) == bytes([5, 0, 7, 1, 1])
    assert make_brightness_command(42) == bytes([5, 0, 4, 0x80, 42])
    with pytest.raises(ValueError):
        make_brightness_command(0)


def test_mix_data_plan_windows():
    payload = bytes(range(256)) * 60  # > 12KB -> two windows
    plan = make_mix_data_raw_plan(payload, screen_slot=3)
    windows = list(plan.windows)
    assert len(windows) == 2
    first = windows[0].data
    assert int.from_bytes(first[:2], "little") == len(first)
    assert first[2:4] == bytes([0x04, 0x00])
    assert first[4] == 0x00 and windows[1].data[4] == 0x02
    assert int.from_bytes(first[5:9], "little") == len(payload)
    assert int.from_bytes(first[9:13], "little") == zlib.crc32(payload) & 0xFFFFFFFF
    assert first[13:15] == bytes([0x02, 3])


def test_batch_pixel_command():
    cmd = make_batch_pixel_command(255, 0, 0, [(1, 2), (3, 4)])
    assert cmd[2:5] == bytes([5, 1, 0])
    assert cmd[5:8] == bytes([255, 0, 0])
    assert cmd[8:] == bytes([1, 2, 3, 4])
    assert int.from_bytes(cmd[:2], "little") == len(cmd)


def test_raw_rgb_brightness_scaling():
    data = bytes([200, 100, 0]) * 4
    cmd = make_raw_rgb_chunk_command(data, data, 0, brightness=50)
    assert cmd[9:12] == bytes([100, 50, 0])


def test_image_to_rgb_bytes_resizes():
    image = Image.new("RGB", (10, 10), (1, 2, 3))
    rgb = image_to_rgb_bytes(image_to_png_bytes(image), 4, 2)
    assert rgb == bytes([1, 2, 3]) * 8


def test_gif_with_identical_frames_becomes_a_still():
    """A tile that does not change (dark top of a low fire) must still encode."""
    frames = [Image.new("RGB", (8, 4), (0, 0, 0)) for _ in range(5)]
    data = frames_to_gif_bytes(frames, [90] * 5)
    decoded, durations, _loop = split_gif_frames(data)
    assert len(decoded) == 1 and durations == [450]
    assert decoded[0].getpixel((0, 0)) == (0, 0, 0)


def test_gif_roundtrip():
    frames = [Image.new("RGB", (8, 4), (255, 0, 0)), Image.new("RGB", (8, 4), (0, 0, 255))]
    data = frames_to_gif_bytes(frames, [100, 200])
    decoded, durations, _loop = split_gif_frames(data)
    assert len(decoded) == 2
    assert durations == [100, 200]
    assert decoded[0].getpixel((0, 0)) == (255, 0, 0)
    assert decoded[1].getpixel((0, 0)) == (0, 0, 255)


def test_render_bars_vertical_geometry_and_colours():
    from custom_components.ipixel_color.device.charts import render_bars

    image = render_bars(8, 4, [0, 50, 100], maximum=100, gap=0, bar_width=2, colors=["ff0000"], margin=0)
    px = image.load()
    assert image.size == (8, 4)
    # three bars of 2 px, centred: x = 1..6; bar 0 is empty, bar 1 half, bar 2 full
    assert px[1, 3] == (0, 0, 0) and px[2, 3] == (0, 0, 0)
    assert px[3, 3] == (255, 0, 0) and px[3, 2] == (255, 0, 0) and px[3, 1] == (0, 0, 0)
    assert all(px[5, y] == (255, 0, 0) for y in range(4))
    # a tiny positive value still shows one pixel; values are clamped to the range
    tiny = render_bars(2, 10, [0.1, 500], maximum=100, gap=0).load()
    assert tiny[0, 9] != (0, 0, 0) and tiny[0, 8] == (0, 0, 0) and tiny[1, 0] != (0, 0, 0)


def test_render_bars_modes_segments_and_baseline():
    from custom_components.ipixel_color.device.charts import render_bars

    # by_value: a full bar gets the high colour, an empty-ish one the low colour
    px = render_bars(2, 10, [0.1, 100], maximum=100, gap=0, color_mode="by_value", color_low="00ff00", color_high="ff0000").load()
    assert px[1, 0] == (255, 0, 0) and px[0, 9] == (0, 255, 0)
    # gradient: base is low, top is high, regardless of the value
    px = render_bars(1, 10, [100], color_mode="gradient", color_low="0000ff", color_high="ff0000").load()
    assert px[0, 9] == (0, 0, 255) and px[0, 0] == (255, 0, 0)
    # segments of 2 px with one dark pixel in between, counted from the base
    px = render_bars(1, 10, [100], segment=2, colors=["ffffff"]).load()
    assert [px[0, 9 - k] == (255, 255, 255) for k in range(6)] == [True, True, False, True, True, False]
    # horizontal bars grow from the left; the baseline is the first column
    image = render_bars(10, 3, [50, 100], maximum=100, gap=0, orientation="horizontal", baseline=True, baseline_color="404040", colors=["ffffff"])
    px = image.load()
    assert px[4, 0] == (255, 255, 255) and px[5, 0] == (0, 0, 0) and px[9, 1] == (255, 255, 255)
    assert px[0, 2] == (64, 64, 64), "baseline where no bar covers it"
    # margin and background
    px = render_bars(6, 6, [100], margin=2, background="101010", colors=["ffffff"]).load()
    assert px[0, 0] == (16, 16, 16) and px[2, 2] == (255, 255, 255) and px[2, 1] == (16, 16, 16)
    with pytest.raises(ValueError):
        render_bars(4, 4, [])
    with pytest.raises(ValueError):
        render_bars(4, 4, [1], color_mode="rainbow")


def test_render_bars_groups_labels_and_values():
    from custom_components.ipixel_color.device.charts import load_label_font, render_bars, render_text

    # the bundled 3x5 font gives 5 rows and a 4 px pitch; "nuc" has no ascender so it sits on the baseline
    mask = render_text("18", load_label_font("3x5"))
    assert mask is not None and mask.size == (7, 5)
    assert render_text("", load_label_font("3x5")) is None
    assert render_text("x", load_label_font("5x7")).height == 7

    # horizontal groups: label row, then CPU (blue) and memory (orange) bars of 4 px; numbers at the right
    image = render_bars(
        64, 64, [50, 100, 0, 25], maximum=100, orientation="horizontal", group_size=2, gap=0, group_gap=2,
        labels=["thinred", "xred"], colors=["0000ff", "ffa000"], show_values=True, label_color="ffffff",
    )
    px = image.load()
    # free = 64 - 2 - 2 * 6 = 50 -> bars of 50 // 4 = 12 px; group span 30, total 62, start 1
    assert px[0, 7] == (0, 0, 255) and px[31, 7] == (0, 0, 255) and px[32, 7] == (0, 0, 0), "CPU half"
    assert px[63, 19] == (255, 160, 0) and px[63, 30] == (255, 160, 0) and px[63, 31] == (0, 0, 0), "memory full"
    assert px[0, 39] == (0, 0, 0), "second node idle"
    white = [(x, y) for x in range(64) for y in range(1, 6) if px[x, y] == (255, 255, 255)]
    assert white and min(x for x, _ in white) == 0, "label at the left of the row"
    blue_text = [(x, y) for x in range(40, 64) for y in range(1, 6) if px[x, y] == (0, 0, 255)]
    orange_text = [(x, y) for x in range(40, 64) for y in range(1, 6) if px[x, y] == (255, 160, 0)]
    assert blue_text and orange_text and max(x for x, _ in orange_text) == 63, "values right-aligned in bar colours"
    assert max(x for x, _ in blue_text) < min(x for x, _ in orange_text)

    # vertical groups: labels under the bars, values above, bars in between
    image = render_bars(32, 20, [100, 100], maximum=100, group_size=2, gap=1, labels=["a"], show_values=True, colors=["ff0000", "00ff00"])
    px = image.load()
    assert px[0, 19] == (0, 0, 0) and px[0, 13] == (255, 0, 0) and px[0, 6] == (255, 0, 0) and px[0, 5] == (0, 0, 0), "bars span rows 6..13"
    assert any(px[x, 19] != (0, 0, 0) for x in range(32)) and any(px[x, 0] != (0, 0, 0) for x in range(32)), "label row and value row"
    # a single colour per position when grouped; per bar when not
    grouped = render_bars(5, 2, [1, 1, 1, 1], gap=0, group_size=2, colors=["ff0000", "00ff00"]).load()
    assert grouped[2, 1] == (0, 0, 0) and grouped[3, 1] == (255, 0, 0) and grouped[4, 1] == (0, 255, 0), "group gap of 1, colours per position"
    assert render_bars(4, 2, [1, 1, 1, 1], gap=0, colors=["ff0000", "00ff00"]).load()[2, 1] == (255, 0, 0)
    assert render_bars(4, 2, [1, 1, 1, 1], gap=0, colors=["ff0000", "00ff00", "0000ff"]).load()[2, 1] == (0, 0, 255)
    with pytest.raises(ValueError):
        render_bars(8, 8, [1], labels=["x"], label_font="9x9")
    with pytest.raises(ValueError):
        render_bars(8, 8, [1], show_values=True, value_format="{:d}")


def test_native_font_names_resolve_to_bundled_files():
    from custom_components.ipixel_color.runtime import iPIXELRuntime

    assert iPIXELRuntime._native_font(None) == "UNIFONT"
    assert iPIXELRuntime._native_font("unifont") == "UNIFONT"
    # fonts/ and the card's www/fonts/ are searched, with or without the extension
    assert iPIXELRuntime._native_font("CUSONG").endswith("www/fonts/CUSONG.ttf")
    assert iPIXELRuntime._native_font("5x5.ttf").endswith("fonts/5x5.ttf")
    # an unknown file falls back to the device font; a bare unknown name is passed on
    assert iPIXELRuntime._native_font("missing.ttf") == "UNIFONT"
    assert iPIXELRuntime._native_font("SOMETHING") == "SOMETHING"


def test_render_bars_animation_effects():
    from custom_components.ipixel_color.device.charts import parse_animation, render_bars, render_bars_frames

    assert parse_animation(None) == () and parse_animation("none") == ()
    assert parse_animation("space") == ("stars", "pulse")
    assert parse_animation(["radar", "grow"]) == ("stars", "scan", "grow")
    assert parse_animation("pulse, pulse, scan") == ("pulse", "scan")
    with pytest.raises(ValueError):
        parse_animation("warp")

    # a still is one frame; an animation is a loop of `frames` images
    assert len(render_bars_frames(16, 8, [1, 2])) == 1
    frames = render_bars_frames(32, 16, [50, 100], maximum=100, gap=0, colors=["ff0000"], animation="pulse", frames=8)
    assert len(frames) == 8 and all(f.size == (32, 16) for f in frames)
    # pulse: the bar is brighter than its colour somewhere, and the frames differ
    lit = [max(f.getpixel((20, y))[1] for y in range(16)) for f in frames]
    assert max(lit) > 0 and lit.count(lit[0]) < 8
    # stars: dim pixels in an area no bar covers, twinkling between frames
    frames = render_bars_frames(32, 16, [10], maximum=100, animation="stars", frames=6, seed=3)
    sky = [sum(1 for x in range(32) for y in range(0, 8) if f.getpixel((x, y)) != (0, 0, 0)) for f in frames]
    assert all(n > 0 for n in sky)
    assert any(frames[0].getpixel((x, y)) != frames[3].getpixel((x, y)) for x in range(32) for y in range(8))
    # scan: a horizontal line moves down a vertical chart
    frames = render_bars_frames(8, 8, [0], animation="scan", frames=8)
    rows = [max(range(8), key=lambda y: sum(frames[k].getpixel((0, y)))) for k in (0, 4)]  # brightest row = head of the sweep
    assert rows == [0, 4]
    # grow: the bar is short in the first frame and full from the middle of the loop on
    frames = render_bars_frames(1, 10, [100], animation="grow", frames=10, colors=["ffffff"])
    heights = [sum(1 for y in range(10) if f.getpixel((0, y)) == (255, 255, 255)) for f in frames]
    assert heights[0] < heights[2] < heights[4] == 10 and heights[-1] == 10
    # render_bars ignores an animation and keeps returning one image
    assert render_bars(4, 4, [1], animation="space").size == (4, 4)


def test_render_bars_track_and_star_colour():
    from custom_components.ipixel_color.device.charts import render_bars, render_bars_frames

    # the empty rest of a bar is painted in the track colour, the bar itself keeps its colour
    px = render_bars(1, 10, [50], maximum=100, colors=["fca311"], track="14213d").load()
    assert px[0, 9] == (252, 163, 17) and px[0, 5] == (252, 163, 17) and px[0, 4] == (20, 33, 61) and px[0, 0] == (20, 33, 61)
    # with one star colour every lit sky pixel is a shade of that tone (grey here: r == g == b)
    frames = render_bars_frames(32, 16, [10], maximum=100, animation="stars", frames=3, seed=3, star_color="e5e5e5")
    sky = [frames[0].getpixel((x, y)) for x in range(32) for y in range(8) if frames[0].getpixel((x, y)) != (0, 0, 0)]
    assert sky and all(r == g == b for r, g, b in sky)


def test_add_caption_puts_text_under_a_scaled_picture():
    from custom_components.ipixel_color.device.caption import add_caption

    bell = Image.new("RGB", (32, 32), (255, 200, 0))
    (frame,) = add_caption([bell], 64, 64, "Voordeur", font="5x7", color="ffffff", background="000000")
    assert frame.size == (64, 64)
    px = frame.load()
    # band of 7 + 2 rows at the bottom; the picture is scaled to 55x55 and centred above it
    assert px[32, 54] == (255, 200, 0) and px[32, 0] == (255, 200, 0)
    assert px[0, 27] == (0, 0, 0) and px[63, 27] == (0, 0, 0), "room left and right of the square picture"
    band = [px[x, y] for y in range(55, 64) for x in range(64)]
    assert (255, 255, 255) in band and (255, 200, 0) not in band
    assert all(px[x, 55] == (0, 0, 0) for x in range(64)), "one empty row above the text"

    # on top, a TTF font with a size, GIF frames keep their count
    frames = add_caption([bell, bell.rotate(90)], 64, 64, "Poort", font="7x5.ttf", size=12, position="top")
    assert len(frames) == 2 and any(frames[0].getpixel((x, 1)) == (255, 255, 255) for x in range(64)) is False
    assert any(frames[0].getpixel((x, y)) == (255, 255, 255) for y in range(1, 14) for x in range(64))
    assert frames[0].getpixel((32, 63)) == (255, 200, 0)

    with pytest.raises(ValueError):
        add_caption([bell], 64, 64, "x", font="nope.ttf")
    with pytest.raises(ValueError):
        add_caption([bell], 64, 64, "x", position="left")
    # no text: the picture simply fills the canvas
    (plain,) = add_caption([bell], 64, 64, "  ")
    assert plain.getpixel((0, 63)) == (255, 200, 0)
