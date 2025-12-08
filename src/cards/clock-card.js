// cards/clock-card.js - 完全使用 Lit 模板
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
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
    const timeStr = formatTime(now, config.use24Hour);
    const dateStr = formatDate(now);
    const weekdayStr = getWeekday(now);
    
    return html`
      <div class="clock-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            ${config.showSeconds 
              ? html`
                  <div class="clock-time card-emphasis">
                    ${timeStr}:${now.getSeconds().toString().padStart(2, '0')}
                  </div>
                `
              : html`
                  <div class="clock-time card-emphasis">${timeStr}</div>
                `
            }
            
            ${config.showDate 
              ? html`<div class="clock-date card-subtitle">${dateStr}</div>` 
              : ''
            }
            
            ${config.showWeekday 
              ? html`<div class="clock-weekday card-caption">${weekdayStr}</div>` 
              : ''
            }
          </div>
        </div>
      </div>
    `;
  },
  
  styles: (config) => {
    const customStyles = css`
      .clock-card {
        min-height: 160px;
      }
      
      .clock-time {
        font-size: var(--cf-font-size-4xl);
        letter-spacing: 1px;
        margin: var(--cf-spacing-md) 0;
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