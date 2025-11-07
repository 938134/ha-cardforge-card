import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './cards/standard-card.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardElement: { state: true }
  };

  constructor() {
    super();
    this._cardElement = null;
  }

  setConfig(config) {
    this.config = this._validateConfig(config);
    this._loadCard();
  }

  _validateConfig(config) {
    const defaults = {
      type: 'standard',
      layout: {
        header: { title: '卡片工坊', icon: 'mdi:widgets', visible: true },
        content: { entities: [] },
        footer: { visible: true, show_timestamp: false, show_entity_count: true }
      },
      theme: 'default'
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

  async _loadCard() {
    if (!this.config?.type) return;

    try {
      if (this._cardElement) {
        this.shadowRoot.removeChild(this._cardElement);
      }

      const cardType = this.config.type;
      let cardElement;
      
      switch (cardType) {
        case 'standard':
          cardElement = document.createElement('standard-card');
          break;
        case 'button':
          cardElement = document.createElement('button-card');
          break;
        default:
          throw new Error(`不支持的卡片类型: ${cardType}`);
      }

      cardElement.setConfig(this.config);
      cardElement.hass = this.hass;
      
      this._cardElement = cardElement;
      this.shadowRoot.appendChild(this._cardElement);

    } catch (error) {
      console.error('加载卡片失败:', error);
      this._showError(error.message);
    }
  }

  _showError(message) {
    if (this._cardElement) {
      this.shadowRoot.removeChild(this._cardElement);
    }
    
    this._cardElement = document.createElement('ha-card');
    this._cardElement.innerHTML = `
      <div class="card-content" style="padding: 20px; text-align: center; color: var(--error-color);">
        <ha-icon icon="mdi:alert-circle"></ha-icon>
        <p>${message}</p>
      </div>
    `;
    this.shadowRoot.appendChild(this._cardElement);
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
    return html`<div id="card-container"></div>`;
  }

  // Home Assistant 标准接口
  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      type: 'standard',
      layout: {
        header: { title: '卡片工坊', icon: 'mdi:widgets', visible: true },
        content: { entities: [] },
        footer: { visible: true }
      }
    };
  }

  getCardSize() {
    return this._cardElement?.getCardSize ? this._cardElement.getCardSize() : 3;
  }
}

customElements.define('ha-cardforge-card', HaCardForgeCard);

// 注册到自定义卡片列表
if (window.customCards) {
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于 LitElement 的可视化卡片编辑器',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge'
  });
}