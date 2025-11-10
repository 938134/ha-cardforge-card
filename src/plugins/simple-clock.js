// src/plugins/simple-clock.js
import { BasePlugin } from '../core/base-plugin.js';

export default class SimpleClockPlugin extends BasePlugin {
  constructor() {
    super();
  }

  getTemplate(config, hass, entities) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const dateStr = now.toLocaleDateString('zh-CN');
    const weekDay = '星期' + '日一二三四五六'[now.getDay()];

    return `
      <div class="simple-clock">
        <div class="time">${timeStr}</div>
        <div class="date">${dateStr}</div>
        <div class="weekday">${weekDay}</div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      .simple-clock {
        text-align: center;
        padding: 20px;
        height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        background: var(--cardforge-bg-color, var(--card-background-color));
        color: var(--cardforge-text-color, var(--primary-text-color));
      }
      .simple-clock .time {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--cardforge-primary-color, var(--primary-color));
        letter-spacing: 2px;
      }
      .simple-clock .date {
        font-size: 1.1em;
        margin-bottom: 4px;
        color: var(--cardforge-text-color, var(--primary-text-color));
        opacity: 0.8;
      }
      .simple-clock .weekday {
        font-size: 1em;
        color: var(--cardforge-text-color, var(--primary-text-color));
        opacity: 0.6;
      }
    `;
  }
}
