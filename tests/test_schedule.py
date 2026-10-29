"""Unit tests for the schedule data classes (time slots and power schedule)."""
from datetime import datetime
from unittest.mock import patch

from custom_components.ipixel_color.schedule import PowerSchedule, ScheduleItem, TimeSlot

ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def _at(year, month, day, hour, minute):
    """Patch the Home Assistant clock used by the schedules."""
    return patch(
        "custom_components.ipixel_color.schedule.dt_util.now",
        return_value=datetime(year, month, day, hour, minute),
    )


def test_schedule_item_ids_and_roundtrip():
    assert ScheduleItem().id != ScheduleItem().id
    item = ScheduleItem(name="Hello", text="Hi there", color="ff0000", mode="text")
    restored = ScheduleItem.from_dict(item.to_dict())
    assert (restored.name, restored.text, restored.color, restored.mode) == ("Hello", "Hi there", "ff0000", "text")


def test_time_slot_active_within_window():
    slot = TimeSlot(start_time="08:00", end_time="18:00", days=ALL_DAYS)
    with _at(2024, 1, 1, 12, 0):  # Monday noon
        assert slot.is_active_now()
    with _at(2024, 1, 1, 6, 0):
        assert not slot.is_active_now()


def test_time_slot_overnight():
    slot = TimeSlot(start_time="22:00", end_time="06:00", days=ALL_DAYS)
    with _at(2024, 1, 1, 23, 0):
        assert slot.is_active_now()
    with _at(2024, 1, 2, 4, 0):
        assert slot.is_active_now()
    with _at(2024, 1, 2, 12, 0):
        assert not slot.is_active_now()


def test_time_slot_disabled_and_wrong_day():
    slot = TimeSlot(start_time="00:00", end_time="23:59", days=["sat", "sun"])
    with _at(2024, 1, 1, 12, 0):  # Monday
        assert not slot.is_active_now()
    slot.days = ALL_DAYS
    slot.enabled = False
    with _at(2024, 1, 1, 12, 0):
        assert not slot.is_active_now()


def test_power_schedule():
    assert PowerSchedule(enabled=False).should_be_on()
    schedule = PowerSchedule(enabled=True, on_time="07:00", off_time="22:00", days=ALL_DAYS)
    with _at(2024, 1, 1, 12, 0):
        assert schedule.should_be_on()
    with _at(2024, 1, 1, 23, 30):
        assert not schedule.should_be_on()
    # no schedule for this day -> default on
    schedule.days = ["sat"]
    with _at(2024, 1, 1, 23, 30):
        assert schedule.should_be_on()
