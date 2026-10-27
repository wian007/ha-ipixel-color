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
from custom_components.ipixel_color.device.image import frames_to_gif_bytes, image_to_png_bytes, split_gif_frames


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


def test_gif_roundtrip():
    frames = [Image.new("RGB", (8, 4), (255, 0, 0)), Image.new("RGB", (8, 4), (0, 0, 255))]
    data = frames_to_gif_bytes(frames, [100, 200])
    decoded, durations, _loop = split_gif_frames(data)
    assert len(decoded) == 2
    assert durations == [100, 200]
    assert decoded[0].getpixel((0, 0)) == (255, 0, 0)
    assert decoded[1].getpixel((0, 0)) == (0, 0, 255)
