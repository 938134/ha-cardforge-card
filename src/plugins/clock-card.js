// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '精美时钟',
    version: '2.0.0',
    description: '多种风格的时钟卡片，支持日期和星期显示',
    category: '时间',
    icon: '🕰️',
    author: 'CardForge',
    
    // 卡片配置 - 功能和外观
    config_schema: {
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['现代风格', '经典风格', '简约风格', '毛玻璃风格', '霓虹风格'],
        default: '现代风格',
        group: 'appearance'
      },
      show_date: {
        type: 'boolean', 
        label: '显示日期',
        default: true,
        group: 'content'
      },
      show_weekday: {
        type: 'boolean',
        label: '显示星期', 
        default: true,
        group: 'content'
      },
      time_format: {
        type: 'boolean',
        label: '24小时制',
        default: true,
        group: 'behavior'
      },
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true,
        group: 'behavior'
      }
    },
    
    // 数据源配置 - 此卡片无数据源需求
    entity_requirements: {}
  };

  getTemplate(config, hass, entities) {
    const timeData = this._getTimeData(config);
    const clockStyle = config.clock_style || '现代风格';
    const showAnimations = config.enable_animations !== false;

    return `
      <div class="cardforge-responsive-container clock-card style-${this._getStyleClass(clockStyle)} ${showAnimations ? 'with-animations' : ''}">
        <div class="clock-content">
          <div class="time-display">${timeData.time}</div>
          ${config.show_date ? `<div class="date-display">${timeData.date}</div>` : ''}
          ${config.show_weekday ? `<div class="weekday-display">${timeData.weekday}</div>` : ''}
        </div>
      </div>
    `;
  }

  _getTimeData(config) {
    const now = new Date();
    const timeFormat = config.time_format !== false;
    
    return {
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: !timeFormat 
      }),
      date: now.toLocaleDateString('zh-CN'),
      weekday: '星期' + '日一二三四五六'[now.getDay()]
    };
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '现代风格': 'modern',
      '经典风格': 'classic', 
      '简约风格': 'minimal',
      '毛玻璃风格': 'glass',
      '霓虹风格': 'neon'
    };
    return styleMap[styleName] || 'modern';
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      .clock-card {
        text-align: center;
        padding: var(--cf-spacing-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }
      .time-display {
        font-size: 2.5em;
        font-weight: 300;
        margin-bottom: var(--cf-spacing-md);
        color: var(--cf-text-primary);
      }
      .date-display, .weekday-display {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xs);
      }
      .with-animations .clock-content {
        animation: fadeIn 0.5s ease-in;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;