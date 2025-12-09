// cards/week-card.js - 使用 HA 组件版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { getYearProgress, getWeekNumber } from '../core/card-tools.js';
import { createCardStyles } from '../core/card-styles.js';

export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度，使用HA原生组件',
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
    
    // 构建周进度条
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
            ${config.showYearProgress ? html`
              <div class="year-section layout-horizontal">
                <!-- 使用 HA 的 gauge 卡片显示年进度 -->
                <hui-gauge-card 
                  style="
                    width: 80px;
                    height: 80px;
                    margin-right: 16px;
                    --gauge-color: var(--primary-color);
                  "
                  .hass=${hass}
                  .config=${{ 
                    type: 'gauge',
                    entity: 'sensor.time',
                    min: 0,
                    max: 100,
                    severity: {
                      green: 0,
                      yellow: 0,
                      red: 0
                    },
                    name: '年进度'
                  }}
                >
                  <!-- 自定义显示 -->
                  <div class="gauge-custom">
                    <div class="gauge-value">${Math.round(yearProgress)}%</div>
                  </div>
                </hui-gauge-card>
                
                <div class="date-info">
                  <div class="week-label card-emphasis">第 ${weekNumber} 周</div>
                  <div class="month-day card-subtitle">${month}月${day}日</div>
                </div>
              </div>
            ` : ''}
            
            ${config.showWeekProgress ? html`
              <div class="week-section">
                <!-- 周进度条使用自定义实现 -->
                <div class="progress-bars">
                  ${weekDays.map((dayLabel, i) => {
                    const isPast = i < currentDay;
                    const isCurrent = i === currentDay;
                    const isWeekend = i === 0 || i === 6; // 周日或周六
                    
                    let colorClass = '';
                    if (isCurrent) {
                      colorClass = 'current';
                    } else if (isPast) {
                      colorClass = 'past';
                    } else {
                      colorClass = 'future';
                    }
                    
                    // 周末特殊样式
                    if (isWeekend) {
                      colorClass += ' weekend';
                    }
                    
                    return html`
                      <div class="week-bar ${colorClass}" title="${dayLabel}">
                        ${isCurrent ? html`
                          <div class="current-indicator">
                            <ha-icon icon="mdi:circle-small"></ha-icon>
                          </div>
                        ` : ''}
                      </div>
                    `;
                  })}
                </div>
                
                <!-- 星期标签 -->
                <div class="day-labels layout-horizontal">
                  ${weekDays.map((dayLabel, i) => {
                    const isPast = i < currentDay;
                    const isCurrent = i === currentDay;
                    const isWeekend = i === 0 || i === 6;
                    
                    let colorClass = '';
                    if (isCurrent) {
                      colorClass = 'current';
                    } else if (isPast) {
                      colorClass = 'past';
                    } else {
                      colorClass = 'future';
                    }
                    
                    // 周末特殊样式
                    if (isWeekend) {
                      colorClass += ' weekend';
                    }
                    
                    return html`
                      <div class="day-label ${colorClass}">
                        ${isCurrent ? html`
                          <ha-icon icon="mdi:circle-small" style="color: var(--accent-color);"></ha-icon>
                        ` : ''}
                        ${dayLabel}
                      </div>
                    `;
                  })}
                </div>
                
                <!-- 当前日期信息 -->
                <div class="current-day-info card-caption">
                  今天是${weekDays[currentDay]}，本周已过 ${currentDay} 天
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
        width: 100%;
        max-width: 320px;
        margin: var(--cf-spacing-sm) 0;
        align-items: center;
      }
      
      /* 自定义 gauge 样式 */
      hui-gauge-card {
        --gauge-color: var(--primary-color);
        --gauge-background: var(--paper-card-background-color);
      }
      
      .gauge-custom {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }
      
      .gauge-value {
        font-size: var(--cf-font-size-xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--primary-color);
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
        width: 100%;
        max-width: 400px;
        margin: var(--cf-spacing-sm) 0;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: 24px;
        background: var(--paper-card-background-color);
        border-radius: var(--cf-radius-pill);
        overflow: hidden;
        margin-bottom: var(--cf-spacing-sm);
        border: 1px solid var(--divider-color);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        transition: all var(--cf-transition-duration-normal);
        border-right: 1px solid var(--divider-color);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      /* 已过去的日子 - 浅色 */
      .week-bar.past {
        background: color-mix(in srgb, var(--primary-color) 20%, transparent 80%);
      }
      
      .week-bar.past.weekend {
        background: color-mix(in srgb, var(--accent-color) 15%, transparent 85%);
      }
      
      /* 当前日 - 强调色 */
      .week-bar.current {
        background: var(--accent-color);
        z-index: 1;
        position: relative;
      }
      
      .week-bar.current.weekend {
        background: color-mix(in srgb, var(--accent-color) 80%, #ff9800 20%);
      }
      
      .current-indicator {
        position: absolute;
        top: -8px;
        color: var(--accent-color);
        font-size: 1.5em;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }
      
      /* 未来的日子 - 主色 */
      .week-bar.future {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent 70%);
      }
      
      .week-bar.future.weekend {
        background: color-mix(in srgb, var(--accent-color) 20%, transparent 80%);
      }
      
      /* 标签样式 */
      .day-labels {
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .day-label {
        font-weight: var(--cf-font-weight-medium);
        text-align: center;
        flex: 1;
        font-size: var(--cf-font-size-sm);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      
      /* 标签颜色与进度条对应 */
      .day-label.past {
        color: var(--secondary-text-color);
      }
      
      .day-label.past.weekend {
        color: color-mix(in srgb, var(--accent-color) 60%, var(--secondary-text-color) 40%);
      }
      
      .day-label.current {
        color: var(--accent-color);
        font-weight: var(--cf-font-weight-bold);
      }
      
      .day-label.current.weekend {
        color: color-mix(in srgb, var(--accent-color) 70%, #ff9800 30%);
      }
      
      .day-label.future {
        color: var(--primary-color);
      }
      
      .day-label.future.weekend {
        color: color-mix(in srgb, var(--accent-color) 40%, var(--primary-color) 60%);
      }
      
      /* 当前日期信息 */
      .current-day-info {
        text-align: center;
        color: var(--secondary-text-color);
        margin-top: var(--cf-spacing-sm);
        font-size: var(--cf-font-size-xs);
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .week-card {
          min-height: 160px;
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-lg);
        }
        
        .year-section {
          max-width: 280px;
          margin: 8px 0;
        }
        
        .week-section {
          max-width: 320px;
          margin: 8px 0;
        }
        
        .progress-bars {
          height: 20px;
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .week-label {
          margin-bottom: 2px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card .card-content {
          gap: var(--cf-spacing-md);
        }
        
        .year-section {
          flex-direction: column;
          text-align: center;
          max-width: 240px;
          gap: var(--cf-spacing-sm);
          margin: 6px 0;
        }
        
        hui-gauge-card {
          margin-right: 0;
          margin-bottom: 12px;
        }
        
        .week-section {
          max-width: 280px;
          margin: 6px 0;
        }
        
        .progress-bars {
          height: 16px;
        }
        
        .current-indicator {
          top: -6px;
          font-size: 1.2em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .week-card {
          min-height: 140px;
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-sm);
        }
        
        .progress-bars {
          height: 14px;
          border-radius: var(--cf-radius-md);
        }
        
        .day-label {
          font-size: var(--cf-font-size-xs);
        }
        
        .current-day-info {
          font-size: 0.7em;
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};
