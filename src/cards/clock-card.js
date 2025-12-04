// 时钟卡片 - 完全变量化版本
export const card = {
  id: 'clock',
  meta: {
    name: '时钟',
    description: '显示当前时间和日期',
    icon: '⏰',
    category: '时间'
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
    },
    timeSize: {
      type: 'select',
      label: '时间字体大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    }
  },
  
  template: (config, data) => {
    const now = new Date();
    
    // 格式化时间
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = config.showSeconds ? ':' + now.getSeconds().toString().padStart(2, '0') : '';
    
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
      <div class="clock-card size-${config.timeSize}">
        <div class="clock-display">
          ${timeHtml}
          ${dateHtml}
          ${weekdayHtml}
        </div>
      </div>
    `;
  },
  
  styles: (config, theme) => {
    // 使用设计系统变量
    const primaryColor = theme['--cf-primary-color'] || 'var(--cf-primary-color, #03a9f4)';
    const textPrimary = theme['--cf-text-primary'] || 'var(--cf-text-primary, #212121)';
    const textSecondary = theme['--cf-text-secondary'] || 'var(--cf-text-secondary, #757575)';
    const textTertiary = theme['--cf-text-tertiary'] || 'var(--cf-text-tertiary, #9e9e9e)';
    
    // 根据尺寸计算字体大小
    let timeFontSize = '3.5em';
    let dateFontSize = '1.1em';
    
    if (config.timeSize === 'small') {
      timeFontSize = '3em';
      dateFontSize = '1em';
    } else if (config.timeSize === 'large') {
      timeFontSize = '4em';
      dateFontSize = '1.2em';
    }
    
    return `
      .clock-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 140px;
        font-family: var(--cf-font-family-base, inherit);
      }
      
      .clock-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm, 8px);
        text-align: center;
        padding: var(--cf-spacing-lg, 16px);
        width: 100%;
      }
      
      .clock-time {
        font-size: ${timeFontSize};
        font-weight: var(--cf-font-weight-bold, 700);
        color: ${primaryColor};
        line-height: var(--cf-line-height-tight, 1.25);
        letter-spacing: 1px;
        margin-bottom: var(--cf-spacing-xs, 4px);
        text-shadow: 0 2px 4px rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.2);
      }
      
      .clock-ampm {
        font-size: 0.4em;
        font-weight: var(--cf-font-weight-semibold, 600);
        margin-left: var(--cf-spacing-xs, 4px);
        opacity: 0.8;
        vertical-align: super;
      }
      
      .clock-date, .clock-weekday {
        font-size: ${dateFontSize};
        color: ${textSecondary};
        line-height: var(--cf-line-height-normal, 1.5);
        font-weight: var(--cf-font-weight-medium, 500);
        letter-spacing: 0.5px;
      }
      
      .clock-weekday {
        color: ${textTertiary};
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .clock-time {
          text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.4);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .clock-card.size-medium .clock-time {
          font-size: 2.8em;
        }
        
        .clock-card.size-large .clock-time {
          font-size: 3.2em;
        }
        
        .clock-card.size-small .clock-time {
          font-size: 2.4em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .clock-display {
          padding: var(--cf-spacing-md, 12px);
        }
        
        .clock-card.size-medium .clock-time {
          font-size: 2.4em;
        }
        
        .clock-card.size-large .clock-time {
          font-size: 2.8em;
        }
        
        .clock-card.size-small .clock-time {
          font-size: 2em;
        }
        
        .clock-date, .clock-weekday {
          font-size: 0.95em;
        }
      }
      
      /* 动画效果 */
      .clock-card {
        animation: slideIn var(--cf-transition-normal, 0.25s) ease;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
  }
};