/**
 * iPIXEL Text Card
 * Text input with effects and colors - with tabbed interface
 */

import { iPIXELCardBase } from '../base.js';
import { iPIXELCardStyles } from '../styles.js';
import { updateDisplayState } from '../state.js';
import { EFFECTS, EFFECT_CATEGORIES } from '../effects/index.js';

export class iPIXELTextCard extends iPIXELCardBase {
  constructor() {
    super();
    this._activeTab = 'text'; // 'text' or 'ambient'
  }

  /**
   * Generate text effect options (text + color effects)
   */
  _buildTextEffectOptions() {
    const textEffects = Object.entries(EFFECTS)
      .filter(([_, info]) => info.category === EFFECT_CATEGORIES.TEXT)
      .map(([name, info]) => `<option value="${name}">${info.name}</option>`)
      .join('');

    const colorEffects = Object.entries(EFFECTS)
      .filter(([_, info]) => info.category === EFFECT_CATEGORIES.COLOR)
      .map(([name, info]) => `<option value="${name}">${info.name}</option>`)
      .join('');

    return `
      <optgroup label="Text Effects">
        ${textEffects}
      </optgroup>
      <optgroup label="Color Effects">
        ${colorEffects}
      </optgroup>
    `;
  }

  /**
   * Generate ambient effect options
   */
  _buildAmbientEffectOptions() {
    return Object.entries(EFFECTS)
      .filter(([_, info]) => info.category === EFFECT_CATEGORIES.AMBIENT)
      .map(([name, info]) => `<option value="${name}">${info.name}</option>`)
      .join('');
  }

  /**
   * Build ambient effects as a button grid
   */
  _buildAmbientGrid() {
    const selected = this._selectedAmbient || 'rainbow';
    return Object.entries(EFFECTS)
      .filter(([_, info]) => info.category === EFFECT_CATEGORIES.AMBIENT)
      .map(([name, info]) => `
        <button class="effect-btn ${name === selected ? 'active' : ''}" data-effect="${name}">
          ${info.name}
        </button>
      `)
      .join('');
  }

