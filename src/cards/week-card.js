// cards/week-card.js - 优化间距版
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
    const currentDay = now.getDay(); // 0=周日, 1=周一...
    
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
              <!-- 渐变定义 -->
              <defs>
                <linearGradient id="year-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="var(--cf-primary-color)" />
                  <stop offset="100%" stop-color="var(--cf-accent-color)" />
                </linearGradient>
              </defs>
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-bg" 
                      stroke-width="${strokeWidth}" />
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-fill"
                      stroke-width="${strokeWidth}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${dashOffset}"
                      stroke="url(#year-gradient)"
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
      let weekLabels = '';
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      
      for (let i = 0; i < 7; i++) {
        const isPast = i < currentDay;
        const isCurrent = i === currentDay;
        
        // 确定颜色（只按时间状态，周末不特殊处理）
        let colorClass = '';
        if (isCurrent) {
          // 当前日
          colorClass = 'current';
        } else if (isPast) {
          // 已过去的日子
          colorClass = 'past';
        } else {
          // 未来的日子
          colorClass = 'future';
        }
        
        weekBars += `<div class="week-bar ${colorClass}" data-day="${weekDays[i]}"></div>`;
        weekLabels += `<div class="day-label ${colorClass}">${weekDays[i]}</div>`;
      }
      
      weekSectionHtml = `
        <div class="week-section">
          <div class="progress-bars">${weekBars}</div>
          <div class="day-labels layout-horizontal">${weekLabels}</div>
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
    const customStyles = `
      .week-card {
        min-height: 180px; /* 稍微降低最小高度 */
      }
      
      .week-card .card-content {
        gap: var(--cf-spacing-lg); /* 减小间距：xl → lg */
        justify-content: center;
      }
      
      /* 年进度区域 */
      .year-section {
        width: 100%;
        max-width: 320px;
        margin: var(--cf-spacing-sm) 0; /* 减小上下间距：md → sm */
      }
      
      .progress-bg {
        stroke: var(--cf-neutral-200);
        fill: none;
      }
      
      .progress-fill {
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
        margin-bottom: 2px; /* 减小间距 */
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
        margin: var(--cf-spacing-sm) 0; /* 减小上下间距：md → sm */
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: var(--cf-spacing-lg); /* 减小高度：xl → lg */
        background: var(--cf-surface);
        border-radius: var(--cf-radius-pill);
        overflow: hidden;
        margin-bottom: var(--cf-spacing-sm); /* 减小间距：md → sm */
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
      
      /* 已过去的日子 - 中性色 */
      .week-bar.past {
        background: var(--cf-neutral-200);
      }
      
      /* 当前日 - 强调色 */
      .week-bar.current {
        background: var(--cf-accent-color);
        transform: scaleY(1.1);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.3);
        z-index: 1;
        position: relative;
      }
      
      /* 未来的日子 - 主色 */
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
      
      /* 标签颜色与进度条对应 */
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
      
      /* 响应式设计 - 进一步减小间距 */
      @container cardforge-container (max-width: 500px) {
        .week-card {
          min-height: 160px; /* 减小高度 */
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-md); /* lg → md */
        }
        
        .year-section {
          max-width: 280px;
          margin: 8px 0; /* 具体数值 */
        }
        
        .week-section {
          max-width: 280px;
          margin: 8px 0; /* 具体数值 */
        }
        
        .progress-bars {
          height: var(--cf-spacing-md); /* lg → md */
          margin-bottom: var(--cf-spacing-xs); /* sm → xs */
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          min-height: 150px; /* 继续减小高度 */
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-sm); /* md → sm */
        }
        
        .year-section {
          max-width: 260px;
          margin: 6px 0; /* 继续减小 */
        }
        
        .date-info {
          min-width: auto;
        }
        
        .week-section {
          max-width: 260px;
          margin: 6px 0; /* 继续减小 */
        }
        
        .progress-bars {
          height: 12px; /* 具体数值 */
          margin-bottom: 6px; /* 具体数值 */
        }
        
        .week-label {
          margin-bottom: 1px; /* 继续减小 */
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .year-section {
          flex-direction: column;
          text-align: center;
          max-width: 240px;
          gap: var(--cf-spacing-sm); /* md → sm */
          margin: 6px 0; /* 继续减小 */
        }
        
        .progress-ring svg {
          width: 60px;
          height: 60px;
        }
        
        .progress-bars {
          height: 10px;
          border-radius: var(--cf-radius-md);
          margin-bottom: 4px; /* 继续减小 */
        }
        
        .week-section {
          max-width: 240px;
          margin: 6px 0; /* 继续减小 */
        }
      }
      
      /* 超小屏幕 */
      @container cardforge-container (max-width: 280px) {
        .week-card {
          min-height: 140px;
        }
        
        .week-card .card-content {
          gap: 8px; /* 更小间距 */
        }
        
        .year-section {
          margin: 4px 0;
        }
        
        .week-section {
          margin: 4px 0;
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};