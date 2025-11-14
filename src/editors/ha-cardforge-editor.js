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
    _configVersion: { state: true } // 添加配置版本号用于强制刷新
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
    this._configVersion = 0; // 初始化配置版本号
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
    this._configVersion = 0; // 重置版本号
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
          💡 主题将改变卡片的外观样式
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
          <span>配置提示</span>
        </div>
        
        <div class="config-hint">
          💡 配置完成后，点击保存即可在卡片中看到效果。Home Assistant 会实时预览配置结果。
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
    this._forcePreviewUpdate();
  }

  _onThemeSelected(themeId) {
    if (themeId === this.config.theme) return;

    this.config = {
      ...this.config,
      theme: themeId
    };
    
    // 强制刷新预览
    this._forcePreviewUpdate();
  }

  _onDatasourceChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._forcePreviewUpdate();
  }

  _forcePreviewUpdate() {
    // 增加配置版本号，强制触发更新
    this._configVersion++;
    
    // 创建新的配置对象确保引用变化
    const newConfig = {
      ...this.config,
      _version: this._configVersion
    };
    
    // 触发配置更新事件
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
    
    // 强制组件更新
    this.requestUpdate();
    
    console.log('🔧 强制刷新预览，配置版本:', this._configVersion);
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
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