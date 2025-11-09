// src/main-card.js
import { BaseCard } from './core/base-card.js';

const ButtonCard = customElements.get('button-card');

export class HaCardForgeCard extends BaseCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugin: { state: true },
    _error: { state: true }
  };

  constructor() {
    super();
    this._plugin = null;
    this._error = null;
  }

  async setConfig(config) {
    this._config = this.validateConfig(config);
    this.updateEntities(this.hass);
    this._error = null;
    
    try {
      this._plugin = await this.pluginManager.loadPlugin(this._config.plugin);
      
      // 验证配置
      const validation = this._plugin.validateConfig?.(this._config) || { valid: true, errors: [] };
      if (!validation.valid) {
        this._error = validation.errors.join(', ');
      }
      
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
      
    } catch (error) {
      this._error = `插件加载失败: ${error.message}`;
      console.error('卡片配置错误:', error);
      
      this._plugin = this.pluginManager.getFallbackPlugin(this._config.plugin, error.message);
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
    }
  }

  _convertToButtonCard(config, plugin) {
    const entities = this.getEntitiesForPlugin(plugin);
    const template = plugin.getTemplate(config, entities);
    const styles = plugin.getStyles(config) + this.themeManager.getThemeStyles(config.theme);
    
    return {
      type: 'custom:button-card',
      template: template,
      styles: this._convertStyles(styles),
      ...this._applyTheme(config)
    };
  }

  _applyTheme(config) {
    const themeConfigs = {
      'dark': { 
        style: 'background: #1e1e1e; color: white;'
      },
      'material': { 
        style: 'background: #fafafa; color: #212121;'
      },
      'glass': {
        style: 'background: rgba(255, 255, 255, 0.1); color: white; backdrop-filter: blur(10px);'
      }
    };
    return themeConfigs[config.theme] || {};
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.updateEntities(this.hass);
      if (this._config) {
        this.setConfig(this._config);
      }
    }
  }

  render() {
    if (this._error) {
      return this.renderError(this._error);
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