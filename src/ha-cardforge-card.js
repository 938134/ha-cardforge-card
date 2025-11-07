// src/ha-cardforge-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './components/dynamic-loader.js';
import './components/card-config.js';

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
    // 确保卡片系统已初始化
    await window.DynamicLoader.initialize();
    
    this.config = this._validateConfig(config);
    await this._loadCard();
  }

  _validateConfig(config) {
    const cardType = config.type || 'time-week';
    
    // 验证卡片类型是否存在
    if (!window.CardConfig.hasCardType(cardType)) {
      console.warn(`卡片类型 ${cardType} 不存在，使用默认卡片`);
      config.type = 'time-week';
    }
    
    const cardConfig = window.CardConfig.getCardConfig(config.type);
    
    const defaults = {
      type: config.type,
      theme: 'default'
    };
    
    // 为卡片类型设置特定默认值
    if (cardConfig.fields) {
      cardConfig.fields.forEach(field => {
        if (field.default !== undefined) {
          this._setNestedValue(defaults, field.key, field.default);
        }
      });
    }
    
    return this._deepMerge(defaults, config);
  }

  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, obj);
    target[lastKey] = value;
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
      this._error = null;
      
      // 移除旧卡片
      if (this._cardElement) {
        this.shadowRoot.removeChild(this._cardElement);
        this._cardElement = null;
      }

      // 动态加载卡片组件
      const CardClass = await window.DynamicLoader.loadCard(this.config.type);
      const tagName = window.DynamicLoader.getTagName(this.config.type);
      
      const cardElement = document.createElement(tagName);
      cardElement.setConfig(this.config);
      
      if (this.hass) {
        cardElement.hass = this.hass;
      }
      
      this._cardElement = cardElement;
      
      // 确保 shadowRoot 存在
      if (!this.shadowRoot) {
        await this.updateComplete;
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
    // 使用同步方式获取默认配置
    const defaultCard = window.CardConfig.getAllCardConfigs()[0];
    const stubConfig = {
      type: defaultCard?.type || 'time-week'
    };
    
    // 添加字段默认值
    if (defaultCard?.fields) {
      defaultCard.fields.forEach(field => {
        if (field.default !== undefined) {
          const keys = field.key.split('.');
          const lastKey = keys.pop();
          const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
          }, stubConfig);
          target[lastKey] = field.default;
        }
      });
    }
    
    return stubConfig;
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
    name: '时间卡片工坊',
    description: '专为时间显示设计的卡片集合',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge'
  });
}