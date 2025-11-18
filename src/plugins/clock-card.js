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
    
    config_schema: {
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['现代风格', '经典风格', '简约风格', '毛玻璃风格', '霓虹风格', '数字风格'],
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
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true
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
    const showAnimations = config.enable_animations !== false;

    return `
      <div class="cardforge-responsive-container clock-card style-${this._getStyleClass(clockStyle)} ${showAnimations ? 'with-animations' : ''}">
        <div class="clock-content">
          <div class="time-display">
            <span class="time">${timeData.time}</span>
            ${!config.time_format ? `<span class="ampm">${timeData.ampm}</span>` : ''}
          </div>

          ${config.show_date || config.show_weekday ? `
            <div class="date-section">
              ${config.show_date ? `<div class="date-display">${timeData.date}</div>` : ''}
              ${config.show_weekday ? `<div class="weekday-display">${timeData.weekday}</div>` : ''}
            </div>
          ` : ''}
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
      '毛玻璃风格': 'glass',
      '霓虹风格': 'neon',
      '数字风格': 'digital'
    };
    return styleMap[styleName] || 'modern';
  }

  getStyles(config) {
    const clockStyle = config.clock_style || '现代风格';
    const styleClass = this._getStyleClass(clockStyle);
    
    return `
      ${this.getBaseStyles(config)}
      ${this._getCommonStyles()}
      ${this._getStyleSpecificStyles(styleClass)}
      ${this._getResponsiveStyles()}
    `;
  }

  _getCommonStyles() {
    return `
      .clock-card {
        text-align: center;
        padding: var(--cf-spacing-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }

      .clock-content {
        width: 100%;
      }

      .time-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }

      .time {
        font-size: 3.5em;
        font-weight: 300;
        color: var(--cf-text-primary);
      }

      .ampm {
        font-size: 1.2em;
        color: var(--cf-accent-color);
        font-weight: 500;
      }

      .date-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }

      .date-display {
        font-size: 1.2em;
        color: var(--cf-text-primary);
        font-weight: 500;
      }

      .weekday-display {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
      }

      .with-animations .clock-content {
        animation: fadeInUp 0.6s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
  }

  _getStyleSpecificStyles(styleClass) {
    const styles = {
      modern: `
        .style-modern .clock-card {
          background: linear-gradient(135deg, var(--cf-primary-color) 0%, var(--cf-accent-color) 100%);
          color: white;
        }
        .style-modern .time {
          font-size: 4em;
          font-weight: 200;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .style-modern .date-display,
        .style-modern .weekday-display {
          color: rgba(255,255,255,0.9);
        }
        .style-modern .ampm {
          color: rgba(255,255,255,0.8);
        }
      `,

      classic: `
        .style-classic .clock-card {
          background: var(--cf-surface);
          border: 3px solid var(--cf-primary-color);
          box-shadow: var(--cf-shadow-lg);
        }
        .style-classic .time {
          font-family: 'Courier New', monospace;
          font-size: 3.5em;
          font-weight: 600;
          color: var(--cf-primary-color);
        }
        .style-classic .ampm {
          color: var(--cf-accent-color);
        }
      `,

      minimal: `
        .style-minimal .clock-card {
          background: transparent;
          border: none;
          box-shadow: none;
        }
        .style-minimal .time {
          font-size: 4.5em;
          font-weight: 100;
          letter-spacing: -2px;
        }
        .style-minimal .date-display {
          font-size: 1.1em;
          opacity: 0.8;
        }
        .style-minimal .weekday-display {
          font-size: 1em;
          opacity: 0.7;
        }
      `,

      glass: `
        .style-glass .clock-card {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }
        .style-glass .time {
          font-size: 4em;
          font-weight: 300;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .style-glass .date-display,
        .style-glass .weekday-display {
          color: rgba(255,255,255,0.9);
        }
      `,

      neon: `
        .style-neon .clock-card {
          background: #1a1a1a;
          border: 2px solid #00ff88;
          box-shadow: 
            0 0 20px #00ff88,
            inset 0 0 20px rgba(0, 255, 136, 0.1);
        }
        .style-neon .time {
          font-size: 4em;
          font-weight: 600;
          color: #00ff88;
          text-shadow: 
            0 0 10px #00ff88,
            0 0 20px #00ff88;
        }
        .style-neon .ampm {
          color: #00ff88;
          text-shadow: 0 0 5px #00ff88;
        }
        .style-neon .date-display,
        .style-neon .weekday-display {
          color: #00ff88;
        }
      `,

      digital: `
        .style-digital .clock-card {
          background: #000;
          color: #0f0;
          font-family: 'Courier New', monospace;
        }
        .style-digital .time {
          font-size: 3.5em;
          font-weight: 600;
          text-shadow: 0 0 5px #0f0;
        }
        .style-digital .ampm {
          color: #0f0;
          text-shadow: 0 0 3px #0f0;
        }
        .style-digital .date-display {
          font-size: 1em;
          opacity: 0.8;
        }
      `
    };

    return styles[styleClass] || styles.modern;
  }

  _getResponsiveStyles() {
    return `
      @media (max-width: 600px) {
        .clock-card {
          padding: var(--cf-spacing-lg);
          min-height: 150px;
        }
        .time {
          font-size: 3em !important;
        }
        .date-display {
          font-size: 1.1em !important;
        }
        .weekday-display {
          font-size: 1em !important;
        }
      }

      @media (max-width: 400px) {
        .time {
          font-size: 2.5em !important;
        }
        .time-display {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        .ampm {
          font-size: 1em;
        }
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;