import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

/**
 * CardForge 主卡片组件 - 简化的入口组件
 */
export class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardElement: { state: true },
    _themeId: { state: true },
    _error: { state: true },
    _loading: { state: true },
    _systemsInitialized: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host {
        display: block;
        height: 100%;
      }

      .cardforge-main {
        height: 100%;
        position: relative;
        container-type: inline-size;
        container-name: cardforge-container;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 120px;
        color: var(--cf-text-secondary);
        gap: var(--cf-spacing-md);
      }

      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 120px;
        color: var(--cf-error-color);
        text-align: center;
        padding: var(--cf-spacing-xl);
        gap: var(--cf-spacing-md);
      }

      .error-icon {
        font-size: 2.5em;
        opacity: 0.8;
      }

      .error-message {
        font-size: var(--cf-font-size-md);
        line-height: var(--cf-line-height-relaxed);
      }

      .error-details {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-tertiary);
        font-family: var(--cf-font-family-mono);
        background: rgba(var(--cf-error-color-rgb), 0.1);
        padding: var(--cf-spacing-md);
        border-radius: var(--cf-radius-md);
        max-width: 100%;
        overflow: auto;
        text-align: left;
      }

      .retry-button {
        margin-top: var(--cf-spacing-md);
        padding: var(--cf-spacing-sm) var(--cf-spacing-lg);
        background: var(--cf-primary-color);
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
    `
  ];

  constructor() {
    super();
    this.hass = null;
    this.config = {};
    this._cardElement = null;
    this._themeId = 'auto';
    this._error = null;
    this._loading = true;
    this._systemsInitialized = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;

      // 验证配置
      const validatedConfig = this._validateConfig(config);
      this.config = validatedConfig;

      // 确保系统已初始化
      await this._ensureSystemsInitialized();

      // 应用主题
      await this._applyTheme();

      // 渲染卡片
      await this._renderCard();

    } catch (error) {
      this._error = error.message || '配置错误';
      console.error('CardForge卡片配置失败:', error);
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  /**
   * 验证配置
   */
  _validateConfig(userConfig) {
    if (!userConfig || typeof userConfig !== 'object') {
      throw new Error('配置必须是一个对象');
    }

    if (!userConfig.card_type) {
      throw new Error('必须指定卡片类型 (card_type)');
    }

    // 确保有必要的字段
    return {
      type: 'custom:ha-cardforge-card',
      card_type: userConfig.card_type,
      theme: userConfig.theme || 'auto',
      ...userConfig
    };
  }

  /**
   * 确保系统已初始化
   */
  async _ensureSystemsInitialized() {
    if (this._systemsInitialized) return;
    
    try {
      await Promise.all([
        cardSystem.initialize(),
        themeSystem.initialize()
      ]);
      
      this._systemsInitialized = true;
    } catch (error) {
      throw new Error(`系统初始化失败: ${error.message}`);
    }
  }

  /**
   * 应用主题
   */
  async _applyTheme() {
    const themeId = this.config.theme || 'auto';
    if (themeId !== this._themeId) {
      await themeSystem.applyTheme(themeId);
      this._themeId = themeId;
    }
  }

  /**
   * 渲染卡片
   */
  async _renderCard() {
    // 清理旧的卡片元素
    if (this._cardElement) {
      this._cardElement.remove();
      this._cardElement = null;
    }

    const cardId = this.config.card_type;
    const cardDef = cardSystem.getCard(cardId);

    if (!cardDef) {
      throw new Error(`卡片类型不存在: ${cardId}`);
    }

    const { CardClass } = cardDef;

    try {
      // 检查是否已注册
      const elementName = `${cardId}-card`;
      if (!customElements.get(elementName)) {
        customElements.define(elementName, CardClass);
      }

      // 创建新元素
      const cardElement = document.createElement(elementName);
      cardElement.config = this.config;
      cardElement.hass = this.hass;

      // 等待元素渲染
      await customElements.whenDefined(elementName);
      
      this._cardElement = cardElement;

    } catch (error) {
      throw new Error(`卡片创建失败: ${error.message}`);
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('hass') && this._cardElement) {
      // 更新HASS对象
      this._cardElement.hass = this.hass;
    }
  }

  /**
   * 重试加载
   */
  _handleRetry() {
    this.setConfig(this.config);
  }

  render() {
    if (this._loading) {
      return html`
        <div class="loading-container">
          <ha-circular-progress indeterminate size="large"></ha-circular-progress>
          <div>加载卡片中...</div>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${this._error}</div>
          ${this.config?.card_type ? html`
            <div class="error-details">
              卡片类型: ${this.config.card_type}<br>
              主题: ${this.config.theme || 'auto'}
            </div>
          ` : ''}
          <button class="retry-button" @click=${this._handleRetry}>
            重试加载
          </button>
        </div>
      `;
    }

    return html`
      <div class="cardforge-main">
        ${this._cardElement}
      </div>
    `;
  }

  /**
   * 获取卡片尺寸（用于Home Assistant布局）
   */
  getCardSize() {
    if (this._cardElement?.getCardSize) {
      return this._cardElement.getCardSize();
    }
    
    // 从卡片定义获取推荐尺寸
    const cardDef = cardSystem.getCard(this.config?.card_type);
    return cardDef?.meta?.recommendedSize || 3;
  }

  /**
   * 获取配置元素（用于编辑器）
   */
  static getConfigElement() {
    return document.createElement('card-editor');
  }

  /**
   * 获取默认配置
   */
  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto'
    };
  }
}

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}
