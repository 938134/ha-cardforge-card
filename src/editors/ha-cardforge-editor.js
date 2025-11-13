// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { sharedStyles } from '../core/shared-styles.js';
import './plugin-selector.js';
import './theme-selector.js';
import './entity-config.js';
import './smart-input.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _initialized: { state: true },
    _focusedInputs: { state: true }
  };

  static styles = [
    sharedStyles,
    css`
      .editor-container {
        padding: 16px;
      }
      
      .config-row {
        margin-bottom: 20px;
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
    this._focusedInputs = new Set();
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

          <entity-config
            .hass=${this.hass}
            .activePlugin=${PluginRegistry.getPlugin(this.config.plugin)}
            .entities=${this.config.entities}
            .focusedInputs=${this._focusedInputs}
            @entity-changed=${this._onEntityChanged}
            @focus-changed=${this._onFocusChanged}
          ></entity-config>
        ` : ''}

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

  _onPluginChanged(event) {
    const pluginId = event.detail.pluginId;
    if (pluginId === this.config.plugin) return;

    this.config = {
      ...this.config,
      plugin: pluginId,
      entities: {}
    };

    this._focusedInputs.clear();
    this._notifyConfigUpdate();
  }

  _onThemeChanged(event) {
    const theme = event.detail.theme;
    if (theme === this.config.theme) return;

    this.config.theme = theme;
    this._notifyConfigUpdate();
  }

  _onEntityChanged(event) {
    this.config.entities = {
      ...this.config.entities,
      [event.detail.key]: event.detail.value
    };
    this._notifyConfigUpdate();
  }

  _onFocusChanged(event) {
    const { key, focused } = event.detail;
    
    if (focused) {
      this._focusedInputs.add(key);
    } else {
      setTimeout(() => {
        this._focusedInputs.delete(key);
        this.requestUpdate();
      }, 150);
    }
    this.requestUpdate();
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