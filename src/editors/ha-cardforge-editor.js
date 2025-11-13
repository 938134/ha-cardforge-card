// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { sharedStyles } from '../core/shared-styles.js';
import './plugin-selector.js';
import './theme-selector.js';
import './entity-picker.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _initialized: { state: true },
    _activePlugin: { state: true }
  };

  static styles = [
    sharedStyles,
    css`
      .editor-container {
        padding: 16px;
      }
      
      .plugin-info {
        margin-bottom: 16px;
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        border: 1px solid var(--divider-color);
      }
      
      .plugin-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      
      .plugin-icon {
        font-size: 1.2em;
      }
      
      .plugin-name {
        font-weight: 600;
        font-size: 1.1em;
      }
      
      .plugin-description {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }
      
      .plugin-version {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
      
      .config-section {
        margin-bottom: 24px;
      }
      
      .section-title {
        font-weight: 600;
        font-size: 1em;
        color: var(--primary-text-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .card-actions {
        margin-top: 24px;
        text-align: right;
        border-top: 1px solid var(--divider-color);
        padding-top: 16px;
      }
    `
  ];

  constructor() {
    super();
    this.config = { plugin: '', entities: {}, theme: 'auto' };
    this._plugins = [];
    this._initialized = false;
    this._activePlugin = null;
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins().map(p => ({ id: p.id, name: p.name }));
    this._initialized = true;
    
    // 如果有配置的插件，加载插件信息
    if (this.config.plugin) {
      this._activePlugin = PluginRegistry.getPlugin(this.config.plugin);
    }
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config 
    };
    
    if (this.config.plugin) {
      this._activePlugin = PluginRegistry.getPlugin(this.config.plugin);
    }
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container">
        <div class="config-section">
          <div class="section-title">📋 选择卡片类型</div>
          <plugin-selector
            .plugins=${this._plugins}
            .selectedPlugin=${this.config.plugin}
            @plugin-changed=${this._onPluginChanged}
          ></plugin-selector>
        </div>

        ${this.config.plugin ? html`
          ${this._renderPluginInfo()}
          
          <div class="config-section">
            <div class="section-title">🎨 主题设置</div>
            <theme-selector
              .selectedTheme=${this.config.theme}
              @theme-changed=${this._onThemeChanged}
            ></theme-selector>
          </div>

          ${this._renderEntityConfig()}
        ` : this._renderEmptyState()}

        <div class="card-actions">
          <mwc-button outlined label="取消" @click=${this._cancel}></mwc-button>
          <mwc-button 
            raised 
            label="保存配置" 
            @click=${this._save} 
            .disabled=${!this.config.plugin}
          ></mwc-button>
        </div>
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <ha-card>
        <div class="empty-state">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div style="margin-top: 16px;">初始化插件系统...</div>
        </div>
      </ha-card>
    `;
  }

  _renderPluginInfo() {
    if (!this._activePlugin) return '';
    
    const manifest = this._activePlugin.manifest;
    
    return html`
      <div class="plugin-info">
        <div class="plugin-header">
          <span class="plugin-icon">${manifest.icon}</span>
          <span class="plugin-name">${manifest.name}</span>
        </div>
        <div class="plugin-description">${manifest.description}</div>
        <div class="plugin-version">版本: ${manifest.version} | 作者: ${manifest.author}</div>
      </div>
    `;
  }

  _renderEntityConfig() {
    if (!this._activePlugin) return '';

    const requirements = this._activePlugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return html`
        <div class="config-section">
          <div class="section-title">🔧 数据源配置</div>
          <div class="entity-help">✅ 此插件无需配置数据源</div>
        </div>
      `;
    }

    return html`
      <div class="config-section">
        <div class="section-title">🔧 数据源配置</div>
        ${requirements.map(req => html`
          <entity-picker
            .hass=${this.hass}
            .label=${req.description}
            .value=${this.config.entities?.[req.key] || ''}
            .required=${req.required || false}
            .placeholder=${`配置 ${req.description}`}
            @value-changed=${e => this._onEntityChanged(req.key, e.detail.value)}
          ></entity-picker>
        `)}
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="config-section">
        <div class="section-title">🚀 开始使用</div>
        <div class="entity-help">
          💡 请先选择要配置的卡片类型。系统已加载 ${this._plugins.length} 个可用插件。
        </div>
      </div>
    `;
  }

  _onPluginChanged(event) {
    const pluginId = event.detail.pluginId;
    if (pluginId === this.config.plugin) return;

    this.config = {
      ...this.config,
      plugin: pluginId,
      entities: {}
    };

    this._activePlugin = PluginRegistry.getPlugin(pluginId);
    this._notifyConfigUpdate();
  }

  _onThemeChanged(event) {
    const theme = event.detail.theme;
    if (theme === this.config.theme) return;

    this.config.theme = theme;
    this._notifyConfigUpdate();
  }

  _onEntityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _save() {
    this._notifyConfigUpdate();
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
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