// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  getTemplate(config, hass, entities) {
    const now = new Date();
    const use24Hour = config.use_24_hour !== false; // 默认true(24小时制)
    
    let timeText = this._formatTime(now, use24Hour, config.show_seconds);
    let dateText = config.show_date ? this._formatDate(now) : '';
    let weekText = config.show_week ? this._formatWeek(now) : '';
    let lunarText = config.show_lunar ? this._formatLunar(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <div class="cardforge-text-large clock-time">${timeText}</div>
        
        ${dateText ? `<div class="cardforge-text-medium clock-date">${dateText}</div>` : ''}
        
        <div class="cf-flex cf-gap-md cf-text-center">
          ${weekText ? `<div class="cardforge-text-small clock-week">${weekText}</div>` : ''}
          ${lunarText ? `<div class="cardforge-text-small clock-lunar">${lunarText}</div>` : ''}
        </div>
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'clock-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .clock-time {
        font-family: 'Courier New', monospace;
        font-weight: 300;
        letter-spacing: 2px;
      }
      
      .clock-date {
        font-weight: 500;
        opacity: 0.9;
      }
      
      .clock-week, .clock-lunar {
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-radius: var(--cf-radius-md);
        min-width: 80px;
      }
      
      .clock-week {
        color: var(--cf-primary-color);
      }
      
      .clock-lunar {
        color: var(--cf-accent-color);
      }
      
      @container cardforge-container (max-width: 400px) {
        .clock-time {
          font-size: 2em;
          letter-spacing: 1px;
        }
        
        .cf-flex.cf-gap-md {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }
        
        .clock-week, .clock-lunar {
          min-width: auto;
        }
      }
    `;
  }

  _formatTime(date, use24Hour, showSeconds) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = showSeconds ? ':' + date.getSeconds().toString().padStart(2, '0') : '';
    
    if (use24Hour) {
      // 24小时制
      return `${hours.toString().padStart(2, '0')}:${minutes}${seconds}`;
    } else {
      // 12小时制
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes}${seconds} ${ampm}`;
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
    // 简化版农历计算
    const lunarData = this._getLunarData(date);
    return `${lunarData.month}${lunarData.day}`;
  }

  _getLunarData(date) {
    // 简化版农历数据
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 农历月份名称
    const lunarMonths = [
      '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '冬月', '腊月'
    ];
    
    // 农历日期名称
    const lunarDays = [
      '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    
    // 简单的农历计算（仅作演示）
    const baseDate = new Date(year, 0, 1);
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
  version: '1.0.0',
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
    }
  }
};

export { ClockCard as default, ClockCard };
export const manifest = ClockCard.manifest;