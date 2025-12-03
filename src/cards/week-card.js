// src/cards/week-card.js
export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度',
    icon: '📅',
    category: '时间',
    version: '2.0.0',
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
        <div class="year-progress">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r="30" stroke="#e0e0e0" stroke-width="4" fill="none"/>
            <circle cx="35" cy="35" r="30" stroke="var(--cf-primary-color)" stroke-width="4" 
                    fill="none" stroke-linecap="round"
                    stroke-dasharray="188.5"
                    stroke-dashoffset="${dashOffset * 1.885}"
                    transform="rotate(-90 35 35)"/>
            <text x="35" y="40" text-anchor="middle" font-size="16" font-weight="600" fill="var(--cf-primary-color)">
              ${Math.round(yearProgress)}
            </text>
          </svg>
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
            ${weekDays.map(day => `<div class="day-label">${day}</div>`).join('')}
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
    
    return `
      .week-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        height: 100%;
        min-height: 160px;
        padding: 20px;
      }
      
      .year-progress {
        display: flex;
        align-items: center;
        gap: 20px;
        width: 100%;
        max-width: 280px;
      }
      
      .year-progress svg {
        flex-shrink: 0;
      }
      
      .year-progress svg text {
        font-family: inherit;
      }
      
      .year-info {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      
      .week-number {
        font-size: 1.6em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.3;
        margin-bottom: 6px;
      }
      
      .current-date {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        line-height: 1.3;
      }
      
      .week-progress {
        width: 100%;
        max-width: 280px;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: 14px;
        background: #e0e0e0;
        border-radius: 7px;
        overflow: hidden;
        margin-bottom: 10px;
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
      }
      
      .week-bar.active {
        background: ${primaryColor};
      }
      
      .week-bar.current {
        background: ${accentColor};
        position: relative;
      }
      
      .week-bar.current::after {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: ${accentColor};
      }
      
      .week-bar.future {
        background: #f0f0f0;
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
      }
      
      .day-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        text-align: center;
        flex: 1;
      }
      
      .day-label:first-child,
      .day-label:last-child {
        color: ${accentColor};
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .week-card {
          gap: 16px;
          padding: 16px;
        }
        
        .year-progress {
          gap: 16px;
        }
        
        .week-number {
          font-size: 1.4em;
        }
        
        .current-date {
          font-size: 1.1em;
        }
        
        .progress-bars {
          height: 12px;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .week-card {
          gap: 14px;
          padding: 12px;
        }
        
        .year-progress {
          flex-direction: column;
          gap: 12px;
          align-items: center;
          text-align: center;
        }
        
        .week-number {
          font-size: 1.3em;
        }
        
        .current-date {
          font-size: 1em;
        }
        
        .progress-bars {
          height: 10px;
        }
        
        .day-label {
          font-size: 0.85em;
        }
      }
    `;
  }
};

export class WeekCard {
  static card = card;
}