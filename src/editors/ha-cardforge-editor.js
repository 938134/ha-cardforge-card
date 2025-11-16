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

      /* ha-combo-box 样式优化 */
      ha-combo-box {
        width: 100%;
      }
    `
  ];

  constructor() {
    super();
    this.config = { 
      type: 'custom:ha-cardforge-card',  // 确保类型字段
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
      type: 'custom:ha-cardforge-card',  // 确保类型字段
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
    
    // 分组处理配置项
    const booleanFields = Object.entries(schema).filter(([_, field]) => field.type === 'boolean');
    const otherFields = Object.entries(schema).filter(([_, field]) => field.type !== 'boolean');
    
    return html`
      <div class="editor-section">
        <div class="section-header">
          <span class="section-icon">⚙️</span>
          <span>卡片配置</span>
        </div>
        
        <!-- 布尔类型配置 - 紧凑网格布局 -->
        ${booleanFields.length > 0 ? html`
          <div class="switch-group-compact">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        <!-- 其他类型配置 - 紧凑网格布局 -->
        ${otherFields.length > 0 ? html`
          <div class="config-grid-compact">
            ${otherFields.map(([key, field]) => this._renderOtherField(key, field))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderBooleanField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;
    
    return html`
      <div class="switch-item-compact">
        <span class="switch-label-compact">
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

  _renderOtherField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
      case 'select':
        // 将选项数组转换为 ha-combo-box 需要的格式
        const items = field.options.map(option => ({
          value: option,
          label: option
        }));
        
        return html`
          <div class="config-field-compact">
            <label class="config-label-compact">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-combo-box
              .items=${items}
              .value=${currentValue}
              @value-changed=${e => this._onConfigChanged(key, e.detail.value)}
              allow-custom-value
            ></ha-combo-box>
          </div>
        `;
        
      case 'number':
        return html`
          <div class="config-field-compact">
            <label class="config-label-compact">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-textfield
              class="number-input-compact"
              .value=${currentValue}
              @input=${e => this._onConfigChanged(key, e.target.value)}
              type="number"
              min=${field.min}
              max=${field.max}
              outlined
            ></ha-textfield>
          </div>
        `;
        
      default:
        return html`
          <div class="config-field-compact">
            <label class="config-label-compact">
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
        
        <div class="config-grid-compact">
          ${requirements.map(req => html`
            <div class="config-field-compact">
              <label class="config-label-compact">
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

    // 创建完整的新配置，确保包含所有必需字段
    const newConfig = {
      type: 'custom:ha-cardforge-card',  // 确保包含 type 字段
      plugin: plugin.id,
      entities: {},
      theme: 'auto'
    };

    this.config = newConfig;
    this._selectedPlugin = PluginRegistry.getPlugin(plugin.id);
    this._pluginManifest = this._selectedPlugin?.manifest || null;
    
    // 延迟通知配置更新，确保 DOM 已更新
    setTimeout(() => {
      this._notifyConfigUpdate();
    }, 0);
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
    // 确保配置对象包含所有必需字段
    const configToSend = {
      type: 'custom:ha-cardforge-card',
      ...this.config
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
    }));
    this.requestUpdate();
  }

  _save() {
    const configToSend = {
      type: 'custom:ha-cardforge-card',
      ...this.config
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
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