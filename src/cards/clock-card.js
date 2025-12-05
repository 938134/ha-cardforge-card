// 时钟卡片 - 优化最终版
import { formatTime, formatDate, getWeekday } from '../core/utilities.js';

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
      timeHtml = `<div class="clock-time">${baseTime}:${seconds}</div>`;
    } else {
      timeHtml = `<div class="clock-time">${formatTime(now, config.use24Hour)}</div>`;
    }
    
    const dateHtml = config.showDate ? 
      `<div class="clock-date">${formatDate(now)}</div>` : '';
    
    const weekdayHtml = config.showWeekday ? 
      `<div class="clock-weekday">${getWeekday(now)}</div>` : '';
    
    return `
      <div class="clock-card">
        <div class="clock-display">
          ${timeHtml}
          ${dateHtml}
          ${weekdayHtml}
        </div>
      </div>
    `;
  },
  
  styles: (config) => {
    return `
      .clock-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 140px;
        padding: var(--cf-spacing-xl);
        font-family: var(--cf-font-family-base);
      }
      
      .clock-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        text-align: center;
        padding: var(--cf-spacing-lg);
        width: 100%;
      }
      
      /* 时间：使用最大字号，确保醒目 */
      .clock-time {
        font-size: var(--cf-font-size-4xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        line-height: var(--cf-line-height-tight);
        letter-spacing: 1px;
        margin-bottom: var(--cf-spacing-xs);
        text-shadow: 0 2px 4px rgba(var(--cf-primary-color-rgb), 0.2);
      }
      
      .clock-date, .clock-weekday {
        font-size: var(--cf-font-size-lg);
        color: var(--cf-text-secondary);
        line-height: var(--cf-line-height-normal);
        font-weight: var(--cf-font-weight-medium);
        letter-spacing: 0.5px;
      }
      
      .clock-weekday {
        color: var(--cf-text-tertiary);
      }
      
      /* 深色模式优化 - 调整阴影效果 */
      @media (prefers-color-scheme: dark) {
        .clock-time {
          text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.4);
        }
      }
      
      /* 响应式设计 - 容器查询 */
      @container cardforge-container (max-width: 400px) {
        .clock-display {
          padding: var(--cf-spacing-md);
        }
        
        .clock-time {
          font-size: var(--cf-font-size-3xl);
        }
        
        .clock-date, .clock-weekday {
          font-size: var(--cf-font-size-md);
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .clock-card {
          padding: var(--cf-spacing-md);
          min-height: 120px;
        }
        
        .clock-time {
          font-size: var(--cf-font-size-2xl);
        }
        
        .clock-date, .clock-weekday {
          font-size: var(--cf-font-size-sm);
        }
      }
    `;
  }
};
