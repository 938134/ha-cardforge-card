// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../themes/index.js';
import { foundationStyles } from '../core/styles.js';
import './plugin-selector.js';
import './theme-selector.js';
import './config-editor.js';
import './entity-manager.js';

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
    _pluginInstance: { state: true },
    _cardCapabilities: { state: true }
  };

  static styles = [
    foundationStyles,
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
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
        font-weight: 600;
        color: var(--cf-text-primary);
        font-size: 1.1em;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--cf-primary-color);
      }

      .section-icon {
        font-size: 1.1em;
      }

      .action-buttons {
        display: flex;
        gap: var(--cf-spacing-md);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-lg);
      }

      .capability-hint {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-sm);
        border-left: 2px solid var(--cf-primary-color);
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

        .capability-hint {
          background: rgba(var(--cf-rgb-primary), 0.1);
          color: var(--cf-dark-text-secondary);
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
    this._cardCapabilities = null;
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
      this._cardCapabilities = this._pluginInstance?.getCardCapabilities() || null;
    } else {
      this._cardCapabilities = null;
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
          <!-- 1. 卡片类型区域 -->
          ${this._renderPluginSection()}
          
          <!-- 2. 主题样式区域 -->
          ${this._renderThemeSection()}
          
          <!-- 3. 卡片配置区域 -->
          ${this._renderPluginConfigSection()}
          
          <!-- 4. 数据源配置区域 -->
          ${this._renderDatasourceSection()}
          
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
          <span class="section-icon">🎨</span>
          <span>卡片类型</span>
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
          <span class="section-icon">🎭</span>
          <span>主题样式</span>
        </div>
        
        <theme-selector
          .themes=${this._themes}
          .selectedTheme=${this.config.theme}
          @theme-changed=${this._onThemeChanged}
        ></theme-selector>
      </div>
    `;
  }

  _renderPluginConfigSection() {
    if (!this.config.plugin || !this._pluginManifest?.config_schema) return '';
    
    return html`
      <div class="editor-section">
        <div class="section-header">
          <span class="section-icon">⚙️</span>
          <span>卡片配置</span>
        </div>
        
        <config-editor
          .schema=${this._pluginManifest.config_schema}
          .config=${this.config}
          @config-changed=${this._onConfigChanged}
        ></config-editor>
      </div>
    `;
  }

  _renderDatasourceSection() {
    if (!this.config.plugin || !this._pluginInstance) return '';

    const capabilities = this._cardCapabilities;
    
    // 如果三个都不支持，就隐藏整个区域
    if (!capabilities?.supportsTitle && 
        !capabilities?.supportsContent && 
        !capabilities?.supportsFooter) {
      return '';
    }

    const requirements = this._pluginInstance.getAllEntityRequirements(this.config, this.hass);
    
    let sectionHint = '';
    const supportedParts = [];
    if (capabilities.supportsTitle) supportedParts.push('标题');
    if (capabilities.supportsContent) supportedParts.push('内容');
    if (capabilities.supportsFooter) supportedParts.push('页脚');
    
    if (supportedParts.length > 0) {
      sectionHint = `此卡片支持自定义：${supportedParts.join('、')}`;
    }

    return html`
      <div class="editor-section">
        <div class="section-header">
          <span class="section-icon">🔧</span>
          <span>内容配置</span>
        </div>
        
        ${sectionHint ? html`
          <div class="capability-hint">
            ${sectionHint}
          </div>
        ` : ''}
        
        <entity-manager
          .hass=${this.hass}
          .requirements=${requirements}
          .entities=${this.config.entities || {}}
          .capabilities=${capabilities}
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
