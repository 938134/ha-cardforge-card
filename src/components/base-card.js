import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './theme.js';

export class BaseCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entityStates: { state: true },
    _styles: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }
    
    .cardforge-card {
      position: relative;
      box-sizing: border-box;
    }
    
    .card-error {
      padding: 20px;
      text-align: center;
      color: var(--error-color);
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
    }
  `;

  constructor() {
    super();
    this._entityStates = new Map();
    this._styles = {};
  }

  setConfig(config) {
    this.config = config;
    this._validateConfig();
    this._generateStyles();
    
    // 应用主题
    if (window.ThemeManager && this.config.theme) {
      window.ThemeManager.applyTheme(this, this.config.theme);
    }
  }

  _validateConfig() {
    const cardConfig = window.CardRegistry.getCardConfig(this.config.type);
    if (!cardConfig) {
      throw new Error(`未知卡片类型: ${this.config.type}`);
    }

    // 验证必需实体
    if (cardConfig.entityInterfaces?.required) {
      cardConfig.entityInterfaces.required.forEach(entity => {
        if (!this.config.entities?.[entity.key]) {
          console.warn(`缺少必需实体: ${entity.key}`);
        }
      });
    }
  }

  _generateStyles() {
    const cardConfig = window.CardRegistry.getCardConfig(this.config.type);
    if (!cardConfig.layout) return;

    this._styles = {
      grid: `
        display: grid;
        grid-template-areas: ${cardConfig.layout.grid?.templateAreas || 'none'};
        grid-template-columns: ${cardConfig.layout.grid?.templateColumns || '1fr'};
        grid-template-rows: ${cardConfig.layout.grid?.templateRows || 'auto'};
        gap: ${cardConfig.layout.grid?.gap || '0'};
        ${cardConfig.layout.grid?.custom || ''}
      `,
      ...cardConfig.styles
    };
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntityStates();
    }
  }

  _updateEntityStates() {
    if (!this.hass || !this.config.entities) return;

    const entities = this.config.entities;
    Object.entries(entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entityStates.set(key, this.hass.states[entityId]);
      }
    });
    
    this.requestUpdate();
  }

  _getEntityState(entityKey) {
    return this._entityStates.get(entityKey);
  }

  _handleAction(actionConfig) {
    if (!actionConfig || !this.hass) return;

    const { action, entity, service, data } = actionConfig;
    
    switch (action) {
      case 'more-info':
        this._fireEvent('hass-more-info', { entityId: entity });
        break;
      case 'call-service':
        this._callService(service, entity, data);
        break;
      case 'navigate':
        this._fireEvent('location-changed', { navigation_path: data?.navigation_path });
        break;
      case 'url':
        window.open(data?.url, '_blank');
        break;
    }
  }

  _fireEvent(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail
    }));
  }

  _callService(service, entityId, data = {}) {
    const [domain, serviceName] = service.split('.');
    this.hass.callService(domain, serviceName, {
      entity_id: entityId,
      ...data
    });
  }

  _renderContent() {
    const cardConfig = window.CardRegistry.getCardConfig(this.config.type);
    if (!cardConfig || !cardConfig.template) {
      return html`<div class="card-error">卡片配置错误</div>`;
    }

    try {
      return cardConfig.template(this._entityStates, this.config, this.hass);
    } catch (error) {
      console.error('渲染卡片失败:', error);
      return html`<div class="card-error">渲染失败: ${error.message}</div>`;
    }
  }

  render() {
    if (!this.config) {
      return html`<ha-card><div class="card-error">未配置</div></ha-card>`;
    }

    return html`
      <ha-card>
        <div class="cardforge-card" style="${this._styles.grid || ''}">
          ${this._renderContent()}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    const cardConfig = window.CardRegistry.getCardConfig(this.config.type);
    return cardConfig?.cardSize || 3;
  }
}

customElements.define('base-card', BaseCard);