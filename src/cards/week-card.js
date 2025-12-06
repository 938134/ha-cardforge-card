// cards/week-card.js - 修复版
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
  
  template: (config) => {
    const now = new Date();
    const yearProgress = getYearProgress(now);
    const weekNumber = getWeekNumber(now);
    const weekDay = now.getDay();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 当前日期
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 构建HTML
    let yearSectionHtml = '';
    let weekSectionHtml = '';
    
    // 年进度区域
    if (config.showYearProgress) {
      const size = 80;
      const strokeWidth = 4;
      const radius = (size / 2) - strokeWidth;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference * (1 - yearProgress / 100);
      
      yearSectionHtml = `
        <div class="year-section layout-horizontal">
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
            <div class="week-label card-emphasis">第 ${weekNumber} 周</div>
            <div class="month-day card-subtitle">${month}月${day}日</div>
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
      
      weekSectionHtml = `
        <div class="week-section">
          <div class="progress-bars">${weekBars}</div>
          <div class="day-labels layout-horizontal">
            ${weekDays.map((day, index) => {
              const isWeekend = index === 0 || index === 6;
              const isToday = index === weekDay;
              return `<div class="day-label ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''} card-caption">${day}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    // 如果没有显示任何内容，显示空状态
    if (!config.showYearProgress && !config.showWeekProgress) {
      return `
        <div class="week-card">
          <div class="card-empty">
            <div class="card-empty-icon">📅</div>
            <div class="card-empty-text">请开启年进度或周进度显示</div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="week-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            ${yearSectionHtml}
            ${weekSectionHtml}
          </div>
        </div>
      </div>
    `;
  },
  
  styles: (config, theme) => {
    // 只保留星期卡片特有的样式
    const customStyles = `
      .week-card {
        min-height: 200px; /* 增加最小高度 */
      }
      
      .week-card .card-content {
        gap: var(--cf-spacing-xl); /* 增加内容之间的间距 */
        justify-content: center; /* 确保垂直居中 */
      }
      
      /* 年进度区域 */
      .year-section {
        width: 100%;
        max-width: 320px;
        margin: var(--cf-spacing-md) 0; /* 增加上下间距 */
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
      
      /* 日期信息 */
      .date-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 100px;
      }
      
      .week-label {
        line-height: var(--cf-line-height-tight);
        margin-bottom: var(--cf-spacing-xs);
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
        margin: var(--cf-spacing-md) 0; /* 增加上下间距 */
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
        justify-content: space-between;
      }
      
      .day-label {
        font-weight: var(--cf-font-weight-medium);
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
      
      /* 星期卡片特定的响应式 */
      @container cardforge-container (max-width: 500px) {
        .week-card {
          min-height: 180px;
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-lg);
        }
        
        .year-section {
          max-width: 280px;
          margin: var(--cf-spacing-sm) 0;
        }
        
        .week-section {
          max-width: 280px;
          margin: var(--cf-spacing-sm) 0;
        }
        
        .progress-bars {
          height: var(--cf-spacing-lg);
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          min-height: 160px;
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-md);
        }
        
        .year-section {
          max-width: 260px;
          margin: var(--cf-spacing-xs) 0;
        }
        
        .date-info {
          min-width: auto;
        }
        
        .week-section {
          max-width: 260px;
          margin: var(--cf-spacing-xs) 0;
        }
        
        .progress-bars {
          height: var(--cf-spacing-md);
          margin-bottom: var(--cf-spacing-sm);
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .year-section {
          flex-direction: column;
          text-align: center;
          max-width: 240px;
          gap: var(--cf-spacing-md);
          margin: var(--cf-spacing-sm) 0;
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
          margin: var(--cf-spacing-sm) 0;
        }
      }
    `;
    
    // 使用通用样式工具
    return createCardStyles(customStyles);
  }
};