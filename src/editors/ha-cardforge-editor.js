// src/editors/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from '../core/plugin-registry.js';
import { themeManager } from '../core/theme-manager.js';
import { entityManager } from '../core/entity-manager.js';
import { configManager } from '../core/config-manager.js';
import { layoutEngine } from '../core/layout-engine.js';
import { entityStrategies } from '../core/entity-strategies.js';
import { foundationStyles } from '../core/styles.js';
import './plugin-selector.js';
import './theme-selector.js';
import './base-config-editor.js';
import './advanced-config-editor.js';
import './entity-strategy-editor.js';
import './layout-editor.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _themes: { state: true },
    _selectedPlugin: { state: true },
    _initialized: { state: true },
    _currentStrategy: { state: true },
    _strategyData: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .editor-container {
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-sm);
        overflow: hidden;
      }

      .editor-section {
        background: var(--cf-surface);
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
      }

      .editor-section:last-child {
        border-bottom: none;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }
    `
  ];

  constructor() {
    super();
    this.config = { 
      type: 'custom:ha-cardforge-card',
      plugin: '', 
      entities: {}, 
      theme: 'auto' 
    };
    this._plugins = [];
    this._themes = [];
    this._selectedPlugin = null;
    this._initialized = false;
    this._currentStrategy = 'stateless';
    this._strategyData = {};
  }

  async firstUpdated() {
    // 初始化核心系统
    await PluginRegistry.initialize();
    await themeManager.initialize();
    
    this._plugins = PluginRegistry.getAllPlugins();
    this._themes = themeManager.getAllThemes();
    
    // 设置管理器
    entityManager.setHass(this.hass);
    
    this._initialized = true;
    
    if (this.config.plugin) {
      await this._loadPluginInstance();
    }
  }

  setConfig(config) {
    this.config = { 
      type: 'custom:ha-cardforge-card',
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config 
    };
    
    if (this.config.plugin && this._initialized) {
      this._loadPluginInstance();
    }
  }

  async _loadPluginInstance() {
    this._selectedPlugin = PluginRegistry.getPlugin(this.config.plugin);
    
    if (this._selectedPlugin) {
      // 设置实体策略
      const strategyType = entityStrategies.detectStrategy(this._selectedPlugin.manifest);
      this._currentStrategy = strategyType;
      
      const strategy = entityManager.setStrategy(strategyType, this._selectedPlugin.manifest);
      this._strategyData = strategy.process(this.config.entities, this.hass);
      
      // 设置配置管理器 schema
      if (this._selectedPlugin.manifest.config_schema) {
        configManager.setSchema('advanced', this._selectedPlugin.manifest.config_schema);
      }
    }
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container">
        ${this._renderPluginSection()}
        ${this._renderThemeSection()}
        ${this._renderBaseConfigSection()}
        ${this._renderAdvancedConfigSection()}
        ${this._renderEntityStrategySection()}
        ${this._renderLayoutSection()}
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
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>卡片类型</span>
        </div>
        <plugin-selector
          .plugins=${this._plugins}
          .selectedPlugin=${this.config.plugin}
          @plugin-changed=${this._onPluginChanged}
        ></plugin-selector>
      </div>
    `;
  }

  _renderThemeSection() {
    if (!this.config.plugin) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:format-paint"></ha-icon>
          <span>主题样式</span>
        </div>
        <theme-selector
          .themes=${this._themes}
          .selectedTheme=${this.config.theme}
          @theme-changed=${this._onThemeChanged}
        ></theme-selector>
      </div>
    `;
  }

  _renderBaseConfigSection() {
    if (!this.config.plugin) return '';
    
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:tune"></ha-icon>
          <span>基础设置</span>
        </div>
        <base-config-editor
          .config=${this.config}
          @config-changed=${this._onBaseConfigChanged}
        ></base-config-editor>
      </div>
    `;
  }

  _renderAdvancedConfigSection() {
    if (!this.config.plugin || !this._selectedPlugin?.manifest.config_schema) return '';
    
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span>高级设置</span>
        </div>
        <advanced-config-editor
          .schema=${this._selectedPlugin.manifest.config_schema}
          .config=${this.config}
          @config-changed=${this._onAdvancedConfigChanged}
        ></advanced-config-editor>
      </div>
    `;
  }

  _renderEntityStrategySection() {
    if (!this.config.plugin) return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:database"></ha-icon>
          <span>数据源配置</span>
        </div>
        <entity-strategy-editor
          .strategyType=${this._currentStrategy}
          .strategyData=${this._strategyData}
          .hass=${this.hass}
          @entities-changed=${this._onEntitiesChanged}
        ></entity-strategy-editor>
      </div>
    `;
  }

  _renderLayoutSection() {
    if (!this.config.plugin || this._currentStrategy !== 'free_layout') return '';

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:view-grid"></ha-icon>
          <span>布局设置</span>
        </div>
        <layout-editor
          .layoutConfig=${this._strategyData.layout || {}}
          @layout-changed=${this._onLayoutChanged}
        ></layout-editor>
      </div>
    `;
  }

  async _onPluginChanged(e) {
    this.config = {
      type: 'custom:ha-cardforge-card',
      plugin: e.detail.pluginId,
      entities: {},
      theme: 'auto'
    };

    await this._loadPluginInstance();
    this._notifyConfigUpdate();
  }

  _onThemeChanged(e) {
    this.config.theme = e.detail.theme;
    configManager.setTheme(e.detail.theme);
    this._notifyConfigUpdate();
  }

  _onBaseConfigChanged(e) {
    const result = configManager.updateConfig('base', e.detail.config);
    if (result.success) {
      this.config = { ...this.config, ...e.detail.config };
      this._notifyConfigUpdate();
    }
  }

  _onAdvancedConfigChanged(e) {
    const result = configManager.updateConfig('advanced', e.detail.config);
    if (result.success) {
      this.config = { ...this.config, ...e.detail.config };
      this._notifyConfigUpdate();
    }
  }

  _onEntitiesChanged(e) {
    this.config.entities = e.detail.entities;
    
    // 重新处理实体数据
    if (entityManager.getCurrentStrategy()) {
      this._strategyData = entityManager.processEntities(this.config.entities, this.hass);
    }
    
    this._notifyConfigUpdate();
  }

  _onLayoutChanged(e) {
    if (this._strategyData.layout) {
      this._strategyData.layout = { ...this._strategyData.layout, ...e.detail.layout };
      
      // 更新配置中的布局设置
      this.config.entities = {
        ...this.config.entities,
        _layout_columns: this._strategyData.layout.columns,
        _layout_style: this._strategyData.layout.style,
        _layout_spacing: this._strategyData.layout.spacing
      };
      
      this._notifyConfigUpdate();
    }
  }

  _notifyConfigUpdate() {
    const fullConfig = configManager.getFullConfig();
    const configToSend = {
      type: 'custom:ha-cardforge-card',
      ...fullConfig,
      plugin: this.config.plugin,
      entities: this.config.entities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
    }));
    this.requestUpdate();
  }
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

export { HaCardForgeEditor };