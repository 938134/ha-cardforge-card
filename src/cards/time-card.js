// src/cards/time-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class TimeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _time: { state: true },
    _date: { state: true },
    _week: { state: true }
  };

  static styles = css`
    .time-card {
      padding: 16px;
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      display: grid;
      grid-template-areas: "a b c";
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      height: 120px;
      align-items: center;
    }
    
    .hour-section {
      grid-area: a;
      justify-self: end;
      margin-right: 5px;
      text-align: center;
    }
    
    .date-section {
      grid-area: b;
      text-align: center;
    }
    
    .minute-section {
      grid-area: c;
      justify-self: start;
      margin-left: 5px;
      text-align: center;
    }
    
    .label {
      font-size: 0.7em;
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 2em;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .hour-value, .minute-value {
      color: rgba(var(--rgb-primary-text-color), 0.7);
    }
    
    .date-value {
      font-size: 2.8em;
    }
    
    .unit {
      font-size: 0.7em;
    }
  `;

  constructor() {
    super();
    this._time = '00:00';
    this._date = '2000-01-01';
    this._week = '星期一';
  }

  setConfig(config) {
    const defaults = {
      entities: {
        time: 'sensor.time',
        date: 'sensor.date',
        week: 'sensor.xing_qi'
      }
    };
    this.config = { ...defaults, ...config };
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.config.entities) {
      this._updateStates();
    }
  }

  _updateStates() {
    const { time, date, week } = this.config.entities;
    
    if (this.hass.states[time]) {
      this._time = this.hass.states[time].state;
    }
    
    if (this.hass.states[date]) {
      this._date = this.hass.states[date].state;
    }
    
    if (this.hass.states[week]) {
      this._week = this.hass.states[week].state;
    }
  }

  _getMonthDay() {
    const parts = this._date.split('-');
    return parts.length === 3 ? `${parts[1]}月` : '01月';
  }

  _getDay() {
    const parts = this._date.split('-');
    return parts.length === 3 ? parts[2] : '01';
  }

  render() {
    const timeParts = this._time.split(':');
    const hour = timeParts[0] || '00';
    const minute = timeParts[1] || '00';

    return html`
      <ha-card>
        <div class="time-card">
          <div class="hour-section">
            <div class="label">TIME</div>
            <div class="value hour-value">${hour}</div>
            <div class="unit">时</div>
          </div>
          
          <div class="date-section">
            <div class="label">${this._getMonthDay()}</div>
            <div class="value date-value">${this._getDay()}</div>
            <div class="unit">${this._week}</div>
          </div>
          
          <div class="minute-section">
            <div class="label">TIME</div>
            <div class="value minute-value">${minute}</div>
            <div class="unit">分</div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define('time-card', TimeCard);