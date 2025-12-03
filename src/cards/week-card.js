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
    
    let template = '<div class="week-card">';
    
    // 年进度
    if (config.showYearProgress) {
      const dashOffset = 163.36 * (1 - yearProgress / 100);
      template += `
        <div class="year-progress">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" stroke="#e0e0e0" stroke-width="4" fill="none"/>
            <circle cx="30" cy="30" r="26" stroke="var(--cf-primary-color)" stroke-width="4" 
                    fill="none" stroke-linecap="round"
                    stroke-dasharray="163.36"
                    stroke-dashoffset="${dashOffset}"
                    transform="rotate(-90 30 30)"/>
          </svg>
          <div class="year-info">
            <div class="year-percent">${Math.round(yearProgress)}</div>
            <div class="week-number">第 ${weekNumber} 周</div>
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
        gap: 16px;
        height: 100%;
        min-height: 140px;
        padding: 16px;
      }
      
      .year-progress {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .year-info {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .year-percent {
        font-size: 1.8em;
        font-weight: 700;
        color: ${primaryColor};
        line-height: 1.2;
      }
      
      .year-percent::after {
        content: "%";
        font-size: 0.6em;
        font-weight: 400;
        margin-left: 2px;
        opacity: 0.7;
        vertical-align: super;
      }
      
      .week-number {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
      
      .week-progress {
        width: 100%;
        max-width: 240px;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: 12px;
        background: #e0e0e0;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 8px;
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
      }
      
      .week-bar.future {
        background: #f0f0f0;
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
      }
      
      .day-label {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        text-align: center;
        flex: 1;
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          gap: 12px;
          padding: 12px;
        }
        
        .year-progress {
          gap: 12px;
        }
        
        .year-percent {
          font-size: 1.6em;
        }
        
        .progress-bars {
          height: 10px;
        }
      }
    `;
  }
};

export class WeekCard {
  static card = card;
}