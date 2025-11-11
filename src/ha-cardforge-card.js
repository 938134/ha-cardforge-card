// src/ha-cardforge-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { ThemeManager } from './core/theme-manager.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugin: { state: true },
    _entities: { state: true },
    _error: { state: true },
    _loading: { state: true }
  };

  constructor() {
    super();
    this._pluginCache = new Map();
    this._plugin = null;
    this._entities = {};
    this._error = null;
    this._loading = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      // 确保插件注册表已初始化
      await PluginRegistry.initialize();
      
      this.config = this._validateConfig(config);
      
      // 加载插件
      this._plugin = await this._loadPlugin(this.config.plugin);
      
      // 更新实体数据
      this._updateEntities();
      
      // 应用主题
      if (this.config.theme) {
        ThemeManager.applyTheme(this, this.config.theme);
      }
      
    } catch (error) {
      console.error('卡片加载失败:', error);
      this._error = error;
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  _validateConfig(config) {
    if (!config || !config.plugin) {
      throw new Error('必须指定 plugin 参数');
    }
    
    return {
      plugin: '',
      entities: {},
      theme: 'default',
      ...config
    };
  }

  async _loadPlugin(pluginId) {
    // 检查缓存
    if (this._pluginCache.has(pluginId)) {
      return this._pluginCache.get(pluginId);
    }

    // 从注册表获取插件
    const plugin = PluginRegistry.createPluginInstance(pluginId);
    if (!plugin) {
      throw new Error(`未知插件: ${pluginId}`);
    }
    
    // 验证插件接口
    if (typeof plugin.getTemplate !== 'function' || 
        typeof plugin.getStyles !== 'function') {
      throw new Error('插件接口不完整');
    }
    
    // 缓存插件
    this._pluginCache.set(pluginId, plugin);
    return plugin;
  }

  _updateEntities() {
    this._entities = {};
    
    if (!this.hass || !this.config.entities) {
      return;
    }
    
    Object.entries(this.config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entities[key] = this.hass.states[entityId];
      }
    });
  }

  render() {
    if (this._error) {
      return html`
        <ha-card>
          <div class="error-container">
            <div class="error-icon">❌</div>
            <div class="error-title">卡片加载失败</div>
            <div class="error-message">${this._error.message}</div>
          </div>
        </ha-card>
        
        <style>
          .error-container {
            padding: 20px;
            text-align: center;
            color: var(--error-color);
          }
          .error-icon {
            font-size: 2em;
            margin-bottom: 8px;
          }
          .error-title {
            font-weight: bold;
            margin-bottom: 8px;
          }
          .error-message {
            font-size: 0.9em;
            opacity: 0.8;
          }
        </style>
      `;
    }
    
    if (this._loading || !this._plugin) {
      return html`
        <ha-card>
          <div class="loading-container">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div class="loading-text">加载中...</div>
          </div>
        </ha-card>
        
        <style>
          .loading-container {
            padding: 40px;
            text-align: center;
            color: var(--secondary-text-color);
          }
          .loading-text {
            margin-top: 8px;
          }
        </style>
      `;
    }
    
    try {
      const template = this._plugin.getTemplate(this.config, this.hass, this._entities);
      const styles = this._plugin.getStyles(this.config);

      return html`
        <ha-card>
          <div class="cardforge-container">
            ${unsafeHTML(template)}
          </div>
        </ha-card>
        
        <style>
          ${styles}
          
          .cardforge-container {
            position: relative;
            min-height: 80px;
          }
        </style>
      `;
    } catch (error) {
      console.error('插件渲染失败:', error);
      return html`
        <ha-card>
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="error-title">插件渲染错误</div>
            <div class="error-message">${error.message}</div>
          </div>
        </ha-card>
      `;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntities();
      this.requestUpdate();
    }
  }

  // Home Assistant 卡片接口
  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      plugin: 'simple-clock',
      entities: {},
      theme: 'default'
    };
  }

  getCardSize() {
    return 3;
  }
}

export { HaCardForgeCard };
