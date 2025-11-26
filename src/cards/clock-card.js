// src/cards/clock-card.js
import { BaseCard } from '../core/base-card.js';

class ClockCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: 'clock-card',
      theme: 'auto',
      areas: {
        content: {
          layout: 'single',
          blocks: ['time_display', 'date_display']
        }
      },
      blocks: {
        time_display: {
          type: 'text',
          title: '',
          content: '12:00',
          style: 'font-size: 3em; font-weight: 300; text-align: center; line-height: 1; margin-bottom: 0.2em;'
        },
        date_display: {
          type: 'text',
          title: '',
          content: '2024年1月1日 星期一',
          style: 'text-align: center; font-size: 1.1em; color: var(--cf-text-secondary);'
        }
      }
    };
  }

  getManifest() {
    return ClockCard.manifest;
  }

  // 重写渲染方法，添加实时时间
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    // 更新时间为当前时间
    const now = new Date();
    safeConfig.blocks.time_display.content = this._formatTime(now, safeConfig.use_24_hour);
    safeConfig.blocks.date_display.content = this._formatDate(now);
    
    return super.render(safeConfig, hass, entities);
  }

  _formatTime(date, use24Hour = true) {
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
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日 ${weekday}`;
  }

  static styles(config) {
    return `
      .clock-card .cardforge-area {
        padding: var(--cf-spacing-xl);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 140px;
      }
      
      @container cardforge-container (max-width: 400px) {
        .clock-card .cardforge-area {
          padding: var(--cf-spacing-lg);
          min-height: 120px;
        }
        
        .clock-card .block-content {
          font-size: 0.9em;
        }
      }
    `;
  }
}

ClockCard.manifest = {
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
    show_seconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    },
    show_lunar: {
      type: 'boolean',
      label: '显示农历',
      default: false
    }
  },
  styles: ClockCard.styles
};

export { ClockCard as default, ClockCard };
export const manifest = ClockCard.manifest;