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
    console.log('🔧 [CardForge] setConfig 被调用:', config);
    
    if (!config) {
      console.error('❌ [CardForge] config 为 undefined');
      return;
    }
    
    this._config = this._validateConfig(config);
    
    try {
      console.log('🔍 [CardForge] 开始加载插件:', this._config.plugin);
      const plugin = await this._loadPlugin(this._config.plugin);
      console.log('✅ [CardForge] 插件加载成功:', this._config.plugin, plugin);
      
      const buttonConfig = this._convertToButtonCard(plugin);
      console.log('🔧 [CardForge] 转换后的 button-card 配置:', buttonConfig);
      
      console.log('🚀 [CardForge] 调用父类 setConfig');
      super.setConfig(buttonConfig);
      console.log('✅ [CardForge] button-card 配置设置成功');
      
      // 检查设置后的状态
      setTimeout(() => {
        this._checkButtonCardState();
      }, 100);
      
    } catch (error) {
      console.error('❌ [CardForge] 加载插件失败:', error);
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
    
    console.log('📝 [CardForge] 插件模板:', template);
    console.log('🎨 [CardForge] 插件样式:', styles);
    
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
      <div style="padding: 20px; text-align: center; color: var(--error-color); border: 2px solid red; background: #ffebee;">
        <div style="font-size: 2em;">❌</div>
        <div style="font-weight: bold;">卡片加载失败</div>
        <div style="font-size: 0.9em;">${error.message}</div>
        <div style="font-size: 0.8em; margin-top: 10px;">请检查控制台获取详细信息</div>
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
          `
        }
      }
    };
  }

  _checkButtonCardState() {
    console.log('🔍 [CardForge] 检查 button-card 状态');
    console.log('📊 [CardForge] 当前元素状态:', {
      shadowRoot: !!this.shadowRoot,
      children: this.children?.length || 0,
      innerHTML: this.innerHTML?.substring(0, 200) || '空'
    });
    
    if (this.shadowRoot) {
      const buttonCardElements = this.shadowRoot.querySelectorAll('*');
      console.log('🎭 [CardForge] 影子根元素数量:', buttonCardElements.length);
      
      buttonCardElements.forEach((el, index) => {
        if (index < 5) { // 只显示前5个元素避免过多日志
          console.log(`🎭 [CardForge] 元素 ${index}:`, el.tagName, el.className);
        }
      });
    } else {
      console.log('❌ [CardForge] 没有影子根');
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this._config && this._config.plugin) {
      console.log('🔄 [CardForge] Hass 更新，重新配置');
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