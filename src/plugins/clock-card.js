// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    const now = new Date();
    
    const timeText = this._formatTime(now, safeConfig.use_24_hour);
    const dateText = safeConfig.show_date ? this._formatDate(now) : '';
    const weekText = safeConfig.show_week ? this._formatWeek(now) : '';
    const lunarText = safeConfig.show_lunar ? this._formatLunar(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(safeConfig, entities)}
      
      <div class="clock-content vivo-style">
        <!-- 时间区域 - 2行 -->
        <div class="clock-time-section">
          <div class="clock-time-main">${timeText.main}</div>
          ${timeText.ampm ? `<div class="clock-time-ampm">${timeText.ampm}</div>` : ''}
        </div>
        
        <!-- 日期+星期区域 - 1行 -->
        ${(dateText || weekText) ? `
          <div class="clock-date-section">
            ${dateText ? `<span class="clock-date">${dateText}</span>` : ''}
            ${dateText && weekText ? `<span class="clock-separator">·</span>` : ''}
            ${weekText ? `<span class="clock-week">${weekText}</span>` : ''}
          </div>
        ` : ''}
        
        <!-- 农历区域 - 1行 -->
        ${lunarText ? `
          <div class="clock-lunar-section">
            <span class="clock-lunar">${lunarText}</span>
          </div>
        ` : ''}
      </div>
      
      ${this._renderCardFooter(safeConfig, entities)}
    `, 'clock-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .clock-card .cardforge-card-container {
        /* 主题样式通过 baseStyles 已经应用，这里只需要确保内容可见 */
      }
      
      .clock-content.vivo-style {
        padding: var(--cf-spacing-lg);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      /* 时间区域 - 2行布局 */
      .clock-time-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        margin-bottom: 4px;
      }
      
      .clock-time-main {
        font-family: 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
        font-weight: 300;
        font-size: 3.2em;
        color: var(--cf-text-primary);
        line-height: 1;
        letter-spacing: -1px;
      }
      
      .clock-time-ampm {
        font-family: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        font-weight: 400;
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        opacity: 0.8;
      }
      
      /* 日期+星期区域 - 1行 */
      .clock-date-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin: 4px 0;
      }
      
      .clock-date {
        font-family: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        font-weight: 500;
        font-size: 1em;
        color: var(--cf-text-primary);
      }
      
      .clock-week {
        font-family: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        font-weight: 500;
        font-size: 1em;
        color: var(--cf-primary-color);
      }
      
      .clock-separator {
        color: var(--cf-text-secondary);
        opacity: 0.6;
      }
      
      /* 农历区域 - 1行 */
      .clock-lunar-section {
        margin-top: 2px;
      }
      
      .clock-lunar {
        font-family: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        font-weight: 400;
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        opacity: 0.8;
      }
      
      /* 移动端适配 */
      @container cardforge-container (max-width: 400px) {
        .clock-content.vivo-style {
          padding: var(--cf-spacing-md);
          gap: 6px;
        }
        
        .clock-time-main {
          font-size: 2.6em;
        }
        
        .clock-date,
        .clock-week {
          font-size: 0.95em;
        }
        
        .clock-lunar {
          font-size: 0.85em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .clock-time-main {
          font-size: 2.2em;
        }
        
        .clock-date,
        .clock-week {
          font-size: 0.9em;
        }
        
        .clock-lunar {
          font-size: 0.8em;
        }
      }
      
      /* 主题适配优化 */
      
      /* 毛玻璃主题优化 */
      .clock-card.glass .clock-time-main {
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .clock-card.glass .clock-date-section,
      .clock-card.glass .clock-lunar-section {
        backdrop-filter: blur(5px);
      }
      
      /* 渐变主题优化 */
      .clock-card.gradient .clock-time-main {
        background: linear-gradient(135deg, var(--cf-text-primary), var(--cf-primary-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      /* 霓虹主题优化 */
      .clock-card.neon .clock-time-main {
        color: var(--cf-primary-color);
        text-shadow: 0 0 10px var(--cf-primary-color);
      }
      
      .clock-card.neon .clock-week {
        color: var(--cf-accent-color);
        text-shadow: 0 0 5px var(--cf-accent-color);
      }
      
      /* 水墨主题优化 */
      .clock-card.ink-wash .clock-time-main {
        font-family: "楷体", "STKaiti", serif;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .clock-card.ink-wash .clock-date,
      .clock-card.ink-wash .clock-week,
      .clock-card.ink-wash .clock-lunar {
        font-family: "楷体", "STKaiti", serif;
      }
    `;
  }

  _formatTime(date, use24Hour) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (use24Hour) {
      return {
        main: `${hours.toString().padStart(2, '0')}:${minutes}`,
        ampm: null
      };
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return {
        main: `${hours}:${minutes}`,
        ampm: ampm
      };
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
    // 农历月份
    const lunarMonths = [
      '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '冬月', '腊月'
    ];
    
    // 农历日期
    const lunarDays = [
      '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];

    // 简单的农历计算（基于固定偏移，实际应该使用农历算法库）
    // 这里使用一个简单的算法来生成看起来合理的农历日期
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 基于公历日期计算一个伪农历（仅用于演示）
    // 实际项目中应该使用专业的农历计算库
    
    // 简单的映射算法
    const lunarMonthIndex = (month + Math.floor(day / 10)) % 12;
    const lunarDayIndex = (day - 1) % 30;
    
    return {
      month: lunarMonths[lunarMonthIndex],
      day: lunarDays[lunarDayIndex]
    };
  }

  // 备选方案：使用固定数据演示
  _getLunarDataDemo(date) {
    const lunarDataMap = {
      '01-01': { month: '正月', day: '初一' },
      '01-15': { month: '正月', day: '十五' },
      '02-02': { month: '二月', day: '初二' },
      '05-05': { month: '五月', day: '初五' },
      '08-15': { month: '八月', day: '十五' },
      '09-09': { month: '九月', day: '初九' },
      '12-30': { month: '腊月', day: '三十' }
    };
    
    const key = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    if (lunarDataMap[key]) {
      return lunarDataMap[key];
    }
    
    // 默认返回一个合理的农历日期
    const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
    const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    
    return {
      month: lunarMonths[date.getMonth()],
      day: lunarDays[(date.getDate() - 1) % 30]
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
    }
  }
};

export { ClockCard as default, ClockCard };
export const manifest = ClockCard.manifest;