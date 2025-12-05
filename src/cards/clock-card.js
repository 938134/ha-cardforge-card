// 时钟卡片 - 优化字体大小版
import { formatTime, formatDate, getWeekday } from '../core/utils.js';

export const card = {
  id: 'clock',
  meta: {
    name: '时钟',
    description: '显示当前时间和日期',
    icon: '⏰',
    category: '时间',
    version: '2.0',
    author: 'CardForge'
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
  
  template: (config) => {
    const now = new Date();
    
    const timeHtml = formatTime(now, config.use24Hour, config.showSeconds);
    const dateHtml = config.showDate ? formatDate(now, 'zh-CN') : '';
    const weekdayHtml = config.showWeekday ? getWeekday(now, 'full') : '';
    
    return `
      <div class="clock-card">
        <div class="clock-display">
          <div class="clock-time">${timeHtml}</div>
          ${dateHtml ? `<div class="clock-date">${dateHtml}</div>` : ''}
          ${weekdayHtml ? `<div class="clock-weekday">${weekdayHtml}</div>` : ''}
        </div>
      </div>
    `;
  },
  
  styles: (config, theme) => {
    return `
      /* 基础卡片布局 */
      .clock-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 180px; /* 增加最小高度 */
        padding: var(--cf-spacing-xl);
        font-family: var(--cf-font-family-base);
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-sm);
        transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
        text-align: center;
      }
      
      /* 交互效果 */
      .clock-card:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
        background: var(--cf-hover-color);
      }
      
      /* 时钟显示区域 */
      .clock-display {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
        width: 100%;
        max-width: 600px; /* 增加最大宽度 */
        align-items: center;
      }
      
      /* 时间显示 - 增大字体！ */
      .clock-time {
        font-size: 4.5em; /* 从3.5em增加到4.5em */
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        line-height: 1;
        letter-spacing: 1px;
        margin-bottom: var(--cf-spacing-sm);
        text-shadow: 0 2px 10px rgba(var(--cf-primary-color-rgb), 0.25);
        transition: all var(--cf-transition-duration-slow) var(--cf-easing-decelerate);
      }
      
      /* 12小时制的AM/PM标记 */
      .clock-time .ampm {
        font-size: 0.35em;
        font-weight: var(--cf-font-weight-semibold);
        margin-left: 8px;
        opacity: 0.9;
        vertical-align: super;
      }
      
      /* 秒数显示 */
      .clock-time .seconds {
        font-size: 0.5em;
        opacity: 0.8;
        margin-left: 2px;
      }
      
      /* 日期和星期 - 适当增大 */
      .clock-date, .clock-weekday {
        font-size: 1.2em; /* 从1.1em增加到1.2em */
        color: var(--cf-text-secondary);
        line-height: var(--cf-line-height-normal);
        font-weight: var(--cf-font-weight-medium);
        letter-spacing: 0.5px;
      }
      
      .clock-weekday {
        color: var(--cf-text-tertiary);
      }
      
      /* 悬停时增强效果 */
      .clock-card:hover .clock-time {
        text-shadow: 0 4px 20px rgba(var(--cf-primary-color-rgb), 0.35);
        transform: scale(1.03);
      }
      
      .clock-card:hover .clock-date {
        color: var(--cf-text-primary);
      }
      
      .clock-card:hover .clock-weekday {
        color: var(--cf-text-secondary);
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .clock-card {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        
        .clock-time {
          text-shadow: 0 2px 15px rgba(var(--cf-primary-color-rgb), 0.5);
        }
        
        .clock-card:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        
        .clock-card:hover .clock-time {
          text-shadow: 0 4px 25px rgba(var(--cf-primary-color-rgb), 0.6);
        }
      }
      
      /* 响应式设计 - 保持字体可读性 */
      @container cardforge-container (max-width: 768px) {
        .clock-card {
          padding: var(--cf-spacing-lg);
        }
        
        .clock-time {
          font-size: 4em;
        }
        
        .clock-date, .clock-weekday {
          font-size: 1.1em;
        }
      }
      
      @container cardforge-container (max-width: 600px) {
        .clock-card {
          padding: var(--cf-spacing-md);
          min-height: 160px;
        }
        
        .clock-display {
          gap: var(--cf-spacing-sm);
        }
        
        .clock-time {
          font-size: 3.5em;
          letter-spacing: 0.5px;
        }
        
        .clock-date, .clock-weekday {
          font-size: 1em;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .clock-card {
          padding: var(--cf-spacing-sm);
          min-height: 140px;
        }
        
        .clock-time {
          font-size: 3em;
          letter-spacing: normal;
        }
        
        .clock-date, .clock-weekday {
          font-size: 0.95em;
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .clock-card {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
          min-height: 130px;
        }
        
        .clock-time {
          font-size: 2.5em;
        }
        
        .clock-date, .clock-weekday {
          font-size: 0.9em;
        }
      }
    `;
  }
};
