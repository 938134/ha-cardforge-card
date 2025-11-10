// src/plugins/time-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class TimeCardPlugin extends BasePlugin {
  constructor() {
    super();
  }

  getEntityRequirements() {
    return [
      { key: 'time', description: '时间实体' },
      { key: 'date', description: '日期实体' },
      { key: 'week', description: '星期实体（可选）' }
    ];
  }

  getTemplate(config, hass, entities) {
    const time = this._getEntityState(entities, 'time', '00:00');
    const date = this._getEntityState(entities, 'date', '2000-01-01');
    const week = this._getEntityState(entities, 'week', '星期一');
    
    const [hour, minute] = time.split(':');
    const [, month, day] = date.split('-');

    return `
      <div class="cardforge-card time-card">
        <div class="time-section hour">
          <div class="label">时</div>
          <div class="value cardforge-primary">${hour}</div>
        </div>
        <div class="date-section">
          <div class="month">${month}月</div>
          <div class="day cardforge-primary">${day}</div>
          <div class="week">${week}</div>
        </div>
        <div class="time-section minute">
          <div class="label">分</div>
          <div class="value cardforge-primary">${minute}</div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      .time-card {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        align-items: center;
        height: 120px;
        font-family: var(--paper-font-common-nowrap_-_font-family);
      }
      .time-section {
        text-align: center;
      }
      .time-section .label {
        font-size: 0.8em;
        opacity: 0.7;
      }
      .time-section .value {
        font-size: 2em;
        font-weight: bold;
      }
      .date-section {
        text-align: center;
      }
      .date-section .month {
        font-size: 0.8em;
        opacity: 0.7;
      }
      .date-section .day {
        font-size: 2.8em;
        font-weight: bold;
        line-height: 1;
      }
      .date-section .week {
        font-size: 0.8em;
        opacity: 0.7;
      }
    `;
  }
}