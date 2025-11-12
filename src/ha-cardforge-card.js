// src/ha-cardforge-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { PluginRegistry } from './core/plugin-registry.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _pluginInstance: { state: true },
    _entities: { state: true },
    _error: { state: true },
    _loading: { state: true },
    _lastConfig: { state: true }
  };

  constructor() {
    super();
    this._pluginCache = new Map();
    this._pluginInstance = null;
    this._entities = {};
    this._error = null;
    this._loading = false;
    this._lastConfig = null;
    this._unsubscribe = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // 监听插件注册表事件
    this._unsubscribe = PluginRegistry.on('plugin-added', (pluginId) => {
      if (this.config?.plugin === pluginId) {
        this._reloadPlugin();
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this._pluginInstance?.onDestroy) {
      this._pluginInstance.onDestroy();
    }
  }

  async setConfig(config) {
    if (this._isSameConfig(config)) return;

    try {
      this._loading = true;
      this._error = null;
      this._lastConfig = JSON.parse(JSON.stringify(config));
      
      // 验证配置
      this.config = this._validateConfig(config);
      
      // 等待插件注册表
      await PluginRegistry.initialize();
      
      // 加载插件
      await this._loadPlugin(this.config.plugin);
      
      // 更新实体数据
      this._updateEntities();
      
    } catch (error) {
      console.error('卡片配置失败:', error);
      this._error = error;
      this._pluginInstance = null;
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  _isSameConfig(newConfig) {
    return JSON.stringify(newConfig) === JSON.stringify(this._lastConfig);
  }

  _validateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('配置必须是一个对象');
    }
    
    if (!config.plugin) {
      throw new Error('必须指定 plugin 参数');
    }

    return {
      plugin: config.plugin,
      entities: config.entities || {},
      theme: config.theme || 'default',
      ...config
    };
  }

  async _loadPlugin(pluginId) {
    // 检查缓存
    if (this._pluginCache.has(pluginId)) {
      this._pluginInstance = this._pluginCache.get(pluginId);
      return;
    }

    // 从注册表获取插件
    const plugin = PluginRegistry.createPluginInstance(pluginId);
    if (!plugin) {
      throw new Error(`未知插件: ${pluginId}`);
    }
    
    // 缓存插件实例
    this._pluginCache.set(pluginId, plugin);
    this._pluginInstance = plugin;

    // 调用生命周期方法
    if (plugin.onConfigUpdate) {
      plugin.onConfigUpdate(this._lastConfig, this.config);
    }
  }

  async _reloadPlugin() {
    if (this.config?.plugin) {
      this._pluginCache.delete(this.config.plugin);
      await this._loadPlugin(this.config.plugin);
      this.requestUpdate();
    }
  }

  _updateEntities() {
    const oldEntities = { ...this._entities };
    this._entities = {};
    
    if (!this.hass || !this.config.entities) {
      return;
    }
    
    Object.entries(this.config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entities[key] = this.hass.states[entityId];
      }
    });

    // 通知插件实体变化
    if (this._pluginInstance?.onEntitiesUpdate) {
      this._pluginInstance.onEntitiesUpdate(this._entities, oldEntities);
    }
  }

  render() {
    if (this._error) {
      return this._renderError(this._error);
    }
    
    if (this._loading || !this._pluginInstance) {
      return this._renderLoading();
    }
    
    try {
      return this._renderPlugin();
    } catch (error) {
      console.error('插件渲染失败:', error);
      return this._renderError(error);
    }
  }

  _renderError(error) {
    return html`
      <ha-card>
        <div class="cardforge-error">
          <ha-icon icon="mdi:alert-circle-outline" class="error-icon"></ha-icon>
          <div class="error-title">卡片加载失败</div>
          <div class="error-message">${error.message}</div>
          ${this.config.plugin ? html`
            <mwc-button 
              outlined 
              @click=${this._reloadPlugin}
              style="margin-top: 12px;"
            >
              <ha-icon icon="mdi:reload" slot="icon"></ha-icon>
              重试
            </mwc-button>
          ` : ''}
        </div>
      </ha-card>
      
      <style>
        .cardforge-error {
          padding: 24px;
          text-align: center;
          color: var(--error-color);
        }
        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.8;
        }
        .error-title {
          font-weight: 600;
          font-size: 1.1em;
          margin-bottom: 8px;
        }
        .error-message {
          font-size: 0.9em;
          opacity: 0.8;
          max-width: 300px;
          margin: 0 auto;
        }
      </style>
    `;
  }

  _renderLoading() {
    return html`
      <ha-card>
        <div class="cardforge-loading">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="loading-text">加载卡片...</div>
          ${this.config.plugin ? html`
            <div class="loading-plugin">${this.config.plugin}</div>
          ` : ''}
        </div>
      </ha-card>
      
      <style>
        .cardforge-loading {
          padding: 40px;
          text-align: center;
          color: var(--secondary-text-color);
        }
        .loading-text {
          margin-top: 16px;
          font-size: 0.95em;
        }
        .loading-plugin {
          margin-top: 8px;
          font-size: 0.8em;
          opacity: 0.6;
          font-family: monospace;
        }
      </style>
    `;
  }

  _renderPlugin() {
    const template = this._pluginInstance.getTemplate(this.config, this.hass, this._entities);
    const styles = this._pluginInstance.getStyles(this.config);

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
          overflow: hidden;
        }
        
        /* 确保卡片样式不被覆盖 */
        .cardforge-card {
          all: initial;
          box-sizing: border-box;
        }
        
        .cardforge-card * {
          box-sizing: border-box;
        }
      </style>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      const oldHass = changedProperties.get('hass');
      this._updateEntities();
      
      // 通知插件 hass 变化
      if (this._pluginInstance?.onHassUpdate) {
        this._pluginInstance.onHassUpdate(this.hass, oldHass);
      }
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
    if (this._pluginInstance?.getCardSize) {
      return this._pluginInstance.getCardSize();
    }
    return 3;
  }
}

export { HaCardForgeCard };
