// src/editors/ha-cardforge-editor.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { sharedStyles } from '../styles/shared-styles.js';
import { layoutStyles } from '../styles/layout-styles.js';
import { componentStyles } from '../styles/component-styles.js';
import { responsiveStyles } from '../styles/responsive-styles.js';
import './plugin-selector.js';
import './theme-selector.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _initialized: { state: true }
  };

  static styles = [
    sharedStyles,
    layoutStyles,
    componentStyles,
    responsiveStyles
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
        <!-- 基础设置 -->
        <div class="config-section">
          <div class="config-section-header">
            <span>🔍</span>
            <span>选择卡片类型</span>
          </div>
          <div class="editor-section-content">
            <plugin-selector
              .plugins=${this._plugins}
              .selectedPlugin=${this.config.plugin}
              @plugin-changed=${this._onPluginChanged}
            ></plugin-selector>
          </div>
        </div>

        ${this.config.plugin ? html`
          <!-- 主题设置 -->
          <div class="config-section">
            <div class="config-section-header">
              <span>🎨</span>
              <span>主题样式</span>
            </div>
            <div class="editor-section-content">
              <theme-selector
                .selectedTheme=${this.config.theme}
                @theme-changed=${this._onThemeChanged}
              ></theme-selector>
            </div>
          </div>

          <!-- 数据源配置 -->
          ${this._renderDataSourceConfig()}

          <!-- 操作按钮 -->
          <div class="form-actions">
            <mwc-button outlined label="取消" @click=${this._cancel}></mwc-button>
            <mwc-button 
              raised 
              label="保存配置" 
              @click=${this._save} 
              .disabled=${!this.config.plugin}
            ></mwc-button>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderDataSourceConfig() {
    const activePlugin = PluginRegistry.getPlugin(this.config.plugin);
    if (!activePlugin) return '';

    const requirements = activePlugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return html`
        <div class="config-section">
          <div class="config-section-header">
            <span>📊</span>
            <span>数据源配置</span>
          </div>
          <div class="config-hint">
            ✅ 此插件无需配置数据源
          </div>
        </div>
      `;
    }

    return html`
      <div class="config-section">
        <div class="config-section-header">
          <span>📊</span>
          <span>数据源配置</span>
        </div>
        <div class="editor-section-content">
          ${requirements.map(req => html`
            <smart-input
              .hass=${this.hass}
              .label=${req.description}
              .value=${this.config.entities?.[req.key] || ''}
              .required=${req.required || false}
              @value-changed=${e => this._onEntityChanged(req.key, e.detail.value)}
            ></smart-input>
          `)}
        </div>
        <div class="config-hint">
          💡 数据源支持实体ID、Jinja2模板或静态文本
        </div>
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="editor-container cardforge-flex-center">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div style="margin-top: 16px;">初始化插件系统...</div>
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
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

export { HaCardForgeEditor };
