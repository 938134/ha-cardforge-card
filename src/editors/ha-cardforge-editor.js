// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../themes/index.js';
import { designSystem } from '../core/design-system.js';
import './plugin-selector.js';
import './theme-selector.js';
import './inline-block-editor.js';
import './config-editor.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _themes: { state: true },
    _selectedPlugin: { state: true },
    _initialized: { state: true },
    _pluginManifest: { state: true },
    _pluginInstance: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host {
        display: block;
        max-width: 100%;
      }

      .editor-container {
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-sm);
        overflow: hidden;
      }

      .editor-layout {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .editor-section {
        background: var(--cf-surface);
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
        position: relative;
      }

      .editor-section:last-child {
        border-bottom: none;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }

      .section-subtitle {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        font-weight: normal;
        margin-left: auto;
        font-style: italic;
      }

      .config-empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      /* 不同区域的视觉区分 */
      .editor-section:nth-child(1) .section-header {
        border-left-color: #4CAF50; /* 绿色 - 卡片类型 */
      }

      .editor-section:nth-child(2) .section-header {
        border-left-color: #2196F3; /* 蓝色 - 卡片设置 */
      }

      .editor-section:nth-child(3) .section-header {
        border-left-color: #FF9800; /* 橙色 - 主题样式 */
      }

      .editor-section:nth-child(4) .section-header {
        border-left-color: #607D8B; /* 蓝色灰 - 数据源配置 */
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .editor-container {
          background: var(--cf-dark-background);
          border-color: var(--cf-dark-border);
        }

        .editor-section {
          background: var(--cf-dark-surface);
          border-bottom-color: var(--cf-dark-border);
        }

        .section-header {
          background: rgba(var(--cf-rgb-primary), 0.1);
          color: var(--cf-dark-text);
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = { 
      type: 'custom:ha-cardforge-card',
      plugin: '', 
      entities: {}, 
      theme: 'auto' 
    };
    this._plugins = [];
    this._themes = [];
    this._selectedPlugin = null;
    this._initialized = false;
    this._pluginManifest = null;
    this._pluginInstance = null;
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    await themeManager.initialize();
    
    this._plugins = PluginRegistry.getAllPlugins();
    this._themes = themeManager.getAllThemes();
    this._initialized = true;
    
    if (this.config.plugin) {
      this._loadPluginInstance();
    }
  }

  _loadPluginInstance() {
    this._selectedPlugin = PluginRegistry.getPlugin(this.config.plugin);
    this._pluginManifest = this._selectedPlugin?.manifest || null;
    
    if (this._selectedPlugin) {
      this._pluginInstance = PluginRegistry.createPluginInstance(this.config.plugin);
    }
  }

  setConfig(config) {
    this.config = { 
      type: 'custom:ha-cardforge-card',
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config 
    };
    
    if (this.config.plugin && this._initialized) {
      this._loadPluginInstance();
    }
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container">
        <div class="editor-layout">
          ${this._renderPluginSection()}
          ${this._renderThemeSection()}
          ${this._renderPluginConfigSection()}
          ${this._renderDataSourceSection()}
        </div>
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="editor-section">
        <div class="cf-flex cf-flex-center cf-p-lg">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="cf-text-md cf-m-sm">初始化编辑器...</div>
        </div>
      </div>
    `;
  }

  _renderPluginSection() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>卡片类型</span>
          <span class="section-subtitle">选择要使用的卡片插件</span>
        </div>
        
        <plugin-selector
          .plugins=${this._plugins}
          .selectedPlugin=${this.config.plugin}
          @plugin-changed=${this._onPluginChanged}
        ></plugin-selector>
      </div>
    `;
  }

  _renderPluginConfigSection() {
    if (!this.config.plugin || !this._pluginInstance) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span>卡片设置</span>
          <span class="section-subtitle">配置 ${this._pluginManifest?.name} 的专属选项</span>
        </div>
        
        <div id="plugin-config-container"></div>
      </div>
    `;
  }

  _renderThemeSection() {
    if (!this.config.plugin) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:format-paint"></ha-icon>
          <span>主题样式</span>
          <span class="section-subtitle">选择卡片的整体视觉风格</span>
        </div>
        
        <theme-selector
          .themes=${this._themes}
          .selectedTheme=${this.config.theme}
          @theme-changed=${this._onThemeChanged}
        ></theme-selector>
      </div>
    `;
  }

  _renderDataSourceSection() {
    if (!this.config.plugin || !this._pluginManifest) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:database"></ha-icon>
          <span>数据源配置</span>
          <span class="section-subtitle">配置卡片显示的数据和内容</span>
        </div>
        
        <entity-manager
          .hass=${this.hass}
          .config=${this.config}
          .pluginManifest=${this._pluginManifest}
          @entities-changed=${this._onEntitiesChanged}
        ></entity-manager>
      </div>
    `;
  }

  async _onPluginChanged(e) {
    const newConfig = {
      type: 'custom:ha-cardforge-card',
      plugin: e.detail.pluginId,
      entities: {},
      theme: 'auto'
    };

    this.config = newConfig;
    await this._loadPluginInstance();
    
    setTimeout(() => {
      this._notifyConfigUpdate();
      this._renderPluginConfig();
    }, 0);
  }

  _onThemeChanged(e) {
    this.config = {
      ...this.config,
      theme: e.detail.theme
    };
    this._notifyConfigUpdate();
  }

  _onEntitiesChanged(e) {
    this.config.entities = e.detail.entities;
    this._notifyConfigUpdate();
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.requestUpdate();
    }
    
    // 渲染插件配置编辑器
    if (changedProperties.has('_pluginInstance') || changedProperties.has('config')) {
      this._renderPluginConfig();
    }
  }

  _renderPluginConfig() {
    if (!this._pluginInstance || !this.config.plugin) return;
    
    const container = this.shadowRoot.getElementById('plugin-config-container');
    if (!container) return;
    
    const schema = this._pluginInstance.getConfigSchema();
    if (!schema || Object.keys(schema).length === 0) {
      container.innerHTML = `
        <div class="config-empty-state cf-flex cf-flex-center cf-flex-column cf-p-lg">
          <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color); font-size: 3em; margin-bottom: var(--cf-spacing-md);"></ha-icon>
          <div class="cf-text-sm cf-text-secondary">此卡片无需额外配置</div>
        </div>
      `;
      return;
    }
    
    // 使用新的配置编辑器
    container.innerHTML = `
      <config-editor
        .schema=${schema}
        .config=${this.config}
        @config-changed=${(e) => this._onPluginConfigChanged(e.detail.config)}
      ></config-editor>
    `;
  }

  _onPluginConfigChanged(configChanges) {
    this.config = {
      ...this.config,
      ...configChanges
    };
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    const configToSend = {
      type: 'custom:ha-cardforge-card',
      ...this.config
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
    }));
    this.requestUpdate();
  }
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

export { HaCardForgeEditor };
