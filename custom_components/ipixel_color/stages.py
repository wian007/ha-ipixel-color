"""Staged animations: pre-stored GIFs switched by a sensor value.

A set of GIFs ("stages", ordered from low to high) is uploaded once into
consecutive storage slots of the panels. From then on showing a stage is a
single show-slot command, which a combined display sends to all panels in
one burst and starts in step. With a source entity and thresholds the stage
follows the entity automatically; the mapping is persisted so it keeps
working after a restart without uploading anything again.
"""
from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from typing import TYPE_CHECKING, Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import EventStateChangedData, async_track_state_change_event
from homeassistant.helpers.storage import Store

from .exceptions import iPIXELCommandError, iPIXELError

if TYPE_CHECKING:
    from .runtime import iPIXELRuntime

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = "ipixel_color_stages"
DEFAULT_BASE_SLOT = 10


@dataclass
class StageConfig:
    """What is stored in which slot and which entity drives the stage."""

    sources: list[str] = field(default_factory=list)  # URLs / media ids, low to high
    base_slot: int = DEFAULT_BASE_SLOT
    entity_id: str | None = None
    thresholds: list[float] = field(default_factory=list)  # len(sources) - 1, ascending
    current: int | None = None

    @property
    def count(self) -> int:
        return len(self.sources)

    def stage_for(self, value: float) -> int:
        """Return the stage index for a value (number of thresholds it is at or above)."""
        return sum(1 for limit in self.thresholds if value >= limit)

    def slot_for(self, stage: int) -> int:
        return self.base_slot + stage

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> StageConfig:
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


class StageManager:
    """Uploads the stages of one display and follows its source entity."""

    def __init__(self, hass: HomeAssistant, runtime: iPIXELRuntime) -> None:
        self.hass = hass
        self.runtime = runtime
        self.config: StageConfig | None = None
        self._store: Store = Store(hass, STORAGE_VERSION, f"{STORAGE_KEY}_{runtime.entry.entry_id}")
        self._unsub: CALLBACK_TYPE | None = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------
    async def async_load(self) -> None:
        """Restore the mapping and start following the source again."""
        data = await self._store.async_load()
        if not data:
            return
        self.config = StageConfig.from_dict(data)
        self._start_following()

    async def async_shutdown(self) -> None:
        self._stop_following()

    async def _async_save(self) -> None:
        await self._store.async_save(self.config.to_dict() if self.config else None)

    # ------------------------------------------------------------------
    # Services
    # ------------------------------------------------------------------
    async def async_set_stages(
        self,
        sources: list[str],
        *,
        base_slot: int = DEFAULT_BASE_SLOT,
        entity_id: str | None = None,
        thresholds: list[float] | None = None,
        upload: bool = True,
    ) -> None:
        """Store the stages in slots (optionally) and start following the source."""
        if len(sources) < 2:
            raise iPIXELCommandError("At least two stages are needed")
        thresholds = sorted(float(t) for t in (thresholds or []))
        if entity_id and len(thresholds) != len(sources) - 1:
            raise iPIXELCommandError(
                f"{len(sources)} stages need {len(sources) - 1} thresholds, got {len(thresholds)}"
            )
        if not 1 <= base_slot <= 255 - (len(sources) - 1):
            raise iPIXELCommandError(f"Slots {base_slot}..{base_slot + len(sources) - 1} are out of range 1-255")
        self._stop_following()
        self.config = StageConfig(sources=list(sources), base_slot=int(base_slot), entity_id=entity_id, thresholds=thresholds)
        if upload:
            for index, source in enumerate(sources):
                slot = self.config.slot_for(index)
                _LOGGER.info("%s: storing stage %d (%s) in slot %d", self.runtime.name, index, source, slot)
                data, extension = await self.runtime.async_fetch_image(source)
                await self.runtime.async_show_image_bytes(data, extension, save_slot=slot)
        await self._async_save()
        self._start_following()
        if entity_id:
            await self.async_update_from_source(force=True)

    async def async_show_stage(self, stage: int, *, in_step: bool = False) -> None:
        """Show a stage now (its slot must have been stored)."""
        if self.config is None:
            raise iPIXELCommandError("No stages configured; call set_stages first")
        if not 0 <= stage < self.config.count:
            raise iPIXELCommandError(f"Stage {stage} does not exist (0-{self.config.count - 1})")
        await self.runtime.async_show_slot(self.config.slot_for(stage), in_step=in_step)
        self.config.current = stage
        await self._async_save()

    async def async_clear(self) -> None:
        """Forget the stages (the slots stay on the panels)."""
        self._stop_following()
        self.config = None
        await self._async_save()

    # ------------------------------------------------------------------
    # Following the source entity
    # ------------------------------------------------------------------
    def _start_following(self) -> None:
        if self.config is None or not self.config.entity_id:
            return
        self._unsub = async_track_state_change_event(self.hass, [self.config.entity_id], self._on_source_changed)

    def _stop_following(self) -> None:
        if self._unsub is not None:
            self._unsub()
            self._unsub = None

    @callback
    def _on_source_changed(self, event: Event[EventStateChangedData]) -> None:
        self.hass.async_create_task(self.async_update_from_source())

    async def async_update_from_source(self, *, force: bool = False) -> None:
        """Show the stage that matches the source value if it changed."""
        config = self.config
        if config is None or not config.entity_id:
            return
        state = self.hass.states.get(config.entity_id)
        try:
            value = float(state.state) if state is not None else None
        except (TypeError, ValueError):
            value = None
        if value is None:
            _LOGGER.debug("%s: source %s has no numeric value", self.runtime.name, config.entity_id)
            return
        stage = min(config.stage_for(value), config.count - 1)
        if stage == config.current and not force:
            return
        _LOGGER.info("%s: %s = %s -> stage %d (slot %d)", self.runtime.name, config.entity_id, value, stage, config.slot_for(stage))
        try:
            await self.runtime.async_show_slot(config.slot_for(stage))
        except iPIXELError as err:
            _LOGGER.warning("%s: could not show stage %d: %s", self.runtime.name, stage, err)
            return
        config.current = stage
        await self._async_save()
