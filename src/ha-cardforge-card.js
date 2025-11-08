import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './components/registry.js';
import './components/theme.js';

// 导出卡片类
export class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entityStates: { state: true },
    _error: { state: true }
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
    this._error = null;
  }

  async setConfig(config) {
    try {
      await window.Registry.initialize();
      this.config = this._validateConfig(config);
      console.log('✅ 卡片配置已设置:', this.config);
    } catch (error) {
      this._showError(`配置错误: ${error.message}`);
    }
  }

  _validateConfig(config) {
    if (!config.style) {
      const styles = window.Registry.getAllStyles();
      if (styles.length > 0) {
        config.style = styles[0].name;
      } else {
        throw new Error('没有可用的外观样式');
      }
    }

    if (!window.Registry.hasStyle(config.style)) {
      throw new Error(`未知的外观样式: ${config.style}`);
    }

    const styleConfig = window.Registry.getStyle(config.style);
    const defaults = {
      style: config.style,
      theme: 'default',
      entities: {},
      custom: {}
    };

    if (styleConfig.requiresEntities && styleConfig.entityInterfaces) {
      styleConfig.entityInterfaces.required?.forEach(entity => {
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

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntityStates();
    }
  }

  _updateEntityStates() {
    if (!this.hass || !this.config.entities) return;

    this._entityStates.clear();
    Object.entries(this.config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entityStates.set(key, this.hass.states[entityId]);
      }
    });
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
      default:
        console.warn('未知动作:', action);
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

  _showError(message) {
    this._error = message;
    this.requestUpdate();
  }

  _renderContent() {
    if (this._error) {
      return html`<div class="card-error">${this._error}</div>`;
    }

    const styleConfig = window.Registry.getStyle(this.config.style);
    if (!styleConfig) {
      return html`<div class="card-error">未知外观: ${this.config.style}</div>`;
    }

    if (styleConfig.requiresEntities && styleConfig.entityInterfaces) {
      const missing = styleConfig.entityInterfaces.required?.filter(
        entity => !this.config.entities?.[entity.key]
      ) || [];
      
      if (missing.length > 0) {
        return html`<div class="card-error">缺少必需实体: ${missing.map(e => e.description).join(', ')}</div>`;
      }
    }

    try {
      if (window.ThemeManager && this.config.theme) {
        window.ThemeManager.applyTheme(this, this.config.theme);
      }

      const renderResult = styleConfig.render(this.config, this.hass, this._entityStates);
      
      if (typeof renderResult === 'string') {
        const template = document.createElement('template');
        template.innerHTML = renderResult;
        return html`${template.content}`;
      }
      
      return renderResult;

    } catch (error) {
      console.error('渲染外观失败:', error);
      return html`<div class="card-error">渲染失败: ${error.message}</div>`;
    }
  }

  render() {
    return html`
      <ha-card @click=${() => this._handleAction(this.config.tap_action)}>
        <div class="cardforge-card">
          ${this._renderContent()}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    const styleConfig = window.Registry.getStyle(this.config.style);
    return styleConfig?.cardSize || 3;
  }

  static getConfigElement() {
    console.log('📝 获取配置编辑器元素');
    const editor = document.createElement('ha-cardforge-editor');
    console.log('✅ 编辑器实例创建成功:', editor);
    return editor;
  }

  static getStubConfig() {
    return {
      style: 'time-week',
      theme: 'default',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date',
        week: 'sensor.xing_qi'
      },
      custom: {},
      tap_action: {
        action: 'more-info'
      }
    };
  }
}