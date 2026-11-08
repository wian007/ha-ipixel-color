# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- A panel that was away while the stage changed is sent the slot of the current stage when it
  reconnects (it used to keep playing the old stage until the next change).
- `tools/generate_fire_gifs.py` takes the number of flame levels as a second argument.
- Burst commands (synchronised show-slot and the in-step restart) wait for the panel's own
  acknowledgement and are sent again as confirmed writes when it does not arrive, so a panel can
  no longer miss a switch and stay on the previous content.
- `show_slot` and `show_stage` switch without blanking (every panel starts the new slot fresh at
  the burst); `in_step: true` adds the blank-and-release restart for re-showing a slot that is
  already playing.
- A tile of an animation that never changes (the dark top of a low fire) is stored as a still;
  it used to fail to encode, leaving those slots empty on the affected panels.
- Staged animations: `set_stages` stores a series of GIFs in slots on the panels once and
  follows a numeric entity with thresholds; a change of stage is a single show-slot command
  (instant, started in step on a combined display) instead of an upload. `show_stage` picks a
  stage by hand, `clear_stages` stops following. The mapping survives restarts.
- Animations on a combined display start in step: after the synchronised start the panels are
  blanked and released with two bursts so they all resume at the same moment (a plain show-slot
  does not restart a slot that is already playing). The same happens once a few seconds after
  all panels have (re)connected, and on demand with the new `sync_animation` service.
- Content that sits in the sync slot is not re-uploaded when a panel reconnects: the panels
  resume it themselves after a dropped link or a power cycle, in step with each other.
- Still images on a combined display are shown synchronised: stored in the sync slot on every
  panel first, then one simultaneous show-slot command (as GIFs already were).
- While placing the panels of a combined display, each panel shows the last four characters of
  its address so it is clear which panel is which.
- A panel that drops off (power cycle, out of range) is reconnected automatically as soon as it
  advertises again; it is cleared and the content Home Assistant was showing is restored,
  including the combined display it belongs to.
- Panel option *BLE packet size* (0 = automatic).
- Images and GIFs can be picked from the Home Assistant media library: the media player
  entity supports *Browse media* (pick an image in the media browser and play it on the display),
  `display_image` has a *Media* picker, and `media-source://` ids are accepted wherever a URL is
  (including the image URL entity and schedules).
- *Status pixel* switch per display: after Home Assistant has cleared the display, one green
  pixel in the top-right corner toggles every 10 s as long as HA is connected; it never runs on
  a display HA did not blank itself (after a restart the panel may show anything).

### Changed
- BLE writes are halved automatically when bulk writes fail (GATT error 133) and the panel
  option *BLE packet size* can force a size. Through a healthy ESPHome proxy (Wi-Fi power
  saving off) 244 byte writes are reliable and 2.4x faster than 100 byte ones; with power
  saving on they stall, which the automatic halving now catches.
- The ACK timeout grows with the size of an upload (large GIFs on several panels).
- A combined display uploads to panels behind the same Bluetooth proxy one at a time (parallel
  streams through one proxy only starve each other) and in parallel across adapters; a failed
  panel is retried once, and the synchronised show command is written without link-layer
  response so all panels start within milliseconds. It only goes to panels that received the
  new content.
- A panel whose notification subscription fails is reconnected instead of being kept as
  connected without ACKs (service calls used to hang for minutes).

