// src/plugins/simple-clock.js
import { BasePlugin } from '../core/base-plugin.js';

export default class SimpleClockPlugin extends BasePlugin {
  getPluginInfo() {
    return {
      name: '简约时钟',
      description: '基于系统时间的简约时钟',
      icon: '⏰',
      category: 'time'
    };
  }

  getThemeConfig() {
    return {
      useGradient: false
    };
  }

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
        ${this._responsiveHeight('140px', '120px')}
        ${this._responsivePadding('20px', '16px')}
      }
      .simple-clock .time { 
        ${this._responsiveFontSize('2.5em', '2em')} 
        font-weight: bold; 
        color: var(--primary-color);
        margin-bottom: 8px;
        letter-spacing: 2px;
      }
      .simple-clock .date { 
        ${this._responsiveFontSize('1.1em', '1em')} 
        opacity: 0.8;
        margin-bottom: 4px;
      }
      .simple-clock .weekday { 
        ${this._responsiveFontSize('1em', '0.9em')} 
        opacity: 0.6;
      }
    `;
  }
}