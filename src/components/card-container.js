import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';

/**
 * 卡片容器组件 - 负责卡片实例的渲染和管理
 */
export class CardContainer extends LitElement {
  static properties = {
    cardId: { type: String },
    config: { type: Object },
    hass: { type: Object },
    themeId: { type: String },
    _cardElement: { state: true },
    _error: { state: true },
    _loading: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .card-container {
      height: 100%;
      width: 100%;
      position: relative;
      container-type: inline-size;
      container-name: cardforge-container;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(var(--cf-background-rgb), 0.9);
      z-index: 10;
      gap: var(--cf-spacing-md);
    }

    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(var(--cf-error-color-rgb), 0.05);
      border: 1px solid rgba(var(--cf-error-color-rgb), 0.2);
      border-radius: var(--cf-radius-md);
      padding: var(--cf-spacing-xl);
      z-index: 20;
      text-align: center;
      gap: var(--cf-spacing-md);
    }

    .error-icon {
      font-size: 2em;
      color: var(--cf-error-color);
      opacity: 0.8;
    }

    .error-message {
      color: var(--cf-error-color);
      font-weight: var(--cf-font-weight-medium);
      line-height: var(--cf-line-height-relaxed);
    }

    .retry-button {
      margin-top: var(--cf-spacing-md);
      padding: var(--cf-spacing-sm) var(--cf-spacing-lg);
      background: var(--cf-error-color);
      color: white;
      border: none;
      border-radius: var(--cf-radius-md);
      cursor: pointer;
      font-weight: var(--cf-font-weight-medium);
      transition: all var(--cf-transition-fast);
    }

    .retry-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .card-slot {
      height: 100%;
      width: 100%;
    }

    /* 动画效果 */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .card-container {
      animation: fadeIn var(--cf-transition-normal);
    }
  `;

  constructor() {
    super();
    this.cardId = '';
    this.config = {};
    this.hass = null;
    this.themeId = 'auto';
    this._cardElement = null;
    this._error = null;
    this._loading = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadCard();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('cardId') || 
        changedProperties.has('config') || 
        changedProperties.has('themeId')) {
      this._loadCard();
    }

    if (changedProperties.has('hass') && this._cardElement) {
      this._cardElement.hass = this.hass;
    }
  }

  /**
   * 加载卡片
   */
  async _loadCard() {
    if (!this.cardId) {
      this._error = '未指定卡片类型';
      return;
    }

    try {
      this._loading = true;
      this._error = null;

      // 确保系统已初始化
      await this._ensureSystemsInitialized();

      // 应用主题
      await this._applyTheme();

      // 创建卡片元素
      await this._createCardElement();

    } catch (error) {
      this._error = error.message || '卡片加载失败';
      console.error('卡片加载错误:', error);
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  /**
   * 确保系统已初始化
   */
  async _ensureSystemsInitialized() {
    await Promise.all([
      cardSystem.initialize(),
      themeSystem.initialize()
    ]);
  }

  /**
   * 应用主题
   */
  async _applyTheme() {
    if (this.themeId) {
      await themeSystem.applyTheme(this.themeId);
    }
  }

  /**
   * 创建卡片元素
   */
  async _createCardElement() {
    // 清理旧的卡片元素
    this._cleanup();

    // 获取卡片定义
    const cardDef = cardSystem.getCard(this.cardId);
    if (!cardDef) {
      throw new Error(`卡片类型不存在: ${this.cardId}`);
    }

    const { CardClass } = cardDef;

    // 检查是否已注册
    const elementName = `${this.cardId}-card`;
    if (!customElements.get(elementName)) {
      customElements.define(elementName, CardClass);
    }

    // 创建新元素
    const cardElement = document.createElement(elementName);
    cardElement.config = { ...this.config, card_type: this.cardId };
    cardElement.hass = this.hass;

    this._cardElement = cardElement;
  }

  /**
   * 清理资源
   */
  _cleanup() {
    if (this._cardElement) {
      if (this._cardElement.parentNode === this) {
        this.removeChild(this._cardElement);
      }
      this._cardElement = null;
    }
  }

  /**
   * 重试加载
   */
  _handleRetry() {
    this._loadCard();
  }

  render() {
    return html`
      <div class="card-container">
        ${this._loading ? html`
          <div class="loading-overlay">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div>加载中...</div>
          </div>
        ` : ''}

        ${this._error ? html`
          <div class="error-overlay">
            <div class="error-icon">⚠️</div>
            <div class="error-message">${this._error}</div>
            <button class="retry-button" @click=${this._handleRetry}>
              重试
            </button>
          </div>
        ` : ''}

        <div class="card-slot">
          ${this._cardElement}
        </div>
      </div>
    `;
  }

  /**
   * 获取卡片尺寸
   */
  getCardSize() {
    if (this._cardElement?.getCardSize) {
      return this._cardElement.getCardSize();
    }
    return 3;
  }
}

// 注册自定义元素
if (!customElements.get('card-container')) {
  customElements.define('card-container', CardContainer);
}
