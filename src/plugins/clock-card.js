// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  // 静态 manifest 属性
  static manifest = {
    id: 'clock-card',
    name: '时钟卡片',
    version: '1.0.0',
    description: '显示当前时间和日期',
    category: '时间',
    icon: '🕒',
    author: 'CardForge',
    config_schema: {
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: true
      },
      show_seconds: {
        type: 'boolean', 
        label: '显示秒数',
        default: false
      },
      time_format: {
        type: 'select',
        label: '时间格式',
        options: ['12小时制', '24小时制'],
        default: '24小时制'
      }
    },
    capabilities: {
      supportsTitle: true,
      supportsFooter: false
    },
    layout_type: 'stateless'
  };

  getTemplate(config, hass, entities) {
    const now = new Date();
    const showDate = config.show_date !== false;
    const showSeconds = config.show_seconds === true;
    const is12Hour = config.time_format === '12小时制';
    
    // 格式化时间
    let hours = now.getHours();
    let ampm = '';
    
    if (is12Hour) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }
    
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = showSeconds ? `:${now.getSeconds().toString().padStart(2, '0')}` : '';
    const timeString = `${hours}:${minutes}${seconds}${ampm}`;
    
    // 格式化日期
    const dateString = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    const title = this._getEntityValue(entities, 'title') || config.title || '当前时间';
    
    return this._renderCardContainer(`
      ${this._renderCardHeader(title)}
      <div class="cardforge-time-content">
        <div class="cardforge-time">${timeString}</div>
        ${showDate ? `<div class="cardforge-date">${dateString}</div>` : ''}
      </div>
    `, 'cardforge-clock-card');
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      
      .cardforge-clock-card {
        text-align: center;
      }
      
      .cardforge-time-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-md);
      }
      
      .cardforge-time {
        font-size: 3em;
        font-weight: 300;
        line-height: 1;
        color: var(--cf-primary-color);
      }
      
      .cardforge-date {
        font-size: 1.2em;
        opacity: 0.8;
      }
      
      @container cardforge-container (max-width: 400px) {
        .cardforge-time {
          font-size: 2.5em;
        }
        
        .cardforge-date {
          font-size: 1em;
        }
      }
    `;
  }
}

// 导出 manifest 和类
export const manifest = ClockCard.manifest;
export default ClockCard;