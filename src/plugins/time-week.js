// src/plugins/time-week.js
import { BasePlugin } from '../core/base-plugin.js';

// 简化版本的时间星期插件
export const manifest = {
  id: 'time-week',
  name: '时间星期',
  version: '1.0.0',
  description: '垂直布局的时间星期显示',
  author: 'CardForge Team',
  category: 'time',
  icon: '📅',
  entityRequirements: [
    {
      key: 'time',
      description: '时间实体（可选）',
      required: false
      // 不指定 domains，允许选择任何实体
    },
    {
      key: 'date',
      description: '日期实体（可选）', 
      required: false
      // 不指定 domains，允许选择任何实体
    }
  ],
  themeSupport: true,
  gradientSupport: false
};

export default class TimeWeekPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const timeEntity = entities.time;
    const dateEntity = entities.date;
    
    // 使用实体数据或系统数据
    const time = timeEntity?.state || this.getSystemData(hass, config).time;
    const date = dateEntity?.state || this.getSystemData(hass, config).date;
    const weekday = this.getSystemData(hass, config).weekday;
    
    const [hour, minute] = time.split(':');
    const dateParts = date.split('-');
    const month = dateParts[1] || '01';
    const day = dateParts[2] || '01';

    return `
      <div class="cardforge-card time-week">
        <div class="time-section">
          <div class="hour">${hour}</div>
          <div class="minute">${minute}</div>
        </div>
        <div class="date-section">
          <div class="month-day">${month}月${day}日</div>
          <div class="weekday">${weekday}</div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .time-week {
        ${this._responsiveHeight('180px', '160px')}
        ${this._responsivePadding('20px', '16px')}
        ${this._flexColumn()}
        justify-content: space-between;
        text-align: center;
      }
      .time-section {
        ${this._flexColumn()}
        gap: 4px;
      }
      .hour, .minute {
        ${this._responsiveFontSize('2.8em', '2.2em')}
        font-weight: bold;
        line-height: 1;
        color: var(--primary-color);
      }
      .date-section {
        ${this._flexColumn()}
        gap: 8px;
      }
      .month-day {
        ${this._responsiveFontSize('1.2em', '1em')}
        font-weight: 600;
        opacity: 0.9;
      }
      .weekday {
        ${this._responsiveFontSize('1em', '0.9em')}
        background: var(--primary-color);
        color: white;
        border-radius: 12px;
        padding: 4px 12px;
        display: inline-block;
        opacity: 0.9;
      }
      
      @media (max-width: 480px) {
        .time-week {
          gap: 12px;
        }
      }
    `;
  }
}