// src/blocks/time-block.js
import { BaseBlock } from '../core/base-block.js';

class TimeBlock extends BaseBlock {
  getTemplate(config, hass) {
    const now = new Date();
    const timeText = this._formatTime(now, config.use_24_hour);
    const dateText = config.show_date ? this._formatDate(now) : '';
    
    return this._renderBlockContainer(`
      <div class="time-content">
        <div class="time-main">${timeText}</div>
        ${dateText ? `<div class="time-date">${dateText}</div>` : ''}
      </div>
    `, 'time-block');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .time-block .time-content {
        padding: var(--cf-spacing-md);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .time-main {
        font-size: 1.8em;
        font-weight: 300;
        color: var(--cf-text-primary);
      }
      
      .time-date {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
    `;
  }

  _formatTime(date, use24Hour) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  }

  _formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

TimeBlock.manifest = {
  type: 'time',
  name: '时间块',
  description: '显示当前时间和日期',
  icon: '⏰',
  category: 'time',
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
    show_seconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    }
  }
};

export { TimeBlock as default };
