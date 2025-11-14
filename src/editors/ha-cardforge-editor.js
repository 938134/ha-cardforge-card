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
    _previewUpdateCount: { state: true } // 新增：用于强制刷新预览
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
      
      /* 主题预览区域 */
      .theme-preview-hint {
        margin-top: 8px;
        font-size: 0.8em;
        color: var(--secondary-text-color);
        text-align: center;
        padding: 8px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: 4px;
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
    this._previewUpdateCount = 0; // 初始化预览更新计数器
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins();
    this._themes = themeManager.getAllThemes();
    this._initialized = true;
    
    // 如果有配置，设置选中的插件
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
          <!-- 卡片类型选择区域 -->
          ${this._renderPluginSection()}
          
          <div class="section-divider"></div>
          
          <!-- 主题样式选择区域 -->
          ${this.config.plugin ? this._renderThemeSection() : ''}
          
          ${this.config.plugin ? html`<div class="section-divider"></div>` : ''}
          
          <!-- 数据源配置区域 -->
          ${this.config.plugin ? this._renderDatasourceSection() : ''}
          
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
          <span>卡片类型</span>
        </div>
        
        <div class="plugin-grid">
          ${this._plugins.map(plugin => html`
            <div 
              class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
              @click=${() => this._onPluginSelected(plugin)}
            >
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
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
          <span>主题样式</span>
        </div>
        
        <div class="theme-grid">
          ${this._themes.map(theme => html`
            <div 
              class="theme-card ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._onThemeSelected(theme.id)}
            >
              <div 
                class="theme-preview ${this._getThemePreviewClass(theme.id)}"
                style=${this._getThemePreviewStyle(theme)}
              ></div>
              <div class="theme-name">${theme.name}</div>
            </div>
          `)}
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
              <div class="config-label">
                ${req.description}
                ${req.required ? html`<span class="required-star">*</span>` : ''}
              </div>
              
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
      'auto': 'theme-auto-preview',
      'glass': 'theme-glass-preview',
      'gradient': 'theme-gradient-preview',
      'neon': 'theme-neon-preview'
    };
    return previewClasses[themeId] || 'theme-auto-preview';
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
    this._notifyConfigUpdate();
  }

  _onThemeSelected(themeId) {
    if (themeId === this.config.theme) return;

    this.config = {
      ...this.config,
      theme: themeId
    };
    
    // 立即通知配置变化，强制刷新预览
    this._notifyConfigUpdate();
    
    // 强制组件重新渲染
    this.requestUpdate();
  }

  _onDatasourceChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._notifyConfigUpdate();
  }

  _forcePreviewUpdate() {
    // 增加更新计数器来强制刷新
    this._previewUpdateCount++;
    
    // 立即通知配置变化
    this._notifyConfigUpdate();
    
    // 强制组件更新
    this.requestUpdate();
    
    console.log('主题切换，强制刷新预览:', this.config.theme);
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { 
        config: this.config,
        // 添加时间戳和更新计数来确保每次都是新的配置对象
        _timestamp: Date.now(),
        _updateCount: this._previewUpdateCount
      }
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