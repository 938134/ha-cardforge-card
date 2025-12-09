// cards/week-card.js - 使用 ha-circular-progress 版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { getYearProgress, getWeekNumber } from '../core/card-tools.js';
import { createCardStyles } from '../core/card-styles.js';

export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度，使用HA原生进度条',
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
    const currentDay = now.getDay(); // 0=周日, 1=周一...
    
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 计算周进度百分比
    const weekProgress = (currentDay / 7) * 100;
    
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
              <div class="year-section">
                <div class="progress-container">
                  <ha-circular-progress
                    .progress=${yearProgress / 100}
                    size="large"
                    stroke-width="4"
                    class="year-progress"
                  ></ha-circular-progress>
                  <div class="progress-text">
                    <div class="progress-value">${Math.round(yearProgress)}%</div>
                    <div class="progress-label">年进度</div>
                  </div>
                </div>
                <div class="date-info">
                  <div class="week-label card-emphasis">第 ${weekNumber} 周</div>
                  <div class="month-day card-subtitle">${month}月${day}日</div>
                </div>
              </div>
            ` : ''}
            
            ${config.showWeekProgress ? html`
              <div class="week-section">
                <!-- 周进度条 -->
                <div class="week-progress-container">
                  <ha-circular-progress
                    .progress=${weekProgress / 100}
                    size="medium"
                    stroke-width="3"
                    class="week-progress"
                  ></ha-circular-progress>
                  <div class="week-progress-text">
                    <div class="current-day">${weekDays[currentDay]}</div>
                    <div class="week-progress-label">周进度</div>
                  </div>
                </div>
                
                <!-- 星期指示器 -->
                <div class="week-indicator">
                  ${weekDays.map((dayLabel, i) => {
                    const isPast = i < currentDay;
                    const isCurrent = i === currentDay;
                    const isWeekend = i === 0 || i === 6;
                    
                    let dayClass = 'day-item';
                    if (isCurrent) dayClass += ' current';
                    if (isPast) dayClass += ' past';
                    if (isWeekend) dayClass += ' weekend';
                    
                    return html`
                      <div class="${dayClass}" title="${dayLabel}">
                        ${isCurrent ? html`
                          <ha-icon icon="mdi:circle-small" class="current-icon"></ha-icon>
                        ` : ''}
                        <div class="day-name">${dayLabel}</div>
                        ${isPast ? html`
                          <ha-icon icon="mdi:check-circle" class="past-icon"></ha-icon>
                        ` : ''}
                      </div>
                    `;
                  })}
                </div>
                
                <!-- 周进度信息 -->
                <div class="week-info card-caption">
                  本周已过 ${currentDay} 天，剩余 ${7 - currentDay} 天
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
        gap: var(--cf-spacing-xl);
        justify-content: center;
      }
      
      /* 年进度区域 */
      .year-section {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
        max-width: 320px;
      }
      
      .progress-container {
        position: relative;
        width: 80px;
        height: 80px;
      }
      
      .year-progress {
        --mdc-theme-primary: var(--primary-color);
        width: 100%;
        height: 100%;
      }
      
      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 1;
      }
      
      .progress-value {
        font-size: var(--cf-font-size-xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--primary-color);
        line-height: 1.2;
      }
      
      .progress-label {
        font-size: var(--cf-font-size-xs);
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      
      .date-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 100px;
      }
      
      .week-label {
        line-height: var(--cf-line-height-tight);
        margin-bottom: 4px;
        white-space: nowrap;
        color: var(--primary-color);
      }
      
      .month-day {
        line-height: var(--cf-line-height-tight);
        white-space: nowrap;
        color: var(--secondary-text-color);
      }
      
      /* 周进度区域 */
      .week-section {
        max-width: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--cf-spacing-md);
      }
      
      .week-progress-container {
        position: relative;
        width: 60px;
        height: 60px;
      }
      
      .week-progress {
        --mdc-theme-primary: var(--accent-color);
        width: 100%;
        height: 100%;
      }
      
      .week-progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 1;
      }
      
      .current-day {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        color: var(--accent-color);
        line-height: 1.2;
      }
      
      .week-progress-label {
        font-size: var(--cf-font-size-xs);
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      
      /* 星期指示器 */
      .week-indicator {
        display: flex;
        gap: 6px;
        width: 100%;
        justify-content: space-between;
      }
      
      .day-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 2px;
        border-radius: var(--cf-radius-sm);
        transition: all var(--cf-transition-duration-fast);
        position: relative;
        min-height: 50px;
      }
      
      .day-name {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        margin-bottom: 4px;
        transition: all var(--cf-transition-duration-fast);
      }
      
      .current-icon {
        color: var(--accent-color);
        font-size: 1.5em;
        margin-bottom: 4px;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
      }
      
      .past-icon {
        color: var(--primary-color);
        font-size: 0.9em;
        opacity: 0.7;
        margin-top: 2px;
      }
      
      /* 当前日样式 */
      .day-item.current {
        background: rgba(var(--accent-color-rgb), 0.1);
        border: 1px solid rgba(var(--accent-color-rgb), 0.3);
      }
      
      .day-item.current .day-name {
        color: var(--accent-color);
        font-weight: var(--cf-font-weight-bold);
      }
      
      /* 已过日样式 */
      .day-item.past {
        background: rgba(var(--primary-color-rgb), 0.05);
      }
      
      .day-item.past .day-name {
        color: var(--primary-color);
      }
      
      /* 未来日样式 */
      .day-item:not(.current):not(.past) .day-name {
        color: var(--secondary-text-color);
      }
      
      /* 周末样式 */
      .day-item.weekend .day-name {
        color: var(--error-color, #f44336);
      }
      
      .day-item.current.weekend .day-name {
        color: color-mix(in srgb, var(--accent-color) 70%, var(--error-color) 30%);
      }
      
      /* 周信息 */
      .week-info {
        text-align: center;
        color: var(--secondary-text-color);
        font-size: var(--cf-font-size-xs);
        padding: 4px 8px;
        background: rgba(var(--primary-color-rgb), 0.05);
        border-radius: var(--cf-radius-sm);
        width: 100%;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .week-card .card-content {
          gap: var(--cf-spacing-lg);
        }
        
        .year-section {
          max-width: 280px;
          gap: var(--cf-spacing-lg);
        }
        
        .progress-container {
          width: 70px;
          height: 70px;
        }
        
        .progress-value {
          font-size: var(--cf-font-size-lg);
        }
        
        .date-info {
          min-width: 80px;
        }
        
        .week-section {
          max-width: 320px;
        }
        
        .week-progress-container {
          width: 50px;
          height: 50px;
        }
        
        .current-day {
          font-size: var(--cf-font-size-md);
        }
        
        .day-item {
          padding: 4px 1px;
          min-height: 45px;
        }
        
        .day-name {
          font-size: var(--cf-font-size-xs);
        }
        
        .current-icon {
          font-size: 1.2em;
        }
        
        .past-icon {
          font-size: 0.8em;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .year-section {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-md);
        }
        
        .progress-container {
          margin-bottom: 8px;
        }
        
        .week-indicator {
          gap: 4px;
        }
        
        .day-item {
          padding: 3px 1px;
          min-height: 40px;
        }
        
        .day-name {
          font-size: 0.7em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .week-card {
          min-height: 160px;
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-md);
        }
        
        .progress-container {
          width: 60px;
          height: 60px;
        }
        
        .progress-value {
          font-size: var(--cf-font-size-md);
        }
        
        .week-progress-container {
          width: 45px;
          height: 45px;
        }
        
        .current-day {
          font-size: var(--cf-font-size-sm);
        }
        
        .day-item {
          min-height: 35px;
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};