// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../themes/index.js';
import { designSystem } from '../core/design-system.js';
import './config-editors.js';
import './layout-editor.js';
import './plugin-selector.js';
import './theme-selector.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _themes: { state: true },
    _selectedPlugin: { state: true },
    _initialized: { state: true },
    _isDarkMode: { state: true },
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

      .action-buttons {
        display: flex;
        gap: var(--cf-spacing-md);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-lg);
      }

      /* 不同区域的视觉区分 */
      .editor-section:nth-child(1) .section-header {
        border-left-color: #4CAF50; /* 绿色 - 卡片类型 */
      }

      .editor-section:nth-child(2) .section-header {
        border-left-color: #2196F3; /* 蓝色 - 主题样式 */  
      }

      .editor-section:nth-child(3) .section-header {
        border-left-color: #FF9800; /* 橙色 - 基础设置 */
      }

      .editor-section:nth-child(4) .section-header {
        border-left-color: #9C27B0; /* 紫色 - 高级设置 */
      }

      .editor-section:nth-child(5) .section-header {
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

      .cf-dark-mode .editor-container {
        background: var(--cf-dark-background) !important;
        border-color: var(--cf-dark-border) !important;
      }

      .cf-dark-mode .editor-section {
        background: var(--cf-dark-surface) !important;
        border-bottom-color: var(--cf-dark-border) !important;
      }

      .cf-dark-mode .section-header {
        background: rgba(var(--cf-rgb-primary), 0.1) !important;
        color: var(--cf-dark-text) !important;
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
    this._isDarkMode = false;
    this._pluginManifest = null;
    this._pluginInstance = null;
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    await themeManager.initialize();
    
    this._plugins = PluginRegistry.getAllPlugins();
    this._themes = themeManager.getAllThemes();
    this._detectDarkMode();
    this._initialized = true;
    
    if (this.config.plugin) {
      this._loadPluginInstance();
    }
  }

  _detectDarkMode() {
    this._isDarkMode = 
      document.body.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (this._isDarkMode) {
      this.classList.add('cf-dark-mode');
    }
  }

  async _loadPluginInstance() {
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
      <div class="editor-container ${this._isDarkMode ? 'cf-dark-mode' : ''}">
        <div class="editor-layout">
          ${this._renderPluginSection()}
          ${this._renderThemeSection()}
          ${this._renderBaseConfigSection()}
          ${this._renderAdvancedConfigSection()}
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

_renderBaseConfigSection() {
  if (!this.config.plugin) return '';
  
  return html`
    <div class="editor-section">
      <div class="section-header">
        <ha-icon icon="mdi:tune"></ha-icon>
        <span>卡片设置</span>
        <span class="section-subtitle">配置卡片外观和功能</span>
      </div>
      
      <config-editor
        .config=${this.config}
        .pluginManifest=${this._pluginManifest}
        @config-changed=${this._onConfigChanged}
      ></config-editor>
    </div>
  `;
}
  
  _renderAdvancedConfigSection() {
    if (!this.config.plugin || !this._pluginManifest?.config_schema) return '';
    
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span>高级设置</span>
          <span class="section-subtitle">配置卡片特定功能</span>
        </div>
        
        <advanced-config-editor
          .schema=${this._pluginManifest.config_schema}
          .config=${this.config}
          @config-changed=${this._onConfigChanged}
        ></advanced-config-editor>
      </div>
    `;
  }

  _renderDataSourceSection() {
    if (!this.config.plugin || !this._pluginInstance) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:database"></ha-icon>
          <span>数据源配置</span>
          <span class="section-subtitle">配置卡片显示的数据和内容</span>
        </div>
        
        <layout-editor
          .hass=${this.hass}
          .config=${this.config}
          .pluginManifest=${this._pluginManifest}
          @entities-changed=${this._onEntitiesChanged}
        ></layout-editor>
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
    }, 0);
  }

  _onThemeChanged(e) {
    this.config = {
      ...this.config,
      theme: e.detail.theme
    };
    this._notifyConfigUpdate();
  }

  _onConfigChanged(e) {
    this.config = {
      ...this.config,
      ...e.detail.config
    };
    this._notifyConfigUpdate();
  }

  _onEntitiesChanged(e) {
    this.config.entities = e.detail.entities;
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

  _save() {
    const configToSend = {
      type: 'custom:ha-cardforge-card',
      ...this.config
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
    }));
    this.dispatchEvent(new CustomEvent('config-saved'));
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-cancelled'));
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.requestUpdate();
    }
  }
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

export { HaCardForgeEditor };