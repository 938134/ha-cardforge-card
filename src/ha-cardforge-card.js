// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { cardSystem } from './core/card-system.js';
import { themeSystem } from './core/theme-system.js';
import { designSystem } from './core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardData: { state: true },
    _error: { state: true },
    _loading: { state: true }
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
      
      ha-circular-progress {
        margin-bottom: 12px;
      }
      
      /* 确保卡片容器正确继承高度 */
      ha-card {
        height: 100%;
        overflow: hidden;
      }
    `
  ];

  constructor() {
    super();
    this._cardData = null;
    this._error = null;
    this._loading = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      // 验证配置
      this.config = this._validateConfig(config);
      
      // 等待系统初始化
      await cardSystem.initialize();
      await themeSystem.initialize();
      
      // 获取主题变量
      const themeVariables = themeSystem.getThemeVariables(this.config.theme || 'auto');
      
      // 渲染卡片
      this._cardData = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass,
        themeVariables
      );
      
      this._loading = false;
      
    } catch (error) {
      console.error('❌ 卡片加载失败:', error);
      this._error = error.message || '未知错误';
      this._loading = false;
    }
  }

  _validateConfig(config) {
    if (!config || !config.card_type) {
      throw new Error('必须指定 card_type 参数');
    }
    
    return {
      type: 'custom:ha-cardforge-card',
      card_type: '',
      theme: 'auto',
      ...config
    };
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
    
    if (this._loading || !this._cardData) {
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
      const themeStyles = themeSystem.getThemeStyles(this.config.theme || 'auto');
      const cardStyles = this._cardData.styles || '';
      
      return html`
        <ha-card>
          <div class="cardforge-container">
            ${unsafeHTML(this._cardData.template)}
          </div>
        </ha-card>
        
        <style>
          ${themeStyles}
          ${cardStyles}
        </style>
      `;
    } catch (error) {
      console.error('❌ 卡片渲染失败:', error);
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
      this._updateCard();
    }
  }

  async _updateCard() {
    if (!this.config?.card_type) return;
    
    try {
      const themeVariables = themeSystem.getThemeVariables(this.config.theme || 'auto');
      this._cardData = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass,
        themeVariables
      );
      this.requestUpdate();
    } catch (error) {
      console.warn('更新卡片失败:', error);
    }
  }

  getCardSize() {
    const card = cardSystem.getCard(this.config?.card_type);
    return card?.layout?.recommendedSize || 3;
  }
}

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
