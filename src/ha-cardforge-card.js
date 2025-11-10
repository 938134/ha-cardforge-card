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
    _loading: { state: true },
    _lastUpdate: { state: true }
  };

  constructor() {
    super();
    this._pluginCache = new Map();
    this._plugin = null;
    this._entities = {};
    this._error = null;
    this._loading = false;
    this._lastUpdate = null;
    
    // 初始化主题管理器
    ThemeManager.init();
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      // 确保插件注册表已初始化
      await PluginRegistry.initialize();
      
      this.config = this._validateConfig(config);
      
      // 验证插件是否存在
      if (!PluginRegistry.getPlugin(this.config.plugin)) {
        throw new Error(`插件 "${this.config.plugin}" 不存在或未加载`);
      }
      
      // 加载插件实例
      this._plugin = await this._loadPlugin(this.config.plugin);
      
      // 更新实体数据
      this._updateEntities();
      
      this._lastUpdate = new Date();
      this.requestUpdate();
      
    } catch (error) {
      console.error('卡片配置失败:', error);
      this._error = error;
      this.requestUpdate();
    } finally {
      this._loading = false;
    }
  }

  _validateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('配置必须是一个对象');
    }
    
    if (!config.plugin) {
      throw new Error('必须指定 plugin 参数');
    }
    
    // 基础配置结构
    const validatedConfig = {
      plugin: '',
      entities: {},
      theme: 'default',
      refresh_interval: 0,
      ...config
    };
    
    // 验证实体配置
    if (validatedConfig.entities && typeof validatedConfig.entities !== 'object') {
      validatedConfig.entities = {};
    }
    
    return validatedConfig;
  }

  async _loadPlugin(pluginId) {
    // 检查缓存
    if (this._pluginCache.has(pluginId)) {
      return this._pluginCache.get(pluginId);
    }

    try {
      // 从注册表获取插件类
      const PluginClass = PluginRegistry.getPluginClass(pluginId);
      if (!PluginClass) {
        throw new Error(`未知插件: ${pluginId}`);
      }
      
      // 创建插件实例
      const plugin = new PluginClass();
      
      // 验证插件接口
      if (typeof plugin.getTemplate !== 'function') {
        throw new Error('插件必须实现 getTemplate 方法');
      }
      
      if (typeof plugin.getStyles !== 'function') {
        throw new Error('插件必须实现 getStyles 方法');
      }
      
      // 缓存插件实例
      this._pluginCache.set(pluginId, plugin);
      return plugin;
      
    } catch (error) {
      console.error(`加载插件 ${pluginId} 失败:`, error);
      throw new Error(`加载插件失败: ${error.message}`);
    }
  }

  _updateEntities() {
    this._entities = {};
    
    if (!this.hass || !this.hass.states || !this.config.entities) {
      return;
    }
    
    Object.entries(this.config.entities).forEach(([key, entityId]) => {
      if (entityId && typeof entityId === 'string') {
        const entity = this.hass.states[entityId];
        if (entity) {
          this._entities[key] = entity;
        } else {
          console.warn(`实体不存在: ${entityId}`);
        }
      }
    });
  }

  render() {
    if (this._error) {
      return this._renderError();
    }
    
    if (this._loading) {
      return this._renderLoading();
    }
    
    if (!this._plugin) {
      return this._renderNoPlugin();
    }
    
    return this._renderCard();
  }

  _renderError() {
    return html`
      <ha-card>
        <div class="cardforge-error">
          <div class="error-icon">❌</div>
          <div class="error-title">卡片加载失败</div>
          <div class="error-message">${this._error.message}</div>
          <div class="error-help">
            请检查卡片配置或尝试重新加载
            ${this.config.plugin ? html`<br>当前插件: ${this.config.plugin}` : ''}
          </div>
        </div>
      </ha-card>
      
      <style>
        .cardforge-error {
          padding: 24px;
          text-align: center;
          color: var(--error-color);
        }
        .error-icon {
          font-size: 3em;
          margin-bottom: 16px;
        }
        .error-title {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .error-message {
          font-size: 0.9em;
          margin-bottom: 12px;
          opacity: 0.8;
        }
        .error-help {
          font-size: 0.8em;
          opacity: 0.6;
        }
      </style>
    `;
  }

  _renderLoading() {
    return html`
      <ha-card>
        <div class="cardforge-loading">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="loading-text">加载插件中...</div>
          ${this.config.plugin ? html`<div class="plugin-name">${this.config.plugin}</div>` : ''}
        </div>
      </ha-card>
      
      <style>
        .cardforge-loading {
          padding: 40px 20px;
          text-align: center;
          color: var(--secondary-text-color);
        }
        .loading-text {
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .plugin-name {
          font-size: 0.9em;
          opacity: 0.7;
        }
      </style>
    `;
  }

  _renderNoPlugin() {
    return html`
      <ha-card>
        <div class="cardforge-no-plugin">
          <div class="no-plugin-icon">🔧</div>
          <div class="no-plugin-title">未选择插件</div>
          <div class="no-plugin-message">请在卡片编辑器中选择一个插件</div>
        </div>
      </ha-card>
      
      <style>
        .cardforge-no-plugin {
          padding: 40px 20px;
          text-align: center;
          color: var(--secondary-text-color);
        }
        .no-plugin-icon {
          font-size: 3em;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .no-plugin-title {
          font-size: 1.1em;
          margin-bottom: 8px;
        }
        .no-plugin-message {
          font-size: 0.9em;
          opacity: 0.7;
        }
      </style>
    `;
  }

  _renderCard() {
    try {
      // 获取插件模板和样式
      const template = this._plugin.getTemplate(this.config, this.hass, this._entities);
      const styles = this._plugin.getStyles(this.config);
      
      // 应用主题
      const themeStyles = this._getThemeStyles();
      
      return html`
        <ha-card>
          <div class="cardforge-card" data-theme="${this.config.theme || 'default'}">
            ${unsafeHTML(template)}
          </div>
        </ha-card>
        
        <style>
          ${themeStyles}
          ${styles}
        </style>
      `;
      
    } catch (error) {
      console.error('渲染卡片失败:', error);
      return this._renderError();
    }
  }

  _getThemeStyles() {
    const theme = this.config.theme || 'default';
    
    const themeVariables = {
      default: `
        .cardforge-card {
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
      `,
      dark: `
        .cardforge-card {
          background: #1e1e1e;
          color: #ffffff;
        }
      `,
      material: `
        .cardforge-card {
          background: #fafafa;
          color: #212121;
          border-radius: 8px;
        }
      `,
      minimal: `
        .cardforge-card {
          background: transparent;
          color: var(--primary-text-color);
        }
      `,
      gradient: `
        .cardforge-card {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
        }
      `
    };
    
    return themeVariables[theme] || themeVariables.default;
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntities();
      this.requestUpdate();
    }
    
    // 自动刷新逻辑
    if (this.config.refresh_interval && this.config.refresh_interval > 0) {
      this._setupAutoRefresh();
    }
  }

  _setupAutoRefresh() {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
    }
    
    this._refreshTimer = setTimeout(() => {
      this.requestUpdate();
      this._setupAutoRefresh();
    }, this.config.refresh_interval * 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
    }
  }

  // Home Assistant 卡片标准接口
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

  // 获取卡片大小
  getCardSize() {
    if (this._plugin && this._plugin.getCardSize) {
      return this._plugin.getCardSize();
    }
    return 1;
  }
}

// 导出卡片类
export { HaCardForgeCard };

// 自动注册到 window 对象（兼容性）
if (!window.HaCardForgeCard) {
  window.HaCardForgeCard = HaCardForgeCard;
}