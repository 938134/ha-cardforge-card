// src/ha-cardforge-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './cards/card-renderer.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardElement: { state: true },
    _error: { state: true }
  };

  constructor() {
    super();
    this._cardElement = null;
    this._error = null;
  }

  setConfig(config) {
    this.config = this._validateConfig(config);
    this._loadCard();
  }

  _validateConfig(config) {
    const defaults = {
      type: 'time-week',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date',
        week: 'sensor.xing_qi',
        lunar: 'sensor.nong_li'
      },
      show_seconds: true,
      tap_action: {
        action: 'more-info',
        entity: 'sensor.nong_li'
      }
    };
    
    return this._deepMerge(defaults, config);
  }

  _deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  _loadCard() {
    if (!this.config?.type) return;

    try {
      this._error = null;
      
      // 移除旧卡片
      if (this._cardElement) {
        this.shadowRoot.removeChild(this._cardElement);
        this._cardElement = null;
      }

      // 创建统一的卡片渲染器
      const cardElement = document.createElement('card-renderer');
      cardElement.setConfig(this.config);
      
      if (this.hass) {
        cardElement.hass = this.hass;
      }
      
      this._cardElement = cardElement;
      
      // 确保 shadowRoot 存在
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
      
      this.shadowRoot.appendChild(this._cardElement);

    } catch (error) {
      console.error('加载卡片失败:', error);
      this._showError(`卡片加载失败: ${error.message}`);
    }
  }

  _showError(message) {
    this._error = message;
    this.requestUpdate();
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this._cardElement) {
      this._cardElement.hass = this.hass;
    }
    
    if (changedProperties.has('config')) {
      this._loadCard();
    }
  }

  render() {
    if (this._error) {
      return html`
        <ha-card>
          <div class="card-content" style="padding: 20px; text-align: center; color: var(--error-color);">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p>${this._error}</p>
          </div>
        </ha-card>
      `;
    }

    return html`<div id="card-container"></div>`;
  }

  // Home Assistant 标准接口
  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      type: 'time-week',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date',
        week: 'sensor.xing_qi'
      }
    };
  }

  getCardSize() {
    return this._cardElement?.getCardSize ? this._cardElement.getCardSize() : 3;
  }
}

customElements.define('ha-cardforge-card', HaCardForgeCard);
customElements.define('card-renderer', CardRenderer);

// 注册到自定义卡片列表
if (window.customCards) {
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '时间卡片工坊',
    description: '专为时间显示设计的卡片集合',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge'
  });
}