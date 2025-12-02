// src/cards/clock.js

export const card = {
  id: 'clock',
  meta: {
    name: '时钟',
    description: '显示当前时间和日期',
    icon: '⏰',
    category: '时间',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  schema: {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    showDate: {
      type: 'boolean',
      label: '显示日期',
      default: true
    },
    showWeekday: {
      type: 'boolean',
      label: '显示星期',
      default: true
    },
    showSeconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    }
  },
  
  template: (config, data, context) => {
    const now = new Date();
    
    // 格式化时间
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = '';
    
    if (config.showSeconds) {
      seconds = ':' + now.getSeconds().toString().padStart(2, '0');
    }
    
    let timeHtml = '';
    if (config.use24Hour) {
      timeHtml = `<div class="clock-time">${hours.toString().padStart(2, '0')}:${minutes}${seconds}</div>`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      timeHtml = `<div class="clock-time">${hours}:${minutes}${seconds} <span class="clock-ampm">${ampm}</span></div>`;
    }
    
    // 格式化日期
    let dateHtml = '';
    if (config.showDate) {
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      dateHtml = `<div class="clock-date">${year}年${month}月${day}日</div>`;
    }
    
    // 格式化星期
    let weekdayHtml = '';
    if (config.showWeekday) {
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[now.getDay()];
      weekdayHtml = `<div class="clock-weekday">${weekday}</div>`;
    }
    
    return `
      <div class="clock-card">
        <div class="clock-display">
          ${timeHtml}
          ${dateHtml}
          ${weekdayHtml}
        </div>
      </div>
    `;
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    
    return `
      .clock-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 120px;
      }
      
      .clock-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-align: center;
      }
      
      .clock-time {
        font-size: 2.2em;
        font-weight: 300;
        color: ${primaryColor};
        line-height: 1.2;
      }
      
      .clock-ampm {
        font-size: 0.5em;
        font-weight: 400;
        margin-left: 4px;
        opacity: 0.8;
      }
      
      .clock-date, .clock-weekday {
        font-size: 1em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
      }
      
      @container cardforge-container (max-width: 400px) {
        .clock-time {
          font-size: 1.8em;
        }
        
        .clock-date, .clock-weekday {
          font-size: 0.9em;
        }
      }
    `;
  },
  
  layout: {
    type: 'single',
    recommendedSize: 2
  }
};

// 可选：导出类供编辑器使用
export class ClockCard {
  static card = card;
}