### Fixed
- **`clear_display` no longer factory-resets the panel.** It sent opcode 0x8003, which
  pypixelcolor documents as erasing all stored content *and the device settings*; it now sends
  the non-destructive DIY blank. `set_default_mode` keeps 0x8003 and is labelled as the factory
  reset it is. (Ported from the ahzs645 fork's protocol review.)
- The hourly time sync no longer switches a powered-off panel back on (opcode 0x8001 powers the
  panel on as a side effect; the power state is re-applied).
- Native text animations 3 and 4 are refused for displays with panels other than 32x32; they
  boot-loop those panels.
- `services.yaml` could not be parsed (the `on` field of `set_power` was read as a boolean), so
  the service descriptions were missing in the UI.
- Works with Home Assistant 2026.x (tested against 2026.2 and 2026.9 / bleak 3): device
  registry lookups use the config-entry scoped API where available, the version check of the
  Lovelace card no longer reads the manifest on the event loop and native text no longer
  resolves font files on the event loop.
- Development setup follows Home Assistant's own dependency pins (`bleak`, `habluetooth`, ...)
  and installs `aiousbwatcher` and `serialx`; the simulated panel works with bleak 1.x, 2.x
  and 3.x and `make test` finds `libstdc++` on NixOS.

## [0.2.0] - 2026-09-12

### Added
- New `ipixel-wall-card`: live preview of the frame Home Assistant sent (camera preview),
  panels of a combined display drawn as tiles, power, brightness, mode and quick text.
- A combined display can be created directly from panels that are not configured yet
  (they are added as panel devices on the fly); panel devices are linked *via* their
  combined display in the device registry.
- Services use the standard Home Assistant target selector (device, entity or area).
- `display_image` replaces `display_image_url`, `upload_gif`, `display_gif`,
  `display_image_raw_rgb` and `display_image_raw_rgb_url` (`url` or `path`, `method: upload|stream`);
  `set_rhythm_mode` takes optional `levels` (replaces `set_rhythm_mode_advanced`);
  `clear_display` replaces `clear_pixels`; `set_pixels` replaces `set_pixels_batched`.
  The old names keep working with a deprecation warning.
- The Lovelace cards find their entities through the entity registry (any entity naming
  works) and only call services and entities that exist.
- Combined displays start animations synchronously: GIFs are stored in a configurable slot on
  every panel and then shown with one simultaneous show-slot command (*Animation sync slot*
  option, default 1, 0 = off).
- **Combined displays**: group several panels on a grid (row/column) and drive them as one
  large screen. Rendered text, images/GIFs, `draw_visuals` and pixel services are sliced over
  the panels and uploaded in parallel; native features (power, brightness, clock, native text,
  rhythm) are broadcast to every panel. Panels and positions can be changed via *Configure*.
- Options flow for panels: width/height override and command timeout.
- Template tracking: text containing templates is re-rendered automatically when the
  referenced entities change (Auto update on).
- Services `update_display`, `set_power`, `set_orientation`, `set_rhythm_mode`,
  `stop_visuals`, plus aliases `clear_display`, `display_image`, `display_gif`.
- Services accept `entity_id` as target and default to the only display when just one is
  configured (this also makes the bundled Lovelace cards work again).
- Diagnostics download, Dutch translation, entity translation keys.
- Test suite with a simulated panel (no hardware needed); `requirements_dev.txt`, `pyproject.toml`,
  `Makefile` and a dev container for local development.

### Changed
- Complete refactor around a `Display` abstraction (`PanelDisplay` / `CompositeDisplay`) and
  a per-entry runtime that owns the settings; entities no longer scrape each other's states.
- Bluetooth transport rewritten on top of the Home Assistant Bluetooth stack: connections are
  established on demand with retries, all writes are serialised with a lock, notifications are
  handled by one handler and the chunk size follows the negotiated MTU.
- Setting changes are debounced into one display update; nothing is sent to panels at startup.
- Entity names use `has_entity_name` (existing entity ids are kept through their unique ids).
- Config entries migrated to version 2 (`entry_type`).
- Font cache moved to the system temp directory instead of the integration folder.
- `pypixelcolor` 0.5.0 or newer is required.

### Fixed
- Time slots and the power schedule use the Home Assistant timezone instead of the OS clock.
- Errors are raised to the UI/service caller instead of being logged and swallowed.
- `send_mix_data` crashed with a `NameError` in the window builder.
- Clock 24h / show date switches sent a display update on every start-up and lost their
  restored state (duplicate `async_added_to_hass`).
- Number entities looked up related entities by guessed entity ids.
- Camera preview used a deprecated supported-features value.
- Lovelace resource registration used a non-existent `hass.data` key.
- Debug `print()` left in the text renderer; per-pixel colour mapping replaced by LUTs.

## [0.1.0] - 2024-11-19

### Added
- Initial release of iPIXEL Color Home Assistant integration
- Bluetooth auto-discovery of iPIXEL devices (`LED_BLE_*` pattern)
- Basic power on/off control via switch entity
- Manual device configuration as fallback
- Proper Home Assistant device registry integration
- Connection management with error handling
- Configuration flow with discovery and manual entry options
- English translations and UI strings

### Technical Details
- Implements core Bluetooth protocol commands based on reverse-engineered documentation
- Uses `bleak` library for cross-platform Bluetooth Low Energy communication
- Follows Home Assistant integration best practices
- Power commands: `[5, 0, 7, 1, 1]` (on) / `[5, 0, 7, 1, 0]` (off)
- Bluetooth UUIDs:
  - Write: `0000fa02-0000-1000-8000-00805f9b34fb`
  - Notify: `0000fa03-0000-1000-8000-00805f9b34fb`

### Limitations
- Only basic power control in this version
- No brightness, color, or image upload features yet
- Single switch entity per device

### Coming in Future Versions
- v0.2.0: Brightness control and basic light entity
- v0.3.0: RGB color control and display modes
- v0.4.0: Image/GIF upload and media player entity
- v1.0.0: Complete feature set and HACS submission