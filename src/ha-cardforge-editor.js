// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { EntityManager } from './core/entity-manager.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _activeTab: { state: true },
    _initialized: { state: true }
  };

  static styles = css`
    .editor-container {
      padding: 16px;
    }
    
    .tabs-container {
      display: flex;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 20px;
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
    }
    
    .tab-button:hover {
      color: var(--primary-text-color);
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
    }
    
    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .plugin-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }
    
    .plugin-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .plugin-card.selected {
      border-color: var(--primary-color);
    }
    
    .plugin-content {
      padding: 16px;
      text-align: center;
      position: relative;
    }
    
    .plugin-category {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--primary-color);
      color: white;
      border-radius: 8px;
      padding: 2px 8px;
      font-size: 0.7em;
      font-weight: 500;
    }
    
    .plugin-icon {
      font-size: 2.5em;
      margin-bottom: 12px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .plugin-name {
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 0.9em;
      color: var(--primary-text-color);
      line-height: 1.2;
    }
    
    .plugin-description {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      line-height: 1.3;
      height: 36px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px;
      background: var(--card-background-color);
      border-radius: 8px;
    }
    
    .entity-label {
      font-weight: 500;
      font-size: 0.9em;
      color: var(--primary-text-color);
    }
    
    .required-star {
      color: var(--error-color);
      margin-left: 4px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
    }
    
    .empty-icon {
      font-size: 3em;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    
    .card-actions {
      margin-top: 24px;
      text-align: right;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._plugins = [];
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this._activeTab = 0;
    this._initialized = false;
    
    this._initializePlugins();
  }

  async _initializePlugins() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins();
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
  }

  render() {
    if (!this._initialized) {
      return html`
        <ha-card>
          <div class="empty-state">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div style="margin-top: 16px;">初始化插件系统...</div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <div class="editor-container">
        <div class="tabs-container">
          ${this._renderTabButton(0, 'mdi:view-grid-outline', '插件市场')}
          ${this._renderTabButton(1, 'mdi:cog-outline', '实体配置', !this.config.plugin)}
          ${this._renderTabButton(2, 'mdi:palette-outline', '主题设置')}
        </div>

        <div>
          ${this._renderActiveTab()}
        </div>

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

  _renderTabButton(tabIndex, icon, label, disabled = false) {
    const isActive = this._activeTab === tabIndex;
    return html`
      <button
        class="tab-button ${isActive ? 'active' : ''}"
        @click=${() => !disabled && this._switchTab(tabIndex)}
        ?disabled=${disabled}
      >
        <ha-icon icon="${icon}"></ha-icon>
        <span>${label}</span>
      </button>
    `;
  }

  _renderActiveTab() {
    switch (this._activeTab) {
      case 0: return this._renderMarketplaceTab();
      case 1: return this._renderEntityTab();
      case 2: return this._renderThemeTab();
      default: return html`<div>未知选项卡</div>`;
    }
  }

  _renderMarketplaceTab() {
    const filteredPlugins = this._getFilteredPlugins();
    const categories = PluginRegistry.getCategories();

    return html`
      <div class="search-header">
        <ha-textfield
          style="flex: 1;"
          label="搜索插件..."
          .value=${this._searchQuery}
          @input=${e => this._onSearchChange(e.target.value)}
          icon="mdi:magnify"
        ></ha-textfield>
        
        <ha-select
          label="分类"
          .value=${this._selectedCategory}
          @selected=${e => this._onCategoryChange(e.target.value)}
          style="min-width: 120px;"
        >
          ${categories.map(category => html`
            <mwc-list-item value=${category}>
              ${category === 'all' ? '全部分类' : category}
            </mwc-list-item>
          `)}
        </ha-select>
      </div>

      <div class="plugin-grid">
        ${filteredPlugins.map(plugin => html`
          <ha-card 
            class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
            @click=${() => this._selectPlugin(plugin)}
          >
            <div class="plugin-content">
              <div class="plugin-category">${plugin.category}</div>
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-description">${plugin.description}</div>
            </div>
          </ha-card>
        `)}
      </div>

      ${filteredPlugins.length === 0 ? html`
        <div class="empty-state">
          <ha-icon icon="mdi:package-variant-closed" class="empty-icon"></ha-icon>
          <div style="font-size: 1.1em; margin-bottom: 8px;">没有找到匹配的插件</div>
          <div style="font-size: 0.9em;">尝试调整搜索条件或选择其他分类</div>
        </div>
      ` : ''}
    `;
  }

  _renderEntityTab() {
    if (!this.config.plugin) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:alert-circle-outline" class="empty-icon"></ha-icon>
          <div style="font-size: 1.1em; margin-bottom: 8px;">请先选择插件</div>
          <div style="font-size: 0.9em;">在"插件市场"选项卡中选择一个插件以配置实体</div>
        </div>
      `;
    }

    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    if (!plugin) return this._renderError('插件不存在');

    return html`
      <ha-card>
        <div style="padding: 20px;">
          <div style="
            margin-bottom: 16px;
            font-size: 1em;
            font-weight: 600;
            color: var(--primary-text-color);
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <ha-icon icon="mdi:database-cog"></ha-icon>
            <span>实体配置 - ${plugin.name}</span>
          </div>
          
          ${this._renderEntityConfig(plugin)}
        </div>
      </ha-card>
    `;
  }

  _renderEntityConfig(plugin) {
    const requirements = plugin.entityRequirements || [];

    if (requirements.length === 0) {
      return html`
        <div class="empty-state" style="padding: 20px;">
          <ha-icon icon="mdi:check-circle-outline" style="color: var(--success-color); font-size: 2em;"></ha-icon>
          <div style="margin-top: 12px; font-size: 1em;">此插件无需配置实体</div>
        </div>
      `;
    }

    return html`
      ${requirements.map(req => {
        const entityId = this.config.entities?.[req.key] || '';
        const isValid = this._validateEntity(this.hass, entityId, req);
        
        return html`
          <div class="entity-row">
            <div class="entity-label">
              ${req.description}
              ${req.required ? html`<span class="required-star">*</span>` : ''}
            </div>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${entityId}
              @value-changed=${e => this._onEntityChange(req.key, e.detail.value)}
              allow-custom-entity
            ></ha-entity-picker>
            <ha-icon 
              icon=${isValid.isValid ? 'mdi:check-circle' : 
                    req.required ? 'mdi:alert-circle' : 'mdi:information'}
              style="color: ${isValid.isValid ? 'var(--success-color)' : 
                      req.required ? 'var(--error-color)' : 'var(--warning-color)'}"
              .title=${isValid.reason || ''}
            ></ha-icon>
          </div>
        `;
      })}
      
      <div style="color: var(--secondary-text-color); font-size: 0.85em; margin-top: 16px;">
        💡 提示：带 <span class="required-star">*</span> 的实体为必选
      </div>
    `;
  }

  _renderThemeTab() {
    const themeOptions = [
      { id: 'default', name: '默认主题', icon: 'mdi:palette-outline' },
      { id: 'dark', name: '深色主题', icon: 'mdi:weather-night' },
      { id: 'material', name: '材质设计', icon: 'mdi:material-design' }
    ];

    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    
    return html`
      <ha-card>
        <div style="padding: 20px;">
          <div style="
            margin-bottom: 16px;
            font-size: 1em;
            font-weight: 600;
            color: var(--primary-text-color);
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <ha-icon icon="mdi:palette"></ha-icon>
            <span>主题设置 ${plugin ? `- ${plugin.name}` : ''}</span>
          </div>
          
          <ha-select
            label="选择主题风格"
            .value=${this.config.theme || 'default'}
            @selected=${e => this._onThemeChange(e.target.value)}
            style="width: 100%; margin-bottom: 20px;"
          >
            ${themeOptions.map(theme => html`
              <mwc-list-item value=${theme.id} graphic="icon">
                <ha-icon .icon=${theme.icon} slot="graphic"></ha-icon>
                ${theme.name}
              </mwc-list-item>
            `)}
          </ha-select>
          
          ${plugin && plugin.supportsGradient ? html`
            <div style="color: var(--secondary-text-color); font-size: 0.85em; margin-bottom: 16px;">
              ✅ 此插件支持渐变背景
            </div>
          ` : ''}
          
          <div style="color: var(--secondary-text-color); font-size: 0.85em;">
            主题更改将实时反映在系统预览区域
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderError(message) {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:alert-circle-outline" style="color: var(--error-color);"></ha-icon>
        <div style="font-size: 1.1em; margin-bottom: 8px;">${message}</div>
      </div>
    `;
  }

  _validateEntity(hass, entityId, requirement = {}) {
    if (!entityId) {
      return { 
        isValid: !requirement.required, 
        reason: requirement.required ? '必须选择实体' : '实体可选' 
      };
    }

    if (!hass || !hass.states) {
      return { isValid: false, reason: 'Home Assistant 未连接' };
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return { isValid: false, reason: '实体不存在' };
    }

    // 完全移除域名验证，允许选择任何实体
    return { isValid: true, reason: '实体有效' };
  }

  _getFilteredPlugins() {
    let filtered = this._plugins;

    if (this._selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === this._selectedCategory);
    }

    if (this._searchQuery) {
      const query = this._searchQuery.toLowerCase();
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  _switchTab(tabIndex) {
    this._activeTab = tabIndex;
    this.requestUpdate();
  }

  async _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._getDefaultEntities(plugin)
    };
    
    // 立即通知配置变更，让系统预览更新
    this._notifyConfigUpdate();
    
    // 如果有实体需求，切换到实体配置页
    if (plugin.entityRequirements && plugin.entityRequirements.length > 0) {
      this._activeTab = 1;
    }
  }

  _getDefaultEntities(plugin) {
    const defaultEntities = {};
    const requirements = plugin.entityRequirements || [];
    
    requirements.forEach(req => {
      defaultEntities[req.key] = '';
    });

    return { ...defaultEntities, ...this.config.entities };
  }

  _onSearchChange(query) {
    this._searchQuery = query;
    this.requestUpdate();
  }

  _onCategoryChange(category) {
    this._selectedCategory = category;
    this.requestUpdate();
  }

  _onEntityChange(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    
    // 立即通知配置变更，让系统预览更新
    this._notifyConfigUpdate();
  }

  _onThemeChange(theme) {
    this.config.theme = theme;
    
    // 立即通知配置变更，让系统预览更新
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    // 立即触发配置变更事件，Home Assistant 会自动更新预览
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
}

export { HaCardForgeEditor };