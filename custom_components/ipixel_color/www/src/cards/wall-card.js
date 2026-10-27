/**
 * iPIXEL Wall Card
 *
 * Shows what Home Assistant actually sent to a panel or combined display:
 * the preview camera frame is drawn as an LED matrix, with the physical
 * panels of a combined display drawn as separate tiles. Includes power,
 * brightness, mode and a quick text input.
 *
 * config:
 *   entity: any entity of the display (text.<name>_display recommended)
 *   name: optional title
 *   refresh: seconds between frame refreshes (default 2)
 *   show_controls: true|false (default true)
 *   show_panels: draw panel outlines/gaps of a combined display (default true)
 */

import { iPIXELCardBase } from '../base.js';
import { iPIXELCardStyles } from '../styles.js';

const MODE_LABELS = {
  textimage: 'Text (rendered)',
  text: 'Text (native)',
  clock: 'Clock',
  gif: 'Image / GIF',
  rhythm: 'Rhythm',
};

// Modes the panel renders itself: Home Assistant has no frame to show.
const NATIVE_MODES = {
  text: { icon: 'M3,5H21V7H3V5M3,11H21V13H3V11M3,17H21V19H3V17Z', label: 'Scrolling text is rendered by the panel itself' },
  clock: { icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z', label: 'Clock is rendered by the panel itself' },
  rhythm: { icon: 'M10,2H14V22H10V2M4,8H8V22H4V8M16,12H20V22H16V12Z', label: 'Music visualiser is rendered by the panel itself' },
};

export class iPIXELWallCard extends iPIXELCardBase {
  constructor() {
    super();
    this._timer = null;
    this._frame = null;          // ImageBitmap/HTMLImageElement of the last preview frame
    this._frameUrl = null;
    this._layoutKey = null;
    this._resizeObserver = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('Please define an entity of the iPIXEL display');
    this._config = { refresh: 2, show_controls: true, show_panels: true, ...config };
    this.render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first || this._needsRerender()) this.render();
    else this._updateDynamic();
  }

  connectedCallback() {
    this._startRefresh();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopRefresh();
    this._resizeObserver?.disconnect();
  }

  // ------------------------------------------------------------------ data
  _camera() { return this.getRelatedEntity('camera', 'preview'); }
  _mode() { return this.getRelatedEntity('select', 'mode')?.state || 'textimage'; }
  _power() { return this.getRelatedEntity('switch', 'power'); }
  _brightness() { return this.getRelatedEntity('number', 'brightness'); }
  _panelCount() { return this.getRelatedEntity('sensor', 'panel_count'); }

  _layout() {
    const [width, height] = this.getResolution();
    const widthSensor = this.getRelatedEntity('sensor', 'width');
    const tiles = widthSensor?.attributes?.tiles;
    if (Array.isArray(tiles) && tiles.length) {
      return { width, height, tiles, missing: widthSensor.attributes.missing_panels || [] };
    }
    return { width, height, tiles: [{ panel: 'single', x: 0, y: 0, width, height }], missing: [] };
  }

  _needsRerender() {
    const key = JSON.stringify([this._layout(), this._mode(), this._power()?.state, this._panelCount()?.state]);
    const changed = key !== this._layoutKey;
    this._layoutKey = key;
    return changed;
  }

  // ------------------------------------------------------------------ frame refresh
  _startRefresh() {
    this._stopRefresh();
    const seconds = Math.max(0.5, Number(this._config?.refresh) || 2);
    this._timer = setInterval(() => this._loadFrame(), seconds * 1000);
    this._loadFrame();
  }

  _stopRefresh() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  async _loadFrame() {
    const camera = this._camera();
    const picture = camera?.attributes?.entity_picture;
    if (!this._hass || !picture) { this._frame = null; this._draw(); return; }
    const base = this._hass.hassUrl ? this._hass.hassUrl(picture) : picture;
    const url = `${base}${base.includes('?') ? '&' : '?'}ts=${Date.now()}`;
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (blob.size === 0) { this._frame = null; this._draw(); return; }
      this._frame = await createImageBitmap(blob);
    } catch (err) {
      // 500/empty = no frame available (native mode); keep the last frame otherwise
      this._frame = null;
    }
    this._draw();
  }

  // ------------------------------------------------------------------ drawing
  _draw() {
    const canvas = this.shadowRoot?.getElementById('wall');
    if (!canvas) return;
    const { width, height, tiles } = this._layout();
    const isOn = this.isOn();
    const mode = this._mode();
    const showPanels = this._config.show_panels !== false && tiles.length > 1;

    // Pixel geometry: fit the matrix (plus panel gaps) into the available width.
    const available = Math.max(120, canvas.parentElement?.clientWidth || 320);
    const cols = Math.max(1, ...tiles.map(t => t.x + t.width));
    const rows = Math.max(1, ...tiles.map(t => t.y + t.height));
    const gapCells = showPanels ? 2 : 0;
    const colGaps = showPanels ? new Set(tiles.map(t => t.x)).size - 1 : 0;
    const rowGaps = showPanels ? new Set(tiles.map(t => t.y)).size - 1 : 0;
    const cell = Math.max(2, Math.floor(available / (cols + colGaps * gapCells)));
    const dpr = window.devicePixelRatio || 1;
    const cssW = cols * cell + colGaps * gapCells * cell;
    const cssH = rows * cell + rowGaps * gapCells * cell;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssW, cssH);

    // Sample the preview frame at matrix resolution.
    let pixels = null;
    if (isOn && this._frame && !NATIVE_MODES[mode]) {
      const off = document.createElement('canvas');
      off.width = width; off.height = height;
      const octx = off.getContext('2d');
      octx.imageSmoothingEnabled = false;
      octx.drawImage(this._frame, 0, 0, width, height);
      pixels = octx.getImageData(0, 0, width, height).data;
    }

    const xOffsets = [...new Set(tiles.map(t => t.x))].sort((a, b) => a - b);
    const yOffsets = [...new Set(tiles.map(t => t.y))].sort((a, b) => a - b);
    const gapX = x => (showPanels ? xOffsets.filter(o => o > 0 && o <= x).length * gapCells * cell : 0);
    const gapY = y => (showPanels ? yOffsets.filter(o => o > 0 && o <= y).length * gapCells * cell : 0);

    const dot = Math.max(1, cell - Math.max(1, Math.round(cell * 0.18)));
    const radius = Math.min(dot / 2, Math.max(1, cell * 0.25));
    for (const tile of tiles) {
      const ox = tile.x * cell + gapX(tile.x);
      const oy = tile.y * cell + gapY(tile.y);
      if (showPanels) {
        ctx.fillStyle = '#141414';
        ctx.fillRect(ox - 2, oy - 2, tile.width * cell + 4, tile.height * cell + 4);
        ctx.strokeStyle = '#3d3d3d';
        ctx.lineWidth = 1;
        ctx.strokeRect(ox - 2.5, oy - 2.5, tile.width * cell + 5, tile.height * cell + 5);
      }
      for (let y = 0; y < tile.height; y++) {
        for (let x = 0; x < tile.width; x++) {
          let r = 24, g = 24, b = 24;
          if (pixels) {
            const i = ((tile.y + y) * width + (tile.x + x)) * 4;
            if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 18) { r = pixels[i]; g = pixels[i + 1]; b = pixels[i + 2]; }
          }
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          const px = ox + x * cell + (cell - dot) / 2;
          const py = oy + y * cell + (cell - dot) / 2;
          if (cell >= 5) {
            ctx.beginPath();
            ctx.roundRect(px, py, dot, dot, radius);
            ctx.fill();
          } else {
            ctx.fillRect(px, py, dot, dot);
          }
        }
      }
    }

    // Overlay for native modes / off / no frame
    const overlay = this.shadowRoot.getElementById('overlay');
    if (overlay) {
      let html = '';
      if (!isOn) {
        html = '<div class="overlay-text">Off</div>';
      } else if (NATIVE_MODES[mode]) {
        const info = NATIVE_MODES[mode];
        html = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${info.icon}"/></svg><div class="overlay-text">${info.label}</div>`;
      } else if (!this._frame) {
        html = '<div class="overlay-text">No frame yet</div>';
      }
      overlay.innerHTML = html;
      overlay.style.display = html ? 'flex' : 'none';
    }
  }

  _updateDynamic() {
    const brightness = this._brightness();
    const slider = this.shadowRoot?.getElementById('brightness');
    if (slider && brightness && document.activeElement !== slider) slider.value = brightness.state;
    const value = this.shadowRoot?.getElementById('brightness-value');
    if (value && brightness) value.textContent = `${Math.round(Number(brightness.state))}%`;
    this._draw();
  }

  // ------------------------------------------------------------------ render
  render() {
    if (!this._hass || !this._config?.entity) return;
    const { width, height, tiles, missing } = this._layout();
    const isOn = this.isOn();
    const mode = this._mode();
    const name = this._config.name || this.getEntity()?.attributes?.friendly_name?.replace(/ (Display|Tekst)$/i, '') || 'iPIXEL';
    const brightness = this._brightness();
    const panelCount = this._panelCount();
    const textEntity = this.getRelatedEntity('text', 'display');
    const showControls = this._config.show_controls !== false;

    this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .wall-wrap { position: relative; background: #000; border-radius: 10px; padding: 10px; border: 2px solid #222; display: flex; justify-content: center; }
        canvas { display: block; image-rendering: pixelated; }
        #overlay { position: absolute; inset: 10px; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: rgba(255,255,255,0.55); pointer-events: none; }
        #overlay svg { width: 28px; height: 28px; }
        .overlay-text { font-size: 0.8em; text-align: center; padding: 0 12px; }
        .meta { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 0.75em; opacity: 0.7; flex-wrap: wrap; gap: 6px; }
        .badge { background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 3px; }
        .badge.warn { background: rgba(255,152,0,0.25); color: #ffb74d; }
        .controls { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
        .row { display: flex; align-items: center; gap: 10px; }
        .row label { font-size: 0.8em; opacity: 0.75; min-width: 70px; }
        .row input[type=range] { flex: 1; }
        .modes { display: flex; gap: 6px; flex-wrap: wrap; }
        .mode-btn { padding: 5px 10px; border-radius: 14px; border: 1px solid var(--divider-color, #444); background: transparent; color: inherit; cursor: pointer; font-size: 0.78em; }
        .mode-btn.active { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
        .text-row { display: flex; gap: 6px; }
        .text-row input { flex: 1; padding: 7px 9px; border-radius: 6px; border: 1px solid var(--divider-color, #444); background: var(--card-background-color, #1c1c1c); color: inherit; }
        .text-row button { padding: 7px 12px; border-radius: 6px; border: none; background: var(--primary-color, #03a9f4); color: #fff; cursor: pointer; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title"><span class="status-dot ${isOn ? '' : 'off'}"></span>${name}</div>
            <button class="icon-btn ${isOn ? 'active' : ''}" id="power-btn" title="Power">
              <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
            </button>
          </div>
          <div class="wall-wrap"><canvas id="wall"></canvas><div id="overlay"></div></div>
          <div class="meta">
            <span>${width} × ${height}${tiles.length > 1 ? ` · ${tiles.length} panels` : ''}</span>
            <span>
              <span class="badge">${isOn ? (MODE_LABELS[mode] || mode) : 'Off'}</span>
              ${panelCount && tiles.length > 1 ? `<span class="badge ${missing.length ? 'warn' : ''}">${panelCount.state} online</span>` : ''}
            </span>
          </div>
          ${showControls ? `
          <div class="controls">
            ${brightness ? `
            <div class="row">
              <label>Brightness</label>
              <input type="range" id="brightness" min="1" max="100" value="${brightness.state}">
              <span id="brightness-value" style="font-size:0.8em;min-width:36px;text-align:right">${Math.round(Number(brightness.state))}%</span>
            </div>` : ''}
            <div class="row">
              <label>Mode</label>
              <div class="modes">
                ${Object.entries(MODE_LABELS).map(([value, label]) =>
                  `<button class="mode-btn ${mode === value ? 'active' : ''}" data-mode="${value}">${label}</button>`).join('')}
              </div>
            </div>
            ${textEntity ? `
            <div class="text-row">
              <input type="text" id="text-input" placeholder="Text (templates allowed)" value="${(textEntity.state || '').replace(/"/g, '&quot;')}">
              <button id="text-send">Show</button>
            </div>` : ''}
          </div>` : ''}
        </div>
      </ha-card>`;

    this.shadowRoot.getElementById('power-btn')?.addEventListener('click', () => {
      const sw = this._power();
      if (sw) this._hass.callService('switch', 'toggle', { entity_id: sw.entity_id });
    });
    this.shadowRoot.getElementById('brightness')?.addEventListener('change', (e) => {
      this.setRelatedEntity('number', 'brightness', parseInt(e.target.value));
    });
    this.shadowRoot.getElementById('brightness')?.addEventListener('input', (e) => {
      const value = this.shadowRoot.getElementById('brightness-value');
      if (value) value.textContent = `${e.target.value}%`;
    });
    this.shadowRoot.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', (e) => {
      this.setRelatedEntity('select', 'mode', e.currentTarget.dataset.mode);
      this.callService('ipixel_color', 'update_display');
    }));
    const send = () => {
      const value = this.shadowRoot.getElementById('text-input')?.value || '';
      if (!value) return;
      const current = this._mode();
      const target = (current === 'text' || current === 'textimage') ? current : 'textimage';
      this.callService('ipixel_color', 'display_text', { text: value, mode: target });
      this.setRelatedEntity('text', 'display', value);
    };
    this.shadowRoot.getElementById('text-send')?.addEventListener('click', send);
    this.shadowRoot.getElementById('text-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    this._resizeObserver?.disconnect();
    const wrap = this.shadowRoot.querySelector('.wall-wrap');
    if (wrap && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._draw());
      this._resizeObserver.observe(wrap);
    }
    this._draw();
    this._loadFrame();
  }

  static getConfigElement() { return document.createElement('ipixel-simple-editor'); }
  static getStubConfig() { return { entity: '' }; }
  getCardSize() { return 4; }
}
