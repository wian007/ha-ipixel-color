/**
 * iPIXEL Schedule Card
 * Power schedule and time slots
 */

import { iPIXELCardBase } from '../base.js';
import { iPIXELCardStyles } from '../styles.js';

export class iPIXELScheduleCard extends iPIXELCardBase {
  render() {
    if (!this._hass) return;
    const now = new Date();
    const nowPos = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;

    this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .timeline { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; margin-bottom: 12px; }
        .timeline-header { display: flex; justify-content: space-between; font-size: 0.7em; opacity: 0.5; margin-bottom: 6px; }
        .timeline-bar { height: 24px; background: rgba(255,255,255,0.1); border-radius: 4px; position: relative; overflow: hidden; }
        .timeline-now { position: absolute; width: 2px; height: 100%; background: #f44336; left: ${nowPos}%; }
        .power-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .power-row label { font-size: 0.85em; }
        .power-row input[type="time"] { padding: 6px 10px; background: rgba(255,255,255,0.08); border: 1px solid var(--ipixel-border); border-radius: 4px; color: inherit; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="section-title">Today's Timeline</div>
          <div class="timeline">
            <div class="timeline-header"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
            <div class="timeline-bar"><div class="timeline-now"></div></div>
          </div>
          <div class="section-title">Power Schedule</div>
          <div class="control-row">
            <div class="power-row">
              <label>On:</label><input type="time" id="power-on" value="07:00">
              <label>Off:</label><input type="time" id="power-off" value="22:00">
              <button class="btn btn-primary" id="save-power">Save</button>
            </div>
          </div>
          <div class="section-title">Time Slots</div>
          <div id="time-slots"><div class="empty-state">No time slots configured</div></div>
          <button class="btn btn-secondary" id="add-slot" style="width: 100%; margin-top: 8px;">+ Add Time Slot</button>
        </div>
      </ha-card>`;

    this.shadowRoot.getElementById('save-power')?.addEventListener('click', () => {
      this.callService('ipixel_color', 'set_power_schedule', {
        enabled: true,
        on_time: this.shadowRoot.getElementById('power-on')?.value,
        off_time: this.shadowRoot.getElementById('power-off')?.value,
      });
    });
  }

  static getConfigElement() { return document.createElement('ipixel-simple-editor'); }
  static getStubConfig() { return { entity: '' }; }
}
