/**
 * Base class for all iPIXEL cards
 * Provides common functionality for entity management, service calls, etc.
 */

import { isTestMode } from './state.js';

export class iPIXELCardBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;

    // Listen for test mode changes to re-render
    this._handleTestModeChange = () => this.render();
    window.addEventListener('ipixel-test-mode-change', this._handleTestModeChange);
  }

  disconnectedCallback() {
    window.removeEventListener('ipixel-test-mode-change', this._handleTestModeChange);
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  setConfig(config) {
    // Allow empty entity in test mode
    if (!config.entity && !isTestMode()) {
      // Store config anyway - test mode may be activated later
      this._config = config;
      return;
    }
    this._config = config;
    this.render();
  }

  /**
   * Check if card is in test mode (no entity or explicitly enabled)
   */
  isInTestMode() {
    return isTestMode() || !this._config.entity || !this.getEntity();
  }

  getEntity() {
    if (!this._hass || !this._config.entity) return null;
    return this._hass.states[this._config.entity];
  }

  /**
   * Find an entity of the same device as the configured entity.
   * Uses the entity registry (hass.entities / translation_key), falling back to
   * entity id heuristics for older Home Assistant versions.
   *
   * @param {string} domain  e.g. 'switch'
   * @param {string} suffix  translation key / unique id suffix, e.g. '_mode' or 'power'
   */
  getRelatedEntity(domain, suffix = '') {
    if (!this._hass || !this._config.entity) return null;
    const key = (suffix || (domain === 'switch' ? 'power' : '')).replace(/^_/, '');

    // 1. Registry based (robust, works with any entity naming)
    const registry = this._hass.entities || {};
    const own = registry[this._config.entity];
    if (own?.device_id) {
      const candidates = Object.values(registry).filter(e =>
        e.device_id === own.device_id && e.entity_id.startsWith(`${domain}.`) && this._hass.states[e.entity_id]);
      const byKey = candidates.find(e => e.translation_key === key)
        || candidates.find(e => e.entity_id.endsWith(`_${key}`));
      if (byKey) return this._hass.states[byKey.entity_id];
      if (!key && candidates.length) return this._hass.states[candidates[0].entity_id];
    }

    // 2. Fallback: derive from the entity id
    const baseName = this._config.entity.replace(/^[^.]+\./, '').replace(/_?(text|display|gif_url|image_url)$/i, '');
    const exactId = `${domain}.${baseName}${key ? `_${key}` : ''}`;
    if (this._hass.states[exactId]) return this._hass.states[exactId];
    const matches = Object.keys(this._hass.states).filter(id =>
      id.startsWith(`${domain}.`) && id.replace(/^[^.]+\./, '').startsWith(baseName));
    if (key) {
      const withSuffix = matches.find(id => id.endsWith(`_${key}`));
      return withSuffix ? this._hass.states[withSuffix] : null;
    }
    const sorted = matches.sort((a, b) => a.length - b.length);
    return sorted.length ? this._hass.states[sorted[0]] : null;
  }

  /** Set a number/select/switch entity of this display (used for settings). */
  async setRelatedEntity(domain, key, value) {
    const entity = this.getRelatedEntity(domain, key);
    if (!entity) {
      console.warn(`iPIXEL: no ${domain} entity '${key}' found for ${this._config.entity}`);
      return;
    }
    if (this.isInTestMode()) {
      console.info(`iPIXEL [Test Mode]: ${domain}.${key} = ${value}`);
      return;
    }
    const data = { entity_id: entity.entity_id };
    if (domain === 'number') return this._hass.callService('number', 'set_value', { ...data, value });
    if (domain === 'select') return this._hass.callService('select', 'select_option', { ...data, option: String(value) });
    if (domain === 'switch') return this._hass.callService('switch', value ? 'turn_on' : 'turn_off', data);
    if (domain === 'text') return this._hass.callService('text', 'set_value', { ...data, value });
  }

  async callService(domain, service, data = {}) {
    if (!this._hass) return;
    if (this.isInTestMode()) {
      console.info(`iPIXEL [Test Mode]: ${domain}.${service}`, data);
      return;
    }
    // Integration services target a display through any of its entities, so
    // the card always passes its configured entity (works with several
    // panels and with combined displays).
    if (domain === 'ipixel_color' && this._config.entity && !data.entity_id && !data.device_id) {
      data = { ...data, entity_id: this._config.entity };
    }
    try {
      await this._hass.callService(domain, service, data);
    } catch (err) {
      console.error(`iPIXEL service call failed: ${domain}.${service}`, err);
    }
  }

  getResolution() {
    const widthEntity = this.getRelatedEntity('sensor', 'width');
    const heightEntity = this.getRelatedEntity('sensor', 'height');
    if (widthEntity && heightEntity) {
      const w = parseInt(widthEntity.state), h = parseInt(heightEntity.state);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) return [w, h];
    }
    return [64, 16];
  }

  isOn() {
    // In test mode, always report as "on" so preview works
    if (this.isInTestMode()) return true;
    return this.getRelatedEntity('switch', 'power')?.state === 'on';
  }

  hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [255, 255, 255];
  }

  render() { /* Override in subclasses */ }
  getCardSize() { return 2; }
}
