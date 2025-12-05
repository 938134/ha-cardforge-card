// 时钟卡片 - 精简实用版
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
    
    // 使用工具组件获取格式化内容
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
    // 直接使用设计系统变量
    return `
      /* 基础卡片布局 */
      .clock-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 160px;
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
        max-width: 500px;
        align-items: center;
      }
      
      /* 时间显示 */
      .clock-time {
        font-size: var(--cf-font-size-4xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        line-height: var(--cf-line-height-tight);
        letter-spacing: 0.5px;
        margin-bottom: var(--cf-spacing-xs);
        text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.2);
        transition: all var(--cf-transition-duration-slow) var(--cf-easing-decelerate);
      }
      
      /* 日期和星期 */
      .clock-date, .clock-weekday {
        font-size: var(--cf-font-size-base);
        color: var(--cf-text-secondary);
        line-height: var(--cf-line-height-normal);
        font-weight: var(--cf-font-weight-medium);
        letter-spacing: 0.3px;
      }
      
      .clock-weekday {
        color: var(--cf-text-tertiary);
      }
      
      /* 悬停时增强效果 */
      .clock-card:hover .clock-time {
        text-shadow: 0 4px 16px rgba(var(--cf-primary-color-rgb), 0.3);
        transform: scale(1.02);
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
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .clock-time {
          text-shadow: 0 2px 12px rgba(var(--cf-primary-color-rgb), 0.4);
        }
        
        .clock-card:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        
        .clock-card:hover .clock-time {
          text-shadow: 0 4px 20px rgba(var(--cf-primary-color-rgb), 0.5);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .clock-card {
          padding: var(--cf-spacing-lg);
        }
        
        .clock-time {
          font-size: var(--cf-font-size-3xl);
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .clock-card {
          padding: var(--cf-spacing-md);
          min-height: 140px;
        }
        
        .clock-display {
          gap: var(--cf-spacing-sm);
        }
        
        .clock-time {
          font-size: var(--cf-font-size-2xl);
          letter-spacing: normal;
        }
        
        .clock-date, .clock-weekday {
          font-size: var(--cf-font-size-sm);
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .clock-card {
          padding: var(--cf-spacing-sm);
          min-height: 120px;
        }
        
        .clock-time {
          font-size: var(--cf-font-size-xl);
        }
        
        .clock-date, .clock-weekday {
          font-size: var(--cf-font-size-xs);
        }
      }
    `;
  }
};
