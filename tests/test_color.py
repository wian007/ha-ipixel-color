"""Unit tests for color conversion utilities (color.py)."""
from __future__ import annotations

import pytest

from custom_components.ipixel_color.color import (
    hex_to_rgb,
    hex_to_rgb_normalized,
    rgb_to_hex,
    rgb_tuple_to_hex,
)


# ── rgb_to_hex ────────────────────────────────────────────────────────────────

class TestRgbToHex:
    def test_white(self) -> None:
        assert rgb_to_hex(255, 255, 255) == "ffffff"

    def test_black(self) -> None:
        assert rgb_to_hex(0, 0, 0) == "000000"

    def test_primary_red(self) -> None:
        assert rgb_to_hex(255, 0, 0) == "ff0000"

    def test_primary_green(self) -> None:
        assert rgb_to_hex(0, 255, 0) == "00ff00"

    def test_primary_blue(self) -> None:
        assert rgb_to_hex(0, 0, 255) == "0000ff"

    def test_arbitrary_colour(self) -> None:
        assert rgb_to_hex(16, 32, 255) == "1020ff"

    def test_lowercase_output(self) -> None:
        # Output must always be lowercase to match device expectations
        result = rgb_to_hex(171, 205, 239)
        assert result == result.lower()


# ── rgb_tuple_to_hex ──────────────────────────────────────────────────────────

class TestRgbTupleToHex:
    def test_tuple_input(self) -> None:
        assert rgb_tuple_to_hex((255, 128, 0)) == "ff8000"

    def test_list_input(self) -> None:
        assert rgb_tuple_to_hex([0, 0, 0]) == "000000"

    def test_extra_elements_ignored(self) -> None:
        # Services pass [r, g, b, ...] arrays; only first three should be used
        assert rgb_tuple_to_hex([255, 255, 255, 128]) == "ffffff"


# ── hex_to_rgb ────────────────────────────────────────────────────────────────

class TestHexToRgb:
    def test_plain_hex(self) -> None:
        assert hex_to_rgb("ffffff") == (255, 255, 255)

    def test_hash_prefix(self) -> None:
        assert hex_to_rgb("#ffffff") == (255, 255, 255)

    def test_black(self) -> None:
        assert hex_to_rgb("000000") == (0, 0, 0)

    def test_arbitrary(self) -> None:
        assert hex_to_rgb("1020ff") == (16, 32, 255)

    def test_invalid_length_raises(self) -> None:
        with pytest.raises(ValueError):
            hex_to_rgb("fff")

    def test_invalid_chars_raises(self) -> None:
        with pytest.raises(ValueError):
            hex_to_rgb("zzzzzz")

    def test_roundtrip(self) -> None:
        original = (171, 205, 239)
        assert hex_to_rgb(rgb_to_hex(*original)) == original


# ── hex_to_rgb_normalized ─────────────────────────────────────────────────────

class TestHexToRgbNormalized:
    def test_white_is_ones(self) -> None:
        assert hex_to_rgb_normalized("ffffff") == (1.0, 1.0, 1.0)

    def test_black_is_zeros(self) -> None:
        assert hex_to_rgb_normalized("000000") == (0.0, 0.0, 0.0)

    def test_range(self) -> None:
        r, g, b = hex_to_rgb_normalized("804020")
        assert 0.0 <= r <= 1.0
        assert 0.0 <= g <= 1.0
        assert 0.0 <= b <= 1.0
