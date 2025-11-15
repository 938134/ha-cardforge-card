// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../themes/index.js';
import { 
  cardForgeStyles,
  generateThemePreviewStyles 
} from '../styles/index.js';
import './plugin-selector.js';
import './theme-selector.js';
import './smart-input.js';
import './decoration-editor.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _themes: { state: true },
    _selectedPlugin: { state: true },
    _initialized: { state: true },
    _configVersion: { state: true },
    _themePreviewStyles: { state: true },
    _isDarkMode: { state: true },
    _showAdvanced: { state: true }
  };

  static styles = [
    cardForgeStyles,
    css`
      :host {
        display: block;
        max-width: 100%;
      }
      
      /* 深色模式强制应用 */
      :host(.dark-mode) .editor-container,
      :host(.cf-dark-mode) .editor-container {
        background: var(--cf-dark-background) !important;
        border-color: var(--cf-dark-border) !important;
      }
      
      :host(.dark-mode) .editor-section,
      :host(.cf-dark-mode) .editor-section {
        background: var(--cf-dark-surface) !important;
        border-bottom-color: var(--cf-dark-border) !important;
      }

      .advanced-toggle {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        cursor: pointer;
        padding: var(--cf-spacing-sm);
        border-radius: var(--cf-radius-md);
        transition: all var(--cf-transition-fast);
        user-select: none;
        margin-bottom: var(--cf-spacing-md);
      }
      
      .advanced-toggle:hover {
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .advanced-icon {
        transition: transform var(--cf-transition-normal);
        font-size: 0.8em;
        opacity: 0.7;
      }
      
      .advanced-toggle[data-open] .advanced-icon {
        transform: rotate(180deg);
      }

      /* 预览区域样式 */
      .preview-container {
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.03);
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-container ha-cardforge-card {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
      }

      /* 深色模式预览 */
      @media (prefers-color-scheme: dark) {
        .preview-container {
          border-color: var(--cf-dark-border);
          background: rgba(var(--cf-rgb-primary), 0.05);
        }
      }

      /* 移动端预览优化 */
      @media (max-width: 600px) {
        .preview-container {
          padding: var(--cf-spacing-sm);
          min-height: 100px;
        }
        
        .preview-container ha-cardforge-card {
          max-width: 100%;
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = { 
      plugin: '', 
      entities: {}, 
      theme: 'auto',
      decorations: {}
    };
    this._plugins = [];
    this._themes = [];
    this._selectedPlugin = null;
    this._initialized = false;
    this._configVersion = 0;
    this._themePreviewStyles = '';
    this._isDarkMode = false;
    this._showAdvanced = false;
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    await themeManager.initialize();
    
    this._plugins = PluginRegistry.getAllPlugins();
    this._themes = themeManager.getAllThemes();
    
    this._themePreviewStyles = generateThemePreviewStyles(this._themes);
    this._detectDarkMode();
    this._initialized = true;
    
    if (this.config.plugin) {
      this._selectedPlugin = PluginRegistry.getPlugin(this.config.plugin);
    }
  }

  _detectDarkMode() {
    const haAppLayout = document.querySelector('ha-app-layout');
    const haSidebar = document.querySelector('ha-sidebar');
    
    this._isDarkMode = 
      document.body.classList.contains('dark') ||
      (haAppLayout && haAppLayout.classList.contains('dark')) ||
      (haSidebar && haSidebar.classList.contains('dark')) ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (this._isDarkMode) {
      this.classList.add('cf-dark-mode');
    }
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      theme: 'auto',
      decorations: {},
      ...config 
    };
    this._configVersion = 0;
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container ${this._isDarkMode ? 'cf-dark-mode' : ''}">
        <style>${this._themePreviewStyles}</style>
        
        <div class="editor-layout">
          <!-- 插件选择区域 -->
          ${this._renderPluginSection()}
          
          <!-- 主题选择区域 -->
          ${this.config.plugin ? this._renderThemeSection() : ''}
          
          <!-- 数据源配置区域 -->
          ${this.config.plugin ? this._renderDatasourceSection() : ''}
          
          <!-- 装饰设置区域 -->
          ${this.config.plugin ? this._renderDecorationSection() : ''}
          
          <!-- 实时预览区域 -->
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
          <span class="section-icon">🎨</span>
          <span>卡片类型</span>
        </div>
        
        <!-- 使用80x80尺寸的卡片 -->
        <div class="cf-grid cf-grid-auto cf-gap-md">
          ${this._plugins.map(plugin => html`
            <div 
              class="cf-card cf-selector-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
              @click=${() => this._onPluginSelected(plugin)}
            >
              <div class="cf-selector-icon">${plugin.icon}</div>
              <div class="cf-selector-name">${plugin.name}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderThemeSection() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <span class="section-icon">🎭</span>
          <span>主题样式</span>
        </div>
        
        <div class="cf-grid cf-grid-auto cf-gap-md">
          ${this._themes.map(theme => html`
            <div 
              class="cf-card cf-selector-card ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._onThemeSelected(theme.id)}
            >
              <div 
                class="theme-preview theme-preview-${theme.id}"
                style="width: 100%; height: 50px; border-radius: var(--cf-radius-sm); margin-bottom: var(--cf-spacing-xs);"
              ></div>
              <div class="cf-selector-name">${theme.name}</div>
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
        <div class="editor-section">
          <div class="section-header">
            <span class="section-icon">🔧</span>
            <span>数据源</span>
          </div>
          <div class="cf-text-sm cf-text-secondary">此插件无需配置数据源</div>
        </div>
      `;
    }

    return html`
      <div class="editor-section">
        <div class="section-header">
          <span class="section-icon">🔧</span>
          <span>数据源配置</span>
        </div>
        
        <div class="cf-flex cf-flex-column cf-gap-lg">
          ${requirements.map(req => html`
            <div class="cf-input-container">
              <label class="cf-text-sm cf-font-medium cf-mb-sm">
                ${req.description}
                ${req.required ? html`<span class="cf-error">*</span>` : ''}
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

  _renderDecorationSection() {
    if (!this.config.plugin) return '';

    return html`
      <div class="editor-section">
        <div 
          class="advanced-toggle ${this._showAdvanced ? 'cf-interactive' : ''}"
          data-open="${this._showAdvanced}"
          @click=${this._toggleAdvanced}
        >
          <span class="section-icon">🎨</span>
          <span>高级装饰设置</span>
          <span class="advanced-icon" style="margin-left: auto;">▼</span>
        </div>
        
        ${this._showAdvanced ? html`
          <decoration-editor
            .config=${this.config}
            @decoration-changed=${this._onDecorationChanged}
          ></decoration-editor>
        ` : ''}
      </div>
    `;
  }

  _renderPreviewSection() {
    if (!this.config.plugin) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <span class="section-icon">👁️</span>
          <span>实时预览</span>
        </div>
        
        <div class="preview-container">
          <ha-cardforge-card
            .hass=${this.hass}
            .config=${{
              ...this.config,
              _preview: true
            }}
          ></ha-cardforge-card>
        </div>
        
        <div class="cf-text-xs cf-text-secondary cf-mt-sm">
          💡 预览基于当前配置和实体状态
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

  _onPluginSelected(plugin) {
    if (plugin.id === this.config.plugin) return;

    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: {},
      decorations: {} // 切换插件时重置装饰设置
    };
    this._selectedPlugin = plugin;
    this._showAdvanced = false; // 切换插件时关闭高级设置
    this._forcePreviewUpdate();
  }

  _onThemeSelected(themeId) {
    if (themeId === this.config.theme) return;

    this.config = {
      ...this.config,
      theme: themeId
    };
    this._forcePreviewUpdate();
  }

  _onDatasourceChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._forcePreviewUpdate();
  }

  _onDecorationChanged(e) {
    this.config.decorations = {
      ...this.config.decorations,
      ...e.detail.decorations
    };
    this._forcePreviewUpdate();
  }

  _toggleAdvanced() {
    this._showAdvanced = !this._showAdvanced;
  }

  _forcePreviewUpdate() {
    this._configVersion++;
    const newConfig = {
      ...this.config,
      _version: this._configVersion
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
    this.requestUpdate();
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