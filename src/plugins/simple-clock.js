// src/plugins/simple-clock.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'simple-clock',
  name: '简约时钟',
  version: '1.1.0',
  description: '基于系统时间的简约时钟显示',
  author: 'CardForge Team',
  category: 'time',
  icon: '⏰',
  entityRequirements: [],
  themeSupport: true,
  gradientSupport: false
};

export default class SimpleClockPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const { time, date, weekday } = this.getSystemData(hass, config);
    
    return `
      <div class="cardforge-card simple-clock">
        <div class="time">${time}</div>
        <div class="date">${date}</div>
        <div class="weekday">${weekday}</div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .simple-clock {
        ${this._textCenter()}
        ${this._flexColumn()}
        ${this._responsiveHeight('120px', '100px')} /* 降低高度 */
        ${this._responsivePadding('16px', '12px')} /* 减小内边距 */
        justify-content: center;
      }
      
      .simple-clock .time {
        ${this._responsiveFontSize('2em', '1.6em')} /* 调整字体大小 */
        font-weight: bold;
        color: var(--primary-color);
        ${this._responsiveMargin('0 0 6px', '0 0 4px')} /* 减小间距 */
        letter-spacing: 2px;
      }
      
      .simple-clock .date {
        ${this._responsiveFontSize('0.95em', '0.85em')} /* 调整字体大小 */
        opacity: 0.8;
        ${this._responsiveMargin('0 0 3px', '0 0 2px')} /* 减小间距 */
      }
      
      .simple-clock .weekday {
        ${this._responsiveFontSize('0.9em', '0.8em')} /* 调整字体大小 */
        opacity: 0.6;
      }
      
      /* 主题适配 */
      .simple-clock.glass .time {
        color: var(--primary-text-color);
      }
    `;
  }
}