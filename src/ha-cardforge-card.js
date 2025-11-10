// src/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';

const ButtonCard = customElements.get('button-card');

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  constructor() {
    super();
    this._pluginCache = new Map();
  }

  async setConfig(config) {
    this._config = this._validateConfig(config);
    
    try {
      const plugin = await this._loadPlugin(this._config.plugin);
      const buttonConfig = this._convertToButtonCard(plugin);
      super.setConfig(buttonConfig);
    } catch (error) {
      console.error('加载插件失败:', error);
      super.setConfig(this._getErrorConfig(error));
    }
  }

  _validateConfig(config) {
    if (!config.plugin) {
      throw new Error('必须指定 plugin 参数');
    }
    return {
      plugin: '',
      entities: {},
      ...config
    };
  }

  async _loadPlugin(pluginId) {
    // 缓存检查
    if (this._pluginCache.has(pluginId)) {
      return this._pluginCache.get(pluginId);
    }

    try {
      // 动态加载插件
      const pluginModule = await import(`./plugins/${pluginId}.js`);
      const pluginInstance = new pluginModule.default();
      
      // 验证插件接口
      if (typeof pluginInstance.getTemplate !== 'function' || 
          typeof pluginInstance.getStyles !== 'function') {
        throw new Error('插件接口不完整');
      }
      
      this._pluginCache.set(pluginId, pluginInstance);
      return pluginInstance;
    } catch (error) {
      throw new Error(`加载插件 ${pluginId} 失败: ${error.message}`);
    }
  }

  _convertToButtonCard(plugin) {
    const entities = this._getEntities();
    
    return {
      type: 'custom:button-card',
      template: plugin.getTemplate(this._config, this.hass, entities),
      styles: plugin.getStyles(this._config),
      // 继承 button-card 的其他配置
      ...this._config
    };
  }

  _getEntities() {
    const entities = {};
    if (!this.hass || !this._config.entities) return entities;
    
    Object.entries(this._config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        entities[key] = this.hass.states[entityId];
      }
    });
    
    return entities;
  }

  _getErrorConfig(error) {
    return {
      type: 'custom:button-card',
      template: `
        <div style="padding: 20px; text-align: center; color: var(--error-color);">
          <div style="font-size: 2em;">❌</div>
          <div style="font-weight: bold;">卡片加载失败</div>
          <div style="font-size: 0.9em;">${error.message}</div>
        </div>
      `,
      styles: ''
    };
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      // Hass 更新时重新设置配置
      this.setConfig(this._config);
    }
  }

  // Lovelace 编辑器集成
  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      plugin: 'simple-clock'
    };
  }
}

export { HaCardForgeCard };
