// components/ha-cardforge-card.js - 更新版
import { LitElement, html, css } from 'https://unpkg.com/lit@3.0.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit/directives/unsafe-html.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardData: { state: true },
    _error: { state: true },
    _currentCardClass: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .cardforge-container {
        position: relative;
        height: 100%;
        min-height: 80px;
      }
      
      .cardforge-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        text-align: center;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-lg);
      }
      
      .error-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .error-message {
        font-size: 0.9em;
        line-height: 1.4;
      }
      
      .cardforge-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        color: var(--cf-text-secondary);
      }
    `
  ];

  constructor() {
    super();
    this._cardData = null;
    this._error = null;
    this._currentCardClass = null;
  }

  async setConfig(config) {
    try {
      // 验证配置
      this.config = await this._validateAndMergeConfig(config);
      
      // 初始化系统
      await cardSystem.initialize();
      await themeSystem.initialize();
      
      // 尝试获取卡片类
      const CardClass = cardSystem.getCardClass(this.config.card_type);
      if (CardClass) {
        this._currentCardClass = CardClass;
        // 直接使用卡片类实例
        this._renderWithCardClass();
      } else {
        // 回退到旧系统
        this._renderWithOldSystem();
      }
    } catch (error) {
      this._error = error.message || '未知错误';
    }
  }

  async _validateAndMergeConfig(userConfig) {
    if (!userConfig) {
      return this.constructor.getStubConfig();
    }
    
    if (!userConfig.card_type) {
      throw new Error('必须指定 card_type 参数');
    }
    
    await cardSystem.initialize();
    
    const card = cardSystem.getCard(userConfig.card_type);
    if (!card) {
      throw new Error(`卡片类型不存在: "${userConfig.card_type}"`);
    }
    
    const defaultConfig = {};
    const schema = card.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    const mergedConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: userConfig.card_type,
      theme: userConfig.theme || 'auto',
      ...defaultConfig,
      ...userConfig
    };
    
    return mergedConfig;
  }

  _renderWithCardClass() {
    try {
      // 创建卡片实例并获取渲染结果
      const cardInstance = new this._currentCardClass();
      cardInstance.config = this.config;
      cardInstance.hass = this.hass;
      
      // 获取卡片样式
      const cardStyles = cardInstance.getCardStyles();
      const themeStyles = themeSystem.getThemeStyles(this.config.theme || 'auto');
      
      this._cardData = {
        template: cardInstance.render(),
        styles: cardStyles + themeStyles
      };
    } catch (error) {
      throw new Error(`卡片渲染失败: ${error.message}`);
    }
  }

  _renderWithOldSystem() {
    try {
      this._cardData = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass
      );
    } catch (error) {
      throw new Error(`卡片渲染失败: ${error.message}`);
    }
  }

  render() {
    if (this._error) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error">
              <div class="error-icon">❌</div>
              <div class="error-message">${this._error}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    if (!this._cardData) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-loading">
              <ha-circular-progress indeterminate></ha-circular-progress>
              <div>加载中...</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    try {
      // 如果是卡片类实例，直接渲染
      if (this._currentCardClass) {
        return html`
          <ha-card>
            <div class="cardforge-container">
              ${this._cardData.template}
            </div>
          </ha-card>
          <style>
            ${this._cardData.styles}
          </style>
        `;
      }
      
      // 旧系统渲染
      return html`
        <ha-card>
          <div class="cardforge-container">
            ${unsafeHTML(this._cardData.template)}
          </div>
        </ha-card>
        <style>
          ${this._cardData.styles}
        </style>
      `;
    } catch (error) {
      console.error('卡片渲染错误:', error);
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error">
              <div class="error-icon">⚠️</div>
              <div class="error-message">渲染错误: ${error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      if (this._currentCardClass) {
        this._renderWithCardClass();
      } else {
        this._renderWithOldSystem();
      }
      this.requestUpdate();
    }
  }

  // 默认配置
  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto'
    };
  }

  // 获取卡片大小
  getCardSize() {
    const card = cardSystem.getCard(this.config?.card_type);
    return card?.layout?.recommendedSize || 3;
  }

  // 获取配置元素
  static getConfigElement() {
    return document.createElement('card-editor');
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
