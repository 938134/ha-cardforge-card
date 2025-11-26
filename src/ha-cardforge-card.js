// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { cardRegistry } from './core/card-registry.js';
import { designSystem } from './core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardInstance: { state: true },
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

      .cardforge-error-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        min-height: 80px;
        text-align: center;
      }

      .cardforge-error-message {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }

      /* 确保卡片容器正确继承高度 */
      ha-card {
        height: 100%;
      }

      .cardforge-container > * {
        height: 100%;
      }
    `
  ];

  constructor() {
    super();
    this._cardInstance = null;
    this._error = null;
    this._loading = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      // 验证配置
      this.config = this._validateConfig(config);
      
      // 初始化卡片系统
      await cardRegistry.initialize();
      
      // 加载卡片实例
      this._cardInstance = cardRegistry.createCardInstance(this.config.card_type);
      
      if (!this._cardInstance) {
        throw new Error(`未知卡片类型: ${this.config.card_type}`);
      }
      
    } catch (error) {
      console.error('卡片加载失败:', error);
      this._error = error;
    } finally {
      this._loading = false;
      this.requestUpdate();
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
      areas: {},
      blocks: {},
      ...config
    };
  }

  render() {
    if (this._error) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
              <div class="cf-error cf-text-xl cf-mb-md">❌</div>
              <div class="cf-text-lg cf-font-bold cf-mb-sm">卡片加载失败</div>
              <div class="cf-text-sm cf-text-secondary">${this._error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    if (this._loading || !this._cardInstance) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
              <ha-circular-progress indeterminate></ha-circular-progress>
              <div class="cf-text-md cf-mt-md">加载中...</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    try {
      const renderResult = this._cardInstance.render(this.config, this.hass, this.config.entities || {});
      
      return html`
        <ha-card>
          <div class="cardforge-container">
            ${unsafeHTML(renderResult.template)}
          </div>
        </ha-card>
        
        <style>
          ${renderResult.styles}
        </style>
      `;
    } catch (error) {
      console.error('卡片渲染失败:', error);
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
              <div class="cf-warning cf-text-xl cf-mb-md">⚠️</div>
              <div class="cf-text-lg cf-font-bold cf-mb-sm">卡片渲染错误</div>
              <div class="cf-text-sm cf-text-secondary">${error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.requestUpdate();
    }
  }

  static getConfigElement() {
    return document.createElement('card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'welcome-card',
      theme: 'auto',
      areas: {},
      blocks: {}
    };
  }

  getCardSize() {
    // 根据卡片类型返回合适的卡片大小
    if (this._cardInstance) {
      const manifest = this._cardInstance.getManifest?.();
      if (manifest?.category === '时间') return 2;
      if (manifest?.category === '信息') return 3;
      if (manifest?.category === '文化') return 4;
    }
    return 3;
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };