// src/plugins/time-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class TimeCardPlugin extends BasePlugin {
  constructor() {
    super();
  }

  getEntityRequirements() {
    return [
      { key: 'time', description: '时间实体（可选）' },
      { key: 'date', description: '日期实体（可选）' },
      { key: 'week', description: '星期实体（可选）' }
    ];
  }

  getTemplate(config, hass, entities) {
    // 如果有实体数据，使用实体数据；否则使用系统时间
    let timeStr, dateStr, weekStr;
    
    if (entities.time && entities.time.state) {
      // 使用实体数据
      timeStr = entities.time.state;
      dateStr = entities.date?.state || this._getCurrentDate();
      weekStr = entities.week?.state || this._getCurrentWeekday();
    } else {
      // 使用系统内置时间
      const now = new Date();
      timeStr = now.toLocaleTimeString('zh-CN', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      dateStr = this._getCurrentDate();
      weekStr = this._getCurrentWeekday();
    }
    
    const [hour, minute] = timeStr.split(':');
    const [, month, day] = dateStr.split('-');

    return `
      <div class="time-card">
        <div class="time-section hour">
          <div class="label">时</div>
          <div class="value">${hour}</div>
        </div>
        <div class="date-section">
          <div class="month">${month}月</div>
          <div class="day">${day}</div>
          <div class="week">${weekStr}</div>
        </div>
        <div class="time-section minute">
          <div class="label">分</div>
          <div class="value">${minute}</div>
        </div>
      </div>
    `;
  }

  _getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  _getCurrentWeekday() {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const now = new Date();
    return weekdays[now.getDay()];
  }

  getStyles(config) {
    return `
      .time-card {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        align-items: center;
        height: 120px;
        padding: 16px;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        background: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
      }
      .time-section {
        text-align: center;
      }
      .time-section .label {
        font-size: 0.8em;
        opacity: 0.7;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .time-section .value {
        font-size: 2em;
        font-weight: bold;
        color: var(--primary-text-color);
      }
      .date-section {
        text-align: center;
      }
      .date-section .month {
        font-size: 0.8em;
        opacity: 0.7;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .date-section .day {
        font-size: 2.8em;
        font-weight: bold;
        line-height: 1;
        color: var(--primary-text-color);
        margin: 4px 0;
      }
      .date-section .week {
        font-size: 0.8em;
        opacity: 0.7;
        color: var(--secondary-text-color);
      }
    `;
  }
}
