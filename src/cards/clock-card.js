// cards/clock-card.js - 修复版
import { formatTime, formatDate, getWeekday } from '../core/card-tools.js';
import { createCardStyles } from '../core/card-styles.js';

export const card = {
  id: 'clock',
  meta: {
    name: '时钟',
    description: '显示当前时间和日期',
    icon: '⏰',
    category: '时间'
  },
  
  schema: {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    showDate: {
      type: 'boolean',
      label: '显示日期',
      default: true
    },
    showWeekday: {
      type: 'boolean',
      label: '显示星期',
      default: true
    },
    showSeconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    }
  },
  
  template: (config, data) => {
    const now = new Date();
    
    // 使用工具库函数
    let timeHtml = '';
    if (config.showSeconds) {
      const baseTime = formatTime(now, config.use24Hour);
      const seconds = now.getSeconds().toString().padStart(2, '0');
      timeHtml = `<div class="clock-time card-emphasis">${baseTime}:${seconds}</div>`;
    } else {
      timeHtml = `<div class="clock-time card-emphasis">${formatTime(now, config.use24Hour)}</div>`;
    }
    
    const dateHtml = config.showDate ? 
      `<div class="clock-date card-subtitle">${formatDate(now)}</div>` : '';
    
    const weekdayHtml = config.showWeekday ? 
      `<div class="clock-weekday card-caption">${getWeekday(now)}</div>` : '';
    
    return `
      <div class="clock-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            ${timeHtml}
            ${dateHtml}
            ${weekdayHtml}
          </div>
        </div>
      </div>
    `;
  },
  
  styles: (config) => {
    // 只保留时钟卡片特有的样式
    const customStyles = `
      .clock-card {
        min-height: 160px; /* 增加最小高度 */
      }
      
      .clock-time {
        font-size: var(--cf-font-size-4xl);
        letter-spacing: 1px;
        margin: var(--cf-spacing-md) 0; /* 增加上下间距 */
      }
      
      .clock-date {
        margin-top: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .clock-weekday {
        margin-top: var(--cf-spacing-xs);
      }
      
      /* 时钟卡片特定的响应式 */
      @container cardforge-container (max-width: 400px) {
        .clock-time {
          font-size: var(--cf-font-size-3xl);
          margin: var(--cf-spacing-sm) 0;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .clock-time {
          font-size: var(--cf-font-size-2xl);
          margin: var(--cf-spacing-xs) 0;
        }
      }
    `;
    
    // 使用通用样式工具
    return createCardStyles(customStyles);
  }
};