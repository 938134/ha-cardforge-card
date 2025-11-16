// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../themes/index.js';
import { 
  cardForgeStyles,
  generateThemePreviewStyles 
} from '../styles/index.js';
import './smart-input.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _themes: { state: true },
    _selectedPlugin: { state: true },
    _initialized: { state: true },
    _themePreviewStyles: { state: true },
    _isDarkMode: { state: true },
    _pluginManifest: { state: true }
  };

  static styles = [
    cardForgeStyles,
    css`
      :host {
        display: block;
        max-width: 100%;
      }

      /* 修复下拉菜单最大高度 */
      ha-select {
        --mdc-menu-max-height: 300px;
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
    this._themePreviewStyles = '';
    this._isDarkMode = false;
    this._pluginManifest = null;
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
      this._pluginManifest = this._selectedPlugin?.manifest || null;
    }
  }

  _detectDarkMode() {
    this._isDarkMode = 
      document.body.classList.contains('dark') ||
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
      ...config 
    };
    
    if (this.config.plugin) {
      this._selectedPlugin = PluginRegistry.getPlugin(this.config.plugin);
      this._pluginManifest = this._selectedPlugin?.manifest || null;
    }
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container ${this._isDarkMode ? 'cf-dark-mode' : ''}">
        <style>${this._themePreviewStyles}</style>
        
        <div class="editor-layout">
          <!-- 1. 卡片类型区域 -->
          ${this._renderPluginSection()}
          
          <!-- 2. 主题样式区域 -->
          ${this.config.plugin ? this._renderThemeSection() : ''}
          
          <!-- 3. 卡片配置区域 -->
          ${this.config.plugin ? this._renderPluginConfigSection() : ''}
          
          <!-- 4. 数据源配置区域 -->
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
        
        <div class="selector-grid">
          ${this._plugins.map(plugin => html`
            <div 
              class="selector-item ${this.config.plugin === plugin.id ? 'selected' : ''}"
              @click=${() => this._onPluginSelected(plugin)}
            >
              <div class="selector-icon">${plugin.icon}</div>
              <div class="selector-name">${plugin.name}</div>
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
        
        <div class="selector-grid">
          ${this._themes.map(theme => html`
            <div 
              class="selector-item ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._onThemeSelected(theme.id)}
            >
              <div class="theme-preview theme-preview-${theme.id}"></div>
              <div class="selector-name">${theme.name}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderPluginConfigSection() {
    if (!this._pluginManifest?.config_schema) return '';
    
    const schema = this._pluginManifest.config_schema;
    
    return html`
      <div class="editor-section">
        <div class="section-header">
          <span class="section-icon">⚙️</span>
          <span>卡片配置</span>
        </div>
        
        <div class="config-grid">
          ${Object.entries(schema).map(([key, field]) => 
            this._renderConfigField(key, field)
          )}
        </div>
      </div>
    `;
  }

  _renderConfigField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    // 处理布尔类型（开关）
    if (field.type === 'boolean') {
      return html`
        <div class="switch-item">
          <span class="switch-label">
            ${field.label}
            ${field.required ? html`<span class="required-star">*</span>` : ''}
          </span>
          <ha-switch
            .checked=${!!currentValue}
            @change=${e => this._onConfigChanged(key, e.target.checked)}
          ></ha-switch>
        </div>
      `;
    }

    // 处理选择类型（下拉）
    if (field.type === 'select') {
      return html`
        <div class="config-field">
          <label class="config-label">
            ${field.label}
            ${field.required ? html`<span class="required-star">*</span>` : ''}
          </label>
          <ha-select
            .value=${currentValue}
            @selected=${e => {
              this._onConfigChanged(key, e.target.value);
              // 延迟关闭下拉菜单
              setTimeout(() => {
                const select = e.target;
                if (select && select.menu) {
                  select.menu.open = false;
                }
              }, 100);
            }}
            fixedMenuPosition
            naturalMenuWidth
          >
            ${field.options.map(option => html`
              <mwc-list-item value="${option}">${option}</mwc-list-item>
            `)}
          </ha-select>
        </div>
      `;
    }

    // 处理数字类型
    if (field.type === 'number') {
      return html`
        <div class="config-field">
          <label class="config-label">
            ${field.label}
            ${field.required ? html`<span class="required-star">*</span>` : ''}
          </label>
          <ha-textfield
            class="number-input"
            .value=${currentValue}
            @input=${e => this._onConfigChanged(key, e.target.value)}
            type="number"
            min=${field.min}
            max=${field.max}
            outlined
          ></ha-textfield>
        </div>
      `;
    }

    // 默认文本输入
    return html`
      <div class="config-field">
        <label class="config-label">
          ${field.label}
          ${field.required ? html`<span class="required-star">*</span>` : ''}
        </label>
        <ha-textfield
          .value=${currentValue}
          @input=${e => this._onConfigChanged(key, e.target.value)}
          outlined
        ></ha-textfield>
      </div>
    `;
  }

  _renderDatasourceSection() {
    const requirements = this._pluginManifest?.entity_requirements || [];
    
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
        
        <div class="config-grid">
          ${requirements.map(req => html`
            <div class="config-field">
              <label class="config-label">
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
      plugin: plugin.id,
      entities: {},
      theme: 'auto'
    };
    this._selectedPlugin = PluginRegistry.getPlugin(plugin.id);
    this._pluginManifest = this._selectedPlugin?.manifest || null;
    this._notifyConfigUpdate();
  }

  _onThemeSelected(themeId) {
    if (themeId === this.config.theme) return;

    this.config = {
      ...this.config,
      theme: themeId
    };
    this._notifyConfigUpdate();
  }

  _onConfigChanged(key, value) {
    this.config = {
      ...this.config,
      [key]: value
    };
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
    this.requestUpdate();
  }

  _save() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
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