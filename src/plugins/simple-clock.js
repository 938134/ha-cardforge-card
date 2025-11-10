// src/plugins/simple-clock.js
import { BasePlugin } from '../core/base-plugin.js';

export default class SimpleClockPlugin extends BasePlugin {
  getPluginInfo() {
    return {
      name: '简约时钟',
      description: '基于系统时间的简约时钟显示',
      icon: '⏰',
      category: 'time',
      supportsGradient: true
    };
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['#667eea', '#764ba2']
    };
  }

  getEntityRequirements() {
    return []; // 不需要关联实体
  }

  getTemplate(config, hass, entities) {
    const { time, date, weekday } = this.getSystemData(hass, config);
    return `
      <div class="cardforge-card simple-clock">
        <div class="time-display">
          <div class="time">${time}</div>
          <div class="date-week">
            <span class="date">${date}</span>
            <span class="weekday">${weekday}</span>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .simple-clock {
        ${this._flexCenter()}
        ${this._responsiveHeight('140px', '120px')}
        ${this._responsivePadding('20px', '16px')}
      }
      
      .time-display {
        ${this._textCenter()}
      }
      
      .simple-clock .time {
        ${this._responsiveFontSize('3em', '2.5em')}
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: 2px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .simple-clock .date-week {
        ${this._flexCenter()}
        gap: 12px;
        font-weight: 500;
      }
      
      .simple-clock .date {
        ${this._responsiveFontSize('1.1em', '1em')}
        opacity: 0.9;
      }
      
      .simple-clock .weekday {
        ${this._responsiveFontSize('1em', '0.9em')}
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 20px;
        opacity: 0.8;
      }
      
      /* 主题特定样式 */
      .cardforge-card[data-theme="minimal"] .simple-clock .weekday {
        background: var(--primary-color);
        color: white;
      }
    `;
  }
}