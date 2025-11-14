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
  dataSourceRequirements: [],
  themeSupport: true,
  gradientSupport: false
};

export default class SimpleClockPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const { time, date, weekday } = this.getSystemData(hass, config);
    
    return `
      <div class="cardforge-card simple-clock theme-${config.theme || 'auto'}">
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
        ${this._responsivePadding('var(--cardforge-spacing-lg)', 'var(--cardforge-spacing-md)')}
        justify-content: center;
      }
      
      .simple-clock .time {
        ${this._responsiveFontSize('2.5em', '2em')}
        font-weight: bold;
        color: var(--primary-color);
        ${this._responsiveMargin('0 0 var(--cardforge-spacing-sm)', '0 0 var(--cardforge-spacing-xs)')}
        letter-spacing: 2px;
      }
      
      .simple-clock .date {
        ${this._responsiveFontSize('1.1em', '1em')}
        opacity: 0.8;
        ${this._responsiveMargin('0 0 var(--cardforge-spacing-xs)', '0 0 3px')}
      }
      
      .simple-clock .weekday {
        ${this._responsiveFontSize('1em', '0.9em')}
        opacity: 0.6;
      }
    `;
  }
}
