// src/editors/ha-cardforge-editor.js (关键部分修正)
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../themes/index.js';
import { designSystem } from '../core/design-system.js';
import { BlockManager } from '../core/block-manager.js';
import './config-editor.js';
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

      /* 仪表盘基础设置样式 */
      .dashboard-basic-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .form-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      .layout-presets {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--cf-spacing-sm);
      }

      .layout-preset {
        aspect-ratio: 1;
        border: 2px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        padding: var(--cf-spacing-sm);
        background: var(--cf-surface);
      }

      .layout-preset:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .layout-preset.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .layout-preview {
        flex: 1;
        width: 100%;
        display: grid;
        gap: 2px;
        margin-bottom: 4px;
      }

      .layout-name {
        font-size: 0.7em;
        text-align: center;
        color: var(--cf-text-secondary);
      }

      @media (max-width: 768px) {
        .layout-presets {
          grid-template-columns: repeat(2, 1fr);
        }
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
    
    const isDashboard = this._pluginManifest?.free_layout;
    
    if (isDashboard) {
      return this._renderDashboardBasicConfig();
    } else {
      return html`
        <div class="editor-section">
          <div class="section-header">
            <ha-icon icon="mdi:tune"></ha-icon>
            <span>卡片设置</span>
          </div>
          
          <config-editor
            .config=${this.config}
            .pluginManifest=${this._pluginManifest}
            @config-changed=${this._onConfigChanged}
          ></config-editor>
        </div>
      `;
    }
  }

  _renderDashboardBasicConfig() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:tune"></ha-icon>
          <span>基础设置</span>
        </div>
        
        <div class="dashboard-basic-form">
          <div class="form-field">
            <label class="form-label">标题</label>
            <ha-textfield
              .value=${this.config.title || ''}
              @input=${e => this._onConfigChanged({ title: e.target.value })}
              label="卡片标题"
              placeholder="例如：家庭仪表板"
              fullwidth
            ></ha-textfield>
          </div>

          <div class="form-field">
            <label class="form-label">布局模板</label>
            <div class="layout-presets">
              ${Object.entries(BlockManager.LAYOUT_PRESETS).map(([key, preset]) => html`
                <div 
                  class="layout-preset ${this.config.layout === key ? 'selected' : ''}"
                  @click=${() => this._onConfigChanged({ layout: key })}
                  title="${preset.name}"
                >
                  <div class="layout-preview" style="
                    grid-template-columns: repeat(${preset.cols}, 1fr);
                    grid-template-rows: repeat(${preset.rows}, 1fr);
                  ">
                    ${Array.from({ length: preset.rows * preset.cols }, (_, i) => html`
                      <div style="background: var(--cf-border); border-radius: 1px;"></div>
                    `)}
                  </div>
                  <div class="layout-name">${preset.cols}×${preset.rows}</div>
                </div>
              `)}
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">页脚</label>
            <ha-textfield
              .value=${this.config.footer || ''}
              @input=${e => this._onConfigChanged({ footer: e.target.value })}
              label="页脚文本"
              placeholder="例如：最后更新时间"
              fullwidth
            ></ha-textfield>
          </div>
        </div>
      </div>
    `;
  }

  _renderDataSourceSection() {
    if (!this.config.plugin || !this._pluginInstance) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:database"></ha-icon>
          <span>${this._pluginManifest?.free_layout ? '布局设计' : '数据源配置'}</span>
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

  _onConfigChanged(configUpdate) {
    this.config = {
      ...this.config,
      ...configUpdate
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