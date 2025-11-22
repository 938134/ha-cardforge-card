// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    const now = new Date();
    
    let timeText = this._formatTime(now, safeConfig.use_24_hour, safeConfig.show_seconds);
    let dateText = safeConfig.show_date ? this._formatDate(now) : '';
    let weekText = safeConfig.show_week ? this._formatWeek(now) : '';
    let lunarText = safeConfig.show_lunar ? this._formatLunar(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(safeConfig, entities)}
      
      <div class="clock-content">
        <div class="clock-time-wrapper">
          <div class="clock-time">${timeText}</div>
          ${safeConfig.show_seconds ? '<div class="clock-seconds-dot"></div>' : ''}
        </div>
        
        ${dateText ? `<div class="clock-date">${dateText}</div>` : ''}
        
        <div class="clock-info-row">
          ${weekText ? `<div class="clock-week">${weekText}</div>` : ''}
          ${lunarText ? `<div class="clock-lunar">${lunarText}</div>` : ''}
        </div>
      </div>
      
      ${this._renderCardFooter(safeConfig, entities)}
    `, 'clock-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .clock-content {
        padding: var(--cf-spacing-lg) var(--cf-spacing-xl);
        text-align: center;
      }
      
      .clock-time-wrapper {
        position: relative;
        display: inline-block;
        margin-bottom: var(--cf-spacing-md);
      }
      
      .clock-time {
        font-family: 'Courier New', 'SF Mono', Monaco, Inconsolata, monospace;
        font-weight: 700;
        font-size: 3.5em;
        letter-spacing: 3px;
        line-height: 1.1;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 2px 10px rgba(var(--cf-rgb-primary), 0.15);
        margin: 0;
      }
      
      .clock-seconds-dot {
        position: absolute;
        top: 15px;
        right: -8px;
        width: 6px;
        height: 6px;
        background: var(--cf-accent-color);
        border-radius: 50%;
        animation: pulse 1s infinite;
      }
      
      .clock-date {
        font-size: 1.3em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.95;
        letter-spacing: 1px;
      }
      
      .clock-info-row {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-lg);
      }
      
      .clock-week, .clock-lunar {
        padding: var(--cf-spacing-sm) var(--cf-spacing-lg);
        background: rgba(var(--cf-rgb-primary), 0.08);
        border-radius: var(--cf-radius-lg);
        font-size: 0.95em;
        font-weight: 500;
        min-width: 100px;
        border: 1px solid rgba(var(--cf-rgb-primary), 0.1);
        backdrop-filter: blur(10px);
      }
      
      .clock-week {
        color: var(--cf-primary-color);
      }
      
      .clock-lunar {
        color: var(--cf-accent-color);
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
      
      /* 紧凑布局变体 */
      .clock-card.compact .clock-content {
        padding: var(--cf-spacing-md);
      }
      
      .clock-card.compact .clock-time {
        font-size: 2.8em;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .clock-card.compact .clock-date {
        font-size: 1.1em;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .clock-card.compact .clock-info-row {
        margin-top: var(--cf-spacing-md);
      }
      
      .clock-card.compact .clock-week,
      .clock-card.compact .clock-lunar {
        padding: var(--cf-spacing-xs) var(--cf-spacing-md);
        min-width: 80px;
        font-size: 0.9em;
      }
      
      /* 极简布局变体 */
      .clock-card.minimal .clock-content {
        padding: var(--cf-spacing-lg);
      }
      
      .clock-card.minimal .clock-time {
        font-size: 3em;
        margin-bottom: var(--cf-spacing-sm);
        background: var(--cf-text-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .clock-card.minimal .clock-date {
        font-size: 1.1em;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .clock-card.minimal .clock-info-row {
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        margin-top: var(--cf-spacing-md);
      }
      
      .clock-card.minimal .clock-week,
      .clock-card.minimal .clock-lunar {
        background: transparent;
        border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
        min-width: auto;
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
      }
      
      @container cardforge-container (max-width: 400px) {
        .clock-content {
          padding: var(--cf-spacing-md);
        }
        
        .clock-time {
          font-size: 2.5em;
          letter-spacing: 2px;
        }
        
        .clock-info-row {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }
        
        .clock-week, .clock-lunar {
          min-width: auto;
        }
        
        .clock-seconds-dot {
          top: 10px;
          right: -6px;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .clock-time {
          font-size: 2em;
          letter-spacing: 1px;
        }
        
        .clock-date {
          font-size: 1em;
        }
      }
    `;
  }

  getTemplateWithConfig(config) {
    // 添加布局变体类
    const layoutClass = config.layout || 'default';
    const originalTemplate = this.getTemplate(config, {}, {});
    
    // 在容器div上添加布局类
    return originalTemplate.replace(
      'clock-card"', 
      `clock-card ${layoutClass}"`
    );
  }

  _formatTime(date, use24Hour, showSeconds) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = showSeconds ? '<span class="clock-seconds">' + date.getSeconds().toString().padStart(2, '0') + '</span>' : '';
    
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes}${seconds}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes}${seconds} <span class="clock-ampm">${ampm}</span>`;
    }
  }

  _formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  _formatWeek(date) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[date.getDay()];
  }

  _formatLunar(date) {
    const lunarData = this._getLunarData(date);
    return `${lunarData.month}${lunarData.day}`;
  }

  _getLunarData(date) {
    const lunarMonths = [
      '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '冬月', '腊月'
    ];
    
    const lunarDays = [
      '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    
    const baseDate = new Date(date.getFullYear(), 0, 1);
    const diffDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
    
    const lunarMonthIndex = (diffDays % 12);
    const lunarDayIndex = (diffDays % 30);
    
    return {
      month: lunarMonths[lunarMonthIndex],
      day: lunarDays[lunarDayIndex]
    };
  }
}

ClockCard.manifest = {
  id: 'clock-card',
  name: '时钟卡片',
  description: '显示时间、日期、星期和农历信息',
  icon: '⏰',
  category: '时间',
  version: '1.1.0',
  author: 'CardForge',
  config_schema: {
    show_date: {
      type: 'boolean',
      label: '显示日期',
      default: true
    },
    show_week: {
      type: 'boolean',
      label: '显示星期',
      default: true
    },
    show_lunar: {
      type: 'boolean',
      label: '显示农历',
      default: true
    },
    use_24_hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    show_seconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    },
    layout: {
      type: 'select',
      label: '布局样式',
      default: 'default',
      options: [
        { value: 'default', label: '默认' },
        { value: 'compact', label: '紧凑' },
        { value: 'minimal', label: '极简' }
      ]
    }
  }
};

export { ClockCard as default, ClockCard };
export const manifest = ClockCard.manifest;