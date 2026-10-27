"""Pure layout maths for combining several panels into one virtual screen."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PanelSpec:
    """A panel and its grid position inside a combined display."""

    key: str
    row: int
    col: int
    width: int
    height: int


@dataclass(frozen=True)
class Tile:
    """The pixel rectangle a panel occupies inside the combined canvas."""

    key: str
    x: int
    y: int
    width: int
    height: int

    @property
    def box(self) -> tuple[int, int, int, int]:
        """Return the PIL crop box (left, top, right, bottom)."""
        return (self.x, self.y, self.x + self.width, self.y + self.height)


@dataclass(frozen=True)
class Layout:
    """Result of laying out panels on a grid."""

    tiles: tuple[Tile, ...]
    width: int
    height: int

    def tile_for(self, key: str) -> Tile | None:
        """Return the tile for a panel key."""
        for tile in self.tiles:
            if tile.key == key:
                return tile
        return None

    def map_point(self, x: int, y: int) -> tuple[Tile, int, int] | None:
        """Map a canvas coordinate to (tile, local_x, local_y)."""
        for tile in self.tiles:
            if tile.x <= x < tile.x + tile.width and tile.y <= y < tile.y + tile.height:
                return tile, x - tile.x, y - tile.y
        return None


def compute_layout(panels: list[PanelSpec]) -> Layout:
    """Place panels on a grid.

    Panels with the same ``row`` are placed side by side ordered by ``col``.
    Rows are stacked top to bottom ordered by ``row``. Each grid row is as
    high as its tallest panel, so mixing panel sizes works (smaller panels
    are top aligned within their row).
    """
    if not panels:
        return Layout(tiles=(), width=0, height=0)

    rows: dict[int, list[PanelSpec]] = {}
    for panel in panels:
        rows.setdefault(panel.row, []).append(panel)

    tiles: list[Tile] = []
    y = 0
    total_width = 0
    for row_index in sorted(rows):
        row_panels = sorted(rows[row_index], key=lambda p: (p.col, p.key))
        x = 0
        row_height = 0
        for panel in row_panels:
            tiles.append(Tile(key=panel.key, x=x, y=y, width=panel.width, height=panel.height))
            x += panel.width
            row_height = max(row_height, panel.height)
        total_width = max(total_width, x)
        y += row_height

    return Layout(tiles=tuple(tiles), width=total_width, height=y)
