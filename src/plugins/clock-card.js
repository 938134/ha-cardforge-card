// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '精美时钟',
    version: '2.0.0',
    description: '多种风格的时钟卡片，支持日期和星期显示',
    category: '时间',
    icon: '🕰️',
    author: 'CardForge',
    
    // 无实体需求 - 自动使用无状态策略
    config_schema: {
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['现代风格', '经典风格', '简约风格', '毛玻璃风格', '霓虹风格'],
        default: '现代风格'
      },
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: true
      },
      show_weekday: {
        type: 'boolean',
        label: '显示星期',
        default: true
      }
    }
  };

  getTemplate(config, hass, entities) {
    const now = new Date();
    const timeData = this._getTimeData(now);
    
    return `
      <div class="cardforge-responsive-container clock-card style-${config.clock_style || '现代风格'}">
        <div class="clock-content">
          <div class="time-display">${timeData.time}</div>
          ${config.show_date ? `<div class="date-display">${timeData.date}</div>` : ''}
          ${config.show_weekday ? `<div class="weekday-display">${timeData.weekday}</div>` : ''}
        </div>
      </div>
    `;
  }

  _getTimeData(now) {
    return {
      time: now.toLocaleTimeString('zh-CN'),
      date: now.toLocaleDateString('zh-CN'),
      weekday: '星期' + '日一二三四五六'[now.getDay()]
    };
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      .clock-card {
        text-align: center;
        padding: var(--cf-spacing-xl);
      }
      .time-display {
        font-size: 2.5em;
        font-weight: 300;
        margin-bottom: var(--cf-spacing-md);
      }
      .date-display, .weekday-display {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;