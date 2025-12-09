// 主卡片组件 - 修复版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit@2.8.0/directives/unsafe-html.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardData: { state: true },
    _error: { state: true },
    _themeStyles: { state: true },
    _cardStyles: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .cardforge-container {
        position: relative;
        height: 100%;
        min-height: 80px;
        container-type: inline-size;
        container-name: cardforge-container;
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
    this._themeStyles = null;
    this._cardStyles = null;
  }

  async setConfig(config) {
    try {
      // 验证配置
      this.config = await this._validateAndMergeConfig(config);
      
      // 初始化系统
      await cardSystem.initialize();
      await themeSystem.initialize();
      
      // 渲染卡片
      await this._renderCard();
    } catch (error) {
      console.error('卡片配置错误:', error);
      this._error = error.message || '未知错误';
    }
  }

  async _validateAndMergeConfig(userConfig) {
    if (!userConfig) {
      return this.constructor.getStubConfig();
    }
    
    // 必须有 card_type
    if (!userConfig.card_type) {
      throw new Error('必须指定 card_type 参数');
    }
    
    // 确保卡片系统已初始化
    await cardSystem.initialize();
    
    // 获取卡片定义
    const card = cardSystem.getCard(userConfig.card_type);
    if (!card) {
      throw new Error(`卡片类型不存在: "${userConfig.card_type}"`);
    }
    
    // 应用卡片schema中的默认值
    const defaultConfig = {};
    const schema = card.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    // 合并配置
    const mergedConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: userConfig.card_type,
      theme: userConfig.theme || 'auto',
      ...defaultConfig,
      ...userConfig
    };
    
    return mergedConfig;
  }

  async _renderCard() {
    try {
      // 获取卡片渲染结果
      const cardResult = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass
      );
      
      if (!cardResult) {
        throw new Error('卡片渲染返回空结果');
      }
      
      this._cardData = cardResult;
      
      // 获取主题样式
      const theme = themeSystem.getTheme(this.config.theme || 'auto');
      this._themeStyles = theme?.styles || '';
      this._cardStyles = cardResult.styles || '';
      
    } catch (error) {
      console.error('卡片渲染失败:', error);
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
      return html`
        <ha-card>
          <div class="cardforge-container">
            ${this._cardData.template}
          </div>
        </ha-card>
        <style>
          /* 注入主题样式 */
          ${this._themeStyles}
          
          /* 注入卡片特定样式 */
          ${this._cardStyles}
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
      this._cardData = null;
      this._error = null;
      this._renderCard().then(() => {
        this.requestUpdate();
      });
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
