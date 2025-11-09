// ha-cardforge-card/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _categories: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _loading: { state: true },
    _activeTab: { state: true },
    _previewConfig: { state: true },
    _marketplaces: { state: true },
    _currentMarketplace: { state: true },
    _customMarketplaceUrl: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 900px;
    }
    
    .editor-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      align-items: start;
    }
    
    .config-section {
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid var(--divider-color);
    }
    
    .preview-section {
      position: sticky;
      top: 20px;
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 20px;
      border: 1px solid var(--divider-color);
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
    
    .plugin-card.installed {
      border-color: var(--success-color);
      background: rgba(var(--rgb-success-color), 0.05);
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
    
    .plugin-meta {
      font-size: 0.7em;
      color: var(--secondary-text-color);
      margin-top: 4px;
      opacity: 0.7;
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
    
    .plugin-badge.installed {
      background: var(--success-color);
    }
    
    .plugin-badge.featured {
      background: var(--warning-color);
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .entity-label {
      font-weight: 500;
      font-size: 0.9em;
    }
    
    .preview-container {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 20px;
    }
    
    .preview-placeholder {
      text-align: center;
      color: var(--secondary-text-color);
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
    
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 20px;
      background: var(--card-background-color);
      border-radius: 8px 8px 0 0;
      overflow: hidden;
    }
    
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: center;
    }
    
    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .tab:hover {
      background: var(--secondary-background-color);
    }
    
    .marketplace-info {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      font-size: 0.9em;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      border: 1px solid var(--divider-color);
    }
    
    .stat-value {
      font-size: 1.5em;
      font-weight: bold;
      color: var(--primary-color);
    }
    
    .stat-label {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
    
    .marketplace-config {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    
    .config-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: end;
      margin-bottom: 12px;
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
    this._activeTab = 0;
    this._previewConfig = null;
    this._marketplaces = [];
    this._currentMarketplace = null;
    this._customMarketplaceUrl = '';
    this._pluginManager = null;
    this._entityManager = null;
    this._themeManager = null;
  }

  async firstUpdated() {
    await this._loadManagers();
    await this._loadMarketplaces();
    await this._loadPlugins();
    this._updatePreview();
  }

  async _loadManagers() {
    if (!this._pluginManager) {
      const { PluginManager } = await import('./managers/plugin.js');
      this._pluginManager = new PluginManager();
    }
    if (!this._entityManager) {
      const { EntityManager } = await import('./managers/entity.js');
      this._entityManager = new EntityManager();
    }
    if (!this._themeManager) {
      const { ThemeManager } = await import('./managers/theme.js');
      this._themeManager = new ThemeManager();
    }
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      theme: 'default',
      entities: {},
      ...config 
    };
    this._updatePreview();
  }

  async _loadMarketplaces() {
    this._marketplaces = this._pluginManager.getMarketplaces().filter(m => m.enabled);
    this._currentMarketplace = this._pluginManager.getCurrentMarketplace();
  }

  async _loadPlugins() {
    this._loading = true;
    try {
      await this._pluginManager.initialize();
      this._plugins = await this._pluginManager.getAvailablePlugins(this._currentMarketplace?.id);
      this._categories = await this._pluginManager.getCategories(this._currentMarketplace?.id);
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
        <div class="tabs">
          <div class="tab ${this._activeTab === 0 ? 'active' : ''}" 
               @click=${() => this._activeTab = 0}>
            <ha-icon icon="mdi:store"></ha-icon>
            <span>插件市场</span>
          </div>
          <div class="tab ${this._activeTab === 1 ? 'active' : ''}" 
               @click=${() => this._activeTab = 1}>
            <ha-icon icon="mdi:cog"></ha-icon>
            <span>实体配置</span>
          </div>
          <div class="tab ${this._activeTab === 2 ? 'active' : ''}" 
               @click=${() => this._activeTab = 2}>
            <ha-icon icon="mdi:palette"></ha-icon>
            <span>主题设置</span>
          </div>
          <div class="tab ${this._activeTab === 3 ? 'active' : ''}" 
               @click=${() => this._activeTab = 3}>
            <ha-icon icon="mdi:package-variant"></ha-icon>
            <span>插件管理</span>
          </div>
        </div>

        <div class="editor-content">
          <div>
            ${this._renderActiveTab()}
          </div>
          
          <div class="preview-section">
            <div class="section-title">
              <ha-icon icon="mdi:eye"></ha-icon>
              <span>预览</span>
            </div>
            <div class="preview-container">
              ${this._renderPreview()}
            </div>
          </div>
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

  _renderActiveTab() {
    switch (this._activeTab) {
      case 0: return this._renderMarketplaceTab();
      case 1: return this._renderEntityTab();
      case 2: return this._renderThemeTab();
      case 3: return this._renderPluginManagementTab();
      default: return html`<div>未知选项卡</div>`;
    }
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
    const stats = this._pluginManager.getStats();

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:store"></ha-icon>
          <span>插件市场</span>
        </div>
        
        <!-- 市场信息和统计 -->
        <div class="marketplace-info">
          <strong>${this._currentMarketplace?.name}</strong> - ${this._currentMarketplace?.description}
          ${this._currentMarketplace?.baseURL ? html`<br>源: ${this._currentMarketplace.baseURL}` : ''}
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalPlugins}</div>
            <div class="stat-label">总插件</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.installedPlugins}</div>
            <div class="stat-label">已安装</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.marketplaces}</div>
            <div class="stat-label">可用市场</div>
          </div>
        </div>
        
        <!-- 搜索和筛选 -->
        <div class="search-header">
          <ha-select
            label="选择市场"
            .value=${this._currentMarketplace?.id}
            @selected=${e => this._switchMarketplace(e.target.value)}
            style="min-width: 150px;"
          >
            ${this._marketplaces.map(marketplace => html`
              <mwc-list-item value=${marketplace.id}>
                <span slot="graphic">${marketplace.icon}</span>
                ${marketplace.name}
              </mwc-list-item>
            `)}
          </ha-select>
          
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

        <!-- 插件网格 -->
        <div class="plugin-grid">
          ${filteredPlugins.map(plugin => html`
            <div class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}
                                 ${plugin.installed ? 'installed' : ''}"
                 @click=${() => this._selectPlugin(plugin)}>
              ${plugin.featured ? html`<div class="plugin-badge featured">⭐</div>` : ''}
              ${plugin.installed ? html`<div class="plugin-badge installed">✓</div>` : ''}
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-description">${plugin.description}</div>
              <div class="plugin-meta">
                v${plugin.version} | ${this._getMarketplaceDisplayName(plugin.marketplace)}
              </div>
              ${!plugin.installed && !plugin.builtin ? html`
                <mwc-button 
                  dense 
                  raised 
                  label="安装" 
                  @click=${(e) => this._installPlugin(plugin.id, e)}
                  style="margin-top: 8px; width: 100%;"
                ></mwc-button>
              ` : html`
                <div style="height: 36px; margin-top: 8px;"></div>
              `}
            </div>
          `)}
        </div>

        ${filteredPlugins.length === 0 ? html`
          <div class="no-plugins">
            <ha-icon icon="mdi:alert-circle-outline" style="font-size: 3em;"></ha-icon>
            <div style="margin-top: 12px;">没有找到匹配的插件</div>
            <mwc-button 
              outlined 
              label="刷新市场" 
              @click=${() => this._refreshMarketplace()}
              style="margin-top: 16px;"
            ></mwc-button>
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
            <div style="margin-top: 12px;">请先选择插件</div>
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
        ${this._renderEntityConfig()}
      </div>
    `;
  }

  _renderEntityConfig() {
    const entities = this.config.entities || {};
    return html`
      <div class="form-group">
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
      </div>
    `;
  }

  _renderThemeTab() {
    const themes = this._themeManager.getAllThemes();
    
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
          <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: 8px;">
            ${this._themeManager.getTheme(this.config.theme)?.description || ''}
          </div>
        </div>
      </div>
    `;
  }

  _renderPluginManagementTab() {
    const installedPlugins = this._pluginManager.getInstalledPlugins();
    const stats = this._pluginManager.getStats();
    const marketplaces = this._pluginManager.getMarketplaces();

    return html`
      <div class="config-section">
        <div class="section-title">
          <ha-icon icon="mdi:package-variant"></ha-icon>
          <span>插件管理</span>
        </div>
        
        <!-- 统计信息 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalPlugins}</div>
            <div class="stat-label">总插件</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.installedPlugins}</div>
            <div class="stat-label">已安装</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.cacheSize}</div>
            <div class="stat-label">缓存插件</div>
          </div>
        </div>
        
        <!-- 市场管理 -->
        <div class="form-group">
          <h3>市场管理</h3>
          <div class="marketplace-config">
            <div class="config-row">
              <ha-textfield
                label="添加自定义市场URL"
                .value=${this._customMarketplaceUrl}
                @input=${e => this._customMarketplaceUrl = e.target.value}
                helper="例如: https://raw.githubusercontent.com/user/repo/branch/"
                style="width: 100%;"
              ></ha-textfield>
              <mwc-button 
                raised 
                label="添加市场" 
                @click=${this._addCustomMarketplace}
                .disabled=${!this._customMarketplaceUrl}
              ></mwc-button>
            </div>
          </div>
          
          <div style="font-size: 0.9em; margin-top: 12px;">
            <strong>可用市场:</strong>
            ${marketplaces.map(marketplace => html`
              <div style="display: flex; justify-content: between; align-items: center; margin: 8px 0; padding: 8px; background: var(--card-background-color); border-radius: 4px;">
                <span>${marketplace.icon} ${marketplace.name} - ${marketplace.description}</span>
                ${!marketplace.official ? html`
                  <mwc-button 
                    dense 
                    outlined 
                    label="删除" 
                    @click=${() => this._removeMarketplace(marketplace.id)}
                  ></mwc-button>
                ` : html`
                  <span style="font-size: 0.8em; color: var(--secondary-text-color);">官方</span>
                `}
              </div>
            `)}
          </div>
        </div>
        
        <!-- 已安装插件 -->
        <div class="form-group">
          <h3>已安装插件 (${installedPlugins.length})</h3>
          ${installedPlugins.length === 0 ? html`
            <div class="no-plugins">
              <ha-icon icon="mdi:package-variant-closed"></ha-icon>
              <div style="margin-top: 12px;">暂无已安装插件</div>
            </div>
          ` : html`
            <div class="plugin-grid">
              ${installedPlugins.map(plugin => html`
                <div class="plugin-card ${plugin.builtin ? 'builtin' : ''}">
                  <div class="plugin-icon">${plugin.icon}</div>
                  <div class="plugin-name">${plugin.name}</div>
                  <div class="plugin-description">
                    v${plugin.version} 
                    <br>${plugin.builtin ? '内置' : plugin.marketplace}
                  </div>
                  ${!plugin.builtin ? html`
                    <mwc-button 
                      dense 
                      outlined 
                      label="删除" 
                      @click=${() => this._uninstallPlugin(plugin.id)}
                      style="margin-top: 8px; width: 100%;"
                    ></mwc-button>
                  ` : html`
                    <div style="margin-top: 8px; font-size: 0.7em; color: var(--secondary-text-color);">
                      内置插件
                    </div>
                  `}
                </div>
              `)}
            </div>
          `}
        </div>
        
        <!-- 操作按钮 -->
        <div class="form-group">
          <h3>系统操作</h3>
          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <mwc-button 
              raised 
              label="刷新所有市场" 
              @click=${this._refreshAllMarketplaces}
            ></mwc-button>
            <mwc-button 
              raised 
              label="更新所有插件" 
              @click=${this._updateAllPlugins}
              .disabled=${installedPlugins.filter(p => !p.builtin).length === 0}
            ></mwc-button>
            <mwc-button 
              outlined 
              label="清除缓存" 
              @click=${this._clearPluginCache}
            ></mwc-button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPreview() {
    if (!this.config.plugin) {
      return html`
        <div class="preview-placeholder">
          <ha-icon icon="mdi:card-bulleted-outline" style="font-size: 3em;"></ha-icon>
          <div>选择插件后显示预览</div>
        </div>
      `;
    }

    const previewConfig = {
      ...this.config,
      _preview: true
    };

    return html`
      <ha-cardforge-card
        .hass=${this.hass}
        .config=${previewConfig}
      ></ha-cardforge-card>
    `;
  }

  // 工具方法
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

  _getMarketplaceDisplayName(marketplaceId) {
    const marketplace = this._marketplaces.find(m => m.id === marketplaceId);
    return marketplace ? marketplace.name : marketplaceId;
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

  // 事件处理方法
  async _switchMarketplace(marketplaceId) {
    this._pluginManager.setCurrentMarketplace(marketplaceId);
    this._currentMarketplace = this._pluginManager.getCurrentMarketplace();
    this._plugins = await this._pluginManager.getAvailablePlugins(marketplaceId);
    this._categories = await this._pluginManager.getCategories(marketplaceId);
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this.requestUpdate();
  }

  _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._entityManager.getDefaultEntities(plugin, this.config.entities)
    };
    this._updatePreview();
    this._fireChanged();
  }

  async _installPlugin(pluginId, event) {
    event.stopPropagation();
    
    try {
      await this._pluginManager.installPlugin(pluginId);
      this._plugins = await this._pluginManager.getAvailablePlugins();
      this.requestUpdate();
    } catch (error) {
      console.error('安装插件失败:', error);
      alert('安装插件失败: ' + error.message);
    }
  }

  async _uninstallPlugin(pluginId) {
    if (confirm(`确定要删除插件 "${pluginId}" 吗？`)) {
      try {
        await this._pluginManager.uninstallPlugin(pluginId);
        this._plugins = await this._pluginManager.getAvailablePlugins();
        if (this.config.plugin === pluginId) {
          this.config.plugin = '';
        }
        this.requestUpdate();
      } catch (error) {
        console.error('删除插件失败:', error);
        alert('删除插件失败: ' + error.message);
      }
    }
  }

  _entityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._updatePreview();
    this._fireChanged();
  }

  _themeChanged(theme) {
    this.config = {
      ...this.config,
      theme: theme
    };
    this._updatePreview();
    this._fireChanged();
  }

  async _addCustomMarketplace() {
    if (!this._customMarketplaceUrl) {
      alert('请输入市场URL');
      return;
    }
    
    try {
      const marketplaceId = 'custom_' + Date.now();
      await this._pluginManager.addMarketplace({
        id: marketplaceId,
        name: '自定义市场',
        description: '用户自定义插件市场',
        baseURL: this._customMarketplaceUrl,
        icon: '🔧',
        official: false
      });
      
      this._marketplaces = this._pluginManager.getMarketplaces().filter(m => m.enabled);
      this._customMarketplaceUrl = '';
      this.requestUpdate();
      alert('自定义市场添加成功！');
    } catch (error) {
      console.error('添加自定义市场失败:', error);
      alert('添加自定义市场失败: ' + error.message);
    }
  }

  async _removeMarketplace(marketplaceId) {
    if (confirm(`确定要删除市场 "${marketplaceId}" 吗？`)) {
      try {
        await this._pluginManager.removeMarketplace(marketplaceId);
        this._marketplaces = this._pluginManager.getMarketplaces().filter(m => m.enabled);
        this.requestUpdate();
        alert('市场删除成功！');
      } catch (error) {
        console.error('删除市场失败:', error);
        alert('删除市场失败: ' + error.message);
      }
    }
  }

  async _refreshMarketplace() {
    try {
      await this._pluginManager.refreshMarketplace(this._currentMarketplace?.id);
      this._plugins = await this._pluginManager.getAvailablePlugins(this._currentMarketplace?.id);
      this.requestUpdate();
    } catch (error) {
      console.error('刷新市场失败:', error);
      alert('刷新市场失败: ' + error.message);
    }
  }

  async _refreshAllMarketplaces() {
    try {
      await this._pluginManager.refreshMarketplace();
      this._plugins = await this._pluginManager.getAvailablePlugins();
      this.requestUpdate();
      alert('所有市场刷新成功！');
    } catch (error) {
      console.error('刷新所有市场失败:', error);
      alert('刷新所有市场失败: ' + error.message);
    }
  }

  async _updateAllPlugins() {
    try {
      const updated = await this._pluginManager.updateAllPlugins();
      this._plugins = await this._pluginManager.getAvailablePlugins();
      this.requestUpdate();
      if (updated.length > 0) {
        alert(`成功更新 ${updated.length} 个插件: ${updated.join(', ')}`);
      } else {
        alert('没有需要更新的插件');
      }
    } catch (error) {
      console.error('更新插件失败:', error);
      alert('更新插件失败: ' + error.message);
    }
  }

  _clearPluginCache() {
    this._pluginManager.clearCache();
    alert('插件缓存已清除');
  }

  async _updatePreview() {
    // 预览会自动更新
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

customElements.define('ha-cardforge-editor', HaCardForgeEditor);
export { HaCardForgeEditor };