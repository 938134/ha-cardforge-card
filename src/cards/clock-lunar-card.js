// src/cards/clock-lunar-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class ClockLunarCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _time: { state: true },
    _date: { state: true },
    _lunar: { state: true },
    _currentTime: { state: true }
  };

  static styles = css`
    .clock-lunar-card {
      padding: 16px;
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      display: grid;
      grid-template-areas: "a b" "a c" "a d" "a e";
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 50% 15% 15% 20%;
      height: 250px;
      align-items: center;
    }
    
    .analog-clock {
      grid-area: a;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .clock-svg {
      width: 100px;
      height: 100px;
    }
    
    .clock-face {
      fill: var(--card-background-color);
      stroke: var(--primary-text-color);
      stroke-width: 2;
    }
    
    .clock-hand {
      stroke: var(--primary-color);
      stroke-linecap: round;
    }
    
    .hour-hand {
      stroke-width: 3;
    }
    
    .minute-hand {
      stroke-width: 2;
    }
    
    .second-hand {
      stroke-width: 1;
      stroke: var(--accent-color);
    }
    
    .time-text {
      grid-area: b;
      font-size: 4rem;
      letter-spacing: 2px;
      font-weight: bold;
      text-align: center;
    }
    
    .date-text {
      grid-area: c;
      font-size: 1rem;
      font-weight: bold;
      text-align: center;
    }
    
    .lunar-year {
      grid-area: d;
      font-size: 1rem;
      font-weight: bold;
      text-align: center;
    }
    
    .solar-term {
      grid-area: e;
      font-size: 1rem;
      letter-spacing: 2px;
      font-weight: bold;
      background-color: coral;
      border-radius: 1em;
      width: 60%;
      justify-self: center;
      text-align: center;
      padding: 4px 0;
    }
  `;

  constructor() {
    super();
    this._time = '00:00:00';
    this._date = '2000-01-01';
    this._lunar = {};
    this._currentTime = new Date();
    
    // 更新时间
    this._interval = setInterval(() => {
      this._currentTime = new Date();
      this.requestUpdate();
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._interval) {
      clearInterval(this._interval);
    }
  }

  setConfig(config) {
    const defaults = {
      entities: {
        time: 'sensor.time',
        date: 'sensor.date',
        lunar: 'sensor.nong_li'
      },
      show_seconds: true,
      tap_action: {
        action: 'more-info',
        entity: 'sensor.nong_li'
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
    const { time, date, lunar } = this.config.entities;
    
    if (this.hass.states[time]) {
      this._time = this.hass.states[time].state;
    }
    
    if (this.hass.states[date]) {
      this._date = this.hass.states[date].state;
    }
    
    if (this.hass.states[lunar]) {
      this._lunar = this.hass.states[lunar];
    }
  }

  _renderAnalogClock() {
    const now = this._currentTime;
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    return html`
      <svg class="clock-svg" viewBox="0 0 100 100">
        <!-- 表盘 -->
        <circle class="clock-face" cx="50" cy="50" r="45"/>
        
        <!-- 刻度 -->
        ${Array.from({length: 12}, (_, i) => {
          const angle = i * 30;
          const rad = angle * Math.PI / 180;
          const x1 = 50 + 35 * Math.sin(rad);
          const y1 = 50 - 35 * Math.cos(rad);
          const x2 = 50 + 40 * Math.sin(rad);
          const y2 = 50 - 40 * Math.cos(rad);
          return html`<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="var(--primary-text-color)" stroke-width="2"/>`;
        })}
        
        <!-- 时针 -->
        <line class="clock-hand hour-hand"
          x1="50" y1="50"
          x2=${50 + 20 * Math.sin(hourAngle * Math.PI / 180)}
          y2=${50 - 20 * Math.cos(hourAngle * Math.PI / 180)}
        />
        
        <!-- 分针 -->
        <line class="clock-hand minute-hand"
          x1="50" y1="50"
          x2=${50 + 30 * Math.sin(minuteAngle * Math.PI / 180)}
          y2=${50 - 30 * Math.cos(minuteAngle * Math.PI / 180)}
        />
        
        <!-- 秒针 -->
        ${this.config.show_seconds ? html`
          <line class="clock-hand second-hand"
            x1="50" y1="50"
            x2=${50 + 35 * Math.sin(secondAngle * Math.PI / 180)}
            y2=${50 - 35 * Math.cos(secondAngle * Math.PI / 180)}
          />
        ` : ''}
        
        <!-- 中心点 -->
        <circle cx="50" cy="50" r="3" fill="var(--primary-color)"/>
      </svg>
    `;
  }

  _handleTap() {
    if (this.config.tap_action && this.config.tap_action.action === 'more-info') {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: this.config.tap_action.entity || this.config.entities.lunar }
      }));
    }
  }

  render() {
    const dateObj = new Date(this._date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    
    const lunarWeek = this._lunar.attributes?.lunar?.星期 || '星期一';
    const lunarYear = this._lunar.attributes?.lunar?.年干支 || '';
    const lunarState = this._lunar.state || '';
    const solarTerm = this._lunar.attributes?.lunar?.节气?.节气差 || '';

    return html`
      <ha-card @click=${this._handleTap}>
        <div class="clock-lunar-card">
          <div class="analog-clock">
            ${this._renderAnalogClock()}
          </div>
          
          <div class="time-text">${this._time.split(':').slice(0, 2).join(':')}</div>
          
          <div class="date-text">
            ${month}月${day}号 ${lunarWeek}
          </div>
          
          <div class="lunar-year">
            ${lunarYear} ${lunarState}
          </div>
          
          <div class="solar-term">
            ${solarTerm}
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('clock-lunar-card', ClockLunarCard);