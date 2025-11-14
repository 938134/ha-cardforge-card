// src/ha-cardforge-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { sharedStyles } from './styles/shared-styles.js';
import { layoutStyles } from './styles/layout-styles.js';
import { componentStyles } from './styles/component-styles.js';

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

  static styles = [
    sharedStyles,
    layoutStyles,
    componentStyles
  ];

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      this.config = this._validateConfig(config);
      
      await PluginRegistry.initialize();
      
      this._plugin = await this._loadPlugin(this.config.plugin);
      
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
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config
    };
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
          <div class="cardforge-flex-center" style="padding: var(--cardforge-spacing-lg); color: var(--error-color);">
            <div style="text-align: center;">
              <div style="font-size: 2em; margin-bottom: var(--cardforge-spacing-sm);">❌</div>
              <div style="font-weight: bold; margin-bottom: var(--cardforge-spacing-sm);">卡片加载失败</div>
              <div style="font-size: 0.9em; opacity: 0.8;">${this._error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    if (this._loading || !this._plugin) {
      return html`
        <ha-card>
          <div class="cardforge-flex-center" style="padding: var(--cardforge-spacing-xl); color: var(--secondary-text-color);">
            <div style="text-align: center;">
              <ha-circular-progress indeterminate></ha-circular-progress>
              <div style="margin-top: var(--cardforge-spacing-sm);">加载中...</div>
            </div>
          </div>
        </ha-card>
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
          <div class="cardforge-flex-center" style="padding: var(--cardforge-spacing-lg); color: var(--warning-color);">
            <div style="text-align: center;">
              <div style="font-size: 2em; margin-bottom: var(--cardforge-spacing-sm);">⚠️</div>
              <div style="font-weight: bold; margin-bottom: var(--cardforge-spacing-sm);">插件渲染错误</div>
              <div style="font-size: 0.9em; opacity: 0.8;">${error.message}</div>
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
      plugin: 'simple-clock',
      entities: {},
      theme: 'auto'
    };
  }

  getCardSize() {
    return 3;
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
