// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { designSystem } from './core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugin: { state: true },
    _entities: { state: true },
    _error: { state: true },
    _loading: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .cardforge-container {
        position: relative;
        height: 100%;
        min-height: 80px;
      }

      .cardforge-error-container,
      .cardforge-loading-container,
      .cardforge-empty-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        min-height: 80px;
        text-align: center;
      }

      .cardforge-loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--cf-border);
        border-top: 2px solid var(--cf-primary-color);
        border-radius: 50%;
        animation: cardforge-spin 1s linear infinite;
      }

      .cardforge-error-message,
      .cardforge-loading-text,
      .cardforge-empty-message {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }

      @keyframes cardforge-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .cardforge-loading-spinner {
          border-color: var(--cf-dark-border);
          border-top-color: var(--cf-primary-color);
        }

        .cardforge-error-message,
        .cardforge-loading-text,
        .cardforge-empty-message {
          color: var(--cf-dark-text-secondary);
        }
      }

      /* 确保卡片容器正确继承高度 */
      ha-card {
        height: 100%;
      }

      .cardforge-container > * {
        height: 100%;
      }
    `
  ];

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
      
      // 验证配置
      this.config = this._validateConfig(config);
      
      // 初始化插件系统
      await PluginRegistry.initialize();
      
      // 加载插件
      this._plugin = await this._loadPlugin(this.config.plugin);
      
      // 验证插件配置
      this._validatePluginConfig();
      
      // 更新实体数据
      this._updateEntities();
      
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
      type: 'custom:ha-cardforge-card',
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config
    };
  }

  _validatePluginConfig() {
    // 简化配置验证，让插件自行处理
    if (!this._plugin) return;
    
    try {
      const manifest = this._plugin.getManifest();
      // 不再进行复杂的配置验证
    } catch (error) {
      console.warn('插件配置验证警告:', error.message);
    }
  }

  async _loadPlugin(pluginId) {
    if (this._pluginCache.has(pluginId)) {
      return this._pluginCache.get(pluginId);
    }

    const plugin = PluginRegistry.createPluginInstance(pluginId);
    if (!plugin) {
      throw new Error(`未知插件: ${pluginId}`);
    }
    
    if (typeof plugin.getTemplate !== 'function' || 
        typeof plugin.getStyles !== 'function') {
      throw new Error('插件接口不完整');
    }
    
    this._pluginCache.set(pluginId, plugin);
    return plugin;
  }

  _updateEntities() {
    // 简化实体处理，直接传递给插件
    this._entities = this.config.entities || {};
  }

  render() {
    if (this._error) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
              <div class="cf-error cf-text-xl cf-mb-md">❌</div>
              <div class="cf-text-lg cf-font-bold cf-mb-sm">卡片加载失败</div>
              <div class="cf-text-sm cf-text-secondary">${this._error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    if (this._loading || !this._plugin) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
              <ha-circular-progress indeterminate></ha-circular-progress>
              <div class="cf-text-md cf-mt-md">加载中...</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    try {
      // 使用新的 render 方法而不是直接调用 getTemplate
      const template = this._plugin.render(this.config, this.hass, this._entities);
      const styles = this._plugin.getStyles(this.config);

      return html`
        <ha-card>
          <div class="cardforge-container">
            ${unsafeHTML(template)}
          </div>
        </ha-card>
        
        <style>
          ${styles}
        </style>
      `;
    } catch (error) {
      console.error('插件渲染失败:', error);
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
              <div class="cf-warning cf-text-xl cf-mb-md">⚠️</div>
              <div class="cf-text-lg cf-font-bold cf-mb-sm">插件渲染错误</div>
              <div class="cf-text-sm cf-text-secondary">${error.message}</div>
            </div>
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

  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      plugin: 'clock-card',
      entities: {},
      theme: 'auto'
    };
  }

  getCardSize() {
    // 根据插件类型返回合适的卡片大小
    if (this._plugin) {
      const manifest = this._plugin.getManifest?.();
      if (manifest?.category === '时间') return 2;
      if (manifest?.category === '信息') return 3;
      if (manifest?.category === '文化') return 4;
    }
    return 3;
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };