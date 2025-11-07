import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

// 工具函数
const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

// 主卡片路由器
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
    this.config = config;
    this._loadCard();
  }

  async _loadCard() {
    if (!this.config?.type) return;

    try {
      // 动态加载对应的卡片
      const module = await import(`./cards/${this.config.type}-card.js`);
      const CardClass = module[this._getClassName(this.config.type)];
      
      if (this._cardElement) {
        this.shadowRoot.removeChild(this._cardElement);
      }

      this._cardElement = document.createElement(`${this.config.type}-card`);
      this._cardElement.hass = this.hass;
      this._cardElement.config = this.config;
      
      if (!this.shadowRoot) {
        await this.updateComplete;
      }
      this.shadowRoot.appendChild(this._cardElement);

    } catch (error) {
      console.error(`加载卡片失败: ${this.config.type}`, error);
      this._showError(`不支持的卡片类型: ${this.config.type}`);
    }
  }

  _getClassName(type) {
    return type.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('') + 'Card';
  }

  _showError(message) {
    if (this._cardElement) {
      this.shadowRoot.removeChild(this._cardElement);
    }
    this._cardElement = document.createElement('div');
    this._cardElement.innerHTML = `
      <ha-card>
        <div class="card-content" style="padding: 20px; text-align: center; color: var(--error-color);">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${message}</p>
        </div>
      </ha-card>
    `;
    this.shadowRoot.appendChild(this._cardElement);
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this._cardElement) {
      this._cardElement.hass = this.hass;
    }
    if (changedProperties.has('config') && this.config) {
      this._loadCard();
    }
  }

  render() {
    return html`<div id="card-container"></div>`;
  }

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

// 创建 Shadow Root
customElements.define('ha-cardforge-card', class extends HaCardForgeCard {
  createRenderRoot() {
    return this;
  }
});
