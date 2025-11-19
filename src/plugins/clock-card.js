// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '精美时钟',
    version: '2.1.0',
    description: '多种风格的时钟卡片，支持日期和星期显示',
    category: '时间',
    icon: '🕰️',
    author: 'CardForge',
    
    config_schema: {
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['现代风格', '经典风格', '简约风格', '数字风格'],
        default: '现代风格'
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
      time_format: {
        type: 'boolean',
        label: '24小时制',
        default: true
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '缩放', '滑动'],
        default: '淡入'
      }
    },
    
    entity_requirements: {}
  };

  constructor() {
    super();
    this._currentTime = this._getTimeData({});
    this._intervalId = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // 启动时钟更新
    this._intervalId = setInterval(() => {
      this._currentTime = this._getTimeData(this.config || {});
      this.requestUpdate();
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  getTemplate(config, hass, entities) {
    const timeData = this._currentTime;
    const clockStyle = config.clock_style || '现代风格';

    const content = `
      <div class="clock-content style-${this._getStyleClass(clockStyle)}">
        <div class="time-section">
          <div class="time-display">
            <span class="cardforge-text-large">${timeData.time}</span>
            ${!config.time_format ? `<span class="time-ampm">${timeData.ampm}</span>` : ''}
          </div>
        </div>

        ${config.show_date || config.show_weekday ? `
          <div class="date-section">
            ${config.show_date ? `<div class="cardforge-text-medium">${timeData.date}</div>` : ''}
            ${config.show_weekday ? `<div class="cardforge-text-small">${timeData.weekday}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    return this._renderCardContainer(content, `clock-card ${this._getStyleClass(clockStyle)}`, config);
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
      ampm: now.getHours() >= 12 ? 'PM' : 'AM',
      date: now.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      timestamp: now.getTime()
    };
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '现代风格': 'modern',
      '经典风格': 'classic', 
      '简约风格': 'minimal',
      '数字风格': 'digital'
    };
    return styleMap[styleName] || 'modern';
  }

  getStyles(config) {
    const clockStyle = config.clock_style || '现代风格';
    const styleClass = this._getStyleClass(clockStyle);
    
    return `
      ${this.getBaseStyles(config)}
      
      .clock-card {
        text-align: center;
      }

      .time-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }

      .time-ampm {
        font-size: 0.6em;
        opacity: 0.8;
        font-weight: 500;
      }

      .date-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }

      /* 风格特定样式 */
      .style-modern .time-display {
        text-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .style-classic .clock-content {
        font-family: 'Georgia', serif;
      }

      .style-classic .time-display {
        color: var(--cf-primary-color);
      }

      .style-minimal .clock-content {
        opacity: 0.9;
      }

      .style-minimal .cardforge-text-large {
        font-weight: 200;
        letter-spacing: -1px;
      }

      .style-digital .clock-content {
        font-family: 'Courier New', monospace;
      }

      .style-digital .cardforge-text-large {
        font-weight: 600;
      }

      /* 响应式优化 */
      @container cardforge-container (max-width: 400px) {
        .time-display {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        
        .time-ampm {
          font-size: 0.7em;
        }
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;