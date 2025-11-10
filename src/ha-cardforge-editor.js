// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PLUGIN_INFO } from './core/plugin-registry.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _activeTab: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 800px;
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      border: 1px solid var(--divider-color);
    }
    
    /* 标签页样式 */
    .tabs-container {
      margin-bottom: 20px;
    }
    
    .tab-buttons {
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
    }
    
    .tab-button:hover {
      color: var(--primary-text-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .tab-button.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }
    
    .tab-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .tab-content {
      min-height: 200px;
    }
    
    /* 搜索和分类 */
    .filter-header {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
    }
    
    .search-field {
      flex: 1;
    }
    
    /* 插件网格 */
    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .plugin-card {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    
    .plugin-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .plugin-card.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.08);
      box-shadow: 0 1px 4px rgba(var(--rgb-primary-color), 0.2);
    }
    
    .plugin-icon {
      font-size: 2em;
      margin-bottom: 8px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .plugin-name {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 0.85em;
      color: var(--primary-text-color);
      line-height: 1.2;
    }
    
    .plugin-description {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      line-height: 1.3;
      height: 32px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .plugin-category {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--primary-color);
      color: white;
      border-radius: 8px;
      padding: 1px 6px;
      font-size: 0.65em;
      font-weight: 500;
    }
    
    /* 实体配置 */
    .entity-config {
      margin: 24px 0;
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid var(--divider-color);
    }
    
    .entity-config-title {
      margin: 0 0 12px 0;
      font-size: 1em;
      font-weight: 600;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 6px;
    }
    
    .entity-label {
      font-weight: 500;
      font-size: 0.85em;
      color: var(--primary-text-color);
    }
    
    /* 操作按钮 */
    .actions {
      margin-top: 24px;
      text-align: right;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    /* 空状态 */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
    }
    
    .empty-state ha-icon {
      font-size: 2.5em;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    
    /* 下拉选择器容器 - 防止点击外部关闭 */
    .select-container {
      position: relative;
    }
    
    .select-container ha-select {
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._plugins = PLUGIN_INFO;
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this._activeTab = 0;
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      ...config 
    };
  }

  render() {
    return html`
      <div class="editor">
        <!-- 标签页导航 -->
        <div class="tabs-container">
          <div class="tab-buttons">
            <button 
              class="tab-button ${this._activeTab === 0 ? 'active' : ''}"
              @click=${() => this._switchTab(0)}
            >
              <ha-icon icon="mdi:view-grid-outline" style="margin-right: 8px;"></ha-icon>
              插件市场
            </button>
            <button 
              class="tab-button ${this._activeTab === 1 ? 'active' : ''}"
              @click=${() => this._switchTab(1)}
              .disabled=${!this.config.plugin}
            >
              <ha-icon icon="mdi:cog-outline" style="margin-right: 8px;"></ha-icon>
              实体配置
            </button>
            <button 
              class="tab-button ${this._activeTab === 2 ? 'active' : ''}"
              @click=${() => this._switchTab(2)}
            >
              <ha-icon icon="mdi:palette-outline" style="margin-right: 8px;"></ha-icon>
              主题设置
            </button>
          </div>
          
          <div class="tab-content">
            ${this._renderActiveTab()}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
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
    const categories = this._getCategories();

    return html`
      <!-- 搜索和分类 -->
      <div class="filter-header">
        <ha-textfield
          class="search-field"
          label="搜索插件..."
          .value=${this._searchQuery}
          @input=${e => this._searchQuery = e.target.value}
          icon="mdi:magnify"
        ></ha-textfield>
        
        <div class="select-container">
          <ha-select
            label="分类"
            .value=${this._selectedCategory}
            @closed=${this._preventSelectClose}
            @selected=${e => this._categoryChanged(e.target.value)}
            style="min-width: 120px;"
          >
            <mwc-list-item value="all">全部分类</mwc-list-item>
            ${categories.map(category => html`
              <mwc-list-item value=${category}>${category}</mwc-list-item>
            `)}
          </ha-select>
        </div>
      </div>

      <!-- 插件网格 -->
      <div class="plugin-grid">
        ${filteredPlugins.map(plugin => html`
          <div class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
               @click=${() => this._selectPlugin(plugin)}>
            <div class="plugin-category">${plugin.category}</div>
            <div class="plugin-icon">${plugin.icon}</div>
            <div class="plugin-name">${plugin.name}</div>
            <div class="plugin-description">${plugin.description}</div>
          </div>
        `)}
      </div>

      <!-- 空状态 -->
      ${filteredPlugins.length === 0 ? html`
        <div class="empty-state">
          <ha-icon icon="mdi:package-variant-closed"></ha-icon>
          <div style="font-size: 1em; margin-bottom: 8px;">没有找到匹配的插件</div>
          <div style="font-size: 0.85em;">尝试调整搜索条件或选择其他分类</div>
        </div>
      ` : ''}
    `;
  }

  _renderEntityTab() {
    if (!this.config.plugin) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <div style="font-size: 1em; margin-bottom: 8px;">请先选择插件</div>
          <div style="font-size: 0.85em;">在"插件市场"选项卡中选择一个插件以配置实体</div>
        </div>
      `;
    }

    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    if (!plugin) return this._renderError('插件不存在');

    return html`
      <div class="entity-config">
        <div class="entity-config-title">
          <ha-icon icon="mdi:database-cog"></ha-icon>
          <span>实体配置 - ${plugin.name}</span>
        </div>
        
        ${this._renderEntityConfig(plugin)}
      </div>
    `;
  }

  _renderEntityConfig(plugin) {
    const requirements = plugin.entityRequirements || [];

    if (requirements.length === 0) {
      return html`
        <div style="text-align: center; padding: 20px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:check-circle-outline" style="color: var(--success-color);"></ha-icon>
          <div style="margin-top: 8px; font-size: 0.9em;">此插件无需配置实体</div>
        </div>
      `;
    }

    return html`
      ${requirements.map(req => html`
        <div class="entity-row">
          <div class="entity-label">${req.description}</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this.config.entities?.[req.key] || ''}
            @value-changed=${e => this._entityChanged(req.key, e.detail.value)}
            allow-custom-entity
            .label=${`选择${req.description}`}
          ></ha-entity-picker>
          <ha-icon 
            icon=${this.config.entities?.[req.key] ? 'mdi:check-circle' : 'mdi:alert-circle-outline'}
            style="color: ${this.config.entities?.[req.key] ? 'var(--success-color)' : 'var(--warning-color)'}"
          ></ha-icon>
        </div>
      `)}
    `;
  }

  _renderThemeTab() {
    return html`
      <div class="entity-config">
        <div class="entity-config-title">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>主题设置</span>
        </div>
        
        <div style="padding: 16px;">
          <div class="select-container">
            <ha-select
              label="选择主题风格"
              .value=${this.config.theme || 'default'}
              @closed=${this._preventSelectClose}
              @selected=${e => this._themeChanged(e.target.value)}
              style="width: 100%;"
            >
              <mwc-list-item value="default">
                <ha-icon icon="mdi:palette-outline" slot="graphic"></ha-icon>
                默认主题
              </mwc-list-item>
              <mwc-list-item value="dark">
                <ha-icon icon="mdi:weather-night" slot="graphic"></ha-icon>
                深色主题
              </mwc-list-item>
              <mwc-list-item value="material">
                <ha-icon icon="mdi:material-design" slot="graphic"></ha-icon>
                材质设计
              </mwc-list-item>
            </ha-select>
          </div>
          
          <div style="margin-top: 12px; color: var(--secondary-text-color); font-size: 0.85em;">
            主题设置将影响卡片的外观样式
          </div>
        </div>
      </div>
    `;
  }

  _renderError(message) {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:alert-circle-outline" style="color: var(--error-color);"></ha-icon>
        <div style="font-size: 1em; margin-bottom: 8px;">${message}</div>
      </div>
    `;
  }

  _getCategories() {
    const categories = new Set();
    this._plugins.forEach(plugin => categories.add(plugin.category));
    return Array.from(categories);
  }

  _getFilteredPlugins() {
    let filtered = this._plugins;

    // 分类筛选
    if (this._selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === this._selectedCategory);
    }

    // 搜索筛选
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
    this._notifyPreviewUpdate();
  }

  async _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._getDefaultEntities(plugin)
    };
    
    // 切换到实体配置标签页（如果有实体需求）
    const hasEntities = plugin.entityRequirements && plugin.entityRequirements.length > 0;
    if (hasEntities) {
      this._activeTab = 1;
    }
    
    this.requestUpdate();
    this._notifyPreviewUpdate();
  }

  _getDefaultEntities(plugin) {
    const defaults = {};
    plugin.entityRequirements?.forEach(req => {
      if (req.key === 'time') defaults.time = 'sensor.time';
      if (req.key === 'date') defaults.date = 'sensor.date';
      if (req.key === 'week') defaults.week = 'sensor.xing_qi';
    });
    return { ...defaults, ...this.config.entities };
  }

  _categoryChanged(category) {
    this._selectedCategory = category;
    this.requestUpdate();
  }

  _entityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this.requestUpdate();
    this._notifyPreviewUpdate();
  }

  _themeChanged(theme) {
    this.config = {
      ...this.config,
      theme: theme
    };
    this.requestUpdate();
    this._notifyPreviewUpdate();
  }

  // 防止下拉选择器点击外部关闭编辑器
  _preventSelectClose(e) {
    e.stopPropagation();
  }

  _notifyPreviewUpdate() {
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this.config }
      }));
    }, 0);
  }

  _save() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
  }
}

export { HaCardForgeEditor };
