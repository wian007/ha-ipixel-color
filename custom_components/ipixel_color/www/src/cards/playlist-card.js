/**
 * iPIXEL Playlist Card
 * Playlist management
 */

import { iPIXELCardBase } from '../base.js';
import { iPIXELCardStyles } from '../styles.js';

export class iPIXELPlaylistCard extends iPIXELCardBase {
  render() {
    if (!this._hass) return;
    const playlist = this._config.items || [];

    this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .playlist-actions { display: flex; gap: 8px; margin-top: 12px; }
        .playlist-actions .btn { flex: 1; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header"><div class="card-title">Playlist</div></div>
          <div id="playlist-items">
            ${playlist.length === 0 ? '<div class="empty-state">No playlist items yet</div>' :
              playlist.map((item, i) => `
                <div class="list-item">
                  <div class="list-item-info">
                    <div class="list-item-name">${item.name || `Item ${i + 1}`}</div>
                    <div class="list-item-meta">${item.mode || 'text'} - ${(item.duration_ms || 5000) / 1000}s</div>
                  </div>
                  <div class="list-item-actions">
                    <button class="icon-btn" style="width:28px;height:28px;">
                      <svg viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                    </button>
                  </div>
                </div>`).join('')}
          </div>
          <div class="playlist-actions">
            <button class="btn btn-success" id="start-btn">▶ Start</button>
            <button class="btn btn-danger" id="stop-btn">■ Stop</button>
            <button class="btn btn-secondary" id="add-btn">+ Add</button>
          </div>
        </div>
      </ha-card>`;

    this.shadowRoot.getElementById('start-btn')?.addEventListener('click', () => {
      this.callService('ipixel_color', 'start_playlist');
    });
    this.shadowRoot.getElementById('stop-btn')?.addEventListener('click', () => {
      this.callService('ipixel_color', 'stop_playlist');
    });
  }

  static getConfigElement() { return document.createElement('ipixel-simple-editor'); }
  static getStubConfig() { return { entity: '' }; }
}
