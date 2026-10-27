"""Tests for the combined display layout maths."""
from custom_components.ipixel_color.display.layout import PanelSpec, compute_layout


def test_single_row_side_by_side():
    layout = compute_layout(
        [
            PanelSpec("b", row=0, col=1, width=64, height=16),
            PanelSpec("a", row=0, col=0, width=64, height=16),
        ]
    )
    assert (layout.width, layout.height) == (128, 16)
    assert layout.tile_for("a").box == (0, 0, 64, 16)
    assert layout.tile_for("b").box == (64, 0, 128, 16)


def test_grid_with_mixed_sizes():
    layout = compute_layout(
        [
            PanelSpec("tl", row=0, col=0, width=64, height=16),
            PanelSpec("tr", row=0, col=1, width=32, height=32),
            PanelSpec("bl", row=1, col=0, width=64, height=16),
        ]
    )
    assert (layout.width, layout.height) == (96, 48)
    assert layout.tile_for("tr").box == (64, 0, 96, 32)
    assert layout.tile_for("bl").box == (0, 32, 64, 48)


def test_two_by_two_grid():
    layout = compute_layout(
        [
            PanelSpec("p0", row=0, col=0, width=64, height=16),
            PanelSpec("p1", row=0, col=1, width=64, height=16),
            PanelSpec("p2", row=1, col=0, width=64, height=16),
            PanelSpec("p3", row=1, col=1, width=64, height=16),
        ]
    )
    assert (layout.width, layout.height) == (128, 32)
    assert layout.tile_for("p3").box == (64, 16, 128, 32)


def test_map_point():
    layout = compute_layout(
        [
            PanelSpec("a", row=0, col=0, width=64, height=16),
            PanelSpec("b", row=0, col=1, width=64, height=16),
        ]
    )
    tile, x, y = layout.map_point(70, 5)
    assert tile.key == "b" and (x, y) == (6, 5)
    assert layout.map_point(200, 5) is None


def test_empty_layout():
    layout = compute_layout([])
    assert layout.width == 0 and layout.height == 0 and layout.tiles == ()
