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
    _initialized: { state: true }
  };

  static styles = [
    sharedStyles,
    css`
      .editor-container {
        padding: 16px;
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
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins().map(p => ({ id: p.id, name: p.name }));
    this._initialized = true;
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config 
    };
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container">
        <div class="config-row">
          <plugin-selector
            .plugins=${this._plugins}
            .selectedPlugin=${this.config.plugin}
            @plugin-changed=${this._onPluginChanged}
          ></plugin-selector>
        </div>

        ${this.config.plugin ? html`
          <div class="config-row">
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

  _renderEntityConfig() {
    const activePlugin = PluginRegistry.getPlugin(this.config.plugin);
    if (!activePlugin) return '';

    const requirements = activePlugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return html`
        <div class="config-row">
          <div class="entity-help">✅ 此插件无需配置实体</div>
        </div>
      `;
    }

    return requirements.map(req => html`
      <entity-picker
        .hass=${this.hass}
        .label=${req.description}
        .value=${this.config.entities?.[req.key] || ''}
        .required=${req.required || false}
        @value-changed=${e => this._onEntityChanged(req.key, e.detail.value)}
      ></entity-picker>
    `);
  }

  _renderEmptyState() {
    return html`
      <div class="config-row">
        <div class="entity-help">💡 请先选择要配置的卡片类型</div>
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