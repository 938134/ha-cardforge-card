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
        height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-family: var(--paper-font-common-nowrap_-_font-family);
      }
    `;
  }
}
