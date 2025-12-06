// src/cards/week-card.js - 完全简化版
import { getYearProgress, getWeekNumber } from '../core/card-tools.js';
import { createCardStyles, responsiveClasses, darkModeClasses } from '../core/card-styles.js';

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
    
    let template = `<div class="week-card card-base ${darkModeClasses.base} ${responsiveClasses.container}">`;
    
    // 年进度区域
    if (config.showYearProgress) {
      const size = 80;
      const strokeWidth = 4;
      const radius = (size / 2) - strokeWidth;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference * (1 - yearProgress / 100);
      
      template += `
        <div class="year-section layout-flex">
          <div class="progress-ring">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-bg ${darkModeClasses.border}" 
                      stroke-width="${strokeWidth}" />
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-fill"
                      stroke-width="${strokeWidth}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${dashOffset}"
                      transform="rotate(-90 ${size/2} ${size/2})" />
              <text x="${size/2}" y="${size/2 + 5}" 
                    text-anchor="middle" 
                    class="progress-text text-emphasis">
                ${Math.round(yearProgress)}<tspan class="progress-percent">%</tspan>
              </text>
            </svg>
          </div>
          <div class="date-info">
            <div class="week-label text-emphasis ${responsiveClasses.title}">第 ${weekNumber} 周</div>
            <div class="month-day text-subtitle ${responsiveClasses.subtitle}">${month}月${day}日</div>
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
        let barClass = 'week-bar-future';
        if (isCurrent) barClass = 'week-bar-current';
        else if (isActive) barClass = 'week-bar-active';
        
        weekBars += `<div class="week-bar ${barClass}" data-day="${weekDays[i]}"></div>`;
      }
      
      template += `
        <div class="week-section">
          <div class="progress-bars ${darkModeClasses.progressBg} ${responsiveClasses.gapMd}">
            ${weekBars}
          </div>
          <div class="day-labels layout-flex ${responsiveClasses.gapSm}">
            ${weekDays.map((day, index) => {
              const isWeekend = index === 0 || index === 6;
              const isToday = index === weekDay;
              const dayClass = isToday ? 'day-today' : (isWeekend ? 'day-weekend' : '');
              return `<div class="day-label text-caption ${dayClass}">${day}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    template += '</div>';
    return template;
  },
  
  styles: (config, theme) => {
    const customStyles = `
      .week-card {
        min-height: 180px;
        gap: var(--cf-spacing-xl);
      }
      
      .year-section {
        gap: var(--cf-spacing-xl);
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
      
      .date-info {
        min-width: 100px;
      }
      
      .week-label {
        line-height: var(--cf-line-height-tight);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .month-day {
        line-height: var(--cf-line-height-tight);
      }
      
      .week-section {
        max-width: 300px;
      }
      
      .progress-bars {
        height: var(--cf-spacing-xl);
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
        border-right: 1px solid var(--cf-border-light);
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      .week-bar-active {
        background: var(--cf-primary-color);
        opacity: 0.8;
      }
      
      .week-bar-current {
        background: var(--cf-accent-color);
        transform: scaleY(1.1);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.3);
      }
      
      .week-bar-future {
        background: var(--cf-background);
      }
      
      .day-labels {
        justify-content: space-between;
      }
      
      .day-label {
        flex: 1;
        text-align: center;
      }
      
      .day-weekend {
        color: var(--cf-accent-color);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      .day-today {
        color: var(--cf-primary-color);
        font-weight: var(--cf-font-weight-bold);
        position: relative;
      }
      
      .day-today::after {
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
      
      /* 特定响应式 */
      @container cardforge-container (max-width: 400px) {
        .year-section {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-md);
        }
        
        .date-info {
          min-width: auto;
        }
        
        .progress-bars {
          height: var(--cf-spacing-md);
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .progress-ring svg {
          width: 60px;
          height: 60px;
        }
        
        .progress-bars {
          height: 10px;
          border-radius: var(--cf-radius-md);
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};