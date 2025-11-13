// src/editors/ha-cardforge-editor.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { editorCoreStyles } from '../styles/index.js';
import { validateEditorConfig, getConfigPreview } from './editor-utils.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _initialized: { state: true },
    _activePlugin: { state: true }
  };

  static styles = editorCoreStyles;

  constructor() {
    super();
    this.config = { plugin: '', entities: {}, theme: 'auto' };
    this._plugins = [];
    this._initialized = false;
    this._activePlugin = null;
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins();
    this._initialized = true;
    
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
        <div class="editor-layout">
          <!-- 左侧：基础配置 -->
          <div class="config-section basic-config">
            <div class="section-header">
              <div class="section-icon">⚙️</div>
              <div>
                <div class="section-title">基础配置</div>
                <div class="section-description">选择卡片类型和主题样式</div>
              </div>
            </div>
            
            <div class="config-group">
              <div class="config-item">
                <label class="entity-label">卡片类型</label>
                <plugin-selector
                  .plugins=${this._plugins}
                  .selectedPlugin=${this.config.plugin}
                  @plugin-changed=${this._onPluginChanged}
                ></plugin-selector>
                <div class="entity-help">选择要使用的卡片插件类型</div>
              </div>

              ${this.config.plugin ? html`
                <div class="config-item">
                  <label class="entity-label">主题样式</label>
                  <theme-selector
                    .selectedTheme=${this.config.theme}
                    @theme-changed=${this._onThemeChanged}
                  ></theme-selector>
                  <div class="entity-help">选择卡片的视觉主题风格</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- 右侧：插件信息 -->
          ${this.config.plugin && this._activePlugin ? html`
            <div class="config-section plugin-info">
              <div class="section-header">
                <div class="section-icon">📋</div>
                <div>
                  <div class="section-title">${this._activePlugin.manifest.name}</div>
                  <div class="section-description">${this._activePlugin.manifest.description}</div>
                </div>
              </div>
              
              <div class="plugin-meta">
                <div class="meta-item">
                  <div class="meta-label">版本</div>
                  <div class="meta-value">v${this._activePlugin.manifest.version}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">分类</div>
                  <div class="meta-value">${this._getCategoryName(this._activePlugin.manifest.category)}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">作者</div>
                  <div class="meta-value">${this._activePlugin.manifest.author}</div>
                </div>
              </div>
              
              <div class="feature-tags">
                <div class="feature-tag ${this._activePlugin.manifest.themeSupport ? 'supported' : 'unsupported'}">
                  ${this._activePlugin.manifest.themeSupport ? '✅' : '❌'} 主题支持
                </div>
                <div class="feature-tag ${this._activePlugin.manifest.gradientSupport ? 'supported' : 'unsupported'}">
                  ${this._activePlugin.manifest.gradientSupport ? '✅' : '❌'} 渐变支持
                </div>
              </div>
            </div>
          ` : this._renderPluginInfoPlaceholder()}
        </div>

        <!-- 底部：实体配置 -->
        ${this.config.plugin ? html`
          <div class="config-section plugin-config-section">
            <div class="section-header">
              <div class="section-icon">🔗</div>
              <div>
                <div class="section-title">数据源配置</div>
                <div class="section-description">配置卡片显示所需的数据来源</div>
              </div>
            </div>
            
            ${this._renderEntityConfig()}
          </div>
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
      <div class="editor-container">
        <div class="empty-state">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div style="margin-top: 16px;">初始化插件系统...</div>
        </div>
      </div>
    `;
  }

  _renderPluginInfoPlaceholder() {
    return html`
      <div class="config-section">
        <div class="empty-state">
          <div class="empty-icon">🎨</div>
          <div class="empty-title">选择卡片类型</div>
          <div class="empty-description">
            从左侧选择要配置的卡片类型，查看详细信息和配置选项
          </div>
        </div>
      </div>
    `;
  }

  _renderEntityConfig() {
    if (!this._activePlugin) return '';

    const requirements = this._activePlugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <div class="empty-title">无需额外配置</div>
          <div class="empty-description">
            此插件无需配置实体数据源，将使用系统默认数据
          </div>
        </div>
      `;
    }

    return html`
      <div class="entities-grid">
        ${requirements.map(req => html`
          <entity-picker
            .hass=${this.hass}
            .label=${req.description}
            .value=${this.config.entities?.[req.key] || ''}
            .required=${req.required || false}
            @value-changed=${e => this._onEntityChanged(req.key, e.detail.value)}
          ></entity-picker>
        `)}
      </div>
    `;
  }

  _getCategoryName(category) {
    const categories = {
      'info': '信息',
      'time': '时间',
      'weather': '天气',
      'sensor': '传感器',
      'control': '设备控制'
    };
    return categories[category] || category;
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
    try {
      validateEditorConfig(this.config);
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this.config }
      }));
    } catch (error) {
      console.warn('配置验证失败:', error.message);
    }
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