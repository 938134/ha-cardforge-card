// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '时间卡片',
    description: '多种风格的时间显示，支持日期、星期、农历',
    icon: '⏰',
    category: '时间',
    version: '1.0.0',
    author: 'CardForge',
    config_schema: {
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['简约数字', '经典表盘', '科技感', '复古风格', '极简文字'],
        default: '简约数字',
        description: '选择时钟的显示风格'
      },
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: true,
        description: '是否显示当前日期'
      },
      show_weekday: {
        type: 'boolean',
        label: '显示星期',
        default: true,
        description: '是否显示星期几'
      },
      show_lunar: {
        type: 'boolean',
        label: '显示农历',
        default: false,
        description: '是否显示农历日期'
      },
      show_seconds: {
        type: 'boolean',
        label: '显示秒数',
        default: false,
        description: '是否显示秒钟'
      },
      time_format: {
        type: 'select',
        label: '时间格式',
        options: ['24小时制', '12小时制'],
        default: '24小时制',
        description: '选择时间显示格式'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const style = this.getConfigValue(config, 'clock_style', '简约数字');
    const showDate = this.getConfigValue(config, 'show_date', true);
    const showWeekday = this.getConfigValue(config, 'show_weekday', true);
    const showLunar = this.getConfigValue(config, 'show_lunar', false);
    const showSeconds = this.getConfigValue(config, 'show_seconds', false);
    const timeFormat = this.getConfigValue(config, 'time_format', '24小时制');

    const now = new Date();
    
    // 根据风格选择不同的渲染方法
    switch (style) {
      case '经典表盘':
        return this._renderAnalogClock(now, config, showDate, showWeekday, showLunar, timeFormat);
      case '科技感':
        return this._renderTechClock(now, config, showDate, showWeekday, showLunar, showSeconds, timeFormat);
      case '复古风格':
        return this._renderVintageClock(now, config, showDate, showWeekday, showLunar, timeFormat);
      case '极简文字':
        return this._renderMinimalClock(now, config, showDate, showWeekday, showLunar, showSeconds, timeFormat);
      default: // 简约数字
        return this._renderDigitalClock(now, config, showDate, showWeekday, showLunar, showSeconds, timeFormat);
    }
  }

  getStyles(config) {
    const style = this.getConfigValue(config, 'clock_style', '简约数字');
    const baseStyles = this.getBaseStyles(config);
    
    switch (style) {
      case '经典表盘':
        return baseStyles + this._getAnalogClockStyles();
      case '科技感':
        return baseStyles + this._getTechClockStyles();
      case '复古风格':
        return baseStyles + this._getVintageClockStyles();
      case '极简文字':
        return baseStyles + this._getMinimalClockStyles();
      default: // 简约数字
        return baseStyles + this._getDigitalClockStyles();
    }
  }

  // === 简约数字风格 ===
  _renderDigitalClock(now, config, showDate, showWeekday, showLunar, showSeconds, timeFormat) {
    const timeText = this._formatTime(now, timeFormat, showSeconds);
    const dateText = showDate ? this._formatDate(now) : '';
    const weekdayText = showWeekday ? this._formatWeekday(now) : '';
    const lunarText = showLunar ? this._getLunarDate(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="digital-clock cf-flex cf-flex-center cf-flex-column cf-gap-md">
        <div class="time-display">${timeText}</div>
        
        ${showDate || showWeekday ? `
          <div class="date-info cf-flex cf-flex-center cf-gap-lg">
            ${showDate ? `<div class="date-text">${dateText}</div>` : ''}
            ${showWeekday ? `<div class="weekday-text">${weekdayText}</div>` : ''}
          </div>
        ` : ''}
        
        ${showLunar ? `<div class="lunar-text">${lunarText}</div>` : ''}
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'digital-clock', config);
  }

  _getDigitalClockStyles() {
    return `
      .digital-clock {
        text-align: center;
      }
      
      .time-display {
        font-size: 3.5em;
        font-weight: 300;
        font-family: 'Courier New', monospace;
        color: var(--cf-primary-color);
        text-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .date-info {
        font-size: 1.2em;
        color: var(--cf-text-primary);
      }
      
      .lunar-text {
        font-size: 1em;
        color: var(--cf-text-secondary);
        font-style: italic;
        margin-top: var(--cf-spacing-sm);
      }
      
      @container cardforge-container (max-width: 400px) {
        .time-display {
          font-size: 2.5em;
        }
        
        .date-info {
          font-size: 1em;
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }
      }
    `;
  }

  // === 经典表盘风格 ===
  _renderAnalogClock(now, config, showDate, showWeekday, showLunar, timeFormat) {
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    const dateText = showDate ? this._formatDate(now) : '';
    const weekdayText = showWeekday ? this._formatWeekday(now) : '';
    const lunarText = showLunar ? this._getLunarDate(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="analog-clock cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <div class="clock-face">
          <div class="clock-center"></div>
          <div class="hour-hand" style="transform: rotate(${hourAngle}deg);"></div>
          <div class="minute-hand" style="transform: rotate(${minuteAngle}deg);"></div>
          <div class="second-hand" style="transform: rotate(${secondAngle}deg);"></div>
          
          <!-- 时钟刻度 -->
          ${Array.from({length: 12}, (_, i) => `
            <div class="hour-mark" style="transform: rotate(${i * 30}deg);">
              <div class="hour-number" style="transform: rotate(${-i * 30}deg);">${i === 0 ? 12 : i}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="clock-info cf-flex cf-flex-center cf-flex-column cf-gap-sm">
          ${showDate ? `<div class="analog-date">${dateText}</div>` : ''}
          ${showWeekday ? `<div class="analog-weekday">${weekdayText}</div>` : ''}
          ${showLunar ? `<div class="analog-lunar">${lunarText}</div>` : ''}
        </div>
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'analog-clock', config);
  }

  _getAnalogClockStyles() {
    return `
      .analog-clock {
        text-align: center;
      }
      
      .clock-face {
        position: relative;
        width: 180px;
        height: 180px;
        border: 8px solid var(--cf-primary-color);
        border-radius: 50%;
        background: var(--cf-surface);
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      
      .clock-center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        background: var(--cf-primary-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      }
      
      .hour-hand, .minute-hand, .second-hand {
        position: absolute;
        background: var(--cf-text-primary);
        transform-origin: bottom center;
        border-radius: 4px;
        left: 50%;
      }
      
      .hour-hand {
        width: 6px;
        height: 50px;
        top: 40px;
        margin-left: -3px;
        background: var(--cf-text-primary);
      }
      
      .minute-hand {
        width: 4px;
        height: 70px;
        top: 20px;
        margin-left: -2px;
        background: var(--cf-text-primary);
      }
      
      .second-hand {
        width: 2px;
        height: 80px;
        top: 10px;
        margin-left: -1px;
        background: var(--cf-error-color);
      }
      
      .hour-mark {
        position: absolute;
        width: 100%;
        height: 100%;
        text-align: center;
      }
      
      .hour-number {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.9em;
        font-weight: bold;
        color: var(--cf-text-primary);
      }
      
      .analog-date {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .analog-weekday {
        font-size: 1em;
        color: var(--cf-text-secondary);
      }
      
      .analog-lunar {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        font-style: italic;
      }
      
      @container cardforge-container (max-width: 400px) {
        .clock-face {
          width: 140px;
          height: 140px;
          border-width: 6px;
        }
        
        .hour-hand {
          height: 40px;
          top: 30px;
        }
        
        .minute-hand {
          height: 55px;
          top: 15px;
        }
        
        .second-hand {
          height: 60px;
          top: 10px;
        }
      }
    `;
  }

  // === 科技感风格 ===
  _renderTechClock(now, config, showDate, showWeekday, showLunar, showSeconds, timeFormat) {
    const timeText = this._formatTime(now, timeFormat, showSeconds);
    const dateText = showDate ? this._formatDate(now) : '';
    const weekdayText = showWeekday ? this._formatWeekday(now) : '';
    const lunarText = showLunar ? this._getLunarDate(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="tech-clock cf-flex cf-flex-center cf-flex-column cf-gap-md">
        <div class="tech-time">${timeText}</div>
        
        ${showDate || showWeekday ? `
          <div class="tech-info">
            ${showDate ? `<div class="tech-date">${dateText}</div>` : ''}
            ${showWeekday ? `<div class="tech-weekday">${weekdayText}</div>` : ''}
          </div>
        ` : ''}
        
        ${showLunar ? `<div class="tech-lunar">${lunarText}</div>` : ''}
        
        <div class="tech-grid">
          ${Array.from({length: 16}, (_, i) => `<div class="grid-cell"></div>`).join('')}
        </div>
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'tech-clock', config);
  }

  _getTechClockStyles() {
    return `
      .tech-clock {
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .tech-time {
        font-size: 2.8em;
        font-weight: 300;
        font-family: 'Courier New', monospace;
        color: #00ff88;
        text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88;
        background: linear-gradient(45deg, #00ff88, #00ccff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: var(--cf-spacing-md);
      }
      
      .tech-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .tech-date, .tech-weekday {
        font-size: 1.1em;
        color: #00ccff;
        font-weight: 500;
      }
      
      .tech-lunar {
        font-size: 0.9em;
        color: #00ff88;
        font-style: italic;
        opacity: 0.8;
      }
      
      .tech-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: 1px;
        pointer-events: none;
        z-index: -1;
      }
      
      .grid-cell {
        background: rgba(0, 255, 136, 0.05);
        border: 1px solid rgba(0, 255, 136, 0.1);
      }
      
      @container cardforge-container (max-width: 400px) {
        .tech-time {
          font-size: 2.2em;
        }
        
        .tech-info {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }
      }
    `;
  }

  // === 复古风格 ===
  _renderVintageClock(now, config, showDate, showWeekday, showLunar, timeFormat) {
    const timeText = this._formatTime(now, timeFormat, false);
    const dateText = showDate ? this._formatDate(now) : '';
    const weekdayText = showWeekday ? this._formatWeekday(now) : '';
    const lunarText = showLunar ? this._getLunarDate(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="vintage-clock cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <div class="vintage-frame">
          <div class="vintage-time">${timeText}</div>
        </div>
        
        <div class="vintage-info">
          ${showDate ? `<div class="vintage-date">${dateText}</div>` : ''}
          ${showWeekday ? `<div class="vintage-weekday">${weekdayText}</div>` : ''}
          ${showLunar ? `<div class="vintage-lunar">${lunarText}</div>` : ''}
        </div>
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'vintage-clock', config);
  }

  _getVintageClockStyles() {
    return `
      .vintage-clock {
        text-align: center;
      }
      
      .vintage-frame {
        padding: var(--cf-spacing-lg);
        border: 4px solid #8B4513;
        border-radius: 12px;
        background: linear-gradient(135deg, #DEB887, #F5DEB3);
        box-shadow: 
          inset 0 2px 4px rgba(0,0,0,0.1),
          0 4px 12px rgba(0,0,0,0.2);
        position: relative;
      }
      
      .vintage-frame::before {
        content: '';
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        border: 2px solid #A0522D;
        border-radius: 8px;
        pointer-events: none;
      }
      
      .vintage-time {
        font-size: 2.5em;
        font-weight: bold;
        font-family: 'Times New Roman', serif;
        color: #8B0000;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }
      
      .vintage-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .vintage-date, .vintage-weekday {
        font-size: 1.1em;
        font-family: 'Times New Roman', serif;
        color: #8B4513;
        font-weight: 500;
      }
      
      .vintage-lunar {
        font-size: 0.9em;
        font-family: '楷体', 'STKaiti', serif;
        color: #A0522D;
        font-style: italic;
      }
      
      @container cardforge-container (max-width: 400px) {
        .vintage-time {
          font-size: 2em;
        }
        
        .vintage-frame {
          padding: var(--cf-spacing-md);
        }
      }
    `;
  }

  // === 极简文字风格 ===
  _renderMinimalClock(now, config, showDate, showWeekday, showLunar, showSeconds, timeFormat) {
    const timeText = this._formatTime(now, timeFormat, showSeconds);
    const dateText = showDate ? this._formatDate(now) : '';
    const weekdayText = showWeekday ? this._formatWeekday(now) : '';
    const lunarText = showLunar ? this._getLunarDate(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="minimal-clock cf-flex cf-flex-center cf-flex-column">
        <div class="minimal-time">${timeText}</div>
        
        ${showDate || showWeekday || showLunar ? `
          <div class="minimal-info">
            ${showDate ? `<div class="minimal-date">${dateText}</div>` : ''}
            ${showWeekday ? `<div class="minimal-weekday">${weekdayText}</div>` : ''}
            ${showLunar ? `<div class="minimal-lunar">${lunarText}</div>` : ''}
          </div>
        ` : ''}
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'minimal-clock', config);
  }

  _getMinimalClockStyles() {
    return `
      .minimal-clock {
        text-align: center;
        gap: var(--cf-spacing-lg);
      }
      
      .minimal-time {
        font-size: 2.2em;
        font-weight: 300;
        color: var(--cf-text-primary);
        letter-spacing: 2px;
      }
      
      .minimal-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .minimal-date, .minimal-weekday {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        font-weight: 300;
      }
      
      .minimal-lunar {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        opacity: 0.7;
        font-style: italic;
      }
      
      @container cardforge-container (max-width: 400px) {
        .minimal-time {
          font-size: 1.8em;
          letter-spacing: 1px;
        }
      }
    `;
  }

  // === 工具方法 ===
  _formatTime(date, format, showSeconds) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = showSeconds ? ':' + date.getSeconds().toString().padStart(2, '0') : '';
    
    if (format === '12小时制') {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes}${seconds} ${ampm}`;
    } else {
      hours = hours.toString().padStart(2, '0');
      return `${hours}:${minutes}${seconds}`;
    }
  }

  _formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  _formatWeekday(date) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[date.getDay()];
  }

  _getLunarDate(date) {
    // 简化的农历计算（实际项目中应该使用完整的农历算法）
    const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
    const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', 
                      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    
    // 这里使用简化算法，实际应该根据农历算法计算
    const monthIndex = date.getMonth();
    const dayIndex = date.getDate() - 1;
    
    return `${lunarMonths[monthIndex % 12]}${lunarDays[dayIndex % 30]}`;
  }
}
