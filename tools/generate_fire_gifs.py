#!/usr/bin/env python3
"""Render fire animations whose flame height follows a load level.

Produces fire_0.gif ... fire_4.gif (64x64, looping). Pair them with the
automation in examples/homelab-fire-automation.yaml to turn a 2x2 wall of
32x32 panels into a load indicator: the busier the homelab, the higher the
flames. The fire is simulated at 32x32 and shown at 64x64, which keeps the
files small (6-17 KB) so they upload in seconds through a Bluetooth proxy.

    python tools/generate_fire_gifs.py /path/to/media/fire
"""
from __future__ import annotations

import random
import sys
from pathlib import Path

from PIL import Image

FIELD = 32  # simulation size
OUT = 64  # output size (the 2x2 wall)
FRAMES = 14
DURATION_MS = 100
# cooling per row and source heat per level: lower cooling = taller flames
LEVELS = [(0.19, 0.70), (0.12, 0.85), (0.080, 1.0), (0.052, 1.0), (0.034, 1.0)]
STOPS = [
    (0.0, (0, 0, 0)),
    (0.15, (70, 0, 0)),
    (0.32, (180, 25, 0)),
    (0.52, (245, 95, 0)),
    (0.72, (255, 185, 25)),
    (0.88, (255, 236, 120)),
    (1.0, (255, 255, 225)),
]


def colour(value: float) -> tuple[int, int, int]:
    value = max(0.0, min(1.0, value))
    for (a, ca), (b, cb) in zip(STOPS, STOPS[1:]):
        if value <= b:
            t = (value - a) / (b - a) if b > a else 0
            return tuple(int(ca[i] + (cb[i] - ca[i]) * t) for i in range(3))  # type: ignore[return-value]
    return STOPS[-1][1]


def render(level: int) -> list[Image.Image]:
    cooling, source = LEVELS[level]
    rng = random.Random(42 + level)
    heat = [[0.0] * FIELD for _ in range(FIELD)]
    frames: list[Image.Image] = []
    for step in range(FRAMES + 30):  # 30 warm-up steps before recording
        for x in range(FIELD):
            heat[FIELD - 1][x] = source * (0.6 + 0.4 * rng.random())
        for y in range(FIELD - 1):
            row, below, below2 = heat[y], heat[y + 1], heat[min(FIELD - 1, y + 2)]
            for x in range(FIELD):
                v = (below[(x - 1) % FIELD] + below[x] * 2 + below[(x + 1) % FIELD] + below2[x]) / 5.0
                v -= cooling * (0.5 + rng.random())
                row[x] = v if v > 0 else 0.0
        if step >= 30:
            image = Image.new("RGB", (FIELD, FIELD))
            pixels = image.load()
            for y in range(FIELD):
                for x in range(FIELD):
                    pixels[x, y] = colour(heat[y][x])
            frames.append(image.resize((OUT, OUT), Image.NEAREST).quantize(colors=24, dither=Image.Dither.NONE))
    return frames


def main() -> None:
    target = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    target.mkdir(parents=True, exist_ok=True)
    for level in range(len(LEVELS)):
        frames = render(level)
        path = target / f"fire_{level}.gif"
        frames[0].save(path, save_all=True, append_images=frames[1:], duration=DURATION_MS, loop=0, optimize=True)
        print(f"{path} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
