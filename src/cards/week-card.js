// src/cards/week-card.js - 修正版
import { 
  getYearProgress, 
  getWeekNumber, 
  formatDate, 
  getWeekday 
} from '../core/utils.js';

export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度',
    icon: '📅',
    category: '时间',
    version: '3.0.0'
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
  
  template: (config) => {
    const now = new Date();
    const yearProgress = getYearProgress(now);
    const weekNumber = getWeekNumber(now);
    const weekDay = now.getDay();
    
    // 当前日期和星期
    const currentDate = formatDate(now, 'zh-CN-short'); // "12月25日"
    const currentWeekday = getWeekday(now, 'single'); // "一"
    
    let template = `<div class="week-card">`;
    
    // 顶部区域：年进度环 + 第X周 + 日期（同一行）
    if (config.showYearProgress) {
      const progressValue = Math.round(yearProgress);
      const circumference = 2 * Math.PI * 26; // 半径26px
      const dashOffset = circumference * (1 - yearProgress / 100);
      
      template += `
        <div class="week-header">
          <!-- 年进度环 -->
          <div class="year-progress">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" class="progress-bg"/>
              <circle cx="30" cy="30" r="26" class="progress-fill"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${dashOffset}"
                      transform="rotate(-90 30 30)"/>
              <text x="30" y="35" class="progress-text">
                ${progressValue}<tspan class="percent">%</tspan>
              </text>
            </svg>
          </div>
          
          <!-- 第X周和日期信息 -->
          <div class="week-info">
            <div class="week-number-row">
              <span class="week-label">第</span>
              <span class="week-value">${weekNumber}</span>
              <span class="week-label">周</span>
            </div>
            <div class="date-row">
              <span class="current-date">${currentDate}</span>
              <span class="current-weekday">星期${currentWeekday}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // 周进度条部分
    if (config.showWeekProgress) {
      let weekBars = '';
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      
      for (let i = 0; i < 7; i++) {
        const isActive = i < weekDay;
        const isCurrent = i === weekDay;
        const isWeekend = i === 0 || i === 6;
        
        let barClass = 'week-bar';
        if (isCurrent) barClass += ' current';
        else if (isActive) barClass += ' active';
        if (isWeekend) barClass += ' weekend';
        
        weekBars += `<div class="${barClass}"></div>`;
      }
      
      template += `
        <div class="week-progress">
          <div class="progress-bars">${weekBars}</div>
          <div class="day-labels">
            ${weekDays.map((day, index) => {
              const isToday = index === weekDay;
              const isWeekend = index === 0 || index === 6;
              let labelClass = 'day-label';
              if (isToday) labelClass += ' today';
              if (isWeekend) labelClass += ' weekend';
              return `<div class="${labelClass}">${day}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    template += '</div>';
    return template;
  },
  
  styles: (config, theme) => {
    // 直接使用设计系统变量
    return `
      /* 基础卡片布局 - 使用设计系统变量 */
      .week-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-lg);
        padding: var(--cf-spacing-xl);
        width: 100%;
        height: 100%;
        min-height: 180px;
        font-family: var(--cf-font-family-base);
      }
      
      /* 顶部区域：年进度环 + 第X周 + 日期（同一行） */
      .week-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        width: 100%;
        max-width: 320px;
        margin-bottom: var(--cf-spacing-md);
      }
      
      .year-progress {
        flex-shrink: 0;
      }
      
      .year-progress svg {
        display: block;
      }
      
      /* 进度环样式 - 直接使用设计系统变量 */
      .progress-bg {
        stroke: var(--cf-border);
        fill: none;
        stroke-width: 4;
      }
      
      .progress-fill {
        stroke: var(--cf-primary-color);
        fill: none;
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset var(--cf-transition-duration-slow) var(--cf-easing-decelerate);
      }
      
      .progress-text {
        fill: var(--cf-text-primary);
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        text-anchor: middle;
        font-family: inherit;
      }
      
      .percent {
        font-size: var(--cf-font-size-sm);
        fill: var(--cf-text-secondary);
      }
      
      /* 周信息部分 */
      .week-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .week-number-row {
        display: flex;
        align-items: baseline;
        gap: var(--cf-spacing-xs);
      }
      
      .week-value {
        font-size: var(--cf-font-size-2xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        line-height: 1;
      }
      
      .week-label {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
      }
      
      .date-row {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        flex-wrap: wrap;
      }
      
      .current-date {
        font-size: var(--cf-font-size-base);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-primary);
      }
      
      .current-weekday {
        font-size: var(--cf-font-size-base);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-accent-color);
      }
      
      /* 周进度条部分 */
      .week-progress {
        width: 100%;
        max-width: 300px;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: var(--cf-spacing-xl);
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
        transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
        border-right: 1px solid rgba(var(--cf-primary-color-rgb), 0.1);
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      .week-bar.active {
        background: rgba(var(--cf-primary-color-rgb), 0.3);
      }
      
      .week-bar.current {
        background: var(--cf-accent-color);
        position: relative;
        z-index: 1;
        transform: scaleY(1.1);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.3);
      }
      
      .week-bar.future {
        background: rgba(var(--cf-primary-color-rgb), 0.05);
      }
      
      .week-bar.weekend {
        /* 周末特殊样式 */
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      
      .day-label {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-tertiary);
        text-align: center;
        flex: 1;
        position: relative;
      }
      
      .day-label.today {
        color: var(--cf-primary-color);
        font-weight: var(--cf-font-weight-bold);
      }
      
      .day-label.today::after {
        content: '•';
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--cf-primary-color);
      }
      
      .day-label.weekend {
        color: var(--cf-accent-color);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .progress-bars {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .week-bar.active {
          background: rgba(var(--cf-primary-color-rgb), 0.4);
        }
        
        .week-bar.future {
          background: rgba(255, 255, 255, 0.03);
        }
        
        .week-bar.current {
          box-shadow: 0 0 12px rgba(var(--cf-accent-color-rgb), 0.4);
        }
      }
      
      /* 响应式设计 - 使用设计系统断点变量 */
      @container cardforge-container (max-width: 600px) {
        .week-card {
          padding: var(--cf-spacing-lg);
          gap: var(--cf-spacing-md);
        }
        
        .week-header {
          max-width: 280px;
          gap: var(--cf-spacing-md);
        }
        
        .year-progress svg {
          width: 50px;
          height: 50px;
        }
        
        .week-value {
          font-size: var(--cf-font-size-xl);
        }
        
        .week-progress {
          max-width: 260px;
        }
        
        .progress-bars {
          height: var(--cf-spacing-lg);
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .week-card {
          padding: var(--cf-spacing-md);
        }
        
        .week-header {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
        }
        
        .week-info {
          align-items: center;
        }
        
        .date-row {
          justify-content: center;
        }
        
        .day-label {
          font-size: var(--cf-font-size-xs);
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .week-card {
          min-height: 160px;
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }
        
        .year-progress svg {
          width: 45px;
          height: 45px;
        }
        
        .week-value {
          font-size: var(--cf-font-size-lg);
        }
        
        .current-date,
        .current-weekday {
          font-size: var(--cf-font-size-sm);
        }
        
        .progress-bars {
          height: var(--cf-spacing-md);
          margin-bottom: var(--cf-spacing-xs);
        }
      }
      
      /* 高对比度模式支持 */
      .high-contrast .week-bar.current {
        border: 2px solid var(--cf-accent-color);
      }
      
      .high-contrast .day-label.today {
        text-decoration: underline;
      }
    `;
  }
};
