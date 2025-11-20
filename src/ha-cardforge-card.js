// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { entityManager } from './core/entity-manager.js';
import { configManager } from './core/config-manager.js';
import { layoutEngine } from './core/layout-engine.js';
import { foundationStyles } from './core/styles.js';

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
    foundationStyles,
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

      @keyframes cardforge-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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
      
      // 设置管理器
      entityManager.setHass(this.hass);
      configManager.resetConfig();
      
      // 加载插件
      this._plugin = await this._loadPlugin(this.config.plugin);
      
      if (this._plugin) {
        // 设置实体策略
        const manifest = this._plugin.getManifest();
        entityManager.setStrategy(
          this._detectStrategy(manifest), 
          manifest
        );
        
        // 处理实体数据
        this._entities = entityManager.processEntities(this.config.entities, this.hass);
        
        // 验证配置
        this._validatePluginConfig();
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
      type: 'custom:ha-cardforge-card',
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config
    };
  }

  _detectStrategy(manifest) {
    if (!manifest) return 'stateless';
    if (manifest.layout_type === 'free') return 'free_layout';
    if (manifest.entity_requirements) return 'structured';
    return 'stateless';
  }

  _validatePluginConfig() {
    if (!this._plugin) return;
    
    try {
      const manifest = this._plugin.getManifest();
      if (manifest.config_schema) {
        const validation = configManager.validateConfig('advanced', this.config);
        if (!validation.valid) {
          console.warn('插件配置验证警告:', validation.errors);
        }
      }
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
      // 使用管理器获取处理后的实体数据
      const processedEntities = entityManager.getAllEntities();
      const template = this._plugin.getTemplate(this.config, this.hass, processedEntities);
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
      entityManager.setHass(this.hass);
      
      // 重新处理实体数据
      if (this._plugin && this.config.entities) {
        this._entities = entityManager.processEntities(this.config.entities, this.hass);
        this.requestUpdate();
      }
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