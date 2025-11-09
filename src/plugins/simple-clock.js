// src/plugins/simple-clock.js
// 确保正确导入 BasePlugin
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
      <div class="simple-clock" style="border: 2px solid red; background: yellow; padding: 20px;">
        <div class="time" style="color: black; font-size: 24px; font-weight: bold;">${timeStr}</div>
        <div class="date" style="color: black; font-size: 16px;">${dateStr}</div>
        <div class="weekday" style="color: black; font-size: 14px;">${weekDay}</div>
        <div style="color: black; font-size: 12px; margin-top: 10px;">调试信息：卡片已渲染</div>
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
        background: rgba(255, 0, 0, 0.1) !important;
        border: 2px dashed blue !important;
      }
    `;
  }
}