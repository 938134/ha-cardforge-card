// src/ha-cardforge-editor.js (优化版)
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './core/plugin-registry.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _categories: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _activeTab: { state: true },
    _initialized: { state: true },
    _selectedPlugin: { state: true },
    _pluginConfigForm: { state: true }
  };

  static styles = css`
    .editor-container {
      padding: 16px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .tab-header {
      display: flex;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    
    .tab-button {
      padding: 12px 24px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }
    
    .tab-button:hover {
      color: var(--primary-color);
    }
    
    .tab-button.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }
    
    .tab-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .search-header {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .search-field {
      flex: 1;
      min-width: 200px;
    }
    
    .category-select {
      min-width: 140px;
    }
    
    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .plugin-card {
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      height: 140px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .plugin-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .plugin-card.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .plugin-card.featured {
      border-color: var(--accent-color);
    }
    
    .plugin-icon {
      font-size: 2.5em;
      margin-bottom: 12px;
      text-align: center;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .plugin-name {
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 0.95em;
      text-align: center;
      color: var(--primary-text-color);
      line-height: 1.2;
    }
    
    .plugin-description {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      text-align: center;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .plugin-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--primary-color);
      color: white;
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 0.7em;
      font-weight: 500;
    }
    
    .featured-badge {
      background: var(--accent-color);
    }
    
    .config-section {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      border: 1px solid var(--divider-color);
    }
    
    .section-title {
      margin: 0 0 20px 0;
      font-size: 1.2em;
      font-weight: 600;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .entity-config {
      display: grid;
      gap: 16px;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 150px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }
    
    .entity-label {
      font-weight: 500;
      font-size: 0.9em;
    }
    
    .entity-label .required {
      color: var(--error-color);
      margin-left: 4px;
    }
    
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }
    
    .theme-option {
      padding: 16px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .theme-option:hover {
      border-color: var(--primary-color);
    }
    
    .theme-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .theme-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }
    
    .theme-name {
      font-size: 0.85em;
      font-weight: 500;
    }
    
    .loading-container {
      text-align: center;
      padding: 60px 20px;
      color: var(--secondary-text-color);
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--secondary-text-color);
    }
    
    .actions {
      margin-top: 24px;
      text-align: right;
      border-top: 1px solid var(--divider-color);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    @media (max-width: 600px) {
      .plugin-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      }
      
      .entity-row {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .search-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._plugins = [];
    this._categories = ['all'];
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this._activeTab = 0;
    this._initialized = false;
    this._selectedPlugin = null;
    this._pluginConfigForm = null;
    
    this._initializeEditor();
  }

  async _initializeEditor() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins();
    this._categories = PluginRegistry.getCategories();
    this._initialized = true;
    this.requestUpdate();
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      theme: 'default',
      ...config 
    };
    
    // 如果有插件被选中，加载其配置表单
    if (this.config.plugin) {
      this._loadPluginConfigForm(this.config.plugin);
    }
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container">
        ${this._renderTabs()}
        ${this._renderActiveTab()}
        ${this._renderActions()}
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="loading-container">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div style="margin-top: 16px;">加载插件系统中...</div>
      </div>
    `;
  }

  _renderTabs() {
    const tabs = [
      { id: 0, icon: 'mdi:view-grid-outline', label: '插件市场', disabled: false },
      { id: 1, icon: 'mdi:cog-outline', label: '实体配置', disabled: !this.config.plugin },
      { id: 2, icon: 'mdi:palette-outline', label: '主题设置', disabled: false },
      { id: 3, icon: 'mdi:tune', label: '高级设置', disabled: !this.config.plugin }
    ];

    return html`
      <div class="tab-header">
        ${tabs.map(tab => html`
          <button
            class="tab-button ${this._activeTab === tab.id ? 'active' : ''}"
            @click=${() => this._switchTab(tab.id)}
            ?disabled=${tab.disabled}
          >
            <ha-icon icon="${tab.icon}"></ha-icon>
            <span>${tab.label}</span>
          </button>
        `)}
      </div>
    `;
  }

  _renderActiveTab() {
    switch (this._activeTab) {
      case 0: return this._renderMarketplaceTab();
      case 1: return this._renderEntityTab();
      case 2: return this._renderThemeTab();
      case 3: return this._renderAdvancedTab();
      default: return html`<div>未知选项卡</div>`;
    }
  }

  _renderMarketplaceTab() {
    const filteredPlugins = PluginRegistry.searchPlugins(this._searchQuery, this._selectedCategory);

    return html`
      <div class="search-header">
        <ha-textfield
          class="search-field"
          label="搜索插件..."
          .value=${this._searchQuery}
          @input=${e => this._searchQuery = e.target.value}
          icon="mdi:magnify"
        ></ha-textfield>
        
        <ha-select
          class="category-select"
          label="分类筛选"
          .value=${this._selectedCategory}
          @selected=${e => this._selectedCategory = e.target.value}
        >
          ${this._categories.map(category => html`
            <mwc-list-item value=${category}>
              ${category === 'all' ? '全部分类' : category}
            </mwc-list-item>
          `)}
        </ha-select>
        
        <div style="font-size: 0.9em; color: var(--secondary-text-color);">
          共 ${filteredPlugins.length} 个插件
        </div>
      </div>

      <div class="plugin-grid">
        ${filteredPlugins.map(plugin => html`
          <div class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''} ${plugin.featured ? 'featured' : ''}"
               @click=${() => this._selectPlugin(plugin)}>
            ${plugin.featured ? html`
              <div class="plugin-badge featured-badge">⭐ 推荐</div>
            ` : ''}
            <div class="plugin-badge">${plugin.category}</div>
            
            <div class="plugin-icon">${plugin.icon}</div>
            <div class="plugin-name">${plugin.name}</div>
            <div class="plugin-description">${plugin.description}</div>
          </div>
        `)}
      </div>

      ${filteredPlugins.length === 0 ? this._renderEmptyState() : ''}
    `;
  }

  _renderEntityTab() {
    if (!this.config.plugin) {
      return this._renderNoPluginSelected();
    }

    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    if (!plugin) return this._renderError('插件不存在');

    const configForm = this._pluginConfigForm;
    if (!configForm) return this._renderLoading();

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:database-cog"></ha-icon>
          <span>实体配置 - ${plugin.name}</span>
        </div>
        
        <div class="entity-config">
          ${configForm.entityRequirements.map(req => this._renderEntityRow(req))}
        </div>
        
        ${configForm.entityRequirements.length === 0 ? html`
          <div style="text-align: center; padding: 40px 20px; color: var(--secondary-text-color);">
            <ha-icon icon="mdi:check-circle-outline" style="color: var(--success-color); font-size: 2em;"></ha-icon>
            <div style="margin-top: 12px; font-size: 1em;">此插件无需配置实体</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityRow(requirement) {
    const entityId = this.config.entities?.[requirement.key] || '';
    const validation = this._validateEntity(this.hass, entityId, requirement);

    return html`
      <div class="entity-row">
        <div class="entity-label">
          ${requirement.description}
          ${requirement.required ? html`<span class="required">*</span>` : ''}
        </div>
        
        <ha-entity-picker
          .hass=${this.hass}
          .value=${entityId}
          @value-changed=${e => this._entityChanged(requirement.key, e.detail.value)}
          allow-custom-entity
          .label=${`选择${requirement.description}`}
          .domainFilter=${requirement.domains}
        ></ha-entity-picker>
        
        <ha-icon 
          icon=${validation.valid ? 'mdi:check-circle' : 
                requirement.required ? 'mdi:alert-circle' : 'mdi:information'}
          style="color: ${validation.valid ? 'var(--success-color)' : 
                          requirement.required ? 'var(--error-color)' : 'var(--warning-color)'}"
          .title=${validation.message || ''}
        ></ha-icon>
      </div>
    `;
  }

  _renderThemeTab() {
    const themeOptions = [
      { id: 'default', name: '默认主题', icon: 'mdi:palette-outline' },
      { id: 'dark', name: '深色主题', icon: 'mdi:weather-night' },
      { id: 'material', name: '材质设计', icon: 'mdi:material-design' },
      { id: 'minimal', name: '极简风格', icon: 'mdi:cellphone' },
      { id: 'gradient', name: '渐变主题', icon: 'mdi:gradient' }
    ];

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>主题设置</span>
        </div>
        
        <div class="theme-grid">
          ${themeOptions.map(theme => html`
            <div class="theme-option ${this.config.theme === theme.id ? 'selected' : ''}"
                 @click=${() => this._themeChanged(theme.id)}>
              <div class="theme-icon">
                <ha-icon icon="${theme.icon}"></ha-icon>
              </div>
              <div class="theme-name">${theme.name}</div>
            </div>
          `)}
        </div>
        
        ${this.config.plugin ? html`
          <div style="margin-top: 16px; padding: 12px; background: var(--info-color, #e3f2fd); border-radius: 8px;">
            <div style="font-size: 0.9em; color: var(--primary-text-color);">
              💡 当前插件 "${this._plugins.find(p => p.id === this.config.plugin)?.name}" 
              ${this._pluginSupportsGradient() ? '支持' : '不支持'}渐变主题
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderAdvancedTab() {
    if (!this.config.plugin) {
      return this._renderNoPluginSelected();
    }

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:tune"></ha-icon>
          <span>高级设置</span>
        </div>
        
        <div style="color: var(--secondary-text-color);">
          <p>高级配置选项正在开发中...</p>
          <p>未来版本将支持自定义 CSS、JavaScript 和更复杂的配置。</p>
        </div>
      </div>
    `;
  }

  _renderActions() {
    return html`
      <div class="actions">
        <mwc-button outlined label="取消" @click=${this._cancel}></mwc-button>
        <div>
          <mwc-button outlined label="重置" @click=${this._reset} style="margin-right: 8px;"></mwc-button>
          <mwc-button raised label="保存配置" @click=${this._save} .disabled=${!this.config.plugin}></mwc-button>
        </div>
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:package-variant-closed" style="font-size: 4em; opacity: 0.3;"></ha-icon>
        <div style="font-size: 1.2em; margin: 16px 0 8px;">没有找到匹配的插件</div>
        <div style="font-size: 0.9em;">尝试调整搜索条件或选择其他分类</div>
      </div>
    `;
  }

  _renderNoPluginSelected() {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:alert-circle-outline" style="font-size: 4em; color: var(--warning-color);"></ha-icon>
        <div style="font-size: 1.2em; margin: 16px 0 8px;">请先选择插件</div>
        <div style="font-size: 0.9em;">在"插件市场"选项卡中选择一个插件以开始配置</div>
      </div>
    `;
  }

  _renderError(message) {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:alert-circle-outline" style="font-size: 4em; color: var(--error-color);"></ha-icon>
        <div style="font-size: 1.2em; margin: 16px 0 8px;">${message}</div>
      </div>
    `;
  }

  // 事件处理方法
  async _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: {} // 重置实体配置
    };
    
    // 加载插件配置表单
    await this._loadPluginConfigForm(plugin.id);
    
    // 如果有实体需求，切换到实体配置页
    if (this._pluginConfigForm?.entityRequirements.length > 0) {
      this._activeTab = 1;
    } else {
      this._activeTab = 2; // 否则跳到主题设置
    }
    
    this._notifyConfigUpdate();
  }

  async _loadPluginConfigForm(pluginId) {
    this._pluginConfigForm = PluginRegistry.getPluginConfigForm(pluginId);
    this.requestUpdate();
  }

  _pluginSupportsGradient() {
    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    return plugin?.supportsGradient || false;
  }

  _validateEntity(hass, entityId, requirement) {
    if (!entityId) {
      return {
        valid: !requirement.required,
        message: requirement.required ? '必须选择实体' : '实体可选'
      };
    }

    if (!hass || !hass.states) {
      return { valid: false, message: 'Home Assistant 未连接' };
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return { valid: false, message: '实体不存在' };
    }

    const domain = entityId.split('.')[0];
    if (requirement.domains && !requirement.domains.includes(domain)) {
      return { 
        valid: false, 
        message: `实体类型应为 ${requirement.domains.join(' 或 ')}，实际为 ${domain}` 
      };
    }

    return { valid: true, message: '实体有效' };
  }

  _switchTab(tabIndex) {
    this._activeTab = tabIndex;
    this.requestUpdate();
  }

  _entityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._notifyConfigUpdate();
  }

  _themeChanged(theme) {
    this.config.theme = theme;
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

  _reset() {
    this.config = {
      plugin: this.config.plugin, // 保持当前插件
      entities: {},
      theme: 'default'
    };
    this._notifyConfigUpdate();
  }
}

customElements.define('ha-cardforge-editor', HaCardForgeEditor);
export { HaCardForgeEditor };