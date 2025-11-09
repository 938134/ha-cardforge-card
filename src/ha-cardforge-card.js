// ha-cardforge-card/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';

const ButtonCard = customElements.get('button-card');

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entities: { state: true }
  };

  constructor() {
    super();
    this._entities = new Map();
    this._pluginManager = null;
    this._themeManager = null;
  }

  async setConfig(config) {
    this._config = this._validateConfig(config);
    this._updateEntities();
    
    // 延迟加载管理器
    await this._loadManagers();
    
    try {
      const plugin = await this._pluginManager.loadPlugin(this._config.plugin);
      const buttonConfig = this._convertToButtonCard(this._config, plugin);
      super.setConfig(buttonConfig);
    } catch (error) {
      console.error('加载插件失败:', error);
      const fallbackPlugin = await this._pluginManager.getFallbackPlugin(this._config.plugin);
      const buttonConfig = this._convertToButtonCard(this._config, fallbackPlugin);
      super.setConfig(buttonConfig);
    }
  }

  async _loadManagers() {
    if (!this._pluginManager) {
      const { PluginManager } = await import('./components/plugin.js');
      this._pluginManager = new PluginManager();
    }
    if (!this._themeManager) {
      const { ThemeManager } = await import('./components/theme.js');
      this._themeManager = new ThemeManager();
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

  _convertToButtonCard(config, plugin) {
    const entities = Object.fromEntries(this._entities);
    
    return {
      type: 'custom:button-card',
      template: plugin.getTemplate(config, entities),
      styles: plugin.getStyles(config) + this._themeManager.getThemeStyles(config.theme),
      ...this._themeManager.applyTheme(config)
    };
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntities();
      this.setConfig(this._config);
    }
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

// 只在未注册的情况下注册组件
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };