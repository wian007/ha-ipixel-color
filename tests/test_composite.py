"""Tests for CompositeDisplay without Home Assistant."""
from __future__ import annotations

import pytest
from PIL import Image

from custom_components.ipixel_color.display.base import Display
from custom_components.ipixel_color.display.composite import CompositeDisplay, MemberSpec
from custom_components.ipixel_color.exceptions import iPIXELError, iPIXELNotAvailableError


class StubPanel(Display):
    """Minimal panel recording what it receives."""

    def __init__(self, name, width, height, fail=False):
        self._name, self._width, self._height, self.fail = name, width, height, fail
        self.images: list[Image.Image] = []
        self.gifs: list[list[Image.Image]] = []
        self.frames: list[Image.Image] = []
        self.pixels: list[list[dict]] = []
        self.calls: list[tuple] = []

    name = property(lambda self: self._name)
    width = property(lambda self: self._width)
    height = property(lambda self: self._height)
    is_connected = property(lambda self: True)
    available = property(lambda self: True)
    panels = property(lambda self: [self])

    def add_listener(self, listener):
        return lambda: None

    async def async_connect(self):
        pass

    async def async_disconnect(self):
        pass

    async def async_show_image(self, image, *, save_slot=0):
        if self.fail:
            raise iPIXELError("boom")
        self.images.append(image)

    async def async_show_gif(self, frames, durations, *, loop=0, save_slot=0):
        self.gifs.append(frames)

    async def async_show_frame(self, image, brightness=100):
        self.frames.append(image)

    async def async_set_pixels(self, pixels):
        self.pixels.append(pixels)

    async def async_fill(self, color):
        self.calls.append(("fill", color))

    async def async_show_native_text(self, text, **kwargs):
        self.calls.append(("text", text))

    async def async_set_clock_mode(self, **kwargs):
        self.calls.append(("clock", kwargs))

    async def async_set_rhythm_mode(self, style, speed=4):
        self.calls.append(("rhythm", style, speed))

    async def async_set_power(self, on):
        self.calls.append(("power", on))

    async def async_set_brightness(self, level):
        self.calls.append(("brightness", level))

    async def async_set_orientation(self, orientation):
        self.calls.append(("orientation", orientation))

    async def async_clear(self):
        self.calls.append(("clear",))

    async def async_sync_time(self):
        self.calls.append(("sync",))

    async def async_set_fun_mode(self, enable):
        self.calls.append(("fun", enable))

    async def async_call(self, method, *args, **kwargs):
        self.calls.append((method, args))


def make_composite(panels: dict[str, StubPanel], members):
    return CompositeDisplay(name="combo", members=members, resolver=lambda key: panels.get(key))


@pytest.fixture
def two_panels():
    panels = {"left": StubPanel("left", 64, 16), "right": StubPanel("right", 64, 16)}
    composite = make_composite(panels, [MemberSpec("left", 0, 0), MemberSpec("right", 0, 1)])
    return panels, composite


async def test_size_and_image_slicing(two_panels):
    panels, composite = two_panels
    assert (composite.width, composite.height) == (128, 16)

    canvas = Image.new("RGB", (128, 16), (0, 0, 0))
    for x in range(64):
        for y in range(16):
            canvas.putpixel((x, y), (255, 0, 0))
            canvas.putpixel((x + 64, y), (0, 0, 255))
    await composite.async_show_image(canvas)

    assert panels["left"].images[0].size == (64, 16)
    assert panels["left"].images[0].getpixel((10, 5)) == (255, 0, 0)
    assert panels["right"].images[0].getpixel((10, 5)) == (0, 0, 255)


async def test_gif_and_frame_slicing(two_panels):
    panels, composite = two_panels
    frames = [Image.new("RGB", (128, 16), (1, 2, 3)), Image.new("RGB", (128, 16), (4, 5, 6))]
    await composite.async_show_gif(frames, [50, 50])
    assert len(panels["left"].gifs[0]) == 2
    assert panels["right"].gifs[0][1].getpixel((0, 0)) == (4, 5, 6)

    await composite.async_show_frame(Image.new("RGB", (128, 16), (9, 9, 9)))
    assert panels["left"].frames[0].size == (64, 16)


async def test_canvas_is_resized_when_needed(two_panels):
    panels, composite = two_panels
    await composite.async_show_image(Image.new("RGB", (256, 32), (7, 7, 7)))
    assert panels["right"].images[0].size == (64, 16)


async def test_pixels_are_routed(two_panels):
    panels, composite = two_panels
    await composite.async_set_pixels(
        [{"x": 3, "y": 4, "color": "ff0000"}, {"x": 70, "y": 1, "color": "00ff00"}, {"x": 500, "y": 0, "color": "ffffff"}]
    )
    assert panels["left"].pixels == [[{"x": 3, "y": 4, "color": "ff0000"}]]
    assert panels["right"].pixels == [[{"x": 6, "y": 1, "color": "00ff00"}]]


async def test_broadcast_and_partial_failure(two_panels):
    panels, composite = two_panels
    await composite.async_set_brightness(30)
    await composite.async_show_native_text("hi", color="ffffff")
    assert ("brightness", 30) in panels["left"].calls and ("brightness", 30) in panels["right"].calls
    assert ("text", "hi") in panels["right"].calls

    panels["left"].fail = True
    await composite.async_show_image(Image.new("RGB", (128, 16)))  # one failure -> warning only
    assert len(panels["right"].images) == 1

    panels["right"].fail = True
    with pytest.raises(iPIXELError):
        await composite.async_show_image(Image.new("RGB", (128, 16)))


async def test_four_panels_two_by_two():
    panels = {f"p{i}": StubPanel(f"p{i}", 64, 16) for i in range(4)}
    composite = make_composite(
        panels,
        [MemberSpec("p0", 0, 0), MemberSpec("p1", 0, 1), MemberSpec("p2", 1, 0), MemberSpec("p3", 1, 1)],
    )
    assert (composite.width, composite.height) == (128, 32)
    canvas = Image.new("RGB", (128, 32))
    colours = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]
    for index, colour in enumerate(colours):
        canvas.paste(Image.new("RGB", (64, 16), colour), ((index % 2) * 64, (index // 2) * 16))
    await composite.async_show_image(canvas)
    for index, colour in enumerate(colours):
        assert panels[f"p{index}"].images[0].getpixel((1, 1)) == colour


async def test_missing_member_is_skipped():
    panels = {"left": StubPanel("left", 32, 32)}
    composite = make_composite(panels, [MemberSpec("left", 0, 0), MemberSpec("gone", 0, 1)])
    assert composite.missing_members == ["gone"]
    assert (composite.width, composite.height) == (32, 32)
    assert composite.available and not composite.is_connected
    await composite.async_show_image(Image.new("RGB", (32, 32)))
    assert len(panels["left"].images) == 1

    empty = make_composite({}, [MemberSpec("gone", 0, 0)])
    assert not empty.available
    with pytest.raises(iPIXELNotAvailableError):
        await empty.async_show_image(Image.new("RGB", (8, 8)))
