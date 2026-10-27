/**
 * iPIXEL Cards for Home Assistant
 * Entry point - imports all modules and registers custom elements
 */

import { CARD_VERSION } from './version.js';
import { iPIXELDisplayCard } from './cards/display-card.js';
import { iPIXELWallCard } from './cards/wall-card.js';
import { iPIXELControlsCard } from './cards/controls-card.js';
import { iPIXELTextCard } from './cards/text-card.js';
import { iPIXELPlaylistCard } from './cards/playlist-card.js';
import { iPIXELScheduleCard } from './cards/schedule-card.js';
import { iPIXELEditorCard } from './cards/editor-card.js';
import { iPIXELSimpleEditor } from './editor.js';

// Initialize shared state
import './state.js';

// Register custom elements
customElements.define('ipixel-wall-card', iPIXELWallCard);
customElements.define('ipixel-display-card', iPIXELDisplayCard);
customElements.define('ipixel-controls-card', iPIXELControlsCard);
customElements.define('ipixel-text-card', iPIXELTextCard);
customElements.define('ipixel-playlist-card', iPIXELPlaylistCard);
customElements.define('ipixel-schedule-card', iPIXELScheduleCard);
customElements.define('ipixel-editor-card', iPIXELEditorCard);
customElements.define('ipixel-simple-editor', iPIXELSimpleEditor);

// Register with Home Assistant's custom card registry
window.customCards = window.customCards || [];
[
  { type: 'ipixel-wall-card', name: 'iPIXEL Wall', description: 'Live preview of a panel or combined display (real frames, panels shown as tiles) with power, brightness, mode and text' },
  { type: 'ipixel-display-card', name: 'iPIXEL Display', description: 'Simulated LED matrix preview with effects (no device needed)' },
  { type: 'ipixel-controls-card', name: 'iPIXEL Controls', description: 'Brightness, mode, and orientation controls' },
  { type: 'ipixel-text-card', name: 'iPIXEL Text', description: 'Text input with effects and colors' },
  { type: 'ipixel-playlist-card', name: 'iPIXEL Playlist', description: 'Playlist management' },
  { type: 'ipixel-schedule-card', name: 'iPIXEL Schedule', description: 'Power schedule and time slots' },
  { type: 'ipixel-editor-card', name: 'iPIXEL Pixel Editor', description: 'Draw custom pixel art and send to your LED matrix' },
].forEach(card => window.customCards.push({
  ...card,
  preview: true,
  documentationURL: 'https://github.com/wian007/ha-ipixel-color'
}));

// Log version
console.info(
  `%c iPIXEL Cards %c ${CARD_VERSION} `,
  'background:#03a9f4;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;',
  'background:#333;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;'
);
