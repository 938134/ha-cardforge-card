// src/cards/card-renderer.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class CardRenderer extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _time: { state: true },
    _date: { state: true },
    _week: { state: true },
    _lunar: { state: true },
    _currentTime: { state: true }
  };

  static styles = css`
    /* 时间星期卡片样式 */
    .time-week-card {
      padding: 16px;
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      display: grid;
      grid-template-areas: "a" "b" "c";
      grid-template-columns: 100%;
      grid-template-rows: 1fr 1fr 1fr;
      height: 200px;
      align-items: center;
    }
    
    .time-hour {
      grid-area: a;
      font-size: 3.2em;
      font-weight: bold;
      letter-spacing: 1px;
      text-align: center;
    }
    
    .time-minute {
      grid-area: b;
      font-size: 3.2em;
      font-weight: bold;
      letter-spacing: 1px;
      text-align: center;
    }
    
    .date-week {
      grid-area: c;
      font-size: 1em;
      letter-spacing: 2px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    
    .date {
      color: red;
    }
    
    .week {
      font-size: 0.8rem;
      background-color: red;
      color: white;
      border-radius: 10px;
      padding: 4px 12px;
      width: 60%;
    }

    /* 时间卡片样式 */
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

    /* 时钟农历卡片样式 */
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
    this._time = '00:00';
    this._date = '2000-01-01';
    this._week = '星期一';
    this._lunar = {};
    this._currentTime = new Date();
    
    // 更新时间（用于模拟时钟）
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
    this.config = config;
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.config?.entities) {
      this._updateStates();
    }
  }

  _updateStates() {
    const entities = this.config.entities || {};
    
    if (entities.time && this.hass.states[entities.time]) {
      this._time = this.hass.states[entities.time].state;
    }
    
    if (entities.date && this.hass.states[entities.date]) {
      this._date = this.hass.states[entities.date].state;
    }
    
    if (entities.week && this.hass.states[entities.week]) {
      this._week = this.hass.states[entities.week].state;
    }
    
    if (entities.lunar && this.hass.states[entities.lunar]) {
      this._lunar = this.hass.states[entities.lunar];
    }
  }

  _renderTimeWeekCard() {
    const timeParts = this._time.split(':');
    const hour = timeParts[0] || '00';
    const minute = timeParts[1] || '00';

    const dateParts = this._date.split('-');
    const dateDisplay = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}日` : '01/01';

    return html`
      <div class="time-week-card">
        <div class="time-hour">${hour}</div>
        <div class="time-minute">${minute}</div>
        <div class="date-week">
          <div class="date">${dateDisplay}</div>
          <div class="week">${this._week}</div>
        </div>
      </div>
    `;
  }

  _renderTimeCard() {
    const timeParts = this._time.split(':');
    const hour = timeParts[0] || '00';
    const minute = timeParts[1] || '00';

    const dateParts = this._date.split('-');
    const month = dateParts.length === 3 ? `${dateParts[1]}月` : '01月';
    const day = dateParts.length === 3 ? dateParts[2] : '01';

    return html`
      <div class="time-card">
        <div class="hour-section">
          <div class="label">TIME</div>
          <div class="value hour-value">${hour}</div>
          <div class="unit">时</div>
        </div>
        
        <div class="date-section">
          <div class="label">${month}</div>
          <div class="value date-value">${day}</div>
          <div class="unit">${this._week}</div>
        </div>
        
        <div class="minute-section">
          <div class="label">TIME</div>
          <div class="value minute-value">${minute}</div>
          <div class="unit">分</div>
        </div>
      </div>
    `;
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
        <circle class="clock-face" cx="50" cy="50" r="45"/>
        
        ${Array.from({length: 12}, (_, i) => {
          const angle = i * 30;
          const rad = angle * Math.PI / 180;
          const x1 = 50 + 35 * Math.sin(rad);
          const y1 = 50 - 35 * Math.cos(rad);
          const x2 = 50 + 40 * Math.sin(rad);
          const y2 = 50 - 40 * Math.cos(rad);
          return html`<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="var(--primary-text-color)" stroke-width="2"/>`;
        })}
        
        <line class="clock-hand hour-hand"
          x1="50" y1="50"
          x2=${50 + 20 * Math.sin(hourAngle * Math.PI / 180)}
          y2=${50 - 20 * Math.cos(hourAngle * Math.PI / 180)}
        />
        
        <line class="clock-hand minute-hand"
          x1="50" y1="50"
          x2=${50 + 30 * Math.sin(minuteAngle * Math.PI / 180)}
          y2=${50 - 30 * Math.cos(minuteAngle * Math.PI / 180)}
        />
        
        ${this.config.show_seconds !== false ? html`
          <line class="clock-hand second-hand"
            x1="50" y1="50"
            x2=${50 + 35 * Math.sin(secondAngle * Math.PI / 180)}
            y2=${50 - 35 * Math.cos(secondAngle * Math.PI / 180)}
          />
        ` : ''}
        
        <circle cx="50" cy="50" r="3" fill="var(--primary-color)"/>
      </svg>
    `;
  }

  _renderClockLunarCard() {
    const dateObj = new Date(this._date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    
    const lunarWeek = this._lunar.attributes?.lunar?.星期 || '星期一';
    const lunarYear = this._lunar.attributes?.lunar?.年干支 || '';
    const lunarState = this._lunar.state || '';
    const solarTerm = this._lunar.attributes?.lunar?.节气?.节气差 || '';

    return html`
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
    `;
  }

  _handleTap() {
    if (this.config.tap_action?.action === 'more-info' && this.config.tap_action.entity) {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: this.config.tap_action.entity }
      }));
    }
  }

  render() {
    if (!this.config) {
      return html`<ha-card>配置错误</ha-card>`;
    }

    let content;
    switch (this.config.type) {
      case 'time-week':
        content = this._renderTimeWeekCard();
        break;
      case 'time':
        content = this._renderTimeCard();
        break;
      case 'clock-lunar':
        content = this._renderClockLunarCard();
        break;
      default:
        content = html`<div>未知卡片类型: ${this.config.type}</div>`;
    }

    return html`
      <ha-card @click=${this._handleTap}>
        ${content}
      </ha-card>
    `;
  }

  getCardSize() {
    switch (this.config.type) {
      case 'time-week':
        return 3;
      case 'time':
        return 2;
      case 'clock-lunar':
        return 4;
      default:
        return 3;
    }
  }
}