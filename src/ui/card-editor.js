// src/ui/card-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginManager } from '../core/plugin-manager.js';
import { EntityManager } from '../core/entity-manager.js';
import { ThemeManager } from '../core/theme-manager.js';

export class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _categories: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _loading: { state: true },
    _activeTab: { state: true },
    _selectedPlugin: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 800px;
    }
    
    .config-section {
      margin-bottom: 24px;
    }
    
    .section-title {
      margin: 0 0 16px 0;
      font-size: 1.2em;
      font-weight: bold;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
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
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
      position: relative;
    }
    
    .plugin-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .plugin-card.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .plugin-icon {
      font-size: 2.2em;
      margin-bottom: 8px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .plugin-name {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 0.9em;
    }
    
    .plugin-description {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      line-height: 1.3;
      height: 32px;
      overflow: hidden;
    }
    
    .plugin-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--primary-color);
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 0.65em;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .entity-label {
      font-weight: 500;
      font-size: 0.9em;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }
    
    .no-plugins {
      text-align: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }
    
    .actions {
      margin-top: 24px;
      text-align: right;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
    }
    
    .tab-content {
      display: none;
      padding: 16px 0;
    }
    
    .tab-content.active {
      display: block;
    }
    
    .theme-previews {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .theme-preview {
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .theme-preview:hover {
      border-color: var(--primary-color);
    }
    
    .theme-preview.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .theme-name {
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .theme-description {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    /* 标签页样式 */
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 20px;
    }
    
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      font-weight: 500;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    .tab:hover {
      background: var(--secondary-background-color);
    }

    .current-selection {
      background: var(--info-color, #0288d1);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 0.9em;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .entity-requirements {
      background: var(--secondary-background-color);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9em;
    }

    .requirement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .requirement-badge {
      background: var(--primary-color);
      color: white;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.7em;
    }

    .optional-badge {
      background: var(--secondary-text-color);
      color: white;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.7em;
    }

    .flex {
      flex: 1;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._plugins = [];
    this._categories = ['all'];
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this._loading = false;
    this._activeTab = 'marketplace';
    this._selectedPlugin = null;
    this.pluginManager = new PluginManager();
    this.entityManager = new EntityManager();
    this.themeManager = new ThemeManager();
  }

  async firstUpdated() {
    await this._loadPlugins();
    // 如果有配置，设置选中的插件
    if (this.config.plugin) {
      this._selectedPlugin = this._plugins.find(p => p.id === this.config.plugin);
    }
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      theme: 'default',
      entities: {},
      ...config 
    };
    // 更新选中的插件信息
    if (this.config.plugin && this._plugins.length > 0) {
      this._selectedPlugin = this._plugins.find(p => p.id === this.config.plugin);
    }
  }

  async _loadPlugins() {
    this._loading = true;
    try {
      this._plugins = await this.pluginManager.getAvailablePlugins();
      this._categories = await this.pluginManager.getCategories();
      console.log(`✅ 加载了 ${this._plugins.length} 个插件`);
    } catch (error) {
      console.error('加载插件失败:', error);
      this._plugins = [];
    } finally {
      this._loading = false;
    }
  }

  render() {
    return html`
      <div class="editor">
        <!-- 自定义标签页 -->
        <div class="tabs">
          <div class="tab ${this._activeTab === 'marketplace' ? 'active' : ''}" 
               @click=${() => this._switchTab('marketplace')}>
            <ha-icon icon="mdi:store"></ha-icon>
            插件市场
          </div>
          <div class="tab ${this._activeTab === 'entities' ? 'active' : ''}" 
               @click=${() => this._switchTab('entities')}
               .disabled=${!this.config.plugin}>
            <ha-icon icon="mdi:cog"></ha-icon>
            实体配置
          </div>
          <div class="tab ${this._activeTab === 'themes' ? 'active' : ''}" 
               @click=${() => this._switchTab('themes')}>
            <ha-icon icon="mdi:palette"></ha-icon>
            主题设置
          </div>
        </div>

        <!-- 当前选择显示 -->
        ${this.config.plugin ? html`
          <div class="current-selection">
            <ha-icon icon="mdi:check-circle"></ha-icon>
            已选择: ${this._selectedPlugin?.name || this.config.plugin}
          </div>
        ` : ''}

        <!-- 插件市场 -->
        <div class="tab-content ${this._activeTab === 'marketplace' ? 'active' : ''}">
          ${this._renderMarketplaceTab()}
        </div>

        <!-- 实体配置 -->
        <div class="tab-content ${this._activeTab === 'entities' ? 'active' : ''}">
          ${this._renderEntityTab()}
        </div>

        <!-- 主题设置 -->
        <div class="tab-content ${this._activeTab === 'themes' ? 'active' : ''}">
          ${this._renderThemeTab()}
        </div>

        <div class="actions">
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

  _renderMarketplaceTab() {
    if (this._loading) {
      return html`
        <div class="config-section">
          <div class="loading">
            <ha-circular-progress active></ha-circular-progress>
            <div style="margin-top: 16px;">加载插件市场中...</div>
          </div>
        </div>
      `;
    }

    const filteredPlugins = this._getFilteredPlugins();

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:store"></ha-icon>
          <span>插件市场</span>
        </div>
        
        <div class="search-header">
          <ha-textfield
            class="flex"
            label="搜索插件..."
            .value=${this._searchQuery}
            @input=${e => this._searchQuery = e.target.value}
            icon="mdi:magnify"
          ></ha-textfield>
          
          <ha-select
            label="分类"
            .value=${this._selectedCategory}
            @selected=${e => this._selectedCategory = e.target.value}
          >
            ${this._categories.map(category => html`
              <mwc-list-item value=${category}>
                ${category === 'all' ? '全部分类' : category}
              </mwc-list-item>
            `)}
          </ha-select>
        </div>

        <div class="plugin-grid">
          ${filteredPlugins.map(plugin => html`
            <div class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
                 @click=${() => this._selectPlugin(plugin)}>
              ${plugin.featured ? html`<div class="plugin-badge">⭐</div>` : ''}
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-description">${plugin.description}</div>
            </div>
          `)}
        </div>

        ${filteredPlugins.length === 0 ? html`
          <div class="no-plugins">
            <ha-icon icon="mdi:alert-circle-outline" style="font-size: 3em;"></ha-icon>
            <div style="margin-top: 12px;">没有找到匹配的插件</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityTab() {
    if (!this.config.plugin) {
      return html`
        <div class="config-section">
          <div class="no-plugins">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <div style="margin-top: 12px;">请先在插件市场选择插件</div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span>实体配置</span>
        </div>

        <!-- 实体需求说明 -->
        ${this._selectedPlugin ? html`
          <div class="entity-requirements">
            <div style="font-weight: bold; margin-bottom: 8px;">实体需求:</div>
            ${this._renderEntityRequirements(this._selectedPlugin)}
          </div>
        ` : ''}
        
        <div class="form-group">
          ${this._renderEntityConfig()}
        </div>
      </div>
    `;
  }

  _renderEntityRequirements(pluginInfo) {
    const requirements = this._getPluginRequirements(pluginInfo);
    
    return html`
      ${requirements.required.length > 0 ? html`
        <div style="margin-bottom: 8px;">
          <div style="font-size: 0.8em; margin-bottom: 4px;">必需实体:</div>
          ${requirements.required.map(req => html`
            <div class="requirement-item">
              <span class="requirement-badge">必需</span>
              <span>${req.description} (${req.type})</span>
            </div>
          `)}
        </div>
      ` : ''}
      
      ${requirements.optional.length > 0 ? html`
        <div>
          <div style="font-size: 0.8em; margin-bottom: 4px;">可选实体:</div>
          ${requirements.optional.map(req => html`
            <div class="requirement-item">
              <span class="optional-badge">可选</span>
              <span>${req.description} (${req.type})</span>
            </div>
          `)}
        </div>
      ` : ''}
    `;
  }

  _getPluginRequirements(pluginInfo) {
    // 根据插件类型返回实体需求
    const requirements = {
      required: [],
      optional: []
    };

    if (pluginInfo.requiresWeek || pluginInfo.category === 'time') {
      requirements.required.push(
        { key: 'time', type: 'sensor', description: '时间实体' },
        { key: 'date', type: 'sensor', description: '日期实体' }
      );
      requirements.optional.push(
        { key: 'week', type: 'sensor', description: '星期实体' }
      );
    }

    if (pluginInfo.category === 'weather') {
      requirements.required.push(
        { key: 'weather', type: 'weather', description: '天气实体' }
      );
    }

    if (pluginInfo.id === 'clock-lunar') {
      requirements.optional.push(
        { key: 'lunar', type: 'sensor', description: '农历实体' }
      );
    }

    return requirements;
  }

  _renderEntityConfig() {
    const entities = this.config.entities || {};
    const pluginInfo = this._selectedPlugin;

    return html`
      ${pluginInfo?.requiresWeek || pluginInfo?.category === 'time' ? html`
        <div class="entity-row">
          <div class="entity-label">时间实体</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${entities.time || ''}
            @value-changed=${e => this._entityChanged('time', e.detail.value)}
            allow-custom-entity
          ></ha-entity-picker>
          <ha-icon-button 
            .path=${entities.time ? 'mdi:check-circle' : 'mdi:alert-circle'}
            .style="color: ${entities.time ? 'var(--success-color)' : 'var(--warning-color)'}"
          ></ha-icon-button>
        </div>

        <div class="entity-row">
          <div class="entity-label">日期实体</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${entities.date || ''}
            @value-changed=${e => this._entityChanged('date', e.detail.value)}
            allow-custom-entity
          ></ha-entity-picker>
          <ha-icon-button 
            .path=${entities.date ? 'mdi:check-circle' : 'mdi:alert-circle'}
            .style="color: ${entities.date ? 'var(--success-color)' : 'var(--warning-color)'}"
          ></ha-icon-button>
        </div>

        <div class="entity-row">
          <div class="entity-label">星期实体</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${entities.week || ''}
            @value-changed=${e => this._entityChanged('week', e.detail.value)}
            allow-custom-entity
          ></ha-entity-picker>
          <ha-icon-button 
            .path=${entities.week ? 'mdi:check-circle' : 'mdi:information-outline'}
            .style="color: ${entities.week ? 'var(--success-color)' : 'var(--disabled-text-color)'}"
          ></ha-icon-button>
        </div>
      ` : ''}

      ${pluginInfo?.category === 'weather' ? html`
        <div class="entity-row">
          <div class="entity-label">天气实体</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${entities.weather || ''}
            @value-changed=${e => this._entityChanged('weather', e.detail.value)}
            allow-custom-entity
          ></ha-entity-picker>
          <ha-icon-button 
            .path=${entities.weather ? 'mdi:check-circle' : 'mdi:information-outline'}
            .style="color: ${entities.weather ? 'var(--success-color)' : 'var(--disabled-text-color)'}"
          ></ha-icon-button>
        </div>
      ` : ''}

      ${pluginInfo?.id === 'clock-lunar' ? html`
        <div class="entity-row">
          <div class="entity-label">农历实体</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${entities.lunar || ''}
            @value-changed=${e => this._entityChanged('lunar', e.detail.value)}
            allow-custom-entity
          ></ha-entity-picker>
          <ha-icon-button 
            .path=${entities.lunar ? 'mdi:check-circle' : 'mdi:information-outline'}
            .style="color: ${entities.lunar ? 'var(--success-color)' : 'var(--disabled-text-color)'}"
          ></ha-icon-button>
        </div>
      ` : ''}

      ${!pluginInfo?.requiresWeek && pluginInfo?.category !== 'weather' && pluginInfo?.id !== 'clock-lunar' ? html`
        <div class="no-plugins">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div style="margin-top: 12px;">此插件无需特殊实体配置</div>
        </div>
      ` : ''}
    `;
  }

  _renderThemeTab() {
    const themes = this.themeManager.getAllThemes();

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>主题设置</span>
        </div>
        
        <div class="form-group">
          <ha-select
            label="选择主题"
            .value=${this.config.theme || 'default'}
            @selected=${e => this._themeChanged(e.target.value)}
          >
            ${themes.map(theme => html`
              <mwc-list-item value=${theme.id}>
                <ha-icon icon=${this._getThemeIcon(theme.id)} slot="graphic"></ha-icon>
                ${theme.name}
              </mwc-list-item>
            `)}
          </ha-select>
        </div>

        <div class="theme-previews">
          ${themes.map(theme => html`
            <div class="theme-preview ${this.config.theme === theme.id ? 'selected' : ''}"
                 @click=${() => this._themeChanged(theme.id)}>
              <div class="theme-name">${theme.name}</div>
              <div class="theme-description">${theme.description}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _getThemeIcon(themeId) {
    const icons = {
      'default': 'mdi:palette-outline',
      'dark': 'mdi:weather-night',
      'material': 'mdi:material-design',
      'glass': 'mdi:crystal-ball'
    };
    return icons[themeId] || 'mdi:palette';
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
        plugin.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  _switchTab(tabName) {
    this._activeTab = tabName;
  }

  _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this.entityManager.getDefaultEntities(plugin, this.config.entities)
    };
    this._selectedPlugin = plugin;
    // 自动切换到实体配置标签页
    this._activeTab = 'entities';
    this._fireChanged();
  }

  _entityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._fireChanged();
  }

  _themeChanged(theme) {
    this.config = {
      ...this.config,
      theme: theme
    };
    this._fireChanged();
  }

  _save() {
    this._fireChanged();
  }

  _fireChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }
}