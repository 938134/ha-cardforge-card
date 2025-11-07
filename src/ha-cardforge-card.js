import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './components/card-registry.js';
import './components/base-card.js';

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

  async setConfig(config) {
    try {
      await window.CardRegistry.initialize();
      this.config = this._validateConfig(config);
      this._loadCard();
    } catch (error) {
      this._showError(`配置错误: ${error.message}`);
    }
  }

  _validateConfig(config) {
    if (!config.type) {
      const defaultCard = window.CardRegistry.getDefaultCard();
      config.type = defaultCard.type;
    }

    if (!window.CardRegistry.hasCardType(config.type)) {
      throw new Error(`不支持的卡片类型: ${config.type}`);
    }

    const cardConfig = window.CardRegistry.getCardConfig(config.type);
    const defaults = {
      type: config.type,
      theme: 'default',
      entities: {},
      style: {},
      advanced: {}
    };

    // 设置实体默认值
    if (cardConfig.entityInterfaces) {
      cardConfig.entityInterfaces.required?.forEach(entity => {
        if (entity.default) {
          defaults.entities[entity.key] = entity.default;
        }
      });
    }

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
      
      if (this._cardElement) {
        this.shadowRoot.removeChild(this._cardElement);
        this._cardElement = null;
      }

      const cardElement = document.createElement('base-card');
      cardElement.setConfig(this.config);
      
      if (this.hass) {
        cardElement.hass = this.hass;
      }
      
      this._cardElement = cardElement;
      
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