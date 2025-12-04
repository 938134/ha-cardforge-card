// src/cards/week-card.js - 优化版：垂直对齐 + 颜色系统化
export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度',
    icon: '📅',
    category: '时间',
    version: '2.1.0',
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
    
    let template = '<div class="week-card">';
    
    // 年进度
    if (config.showYearProgress) {
      const dashOffset = 163.36 * (1 - yearProgress / 100);
      template += `
        <div class="year-progress-container">
          <div class="year-progress-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" class="progress-bg" />
              <circle cx="40" cy="40" r="34" class="progress-fill"
                      stroke-dasharray="213.63"
                      stroke-dashoffset="${dashOffset * 2.1363}"
                      transform="rotate(-90 40 40)"/>
              <text x="40" y="46" text-anchor="middle" font-size="18" font-weight="700" class="progress-text">
                ${Math.round(yearProgress)}
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
              return `<div class="day-label ${isWeekend ? 'weekend' : ''}">${day}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    template += '</div>';
    return template;
    
    // 工具函数
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
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    const accentColor = theme['--cf-accent-color'] || '#ff4081';
    const borderColor = theme['--cf-border'] || '#e0e0e0';
    const surfaceSecondary = 'rgba(var(--cf-rgb-primary, 3, 169, 244), 0.1)';
    const textPrimary = theme['--cf-text-primary'] || '#212121';
    const textSecondary = theme['--cf-text-secondary'] || '#757575';
    
    return `
      .week-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
        height: 100%;
        min-height: 180px;
        padding: 24px;
      }
      
      .year-progress-container {
        display: flex;
        align-items: center; /* 关键：垂直居中 */
        justify-content: center;
        gap: 32px;
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
      
      /* 进度环颜色系统化 */
      .progress-bg {
        stroke: ${borderColor};
        stroke-width: 4;
        fill: none;
      }
      
      .progress-fill {
        stroke: ${primaryColor};
        stroke-width: 4;
        fill: none;
        stroke-linecap: round;
      }
      
      .progress-text {
        fill: ${primaryColor};
      }
      
      /* 年信息区域 - 垂直居中 */
      .year-info {
        display: flex;
        flex-direction: column;
        justify-content: center; /* 关键：垂直居中 */
        height: 80px; /* 与进度环高度匹配 */
        min-width: 100px;
      }
      
      .week-number {
        font-size: 1.8em;
        font-weight: 700;
        color: ${textPrimary};
        line-height: 1.2;
        margin-bottom: 8px;
        white-space: nowrap;
      }
      
      .current-date {
        font-size: 1.3em;
        font-weight: 500;
        color: ${textSecondary};
        line-height: 1.2;
        white-space: nowrap;
      }
      
      .week-progress {
        width: 100%;
        max-width: 300px;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: 16px;
        background: ${surfaceSecondary};
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 12px;
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        transition: all 0.3s ease;
      }
      
      .week-bar.active {
        background: ${primaryColor};
        opacity: 0.9;
      }
      
      .week-bar.current {
        background: ${accentColor};
        position: relative;
        z-index: 1;
        box-shadow: 0 0 4px ${accentColor}; /* 增强对比度 */
      }
      
      .week-bar.current::after {
        content: '';
        position: absolute;
        top: -3px;
        left: 0;
        right: 0;
        height: 3px;
        background: ${accentColor};
        border-radius: 1.5px;
      }
      
      .week-bar.future {
        background: ${surfaceSecondary};
        border: 1px solid ${borderColor};
        box-sizing: border-box;
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
      }
      
      .day-label {
        font-size: 0.95em;
        font-weight: 500;
        color: ${textSecondary};
        text-align: center;
        flex: 1;
      }
      
      .day-label.weekend {
        color: ${accentColor};
        font-weight: 600;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .week-card {
          gap: 20px;
          padding: 20px;
        }
        
        .year-progress-container {
          gap: 24px;
          max-width: 280px;
        }
        
        .year-progress-ring svg {
          width: 70px;
          height: 70px;
        }
        
        .week-number {
          font-size: 1.6em;
        }
        
        .current-date {
          font-size: 1.2em;
        }
        
        .progress-bars {
          height: 14px;
        }
        
        .week-progress {
          max-width: 280px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          gap: 18px;
          padding: 16px;
        }
        
        .year-progress-container {
          gap: 20px;
          max-width: 260px;
          flex-direction: column; /* 移动端改为垂直布局 */
          text-align: center;
        }
        
        .year-info {
          align-items: center; /* 移动端居中对齐 */
          height: auto;
          min-width: auto;
          padding: 8px 0;
        }
        
        .year-progress-ring svg {
          width: 65px;
          height: 65px;
        }
        
        .week-number {
          font-size: 1.5em;
          margin-bottom: 6px;
        }
        
        .current-date {
          font-size: 1.1em;
        }
        
        .progress-bars {
          height: 12px;
          margin-bottom: 10px;
        }
        
        .week-progress {
          max-width: 260px;
        }
        
        .day-label {
          font-size: 0.9em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .week-card {
          gap: 16px;
          padding: 14px;
        }
        
        .year-progress-container {
          gap: 16px;
          max-width: 240px;
        }
        
        .year-progress-ring svg {
          width: 60px;
          height: 60px;
        }
        
        .week-number {
          font-size: 1.4em;
          margin-bottom: 4px;
        }
        
        .current-date {
          font-size: 1em;
        }
        
        .progress-bars {
          height: 10px;
          border-radius: 5px;
        }
        
        .week-progress {
          max-width: 240px;
        }
        
        .day-label {
          font-size: 0.85em;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .progress-bg {
          stroke: rgba(255, 255, 255, 0.2);
        }
        
        .progress-bars {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .week-bar.future {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .week-bar.active {
          opacity: 1; /* 深色模式下提高不透明度 */
        }
      }
      
      /* 高对比度主题优化 */
      .week-card.high-contrast .week-bar.current {
        box-shadow: 0 0 8px ${accentColor}, 0 0 16px rgba(255, 64, 129, 0.3);
      }
      
      .week-card.high-contrast .week-bar.active {
        background: ${primaryColor};
        opacity: 1;
      }
    `;
  }
};

export class WeekCard {
  static card = card;
}