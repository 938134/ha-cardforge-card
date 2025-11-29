// src/cards/clock-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'clock-card',
  name: '时钟卡片',
  description: '显示当前时间和日期，支持12/24小时制',
  icon: '⏰',
  category: '时间',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    use_24_hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    show_date: {
      type: 'boolean',
      label: '显示日期',
      default: true
    },
    show_weekday: {
      type: 'boolean',
      label: '显示星期',
      default: true
    },
    show_seconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    }
  }
};

export class ClockCard extends BaseCard {
  getDefaultConfig() {
    // 从config_schema生成默认配置
    const defaultConfig = {};
    Object.entries(CARD_CONFIG.config_schema).forEach(([key, field]) => {
      defaultConfig[key] = field.default !== undefined ? field.default : '';
    });

    return {
      card_type: CARD_CONFIG.id,
      theme: 'auto',
      ...defaultConfig
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  // 重写渲染方法，直接渲染时钟内容
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    const now = new Date();
    const content = this._generateClockContent(now, safeConfig);
    const styles = this._renderStyles(safeConfig, '');
    
    return {
      template: this._renderTemplate(content),
      styles: styles
    };
  }

  _generateClockContent(date, config) {
    const timeHtml = this._formatTime(date, config);
    const dateHtml = this._formatDate(date, config);
    const weekdayHtml = this._formatWeekday(date, config);
    
    let content = timeHtml;
    
    if (config.show_date && dateHtml) {
      content += dateHtml;
    }
    
    if (config.show_weekday && weekdayHtml) {
      content += weekdayHtml;
    }
    
    return content;
  }

  _formatTime(date, config) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = '';
    
    if (config.show_seconds) {
      seconds = ':' + date.getSeconds().toString().padStart(2, '0');
    }
    
    if (config.use_24_hour) {
      return `<div class="clock-time">${hours.toString().padStart(2, '0')}:${minutes}${seconds}</div>`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `<div class="clock-time">${hours}:${minutes}${seconds} <span class="clock-ampm">${ampm}</span></div>`;
    }
  }

  _formatDate(date, config) {
    if (!config.show_date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `<div class="clock-date">${year}年${month}月${day}日</div>`;
  }

  _formatWeekday(date, config) {
    if (!config.show_weekday) return '';
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    
    return `<div class="clock-weekday">${weekday}</div>`;
  }

  _renderTemplate(content) {
    return `
      <div class="cardforge-card ${CARD_CONFIG.id}">
        <div class="cardforge-area area-content">
          <div class="clock-display">
            ${content}
          </div>
        </div>
      </div>
    `;
  }

  _renderStyles(config, themeStyles) {
    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      /* 时钟显示区域 */
      .cardforge-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 120px;
        text-align: center;
      }
      
      .clock-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--cf-primary-color);
        font-family: 'Segoe UI', 'Roboto', sans-serif;
      }
      
      .clock-time {
        font-size: 2.5em;
        font-weight: 300;
        line-height: 1.2;
        margin: 0;
      }
      
      .clock-ampm {
        font-size: 0.5em;
        font-weight: 400;
        margin-left: 4px;
        opacity: 0.8;
      }
      
      .clock-date {
        font-size: 1em;
        font-weight: 400;
        line-height: 1.3;
        margin: 0;
        opacity: 0.9;
      }
      
      .clock-weekday {
        font-size: 1em;
        font-weight: 400;
        line-height: 1.3;
        margin: 0;
        opacity: 0.8;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .cardforge-area {
          min-height: 100px;
          padding: var(--cf-spacing-md);
        }
        
        .clock-time {
          font-size: 2em;
        }
        
        .clock-date,
        .clock-weekday {
          font-size: 0.9em;
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default ClockCard;