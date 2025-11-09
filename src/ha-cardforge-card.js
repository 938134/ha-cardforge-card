// src/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PLUGIN_REGISTRY } from './core/plugin-registry.js';

const ButtonCard = customElements.get('button-card');

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  constructor() {
    super();
    this._pluginCache = new Map();
    this._config = {};
  }

  async setConfig(config) {
    console.log('🔧 setConfig 被调用:', config);
    
    if (!config) {
      console.error('❌ config 为 undefined');
      return;
    }
    
    this._config = this._validateConfig(config);
    
    try {
      const plugin = await this._loadPlugin(this._config.plugin);
      console.log('✅ 插件加载成功:', this._config.plugin);
      
      const buttonConfig = this._convertToButtonCard(plugin);
      console.log('🔧 转换后的 button-card 配置:', buttonConfig);
      
      super.setConfig(buttonConfig);
      console.log('✅ button-card 配置设置成功');
    } catch (error) {
      console.error('❌ 加载插件失败:', error);
      super.setConfig(this._getErrorConfig(error));
    }
  }

  _validateConfig(config) {
    if (!config || !config.plugin) {
      throw new Error('必须指定 plugin 参数');
    }
    return {
      plugin: '',
      entities: {},
      ...config
    };
  }

  async _loadPlugin(pluginId) {
    if (this._pluginCache.has(pluginId)) {
      return this._pluginCache.get(pluginId);
    }

    try {
      const PluginClass = PLUGIN_REGISTRY[pluginId];
      if (!PluginClass) {
        throw new Error(`未知插件: ${pluginId}`);
      }
      
      const pluginInstance = new PluginClass();
      
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
    const template = plugin.getTemplate(this._config, this.hass, entities);
    const styles = plugin.getStyles(this._config);
    
    console.log('📝 插件模板:', template);
    console.log('🎨 插件样式:', styles);
    
    return {
      type: 'custom:button-card',
      section_mode: true,
      custom_fields: {
        card: template
      },
      styles: {
        custom_fields: {
          card: [
            `ha-card { background: transparent; border: none; box-shadow: none; }`,
            `:host { display: block; }`,
            styles
          ].join(' ')
        }
      },
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
    const errorHtml = `
      <div style="padding: 20px; text-align: center; color: var(--error-color); border: 2px solid red;">
        <div style="font-size: 2em;">❌</div>
        <div style="font-weight: bold;">卡片加载失败</div>
        <div style="font-size: 0.9em;">${error.message}</div>
        <div style="font-size: 0.8em; margin-top: 10px;">调试信息</div>
      </div>
    `;
    
    return {
      type: 'custom:button-card',
      section_mode: true,
      custom_fields: {
        card: errorHtml
      },
      styles: {
        custom_fields: {
          card: `
            ha-card { background: transparent; border: none; box-shadow: none; }
            :host { display: block; }
            .card { 
              padding: 20px; 
              text-align: center; 
              color: var(--error-color);
              font-family: var(--paper-font-common-nowrap_-_font-family);
            }
          `
        }
      }
    };
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this._config && this._config.plugin) {
      console.log('🔄 Hass 更新，重新配置');
      this.setConfig(this._config);
    }
  }

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