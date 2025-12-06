// src/cards/clock-card.js - 完全简化版
import { formatTime, formatDate, getWeekday } from '../core/card-tools.js';
import { createCardStyles, responsiveClasses, darkModeClasses } from '../core/card-styles.js';

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
    }
  },
  
  template: (config, data) => {
    const now = new Date();
    
    // 使用工具库函数
    let timeHtml = '';
    if (config.showSeconds) {
      const baseTime = formatTime(now, config.use24Hour);
      const seconds = now.getSeconds().toString().padStart(2, '0');
      timeHtml = `<div class="clock-time text-emphasis ${darkModeClasses.emphasis}">${baseTime}:${seconds}</div>`;
    } else {
      timeHtml = `<div class="clock-time text-emphasis ${darkModeClasses.emphasis}">${formatTime(now, config.use24Hour)}</div>`;
    }
    
    const dateHtml = config.showDate ? 
      `<div class="clock-date text-subtitle ${responsiveClasses.subtitle}">${formatDate(now)}</div>` : '';
    
    const weekdayHtml = config.showWeekday ? 
      `<div class="clock-weekday text-caption ${responsiveClasses.caption}">${getWeekday(now)}</div>` : '';
    
    return `
      <div class="clock-card card-base ${darkModeClasses.base} ${responsiveClasses.container} ${responsiveClasses.minHeight}">
        <div class="card-content layout-center">
          ${timeHtml}
          ${dateHtml}
          ${weekdayHtml}
        </div>
      </div>
    `;
  },
  
  styles: (config) => {
    const customStyles = `
      .clock-card {
        min-height: 160px;
      }
      
      .clock-time {
        font-size: var(--cf-font-size-4xl);
        margin-bottom: var(--cf-spacing-xs);
        letter-spacing: 1px;
      }
      
      .clock-date, .clock-weekday {
        margin-top: var(--cf-spacing-xs);
      }
    `;
    
    return createCardStyles(customStyles);
  }
};