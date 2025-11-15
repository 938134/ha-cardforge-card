// src/plugins/time-week.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'time-week',
  name: '时间星期',
  version: '1.1.0',
  description: '垂直布局的时间星期显示，支持灵活数据源',
  author: 'CardForge Team',
  category: 'time',
  icon: '📅',
  entityRequirements: [
    {
      key: 'time_source',
      description: '时间来源（实体ID或Jinja2模板）',
      required: false
    },
    {
      key: 'date_source',
      description: '日期来源（实体ID或Jinja2模板）',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: false
};

export default class TimeWeekPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    // 使用统一数据获取方法
    const time = this._getCardValue(hass, entities, 'time_source') || systemData.time;
    const date = this._getCardValue(hass, entities, 'date_source') || systemData.date;
    const weekday = systemData.weekday;
    
    const [hour, minute] = time.split(':');
    let month = '01', day = '01';
    
    if (date.includes('-')) {
      const dateParts = date.split('-');
      month = dateParts[1] || '01';
      day = dateParts[2] || '01';
    } else if (date.includes('/')) {
      const dateParts = date.split('/');
      month = dateParts[1] || '01';
      day = dateParts[2] || '01';
    } else {
      const now = new Date();
      month = String(now.getMonth() + 1).padStart(2, '0');
      day = String(now.getDate()).padStart(2, '0');
    }

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
        ${this._responsiveHeight('140px', '120px')} /* 降低高度 */
        ${this._responsivePadding('16px', '12px')} /* 减小内边距 */
        ${this._flexColumn()}
        justify-content: space-between;
        ${this._textCenter()}
      }
      
      .time-section {
        ${this._flexColumn()}
        ${this._responsiveGap('3px', '2px')} /* 减小间距 */
      }
      
      .hour, .minute {
        ${this._responsiveFontSize('2.2em', '1.8em')} /* 调整字体大小 */
        font-weight: bold;
        line-height: 1;
        color: var(--primary-color);
      }
      
      .date-section {
        ${this._flexColumn()}
        ${this._responsiveGap('6px', '4px')} /* 减小间距 */
      }
      
      .month-day {
        ${this._responsiveFontSize('1em', '0.9em')} /* 调整字体大小 */
        font-weight: 600;
        opacity: 0.9;
      }
      
      .weekday {
        ${this._responsiveFontSize('0.9em', '0.8em')} /* 调整字体大小 */
        background: var(--primary-color);
        color: white;
        ${this._borderRadius('10px')} /* 减小圆角 */
        padding: 3px 10px; /* 减小内边距 */
        display: inline-block;
        opacity: 0.9;
      }
      
      /* 主题适配 */
      .time-week.glass .hour,
      .time-week.glass .minute {
        color: var(--primary-text-color);
      }
      
      /* 响应式优化 */
      @media (max-width: 480px) {
        .time-week {
          ${this._responsiveGap('10px', '8px')} /* 减小间距 */
        }
      }
    `;
  }
}