  render() {
    if (!this._hass) return;

    const isTextTab = this._activeTab === 'text';

    this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .tabs { display: flex; gap: 4px; margin-bottom: 16px; }
        .tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          cursor: pointer;
          border-radius: 8px;
          font-size: 0.9em;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .tab:hover { background: rgba(255,255,255,0.1); }
        .tab.active {
          background: var(--primary-color, #03a9f4);
          color: #fff;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .input-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .input-row .text-input { flex: 1; }
        select optgroup { font-weight: bold; color: var(--primary-text-color, #fff); }
        select option { font-weight: normal; }
        .effect-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .effect-btn {
          padding: 12px 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.75em;
          text-align: center;
          transition: all 0.2s ease;
        }
        .effect-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .effect-btn.active {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
        }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="tabs">
            <button class="tab ${isTextTab ? 'active' : ''}" id="tab-text">Text</button>
            <button class="tab ${!isTextTab ? 'active' : ''}" id="tab-ambient">Ambient</button>
          </div>

          <!-- Text Tab -->
          <div class="tab-content ${isTextTab ? 'active' : ''}" id="content-text">
            <div class="section-title">Display Text</div>
            <div class="input-row">
              <input type="text" class="text-input" id="text-input" placeholder="Enter text to display...">
              <button class="btn btn-primary" id="send-btn">Send</button>
            </div>
            <div class="section-title">Effect</div>
            <div class="control-row">
              <select class="dropdown" id="text-effect">
                ${this._buildTextEffectOptions()}
              </select>
            </div>
            <div class="section-title">Speed</div>
            <div class="control-row">
              <div class="slider-row">
                <input type="range" class="slider" id="text-speed" min="1" max="100" value="50">
                <span class="slider-value" id="text-speed-val">50</span>
              </div>
            </div>
            <div class="section-title">Font</div>
            <div class="control-row">
              <select class="dropdown" id="font-select">
                <option value="VCR_OSD_MONO">VCR OSD Mono</option>
                <option value="CUSONG">CUSONG</option>
                <option value="LEGACY">Legacy (Bitmap)</option>
              </select>
            </div>
            <div class="section-title">Colors</div>
            <div class="control-row">
              <div class="color-row">
                <span style="font-size: 0.85em;">Text:</span>
                <input type="color" class="color-picker" id="text-color" value="#ff6600">
                <span style="font-size: 0.85em; margin-left: 16px;">Background:</span>
                <input type="color" class="color-picker" id="bg-color" value="#000000">
              </div>
            </div>
          </div>

          <!-- Ambient Tab -->
          <div class="tab-content ${!isTextTab ? 'active' : ''}" id="content-ambient">
            <div class="section-title">Ambient Effect</div>
            <div class="effect-grid" id="ambient-grid">
              ${this._buildAmbientGrid()}
            </div>
            <div class="section-title">Speed</div>
            <div class="control-row">
              <div class="slider-row">
                <input type="range" class="slider" id="ambient-speed" min="1" max="100" value="50">
                <span class="slider-value" id="ambient-speed-val">50</span>
              </div>
            </div>
            <button class="btn btn-primary" id="apply-ambient-btn" style="width: 100%; margin-top: 8px;">Apply Effect</button>
          </div>
        </div>
      </ha-card>`;

    this._attachListeners();
  }

  /**
   * Get text tab form values
   */
  _getTextFormValues() {
    return {
      text: this.shadowRoot.getElementById('text-input')?.value || '',
      effect: this.shadowRoot.getElementById('text-effect')?.value || 'fixed',
      speed: parseInt(this.shadowRoot.getElementById('text-speed')?.value || '50'),
      fgColor: this.shadowRoot.getElementById('text-color')?.value || '#ff6600',
      bgColor: this.shadowRoot.getElementById('bg-color')?.value || '#000000',
      font: this.shadowRoot.getElementById('font-select')?.value || 'VCR_OSD_MONO'
    };
  }

  /**
   * Get ambient tab form values
   */
  _getAmbientFormValues() {
    return {
      effect: this._selectedAmbient || 'rainbow',
      speed: parseInt(this.shadowRoot.getElementById('ambient-speed')?.value || '50')
    };
  }

  /**
   * Update text preview (without sending to device)
   */
  _updateTextPreview() {
    const { text, effect, speed, fgColor, bgColor, font } = this._getTextFormValues();

    updateDisplayState({
      text: text || 'Preview',
      mode: 'text',
      effect,
      speed,
      fgColor,
      bgColor,
      font
    });
  }

  /**
   * Update ambient preview
   */
  _updateAmbientPreview() {
    const { effect, speed } = this._getAmbientFormValues();

    updateDisplayState({
      text: '',
      mode: 'ambient',
      effect,
      speed,
      fgColor: '#ffffff',
      bgColor: '#000000'
    });
  }

  _attachListeners() {
    // Tab switching
    this.shadowRoot.getElementById('tab-text')?.addEventListener('click', () => {
      this._activeTab = 'text';
      this.render();
    });

    this.shadowRoot.getElementById('tab-ambient')?.addEventListener('click', () => {
      this._activeTab = 'ambient';
      this.render();
    });

    // === Text Tab Listeners ===

    // Text speed slider with live preview
    const textSpeed = this.shadowRoot.getElementById('text-speed');
    if (textSpeed) {
      textSpeed.style.setProperty('--value', `${textSpeed.value}%`);
      textSpeed.addEventListener('input', (e) => {
        e.target.style.setProperty('--value', `${e.target.value}%`);
        this.shadowRoot.getElementById('text-speed-val').textContent = e.target.value;
        this._updateTextPreview();
      });
    }

    // Text effect dropdown with live preview
    this.shadowRoot.getElementById('text-effect')?.addEventListener('change', () => {
      this._updateTextPreview();
    });

    // Font selector with live preview
    this.shadowRoot.getElementById('font-select')?.addEventListener('change', () => {
      this._updateTextPreview();
    });

    // Color pickers with live preview
    this.shadowRoot.getElementById('text-color')?.addEventListener('input', () => {
      this._updateTextPreview();
    });
    this.shadowRoot.getElementById('bg-color')?.addEventListener('input', () => {
      this._updateTextPreview();
    });

    // Text input with live preview on typing
    this.shadowRoot.getElementById('text-input')?.addEventListener('input', () => {
      this._updateTextPreview();
    });

    // Send text button
    this.shadowRoot.getElementById('send-btn')?.addEventListener('click', () => {
      const { text, effect, speed, fgColor, bgColor, font } = this._getTextFormValues();

      if (text) {
        updateDisplayState({
          text,
          mode: 'text',
          effect,
          speed,
          fgColor,
          bgColor,
          font
        });

        if (this._config.entity) {
          this._hass.callService('text', 'set_value', {
            entity_id: this._config.entity,
            value: text
          });
        }

        // Map font name for backend (LEGACY uses default CUSONG)
        const backendFont = font === 'LEGACY' ? 'CUSONG' : font;

        this.callService('ipixel_color', 'display_text', {
          text,
          effect,
          speed,
          color_fg: this.hexToRgb(fgColor),
          color_bg: this.hexToRgb(bgColor),
          font: backendFont,
        });
      }
    });

    // === Ambient Tab Listeners ===

    // Ambient effect grid buttons
    this.shadowRoot.querySelectorAll('.effect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const effect = e.target.dataset.effect;
        this._selectedAmbient = effect;

        // Update button states
        this.shadowRoot.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Live preview
        this._updateAmbientPreview();
      });
    });

    // Ambient speed slider
    const ambientSpeed = this.shadowRoot.getElementById('ambient-speed');
    if (ambientSpeed) {
      ambientSpeed.style.setProperty('--value', `${ambientSpeed.value}%`);
      ambientSpeed.addEventListener('input', (e) => {
        e.target.style.setProperty('--value', `${e.target.value}%`);
        this.shadowRoot.getElementById('ambient-speed-val').textContent = e.target.value;
        this._updateAmbientPreview();
      });
    }

    // Apply ambient effect button
    this.shadowRoot.getElementById('apply-ambient-btn')?.addEventListener('click', () => {
      const { effect, speed } = this._getAmbientFormValues();

      updateDisplayState({
        text: '',
        mode: 'ambient',
        effect,
        speed,
        fgColor: '#ffffff',
        bgColor: '#000000'
      });

      // TODO: Send ambient effect to device when service is available
      // For now just update the preview
    });
  }

  static getConfigElement() { return document.createElement('ipixel-simple-editor'); }
  static getStubConfig() { return { entity: '' }; }
}
