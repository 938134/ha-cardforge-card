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
    _loading: { state: true },
    _cardNotFound: { state: true }
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
        min-height: 120px;
        text-align: center;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-lg);
      }
      
      .error-icon {
        font-size: 2.5em;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      .error-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 8px;
      }
      
      .error-message {
        font-size: 0.9em;
        line-height: 1.4;
        margin-bottom: 16px;
        max-width: 80%;
      }
      
      .error-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      
      .error-btn {
        padding: 8px 16px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
      }
      
      .error-btn:hover {
        background: var(--cf-background);
      }
      
      .error-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }
      
      .error-btn.primary:hover {
        background: var(--cf-primary-color);
        opacity: 0.9;
      }
      
      .cardforge-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 120px;
        color: var(--cf-text-secondary);
      }
      
      ha-circular-progress {
        margin-bottom: 16px;
      }
      
      .loading-text {
        font-size: 0.9em;
      }
      
      /* 卡片未找到样式 */
      .card-not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 160px;
        text-align: center;
        padding: var(--cf-spacing-xl);
      }
      
      .card-not-found-icon {
        font-size: 3em;
        margin-bottom: 20px;
        opacity: 0.5;
      }
      
      .card-not-found-title {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 8px;
      }
      
      .card-not-found-message {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
        margin-bottom: 20px;
        max-width: 80%;
      }
      
      .available-cards {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-top: 16px;
      }
      
      .available-card {
        padding: 6px 12px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-secondary);
        font-size: 0.8em;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }
      
      .available-card:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
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
    this._cardNotFound = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      this._cardNotFound = false;
      
      // 验证配置
      this.config = this._validateConfig(config);
      
      // 等待系统初始化
      await cardSystem.initialize();
      await themeSystem.initialize();
      
      // 检查卡片是否存在
      const card = cardSystem.getCard(this.config.card_type);
      if (!card) {
        this._cardNotFound = true;
        this._loading = false;
        return;
      }
      
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
    if (!config) {
      throw new Error('配置为空');
    }
    
    if (!config.card_type) {
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
      return this._renderError(this._error);
    }
    
    if (this._cardNotFound) {
      return this._renderCardNotFound();
    }
    
    if (this._loading || !this._cardData) {
      return this._renderLoading();
    }
    
    return this._renderCard();
  }

  _renderError(message) {
    return html`
      <ha-card>
        <div class="cardforge-container">
          <div class="cardforge-error">
            <div class="error-icon">❌</div>
            <div class="error-title">卡片加载失败</div>
            <div class="error-message">${message}</div>
            <div class="error-actions">
              <button class="error-btn" @click=${this._reloadCard}>
                重试
              </button>
              <button class="error-btn primary" @click=${this._openEditor}>
                编辑配置
              </button>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderCardNotFound() {
    const availableCards = cardSystem.getAllCards();
    
    return html`
      <ha-card>
        <div class="cardforge-container">
          <div class="card-not-found">
            <div class="card-not-found-icon">🔍</div>
            <div class="card-not-found-title">卡片未找到</div>
            <div class="card-not-found-message">
              卡片类型 "<strong>${this.config?.card_type}</strong>" 不存在。
              请检查卡片类型是否正确，或从以下可用卡片中选择：
            </div>
            
            ${availableCards.length > 0 ? html`
              <div class="available-cards">
                ${availableCards.slice(0, 8).map(card => html`
                  <div 
                    class="available-card"
                    @click=${() => this._useCard(card.id)}
                    title="${card.description || card.name}"
                  >
                    ${card.icon} ${card.name}
                  </div>
                `)}
              </div>
              
              ${availableCards.length > 8 ? html`
                <div style="font-size: 0.8em; color: var(--cf-text-secondary); margin-top: 8px;">
                  还有 ${availableCards.length - 8} 张更多卡片...
                </div>
              ` : ''}
            ` : html`
              <div class="error-message">暂无可用卡片</div>
            `}
            
            <div class="error-actions" style="margin-top: 24px;">
              <button class="error-btn primary" @click=${this._openEditor}>
                编辑配置
              </button>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderLoading() {
    return html`
      <ha-card>
        <div class="cardforge-container">
          <div class="cardforge-loading">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div class="loading-text">
              ${this.config?.card_type ? 
                `加载卡片: ${this.config.card_type}` : 
                '初始化卡片...'}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderCard() {
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
      return this._renderError(`渲染错误: ${error.message}`);
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
      const card = cardSystem.getCard(this.config.card_type);
      if (!card) {
        this._cardNotFound = true;
        return;
      }
      
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

  _reloadCard() {
    this.setConfig(this.config);
  }

  _useCard(cardId) {
    this.config = { ...this.config, card_type: cardId };
    this.setConfig(this.config);
  }

  _openEditor() {
    // 触发 Home Assistant 编辑器打开
    const event = new Event('hass-more-info', { 
      bubbles: true, 
      composed: true 
    });
    event.detail = { entityId: null };
    this.dispatchEvent(event);
  }

  getCardSize() {
    if (this._error || this._cardNotFound || this._loading) {
      return 3;
    }
    
    const card = cardSystem.getCard(this.config?.card_type);
    return card?.layout?.recommendedSize || 3;
  }
}

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
