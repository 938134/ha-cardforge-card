import { BaseCard } from '../core/base-card.js';
import { html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { formatTime, formatDate, getWeekday } from '../core/card-tools.js';

/**
 * 时钟卡片 - 显示当前时间和日期
 */
export class ClockCard extends BaseCard {
  static properties = {
    ...BaseCard.properties,
    _currentTime: { state: true },
    _timerId: { state: true }
  };

  // 卡片配置模式
  static schema = {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    showDate: {
      type: 'boolean',
      label: '显示日期',
      default: true
    },
    showWeekday: {
      type: 'boolean',
      label: '显示星期',
      default: true
    },
    showSeconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    },
    updateInterval: {
      type: 'number',
      label: '更新时间（秒）',
      default: 60,
      min: 1,
      max: 3600
    }
  };

  // 卡片元数据
  static meta = {
    name: '时钟',
    description: '显示当前时间、日期和星期',
    icon: '⏰',
    category: '时间',
    tags: ['时间', '日期', '时钟'],
    recommendedSize: 2
  };

  // 卡片特有样式
  static styles = [
    BaseCard.styles,
    css`
      .clock-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: var(--cf-spacing-xl);
        text-align: center;
      }

      .time-display {
        font-size: var(--cf-font-size-4xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        margin-bottom: var(--cf-spacing-md);
        letter-spacing: 1px;
        text-shadow: 0 2px 4px rgba(var(--cf-primary-color-rgb), 0.2);
      }

      .date-display {
        font-size: var(--cf-font-size-lg);
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xs);
        font-weight: var(--cf-font-weight-medium);
      }

      .weekday-display {
        font-size: var(--cf-font-size-md);
        color: var(--cf-text-tertiary);
        font-style: italic;
      }

      .time-with-seconds {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 2px;
      }

      .seconds-part {
        font-size: var(--cf-font-size-xl);
        color: var(--cf-accent-color);
        opacity: 0.8;
        margin-left: 4px;
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 480px) {
        .clock-card {
          padding: var(--cf-spacing-lg);
        }

        .time-display {
          font-size: var(--cf-font-size-3xl);
        }

        .date-display {
          font-size: var(--cf-font-size-md);
        }

        .weekday-display {
          font-size: var(--cf-font-size-sm);
        }
      }

      @container cardforge-container (max-width: 320px) {
        .time-display {
          font-size: var(--cf-font-size-2xl);
        }
      }

      /* 动画效果 */
      .time-display {
        transition: all var(--cf-transition-normal);
      }

      .seconds-part {
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 0.4; }
      }
    `
  ];

  constructor() {
    super();
    this._currentTime = new Date();
    this._timerId = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startClock();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopClock();
  }

  /**
   * 开始时钟更新
   */
  _startClock() {
    const interval = this.config?.showSeconds ? 1000 : 60000; // 1秒或1分钟
    this._timerId = setInterval(() => {
      this._currentTime = new Date();
      this.requestUpdate();
    }, interval);
  }

  /**
   * 停止时钟更新
   */
  _stopClock() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  /**
   * 处理卡片数据
   */
  async processCardData() {
    // 时钟卡片不需要异步数据处理
    return {
      time: this._currentTime,
      config: this.config
    };
  }

  /**
   * 渲染卡片内容
   */
  renderCardContent() {
    const { use24Hour = true, showDate = true, showWeekday = true, showSeconds = false } = this.config;
    
    // 格式化时间
    const baseTime = formatTime(this._currentTime, use24Hour);
    const seconds = this._currentTime.getSeconds().toString().padStart(2, '0');
    
    return html`
      <div class="clock-card">
        <div class="time-display">
          ${showSeconds 
            ? html`
                <div class="time-with-seconds">
                  <span>${baseTime.split(':')[0]}:${baseTime.split(':')[1]}</span>
                  <span class="seconds-part">:${seconds}</span>
                </div>
              `
            : html`<div>${baseTime}</div>`
          }
        </div>
        
        ${showDate 
          ? html`<div class="date-display">${formatDate(this._currentTime)}</div>`
          : ''
        }
        
        ${showWeekday 
          ? html`<div class="weekday-display">${getWeekday(this._currentTime)}</div>`
          : ''
        }
      </div>
    `;
  }

  /**
   * 获取卡片尺寸
   */
  getCardSize() {
    return this.config?.card_size || 2;
  }
}

// 注册卡片
if (!customElements.get('clock-card')) {
  customElements.define('clock-card', ClockCard);
}

// 导出卡片类供卡片系统使用
export default ClockCard;
