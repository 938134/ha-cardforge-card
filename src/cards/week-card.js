// cards/week-card.js - 使用HA组件简化版
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
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
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
            <!-- 年进度部分 -->
            ${config.showYearProgress ? html`
              <div class="year-section">
                <!-- 使用HA的环形进度条 -->
                <div class="year-progress-container">
                  <ha-circular-progress
                    .value=${yearProgress}
                    size="large"
                    stroke-width="4"
                    class="year-progress"
                  >
                    <div class="progress-text" slot="label">
                      <div class="progress-value">${Math.round(yearProgress)}%</div>
                      <div class="progress-label">年进度</div>
                    </div>
                  </ha-circular-progress>
                </div>
                
                <!-- 日期信息 -->
                <div class="date-info">
                  <div class="date-item">
                    <ha-icon icon="mdi:calendar-week" class="date-icon"></ha-icon>
                    <div class="date-text">
                      <div class="date-title">本周</div>
                      <div class="date-value">第 ${weekNumber} 周</div>
                    </div>
                  </div>
                  
                  <div class="date-item">
                    <ha-icon icon="mdi:calendar-today" class="date-icon"></ha-icon>
                    <div class="date-text">
                      <div class="date-title">今天</div>
                      <div class="date-value">${month}月${day}日</div>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <!-- 周进度部分 -->
            ${config.showWeekProgress ? html`
              <div class="week-section">
                <!-- 周进度标题 -->
                <div class="week-title card-subtitle">本周进度</div>
                
                <!-- 使用HA的滑块组件显示周进度 -->
                <ha-slider
                  .value=${(currentDay / 7) * 100}
                  min="0"
                  max="100"
                  step="14.28"
                  pin
                  class="week-slider"
                  disabled
                ></ha-slider>
                
                <!-- 星期标签 -->
                <div class="week-days">
                  ${weekDays.map((dayLabel, i) => html`
                    <div class="week-day ${i === currentDay ? 'current' : ''}">
                      <div class="week-day-label">${dayLabel}</div>
                      ${i === currentDay ? html`
                        <ha-icon icon="mdi:circle-small" class="current-indicator"></ha-icon>
                      ` : ''}
                    </div>
                  `)}
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
        justify-content: center;
        gap: var(--cf-spacing-xl);
        width: 100%;
        max-width: 400px;
      }
      
      .year-progress-container {
        position: relative;
      }
      
      .year-progress {
        --mdc-theme-primary: var(--cf-primary-color);
        --progress-color: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
      }
      
      .progress-text {
        text-align: center;
      }
      
      .progress-value {
        font-size: var(--cf-font-size-2xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        line-height: 1;
      }
      
      .progress-label {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
      
      /* 日期信息 */
      .date-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }
      
      .date-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }
      
      .date-icon {
        color: var(--cf-primary-color);
        font-size: 1.2em;
      }
      
      .date-text {
        display: flex;
        flex-direction: column;
      }
      
      .date-title {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
      }
      
      .date-value {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-primary);
      }
      
      /* 周进度区域 */
      .week-section {
        width: 100%;
        max-width: 400px;
      }
      
      .week-title {
        text-align: center;
        margin-bottom: var(--cf-spacing-md);
      }
      
      .week-slider {
        width: 100%;
        --mdc-theme-primary: var(--cf-accent-color);
        --mdc-theme-secondary: var(--cf-primary-color);
        --paper-slider-knob-color: var(--cf-accent-color);
        --paper-slider-active-color: var(--cf-accent-color);
        --paper-slider-secondary-color: var(--cf-primary-color);
      }
      
      /* 星期标签 */
      .week-days {
        display: flex;
        justify-content: space-between;
        margin-top: var(--cf-spacing-sm);
      }
      
      .week-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        position: relative;
      }
      
      .week-day-label {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-secondary);
      }
      
      .week-day.current .week-day-label {
        color: var(--cf-accent-color);
        font-weight: var(--cf-font-weight-bold);
      }
      
      .current-indicator {
        color: var(--cf-accent-color);
        font-size: 1.2em;
        position: absolute;
        bottom: -8px;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .year-section {
          flex-direction: column;
          gap: var(--cf-spacing-lg);
        }
        
        .date-info {
          flex-direction: row;
          justify-content: center;
          gap: var(--cf-spacing-xl);
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-lg);
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .date-info {
          flex-direction: column;
          gap: var(--cf-spacing-md);
        }
        
        .week-day-label {
          font-size: var(--cf-font-size-xs);
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .year-progress {
          --mdc-theme-primary: var(--cf-primary-color);
        }
        
        .week-slider {
          --mdc-theme-primary: var(--cf-accent-color);
          --paper-slider-knob-color: var(--cf-accent-color);
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};
