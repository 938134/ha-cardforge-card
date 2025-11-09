// ha-cardforge-card/src/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginManager, FallbackPlugin } from './components/plugin.js';

const ButtonCard = customElements.get('button-card');

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entities: { state: true },
    _plugin: { state: true },
    _error: { state: true }
  };

  constructor() {
    super();
    this._entities = new Map();
    this._pluginManager = new PluginManager();
    this._plugin = null;
    this._error = null;
  }

  async setConfig(config) {
    this._config = this._validateConfig(config);
    this._updateEntities();
    this._error = null;
    
    try {
      this._plugin = await this._pluginManager.loadPlugin(this._config.plugin);
      
      const validation = this._validateEntities();
      if (!validation.valid) {
        this._error = validation.errors.join(', ');
      }
      
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
      
    } catch (error) {
      this._error = `插件加载失败: ${error.message}`;
      console.error('卡片配置错误:', error);
      
      this._plugin = new FallbackPlugin(this._config.plugin);
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
    }
  }

  _validateConfig(config) {
    return {
      plugin: '',
      theme: 'default',
      entities: {},
      custom: {},
      ...config
    };
  }

  _updateEntities() {
    this._entities.clear();
    if (!this.hass || !this._config.entities) return;
    
    Object.entries(this._config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entities.set(key, this.hass.states[entityId]);
      }
    });
  }

  _validateEntities() {
    const requirements = this._plugin?.getEntityRequirements?.() || { required: [] };
    const errors = [];
    
    requirements.required.forEach(req => {
      if (!this._config.entities?.[req.key]) {
        errors.push(`缺少必需实体: ${req.description}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }

  _convertToButtonCard(config, plugin) {
    const entities = Object.fromEntries(this._entities);
    
    return {
      type: 'custom:button-card',
      template: plugin.getTemplate(config, entities),
      styles: plugin.getStyles(config) + this._getThemeStyles(config.theme),
      ...this._applyTheme(config)
    };
  }

  _getThemeStyles(theme) {
    const themes = {
      'default': `
        .cardforge-card { 
          background: var(--card-background-color); 
          color: var(--primary-text-color);
        }
      `,
      'dark': `
        .cardforge-card { 
          background: #1e1e1e; 
          color: white;
        }
      `,
      'material': `
        .cardforge-card { 
          background: #fafafa; 
          color: #212121;
          border-radius: 8px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        }
      `
    };
    return themes[theme] || themes.default;
  }

  _applyTheme(config) {
    const themeConfigs = {
      'dark': { style: 'background: #1e1e1e; color: white;' },
      'material': { style: 'background: #fafafa; color: #212121;' }
    };
    return themeConfigs[config.theme] || {};
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntities();
      if (this._config) {
        this.setConfig(this._config);
      }
    }
  }

  render() {
    if (this._error) {
      return html`
        <div class="cardforge-error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <div>${this._error}</div>
        </div>
      `;
    }
    return super.render();
  }

  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      plugin: 'time-week',
      theme: 'default',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date'
      }
    };
  }
}

export { HaCardForgeCard };