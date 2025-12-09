// cards/week-card.js - 简化测试版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { getYearProgress, getWeekNumber } from '../core/card-tools.js';
import { createCardStyles } from '../core/card-styles.js';

export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度',
    icon: '📅',
    category: '时间'
  },
  
  schema: {
    showYearProgress: {
      type: 'boolean',
      label: '显示年进度',
      default: true
    },
    showWeekProgress: {
      type: 'boolean',
      label: '显示周进度',
      default: true
    }
  },
  
  template: (config, { hass }) => {
    const now = new Date();
    const yearProgress = getYearProgress(now);
    const weekNumber = getWeekNumber(now);
    const currentDay = now.getDay();
    
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 如果没有显示任何内容，显示空状态
    if (!config.showYearProgress && !config.showWeekProgress) {
      return html`
        <div class="week-card">
          <div class="card-empty">
            <div class="card-empty-icon">📅</div>
            <div class="card-empty-text">请开启年进度或周进度显示</div>
          </div>
        </div>
      `;
    }
    
    return html`
      <div class="week-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            ${config.showYearProgress ? html`
              <div class="year-section layout-horizontal">
                <div class="progress-text card-emphasis">${Math.round(yearProgress)}%</div>
                <div class="date-info">
                  <div class="week-label card-emphasis">第 ${weekNumber} 周</div>
                  <div class="month-day card-subtitle">${month}月${day}日</div>
                </div>
              </div>
            ` : ''}
            
            ${config.showWeekProgress ? html`
              <div class="week-section">
                <div class="progress-bars">
                  ${['日', '一', '二', '三', '四', '五', '六'].map((dayLabel, i) => {
                    const isPast = i < currentDay;
                    const isCurrent = i === currentDay;
                    const colorClass = isCurrent ? 'current' : (isPast ? 'past' : 'future');
                    
                    return html`
                      <div class="week-bar ${colorClass}" title="${dayLabel}"></div>
                    `;
                  })}
                </div>
                <div class="day-labels layout-horizontal">
                  ${['日', '一', '二', '三', '四', '五', '六'].map((dayLabel, i) => {
                    const isPast = i < currentDay;
                    const isCurrent = i === currentDay;
                    const colorClass = isCurrent ? 'current' : (isPast ? 'past' : 'future');
                    
                    return html`
                      <div class="day-label ${colorClass}">${dayLabel}</div>
                    `;
                  })}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },
  
  styles: (config) => {
    const customStyles = css`
      .week-card {
        min-height: 180px;
      }
      
      .week-card .card-content {
        gap: var(--cf-spacing-lg);
        justify-content: center;
      }
      
      /* 年进度区域 */
      .year-section {
        width: 100%;
        max-width: 320px;
        margin: var(--cf-spacing-sm) 0;
      }
      
      .progress-text {
        font-size: var(--cf-font-size-2xl);
        font-weight: var(--cf-font-weight-bold);
      }
      
      /* 日期信息 */
      .date-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 100px;
      }
      
      .week-label {
        line-height: var(--cf-line-height-tight);
        margin-bottom: 2px;
        white-space: nowrap;
      }
      
      .month-day {
        line-height: var(--cf-line-height-tight);
        white-space: nowrap;
      }
      
      /* 周进度区域 */
      .week-section {
        width: 100%;
        max-width: 300px;
        margin: var(--cf-spacing-sm) 0;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: var(--cf-spacing-lg);
        background: var(--cf-surface);
        border-radius: var(--cf-radius-pill);
        overflow: hidden;
        margin-bottom: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-inner);
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        transition: all var(--cf-transition-duration-normal);
        border-right: 1px solid var(--cf-border-light);
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      .week-bar.past {
        background: var(--cf-neutral-200);
      }
      
      .week-bar.current {
        background: var(--cf-accent-color);
        transform: scaleY(1.1);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.3);
        z-index: 1;
        position: relative;
      }
      
      .week-bar.future {
        background: var(--cf-primary-color);
      }
      
      /* 标签样式 */
      .day-labels {
        justify-content: space-between;
      }
      
      .day-label {
        font-weight: var(--cf-font-weight-medium);
        text-align: center;
        flex: 1;
        font-size: var(--cf-font-size-sm);
      }
      
      .day-label.past {
        color: var(--cf-neutral-400);
      }
      
      .day-label.current {
        color: var(--cf-accent-color);
        font-weight: var(--cf-font-weight-bold);
      }
      
      .day-label.future {
        color: var(--cf-primary-color);
      }
    `;
    
    return createCardStyles(customStyles);
  }
};
