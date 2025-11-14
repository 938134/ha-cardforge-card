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
    _initialized: { state: true }
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
          <!-- 插件选择区域 -->
          ${this._renderPluginSection()}
          
          <div class="section-divider"></div>
          
          <!-- 主题选择区域 -->
          ${this.config.plugin ? this._renderThemeSection() : ''}
          
          ${this.config.plugin ? html`<div class="section-divider"></div>` : ''}
          
          <!-- 数据源配置区域 -->
          ${this.config.plugin ? this._renderDatasourceSection() : ''}
          
          ${this.config.plugin ? html`<div class="section-divider"></div>` : ''}
          
          <!-- 预览区域 -->
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
          <span>选择主题样式</span>
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
            <div class="datasource-item">
              <div class="datasource-header">
                <span class="datasource-icon">📊</span>
                <span class="datasource-title">${req.description}</span>
                ${req.required ? html`<span class="datasource-required">* 必填</span>` : ''}
              </div>
              
              <div class="datasource-description">
                支持实体ID、Jinja2模板或直接文本
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
        
        <div class="config-hint">
          💡 数据源支持实体选择、模板表达式或直接文本输入
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
        
        <div class="preview-container">
          ${this._renderCardPreview()}
        </div>
        
        <div class="config-hint">
          💡 预览基于当前配置实时生成
        </div>
      </div>
    `;
  }

  _renderCardPreview() {
    if (!this.config.plugin) {
      return html`
        <div class="preview-placeholder">
          请先选择卡片类型以查看预览
        </div>
      `;
    }

    try {
      const plugin = PluginRegistry.createPluginInstance(this.config.plugin);
      if (!plugin) {
        return html`
          <div class="preview-placeholder">
            无法加载插件预览
          </div>
        `;
      }

      const template = plugin.getTemplate(this.config, this.hass, this._getPreviewEntities());
      const styles = plugin.getStyles(this.config);

      return html`
        <style>${styles}</style>
        ${unsafeHTML(template)}
      `;
    } catch (error) {
      return html`
        <div class="preview-placeholder error">
          ⚠️ 预览生成失败: ${error.message}
        </div>
      `;
    }
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
      'gradient': themeManager.getThemePreview('gradient').background ? 'theme-preview-gradient-1' : 'theme-preview-gradient-1',
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

  _getPreviewEntities() {
    const entities = {};
    const plugin = PluginRegistry.getPlugin(this.config.plugin);
    if (!plugin) return entities;

    const requirements = plugin.manifest.entityRequirements || [];
    requirements.forEach(req => {
      const value = this.config.entities?.[req.key];
      if (value && this.hass?.states[value]) {
        entities[req.key] = this.hass.states[value];
      }
    });

    return entities;
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

    this.config.theme = themeId;
    this._notifyConfigUpdate();
  }

  _onDatasourceChanged(key, value) {
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

// 导入 unsafeHTML
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

export { HaCardForgeEditor };