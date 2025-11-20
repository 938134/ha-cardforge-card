// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '时钟卡片',
    description: '显示当前时间和日期',
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
    }
  };

  getTemplate(config, hass, entities) {
    const now = new Date();
    const timeFormat = config.time_format || '24小时制';
    
    let timeText = this._formatTime(now, timeFormat, config.show_seconds);
    let dateText = config.show_date ? this._formatDate(now) : '';

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <div class="cardforge-text-large">${timeText}</div>
        ${dateText ? `<div class="cardforge-text-medium">${dateText}</div>` : ''}
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'clock-card', config);
  }

  getStyles(config) {
    return this.getBaseStyles(config);
  }

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
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日 ${weekday}`;
  }
}