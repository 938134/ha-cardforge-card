// src/cards/week-card.js - 精简优化版
import { getYearProgress, getWeekNumber} from '../core/utilities.js';

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
    // 移除了progressSize配置项
  },
  
  template: (config) => {
    const now = new Date();
    const yearProgress = getYearProgress(now);
    const weekNumber = getWeekNumber(now);
    const weekDay = now.getDay();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 当前日期
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    let template = `<div class="week-card">`;
    
    // 年进度区域
    if (config.showYearProgress) {
      // 固定尺寸，使用系统变量控制
      const size = 80; // 固定中等尺寸
      const strokeWidth = 4;
      const radius = (size / 2) - strokeWidth;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference * (1 - yearProgress / 100);
      
      template += `
        <div class="year-section">
          <div class="progress-ring">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-bg" 
                      stroke-width="${strokeWidth}" />
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-fill"
                      stroke-width="${strokeWidth}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${dashOffset}"
                      transform="rotate(-90 ${size/2} ${size/2})" />
              <text x="${size/2}" y="${size/2 + 5}" 
                    text-anchor="middle" 
                    class="progress-text">
                ${Math.round(yearProgress)}<tspan class="progress-percent">%</tspan>
              </text>
            </svg>
          </div>
          <div class="date-info">
            <div class="week-label">第 ${weekNumber} 周</div>
            <div class="month-day">${month}月${day}日</div>
          </div>
        </div>
      `;
    }
    
    // 周进度条
    if (config.showWeekProgress) {
      let weekBars = '';
      for (let i = 0; i < 7; i++) {
        const isActive = i < weekDay;
        const isCurrent = i === weekDay;
        let barClass = 'future';
        if (isCurrent) barClass = 'current';
        else if (isActive) barClass = 'active';
        
        weekBars += `<div class="week-bar ${barClass}" data-day="${weekDays[i]}"></div>`;
      }
      
      template += `
        <div class="week-section">
          <div class="progress-bars">${weekBars}</div>
          <div class="day-labels">
            ${weekDays.map((day, index) => {
              const isWeekend = index === 0 || index === 6;
              const isToday = index === weekDay;
              return `<div class="day-label ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}">${day}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    template += '</div>';
    return template;
  },
  
  styles: (config, theme) => {
    // 直接使用系统变量，无需中间变量赋值
    return `
      .week-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-xl);
        height: 100%;
        min-height: 180px;
        padding: var(--cf-spacing-xl);
        font-family: var(--cf-font-family-base);
      }
      
      /* 年进度区域 - 紧凑单行布局 */
      .year-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-xl);
        width: 100%;
        max-width: 320px;
      }
      
      .progress-ring svg {
        display: block;
      }
      
      .progress-bg {
        stroke: var(--cf-border);
        fill: none;
      }
      
      .progress-fill {
        stroke: var(--cf-primary-color);
        fill: none;
        stroke-linecap: round;
        transition: stroke-dashoffset var(--cf-transition-duration-slow);
      }
      
      .progress-text {
        fill: var(--cf-text-primary);
        font-size: var(--cf-font-size-xl);
        font-weight: var(--cf-font-weight-bold);
      }
      
      .progress-percent {
        font-size: var(--cf-font-size-sm);
        fill: var(--cf-text-secondary);
      }
      
      /* 日期信息 - 与进度环并排 */
      .date-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 100px;
      }
      
      .week-label {
        font-size: var(--cf-font-size-2xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        line-height: var(--cf-line-height-tight);
        margin-bottom: var(--cf-spacing-xs);
        white-space: nowrap;
      }
      
      .month-day {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-secondary);
        line-height: var(--cf-line-height-tight);
        white-space: nowrap;
      }
      
      /* 周进度区域 */
      .week-section {
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
        margin-bottom: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-inner);
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        transition: all var(--cf-transition-duration-normal);
        position: relative;
        border-right: 1px solid var(--cf-border-light);
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      .week-bar.active {
        background: var(--cf-primary-color);
        opacity: 0.8;
      }
      
      .week-bar.current {
        background: var(--cf-accent-color);
        position: relative;
        z-index: 1;
        transform: scaleY(1.1);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.3);
      }
      
      .week-bar.future {
        background: var(--cf-background);
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
      }
      
      .day-label {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-tertiary);
        text-align: center;
        flex: 1;
        transition: color var(--cf-transition-duration-fast);
      }
      
      .day-label.weekend {
        color: var(--cf-accent-color);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      .day-label.today {
        color: var(--cf-primary-color);
        font-weight: var(--cf-font-weight-bold);
        position: relative;
      }
      
      .day-label.today::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background: var(--cf-primary-color);
        border-radius: 50%;
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .progress-bars {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .week-bar.active {
          opacity: 0.9;
        }
        
        .week-bar.current {
          box-shadow: 0 0 12px rgba(var(--cf-accent-color-rgb), 0.4);
        }
        
        .week-bar.future {
          background: rgba(255, 255, 255, 0.03);
        }
        
        .progress-bg {
          stroke: rgba(255, 255, 255, 0.2);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .week-card {
          gap: var(--cf-spacing-lg);
          padding: var(--cf-spacing-lg);
        }
        
        .year-section {
          gap: var(--cf-spacing-xl);
          max-width: 280px;
        }
        
        .week-label {
          font-size: var(--cf-font-size-xl);
        }
        
        .month-day {
          font-size: var(--cf-font-size-base);
        }
        
        .progress-bars {
          height: var(--cf-spacing-lg);
        }
        
        .week-section {
          max-width: 280px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          gap: var(--cf-spacing-md);
          padding: var(--cf-spacing-md);
        }
        
        .year-section {
          gap: var(--cf-spacing-lg);
          max-width: 260px;
        }
        
        .date-info {
          min-width: auto;
        }
        
        .week-label {
          font-size: var(--cf-font-size-lg);
        }
        
        .month-day {
          font-size: var(--cf-font-size-sm);
        }
        
        .progress-bars {
          height: var(--cf-spacing-md);
          margin-bottom: var(--cf-spacing-sm);
        }
        
        .week-section {
          max-width: 260px;
        }
        
        .day-label {
          font-size: var(--cf-font-size-xs);
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .year-section {
          flex-direction: column;
          gap: var(--cf-spacing-md);
          text-align: center;
          max-width: 240px;
        }
        
        .progress-ring svg {
          width: 60px;
          height: 60px;
        }
        
        .progress-bars {
          height: 10px;
          border-radius: var(--cf-radius-md);
        }
        
        .week-section {
          max-width: 240px;
        }
      }
    `;
  }
};
