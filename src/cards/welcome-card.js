import { BaseCard } from '../core/base-card.js';
import { html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { 
  getGreetingByHour, 
  formatTime, 
  getDisplayName,
  getDefaultQuote,
  getEntityState,
  getEntityIcon 
} from '../core/card-tools.js';

/**
 * 欢迎卡片 - 显示个性化欢迎信息和每日名言
 */
export class WelcomeCard extends BaseCard {
  static properties = {
    ...BaseCard.properties,
    _currentTime: { state: true },
    _quoteData: { state: true }
  };

  // 卡片配置模式
  static schema = {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    greetingName: {
      type: 'text',
      label: '自定义称呼',
      placeholder: '例如：小明'
    },
    showQuote: {
      type: 'boolean',
      label: '显示每日一言',
      default: true
    },
    autoRefresh: {
      type: 'boolean',
      label: '自动刷新问候语',
      default: true
    }
  };

  // 块配置
  static blocksConfig = {
    type: 'preset',
    blocks: {
      daily_quote: {
        name: '每日一言',
        icon: 'mdi:format-quote-close',
        required: false,
        description: '关联一个文本传感器显示每日名言'
      }
    }
  };

  // 卡片元数据
  static meta = {
    name: '欢迎',
    description: '个性化欢迎信息，可显示每日名言',
    icon: '👋',
    category: '信息',
    tags: ['欢迎', '问候', '名言'],
    recommendedSize: 3
  };

  // 卡片特有样式
  static styles = [
    BaseCard.styles,
    css`
      .welcome-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: var(--cf-spacing-xl);
        text-align: center;
      }

      .greeting-section {
        margin-bottom: var(--cf-spacing-xl);
      }

      .greeting-text {
        font-size: var(--cf-font-size-2xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-sm);
        line-height: 1.3;
      }

      .time-display {
        font-size: var(--cf-font-size-4xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        letter-spacing: 1px;
        margin-top: var(--cf-spacing-md);
        text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.2);
      }

      .quote-section {
        width: 100%;
        max-width: 500px;
        margin-top: var(--cf-spacing-lg);
      }

      .quote-container {
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-lg);
        background: var(--cf-surface-elevated);
        border: 1px solid var(--cf-border);
        border-left: 4px solid var(--cf-accent-color);
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-sm);
        transition: all var(--cf-transition-normal);
      }

      .quote-container:hover {
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
        border-color: var(--cf-primary-color);
      }

      .quote-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--cf-accent-color-rgb), 0.1);
        color: var(--cf-accent-color);
        border-radius: var(--cf-radius-md);
        font-size: 1.5em;
      }

      .quote-content {
        flex: 1;
        text-align: left;
        font-size: var(--cf-font-size-lg);
        line-height: var(--cf-line-height-relaxed);
        color: var(--cf-text-primary);
        font-style: italic;
      }

      .quote-source {
        margin-top: var(--cf-spacing-sm);
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-tertiary);
        text-align: right;
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
        }

        .greeting-text {
          font-size: var(--cf-font-size-xl);
        }

        .time-display {
          font-size: var(--cf-font-size-3xl);
        }

        .quote-container {
          padding: var(--cf-spacing-md);
          gap: var(--cf-spacing-sm);
        }

        .quote-icon {
          width: 40px;
          height: 40px;
          font-size: 1.3em;
        }

        .quote-content {
          font-size: var(--cf-font-size-md);
        }
      }

      @container cardforge-container (max-width: 400px) {
        .greeting-text {
          font-size: var(--cf-font-size-lg);
        }

        .time-display {
          font-size: var(--cf-font-size-2xl);
        }

        .quote-container {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .quote-content {
          text-align: center;
        }
      }

      /* 动画效果 */
      .greeting-text {
        animation: fadeIn var(--cf-transition-slow);
      }

      .time-display {
        animation: slideUp var(--cf-transition-slow);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
  ];

  constructor() {
    super();
    this._currentTime = new Date();
    this._quoteData = null;
    this._updateTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.config?.autoRefresh !== false) {
      this._startAutoUpdate();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoUpdate();
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      this._updateQuoteData();
    }
  }

  /**
   * 开始自动更新
   */
  _startAutoUpdate() {
    this._updateTimer = setInterval(() => {
      this._currentTime = new Date();
      this.requestUpdate();
    }, 60000); // 每分钟更新一次
  }

  /**
   * 停止自动更新
   */
  _stopAutoUpdate() {
    if (this._updateTimer) {
      clearInterval(this._updateTimer);
      this._updateTimer = null;
    }
  }

  /**
   * 更新名言数据
   */
  _updateQuoteData() {
    const blocks = this.config?.blocks || {};
    let quoteEntity = null;
    let quoteIcon = 'mdi:format-quote-close';

    // 查找名言实体
    Object.values(blocks).forEach(block => {
      if (block.presetKey === 'daily_quote' && block.entity) {
        quoteEntity = block.entity;
        quoteIcon = block.icon || quoteIcon;
      }
    });

    this._quoteData = {
      quoteEntity,
      quoteIcon,
      timestamp: Date.now()
    };
  }

  /**
   * 处理卡片数据
   */
  async processCardData() {
    const { 
      use24Hour = true, 
      greetingName = '', 
      showQuote = true 
    } = this.config;

    // 获取问候语和用户名
    const greeting = getGreetingByHour(this._currentTime);
    const userName = getDisplayName(this.hass, greetingName, '朋友');
    const timeStr = formatTime(this._currentTime, use24Hour);

    // 获取名言
    let quote = null;
    if (showQuote && this._quoteData) {
      if (this._quoteData.quoteEntity && this.hass?.states) {
        // 从实体获取名言
        const entityState = getEntityState(
          this.hass, 
          this._quoteData.quoteEntity, 
          getDefaultQuote(this._currentTime)
        );
        
        // 获取实体图标
        const entityIcon = getEntityIcon(
          this.hass, 
          this._quoteData.quoteEntity, 
          this._quoteData.quoteIcon
        );

        quote = {
          content: entityState,
          icon: entityIcon,
          source: '实体',
          hasEntity: true
        };
      } else {
        // 使用默认名言
        quote = {
          content: getDefaultQuote(this._currentTime),
          icon: this._quoteData.quoteIcon,
          source: '默认',
          hasEntity: false
        };
      }
    }

    return {
      greeting,
      userName,
      time: timeStr,
      quote,
      showQuote
    };
  }

  /**
   * 渲染卡片内容
   */
  renderCardContent() {
    const { greeting, userName, time, quote, showQuote } = this.renderData;

    return html`
      <div class="welcome-card">
        <div class="greeting-section">
          <div class="greeting-text">${greeting}，${userName}！</div>
          <div class="time-display">${time}</div>
        </div>

        ${showQuote && quote ? html`
          <div class="quote-section">
            <div class="quote-container">
              <div class="quote-icon">
                <ha-icon .icon=${quote.icon}></ha-icon>
              </div>
              <div class="quote-content">
                ${quote.content}
                ${quote.source === '实体' ? html`
                  <div class="quote-source">—— 每日一言</div>
                ` : ''}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 获取卡片尺寸
   */
  getCardSize() {
    return this.config?.card_size || 3;
  }
}

// 注册卡片
if (!customElements.get('welcome-card')) {
  customElements.define('welcome-card', WelcomeCard);
}

// 导出卡片类供卡片系统使用
export default WelcomeCard;
