"""Unit tests for iPIXELScheduleManager and related data classes."""
from __future__ import annotations

from datetime import datetime
from unittest.mock import patch

import pytest

from custom_components.ipixel_color.schedule import (
    PowerSchedule,
    ScheduleItem,
    TimeSlot,
)


# ── ScheduleItem ─────────────────────────────────────────────────────────────

class TestScheduleItem:
    def test_default_id_is_unique(self) -> None:
        a = ScheduleItem()
        b = ScheduleItem()
        assert a.id != b.id

    def test_roundtrip_serialisation(self) -> None:
        item = ScheduleItem(name="Hello", text="Hi there", color="ff0000")
        restored = ScheduleItem.from_dict(item.to_dict())
        assert restored.name == item.name
        assert restored.text == item.text
        assert restored.color == item.color


# ── TimeSlot ─────────────────────────────────────────────────────────────────

class TestTimeSlotIsActiveNow:
    """Tests for TimeSlot.is_active_now()."""

    def _slot(self, start: str, end: str, days=None) -> TimeSlot:
        return TimeSlot(
            start_time=start,
            end_time=end,
            days=days or ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        )

    def _patch_now(self, weekday_abbr: str, time_str: str):
        """Return a context manager that patches datetime.now() to a fixed moment."""
        dt_str = f"2024-01-01 {time_str}"  # 2024-01-01 is a Monday
        # Map abbreviated weekday to an actual Monday–Sunday date
        day_offsets = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
        offset = day_offsets.get(weekday_abbr, 0)
        dt_str = f"2024-01-0{1 + offset} {time_str}"
        fixed = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        return patch(
            "custom_components.ipixel_color.schedule.datetime",
            wraps=datetime,
        ), fixed

    def test_active_within_slot(self) -> None:
        slot = self._slot("08:00", "18:00")
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 12, 0)  # Monday 12:00
            mock_dt.strptime = datetime.strptime
            assert slot.is_active_now() is True

    def test_inactive_outside_slot(self) -> None:
        slot = self._slot("08:00", "18:00")
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 6, 0)  # Monday 06:00
            mock_dt.strptime = datetime.strptime
            assert slot.is_active_now() is False

    def test_overnight_slot_before_midnight(self) -> None:
        slot = self._slot("22:00", "06:00")
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 23, 0)  # 23:00
            mock_dt.strptime = datetime.strptime
            assert slot.is_active_now() is True

    def test_overnight_slot_after_midnight(self) -> None:
        slot = self._slot("22:00", "06:00")
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 2, 4, 0)  # 04:00 Tuesday
            mock_dt.strptime = datetime.strptime
            assert slot.is_active_now() is True

    def test_disabled_slot_never_active(self) -> None:
        slot = self._slot("00:00", "23:59")
        slot.enabled = False
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 12, 0)
            mock_dt.strptime = datetime.strptime
            assert slot.is_active_now() is False

    def test_wrong_day_is_inactive(self) -> None:
        slot = self._slot("08:00", "18:00", days=["sat", "sun"])
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 12, 0)  # Monday
            mock_dt.strptime = datetime.strptime
            assert slot.is_active_now() is False


# ── PowerSchedule ─────────────────────────────────────────────────────────────

class TestPowerScheduleShouldBeOn:
    def test_disabled_always_on(self) -> None:
        ps = PowerSchedule(enabled=False)
        assert ps.should_be_on() is True

    def test_on_during_active_hours(self) -> None:
        ps = PowerSchedule(enabled=True, on_time="07:00", off_time="22:00")
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 12, 0)  # Monday noon
            mock_dt.strptime = datetime.strptime
            assert ps.should_be_on() is True

    def test_off_outside_active_hours(self) -> None:
        ps = PowerSchedule(enabled=True, on_time="07:00", off_time="22:00")
        with patch("custom_components.ipixel_color.schedule.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 23, 30)  # Monday 23:30
            mock_dt.strptime = datetime.strptime
            assert ps.should_be_on() is False
