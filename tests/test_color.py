"""Unit tests for colour helpers."""
import pytest

from custom_components.ipixel_color.color import hex_to_rgb, hex_to_rgb_normalized, parse_color, rgb_to_hex


def test_rgb_to_hex_is_lowercase_without_hash():
    assert rgb_to_hex(255, 255, 255) == "ffffff"
    assert rgb_to_hex(16, 32, 255) == "1020ff"
    assert rgb_to_hex(171, 205, 239) == "abcdef"


@pytest.mark.parametrize("value", ["ffffff", "#ffffff", " #FFFFFF "])
def test_hex_to_rgb_accepts_hash_and_case(value):
    assert hex_to_rgb(value) == (255, 255, 255)


@pytest.mark.parametrize("value", ["fff", "zzzzzz", ""])
def test_hex_to_rgb_rejects_invalid(value):
    with pytest.raises(ValueError):
        hex_to_rgb(value)


def test_roundtrip():
    assert hex_to_rgb(rgb_to_hex(171, 205, 239)) == (171, 205, 239)


def test_normalized():
    assert hex_to_rgb_normalized("ffffff") == (1.0, 1.0, 1.0)
    assert hex_to_rgb_normalized("000000") == (0.0, 0.0, 0.0)


def test_parse_color_accepts_lists_hex_and_falls_back():
    assert parse_color([255, 128, 0]) == (255, 128, 0)
    assert parse_color([1, 2, 3, 4]) == (1, 2, 3)
    assert parse_color("#00ff00") == (0, 255, 0)
    assert parse_color("nonsense", default=(9, 9, 9)) == (9, 9, 9)
    assert parse_color(None, default=(1, 1, 1)) == (1, 1, 1)
