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
    _cardInstance: { state: true },
    _themeId: { state: true },
    _error: { state: true },
    _loading: { state: true }
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
    `
  ];

  constructor() {
    super();
    this._cardInstance = null;
    this._themeId = 'auto';
    this._error = null;
    this._loading = true;
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

      // 创建卡片实例
      await this._createCardInstance();

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
    try {
      await Promise.all([
        cardSystem.initialize(),
        themeSystem.initialize()
      ]);
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
   * 创建卡片实例
   */
  async _createCardInstance() {
    const cardId = this.config.card_type;
    const cardDef = cardSystem.getCard(cardId);

    if (!cardDef) {
      throw new Error(`卡片类型不存在: ${cardId}`);
    }

    // 销毁旧实例
    if (this._cardInstance) {
      this._cleanupCardInstance();
    }

    // 创建新实例
    try {
      const instance = cardSystem.createCardInstance(
        cardId,
        this.config,
        this.hass
      );

      this._cardInstance = {
        id: instance.id,
        cardId,
        CardClass: cardDef.CardClass,
        element: null
      };

    } catch (error) {
      throw new Error(`卡片创建失败: ${error.message}`);
    }
  }

  /**
   * 清理卡片实例
   */
  _cleanupCardInstance() {
    if (this._cardInstance?.element) {
      this._cardInstance.element.remove();
    }
    this._cardInstance = null;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('hass') && this._cardInstance?.element) {
      // 更新HASS对象
      this._cardInstance.element.hass = this.hass;
    }
  }

  firstUpdated() {
    this._renderCardElement();
  }

  /**
   * 渲染卡片元素
   */
  async _renderCardElement() {
    if (!this._cardInstance || this._loading || this._error) {
      return;
    }

    try {
      const { CardClass, cardId } = this._cardInstance;
      
      // 检查是否已注册
      if (!customElements.get(`${cardId}-card`)) {
        // 使用动态注册
        customElements.define(`${cardId}-card`, CardClass);
      }

      // 创建卡片元素
      const cardElement = document.createElement(`${cardId}-card`);
      cardElement.config = this.config;
      cardElement.hass = this.hass;

      // 添加到容器
      const container = this.shadowRoot.querySelector('.cardforge-main');
      if (container) {
        // 移除旧的
        if (this._cardInstance.element) {
          this._cardInstance.element.remove();
        }
        
        container.appendChild(cardElement);
        this._cardInstance.element = cardElement;
      }

    } catch (error) {
      console.error('卡片渲染失败:', error);
      this._error = `卡片渲染失败: ${error.message}`;
    }
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
        </div>
      `;
    }

    return html`
      <div class="cardforge-main">
        <!-- 卡片实例将在这里动态渲染 -->
      </div>
    `;
  }

  /**
   * 获取卡片尺寸（用于Home Assistant布局）
   */
  getCardSize() {
    if (this._cardInstance?.element?.getCardSize) {
      return this._cardInstance.element.getCardSize();
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
