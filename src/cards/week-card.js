// src/cards/week-card.js - 完全变量化版本
export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度',
    icon: '📅',
    category: '时间',
    version: '2.3.0',
    author: 'CardForge'
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
    },
    progressSize: {
      type: 'select',
      label: '进度环尺寸',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    }
  },
  
  template: (config) => {
    const now = new Date();
    const yearProgress = calculateYearProgress(now);
    const weekNumber = getWeekNumber(now);
    const weekDay = now.getDay();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 获取当前日期
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    let template = `<div class="week-card size-${config.progressSize}">`;
    
    // 年进度
    if (config.showYearProgress) {
      const size = config.progressSize === 'small' ? 70 : config.progressSize === 'large' ? 90 : 80;
      const strokeWidth = config.progressSize === 'small' ? 3 : config.progressSize === 'large' ? 5 : 4;
      const radius = (size / 2) - strokeWidth;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference * (1 - yearProgress / 100);
      
      template += `
        <div class="year-progress-container">
          <div class="year-progress-ring">
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
          <div class="year-info">
            <div class="week-number">第 ${weekNumber} 周</div>
            <div class="current-date">${month}月${day}日</div>
          </div>
        </div>
      `;
    }
    
    // 周进度
    if (config.showWeekProgress) {
      let weekBars = '';
      for (let i = 0; i < 7; i++) {
        const isActive = i < weekDay;
        const isCurrent = i === weekDay;
        let barClass = 'future';
        if (isCurrent) barClass = 'current';
        else if (isActive) barClass = 'active';
        
        weekBars += `<div class="week-bar ${barClass}"></div>`;
      }
      
      template += `
        <div class="week-progress">
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
    
    function calculateYearProgress(date) {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = new Date(date.getFullYear() + 1, 0, 1);
      const elapsed = date - start;
      const total = end - start;
      return (elapsed / total) * 100;
    }
    
    function getWeekNumber(date) {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
      return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    }
  },
  
  styles: (config, theme) => {
    // 使用设计系统变量
    const primaryColor = theme['--cf-primary-color'] || 'var(--cf-primary-color, #03a9f4)';
    const accentColor = theme['--cf-accent-color'] || 'var(--cf-accent-color, #ff4081)';
    const borderColor = theme['--cf-border'] || 'var(--cf-border, #e0e0e0)';
    const surfaceColor = theme['--cf-surface'] || 'var(--cf-surface, #ffffff)';
    const backgroundColor = theme['--cf-background'] || 'var(--cf-background, #ffffff)';
    const textPrimary = theme['--cf-text-primary'] || 'var(--cf-text-primary, #212121)';
    const textSecondary = theme['--cf-text-secondary'] || 'var(--cf-text-secondary, #757575)';
    const textTertiary = theme['--cf-text-tertiary'] || 'var(--cf-text-tertiary, #9e9e9e)';
    
    // 动态计算颜色
    const hoverColor = theme['--cf-hover-color'] || 'rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.08)';
    const borderLight = theme['--cf-border-light'] || 'rgba(0, 0, 0, 0.12)';
    
    return `
      .week-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-xl, 20px);
        height: 100%;
        min-height: 180px;
        padding: var(--cf-spacing-xl, 20px);
        font-family: var(--cf-font-family-base, inherit);
      }
      
      .week-card.size-small .year-progress-ring svg {
        width: 70px;
        height: 70px;
      }
      
      .week-card.size-medium .year-progress-ring svg {
        width: 80px;
        height: 80px;
      }
      
      .week-card.size-large .year-progress-ring svg {
        width: 90px;
        height: 90px;
      }
      
      .year-progress-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-2xl, 24px);
        width: 100%;
        max-width: 320px;
      }
      
      .year-progress-ring {
        flex-shrink: 0;
      }
      
      .year-progress-ring svg {
        display: block;
      }
      
      .year-progress-ring svg text {
        font-family: inherit;
      }
      
      /* 进度环使用变量 */
      .progress-bg {
        stroke: ${borderColor};
        fill: none;
      }
      
      .progress-fill {
        stroke: ${primaryColor};
        fill: none;
        stroke-linecap: round;
        transition: stroke-dashoffset var(--cf-transition-slow, 0.4s) cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .progress-text {
        fill: ${textPrimary};
        font-size: var(--cf-font-size-xl, 1.25rem);
        font-weight: var(--cf-font-weight-bold, 700);
      }
      
      .progress-percent {
        font-size: var(--cf-font-size-sm, 0.875rem);
        fill: ${textSecondary};
      }
      
      .year-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 80px;
        min-width: 100px;
      }
      
      .week-number {
        font-size: var(--cf-font-size-2xl, 1.5rem);
        font-weight: var(--cf-font-weight-bold, 700);
        color: ${textPrimary};
        line-height: var(--cf-line-height-tight, 1.25);
        margin-bottom: var(--cf-spacing-xs, 4px);
        white-space: nowrap;
      }
      
      .current-date {
        font-size: var(--cf-font-size-lg, 1.125rem);
        font-weight: var(--cf-font-weight-medium, 500);
        color: ${textSecondary};
        line-height: var(--cf-line-height-tight, 1.25);
        white-space: nowrap;
      }
      
      .week-progress {
        width: 100%;
        max-width: 300px;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: var(--cf-spacing-xl, 20px);
        background: ${surfaceColor};
        border-radius: var(--cf-radius-pill, 999px);
        overflow: hidden;
        margin-bottom: var(--cf-spacing-md, 12px);
        border: 1px solid ${borderColor};
        box-shadow: var(--cf-shadow-inner, inset 0 2px 4px rgba(0, 0, 0, 0.06));
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        transition: all var(--cf-transition-normal, 0.25s) ease;
        position: relative;
        border-right: 1px solid ${borderLight};
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      .week-bar.active {
        background: ${primaryColor};
        opacity: 0.8;
      }
      
      .week-bar.current {
        background: ${accentColor};
        position: relative;
        z-index: 1;
        transform: scaleY(1.1);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb, 255, 64, 129), 0.3);
      }
      
      .week-bar.future {
        background: ${backgroundColor};
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
      }
      
      .day-label {
        font-size: var(--cf-font-size-sm, 0.875rem);
        font-weight: var(--cf-font-weight-medium, 500);
        color: ${textTertiary};
        text-align: center;
        flex: 1;
        transition: color var(--cf-transition-fast, 0.15s) ease;
      }
      
      .day-label.weekend {
        color: ${accentColor};
        font-weight: var(--cf-font-weight-semibold, 600);
      }
      
      .day-label.today {
        color: ${primaryColor};
        font-weight: var(--cf-font-weight-bold, 700);
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
        background: ${primaryColor};
        border-radius: 50%;
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .week-card {
          --week-progress-bg: rgba(255, 255, 255, 0.05);
        }
        
        .progress-bars {
          background: rgba(255, 255, 255, 0.05);
          border-color: ${borderColor};
        }
        
        .week-bar.active {
          background: ${primaryColor};
          opacity: 0.9;
        }
        
        .week-bar.current {
          box-shadow: 0 0 12px rgba(var(--cf-accent-color-rgb, 255, 64, 129), 0.4);
        }
        
        .week-bar.future {
          background: rgba(255, 255, 255, 0.03);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .week-card {
          gap: var(--cf-spacing-lg, 16px);
          padding: var(--cf-spacing-lg, 16px);
        }
        
        .year-progress-container {
          gap: var(--cf-spacing-xl, 20px);
          max-width: 280px;
        }
        
        .week-number {
          font-size: var(--cf-font-size-xl, 1.25rem);
        }
        
        .current-date {
          font-size: var(--cf-font-size-base, 1rem);
        }
        
        .progress-bars {
          height: var(--cf-spacing-lg, 16px);
        }
        
        .week-progress {
          max-width: 280px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          gap: var(--cf-spacing-md, 12px);
          padding: var(--cf-spacing-md, 12px);
        }
        
        .year-progress-container {
          gap: var(--cf-spacing-lg, 16px);
          max-width: 260px;
          flex-direction: column;
          text-align: center;
        }
        
        .year-info {
          align-items: center;
          height: auto;
          min-width: auto;
          padding: var(--cf-spacing-sm, 8px) 0;
        }
        
        .week-number {
          font-size: var(--cf-font-size-lg, 1.125rem);
          margin-bottom: var(--cf-spacing-xs, 4px);
        }
        
        .current-date {
          font-size: var(--cf-font-size-sm, 0.875rem);
        }
        
        .progress-bars {
          height: var(--cf-spacing-md, 12px);
          margin-bottom: var(--cf-spacing-sm, 8px);
        }
        
        .week-progress {
          max-width: 260px;
        }
        
        .day-label {
          font-size: var(--cf-font-size-xs, 0.75rem);
        }
      }
      
      /* 高对比度模式支持 */
      .week-card.high-contrast .week-bar.current::after {
        opacity: 0.8;
        border-width: 3px;
      }
      
      .week-card.high-contrast .week-bar.active {
        opacity: 1;
      }
      
      /* 动画效果 */
      .week-card {
        animation: fadeIn var(--cf-transition-normal, 0.25s) ease;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
  }
};