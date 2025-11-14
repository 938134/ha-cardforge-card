// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../themes/index.js';
import { sharedStyles } from '../styles/shared-styles.js';
import { editorStyles } from '../styles/editor-styles.js';
import './plugin-selector.js';
import './theme-selector.js';
import './smart-input.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _themes: { state: true },
    _selectedPlugin: { state: true },
    _initialized: { state: true },
    _configVersion: { state: true }
  };

  static styles = [
    sharedStyles,
    editorStyles,
    css`
      .editor-container {
        padding: 0;
      }
      
      .vertical-layout {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      
      .section-divider {
        height: 1px;
        background: var(--divider-color);
        margin: 0;
      }
    `
  ];

  constructor() {
    super();
    this.config = { 
      plugin: '', 
      entities: {}, 
      theme: 'auto' 
    };
    this._plugins = [];
    this._themes = [];
    this._selectedPlugin = null;
    this._initialized = false;
    this._configVersion = 0;
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins();
    this._themes = themeManager.getAllThemes();
    this._initialized = true;
    
    if (this.config.plugin) {
      this._selectedPlugin = PluginRegistry.getPlugin(this.config.plugin);
    }
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
        <div class="vertical-layout">
          <!-- 插件选择区域 -->
          ${this._renderPluginSection()}
          
          <div class="section-divider"></div>
          
          <!-- 主题选择区域 -->
          ${this.config.plugin ? this._renderThemeSection() : ''}
          
          ${this.config.plugin ? html`<div class="section-divider"></div>` : ''}
          
          <!-- 数据源配置区域 -->
          ${this.config.plugin ? this._renderDatasourceSection() : ''}
          
          ${this.config.plugin ? html`<div class="section-divider"></div>` : ''}
          
          <!-- 配置提示区域 -->
          ${this.config.plugin ? this._renderPreviewSection() : ''}
          
          <!-- 操作按钮 -->
          ${this._renderActionButtons()}
        </div>
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="editor-section">
        <div class="loading-container">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="loading-text">初始化编辑器...</div>
        </div>
      </div>
    `;
  }

  _renderPluginSection() {
    return html`
      <div class="editor-section plugin-selector-section">
        <div class="section-header">
          <span class="section-icon">🎨</span>
          <span>选择卡片类型</span>
        </div>
        
        <div class="selector-grid">
          ${this._plugins.map(plugin => html`
            <div 
              class="selector-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
              @click=${() => this._onPluginSelected(plugin)}
            >
              <div class="selector-icon">${plugin.icon}</div>
              <div class="selector-name">${plugin.name}</div>
              <div class="selector-description">${plugin.version}</div>
            </div>
          `)}
        </div>
        
        ${!this.config.plugin ? html`
          <div class="config-hint">
            💡 点击上方的卡片类型开始配置
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderThemeSection() {
    return html`
      <div class="editor-section theme-selector-section">
        <div class="section-header">
          <span class="section-icon">🎭</span>
          <span>选择主题样式</span>
        </div>
        
        <div class="selector-grid">
          ${this._themes.map(theme => html`
            <div 
              class="selector-card ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._onThemeSelected(theme.id)}
            >
              <div 
                class="theme-preview ${this._getThemePreviewClass(theme.id)}"
                style=${this._getThemePreviewStyle(theme)}
              ></div>
              <div class="selector-name">${theme.name}</div>
              <div class="selector-description">${theme.description}</div>
            </div>
          `)}
        </div>
        
        <div class="config-hint">
          💡 主题将改变卡片的外观样式，选择后预览窗口会立即更新
        </div>
      </div>
    `;
  }

  _renderDatasourceSection() {
    const plugin = PluginRegistry.getPlugin(this.config.plugin);
    if (!plugin) return '';

    const requirements = plugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return html`
        <div class="editor-section datasource-section">
          <div class="section-header">
            <span class="section-icon">🔧</span>
            <span>数据源配置</span>
          </div>
          <div class="entity-help">✅ 此插件无需配置数据源</div>
        </div>
      `;
    }

    return html`
      <div class="editor-section datasource-section">
        <div class="section-header">
          <span class="section-icon">🔧</span>
          <span>数据源配置</span>
        </div>
        
        <div class="datasource-list">
          ${requirements.map(req => html`
            <div class="config-row">
              <label class="entity-label">
                ${req.description}
                ${req.required ? html`<span class="required-star">*</span>` : ''}
              </label>
              
              <smart-input
                .hass=${this.hass}
                .value=${this.config.entities?.[req.key] || ''}
                .placeholder=${`输入${req.description}`}
                @value-changed=${e => this._onDatasourceChanged(req.key, e.detail.value)}
              ></smart-input>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderPreviewSection() {
    return html`
      <div class="editor-section preview-section">
        <div class="section-header">
          <span class="section-icon">👀</span>
          <span>实时预览</span>
        </div>
        
        <div class="config-hint">
          💡 所有配置变更都会立即在预览窗口中生效
        </div>
      </div>
    `;
  }

  _renderActionButtons() {
    return html`
      <div class="editor-section">
        <div class="action-buttons">
          <mwc-button 
            outlined 
            label="取消" 
            @click=${this._cancel}
          ></mwc-button>
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

  _getThemePreviewClass(themeId) {
    const previewClasses = {
      'auto': 'theme-preview-auto',
      'glass': 'theme-preview-glass',
      'gradient': 'theme-preview-gradient-1',
      'neon': 'theme-preview-neon'
    };
    return previewClasses[themeId] || 'theme-preview-auto';
  }

  _getThemePreviewStyle(theme) {
    const preview = themeManager.getThemePreview(theme.id);
    if (preview.background) {
      return `background: ${preview.background}; border: ${preview.border || 'none'};`;
    }
    return '';
  }

  _onPluginSelected(plugin) {
    if (plugin.id === this.config.plugin) return;

    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: {}
    };
    this._selectedPlugin = plugin;
    this._forcePreviewUpdate('plugin');
  }

  _onThemeSelected(themeId) {
    if (themeId === this.config.theme) return;

    this.config = {
      ...this.config,
      theme: themeId
    };
    this._forcePreviewUpdate('theme');
  }

  _onDatasourceChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._forcePreviewUpdate('datasource');
  }

  _forcePreviewUpdate(source) {
    // 增加版本号确保配置对象引用变化
    this._configVersion++;
    
    // 创建全新的配置对象
    const newConfig = {
      ...this.config,
      _timestamp: Date.now(),
      _version: this._configVersion
    };
    
    console.log(`🔄 强制预览更新 (${source}):`, newConfig.theme);
    
    // 立即触发配置更新
    this._notifyConfigUpdate(newConfig);
    
    // 强制组件重新渲染
    this.requestUpdate();
    
    // 多重触发确保HA收到更新
    setTimeout(() => {
      const refreshedConfig = {
        ...newConfig,
        _refreshed: Date.now()
      };
      this._notifyConfigUpdate(refreshedConfig);
    }, 10);
    
    // 再次触发确保预览更新
    setTimeout(() => {
      const finalConfig = {
        ...newConfig,
        _final: true
      };
      this._notifyConfigUpdate(finalConfig);
    }, 50);
  }

  _notifyConfigUpdate(config = this.config) {
    // 深度复制配置对象
    const configCopy = JSON.parse(JSON.stringify(config));
    
    // 移除内部属性
    delete configCopy._timestamp;
    delete configCopy._version;
    delete configCopy._refreshed;
    delete configCopy._final;
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configCopy }
    }));
  }

  _save() {
    this._notifyConfigUpdate();
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