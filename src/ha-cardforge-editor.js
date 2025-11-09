// ha-cardforge-card/src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginManager } from './components/plugin.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _categories: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _loading: { state: true },
    _activeTab: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
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
      padding: 16px 0;
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
    this._pluginManager = new PluginManager();
  }

  async firstUpdated() {
    await this._loadPlugins();
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      theme: 'default',
      entities: {},
      ...config 
    };
  }

  async _loadPlugins() {
    this._loading = true;
    try {
      this._plugins = await this._pluginManager.getAvailablePlugins();
      this._categories = await this._pluginManager.getCategories();
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
        <ha-tabs
          .selected=${this._activeTab}
          @selected-changed=${this._tabChanged}
          scrollable
        >
          <paper-tab>
            <ha-icon icon="mdi:store"></ha-icon>
            插件市场
          </paper-tab>
          <paper-tab>
            <ha-icon icon="mdi:cog"></ha-icon>
            实体配置
          </paper-tab>
          <paper-tab>
            <ha-icon icon="mdi:palette"></ha-icon>
            主题设置
          </paper-tab>
        </ha-tabs>

        <div class="tab-content">
          ${this._renderActiveTab()}
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
        
        <div class="form-group">
          ${this._renderEntityConfig()}
        </div>
      </div>
    `;
  }

  _renderEntityConfig() {
    const entities = this.config.entities || {};
    const pluginInfo = this._plugins.find(p => p.id === this.config.plugin);

    return html`
      ${pluginInfo?.requiresWeek ? html`
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
    const themes = [
      { id: 'default', name: '默认主题', description: '使用 Home Assistant 默认主题', icon: 'mdi:palette-outline' },
      { id: 'dark', name: '深色主题', description: '适合暗色模式的深色主题', icon: 'mdi:weather-night' },
      { id: 'material', name: '材质设计', description: 'Google Material Design 风格', icon: 'mdi:material-design' },
      { id: 'glass', name: '玻璃拟态', description: '毛玻璃效果现代设计', icon: 'mdi:crystal-ball' }
    ];

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
                <ha-icon icon=${theme.icon} slot="graphic"></ha-icon>
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

  _tabChanged(ev) {
    this._activeTab = ev.detail.selected;
  }

  _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._getDefaultEntities(plugin)
    };
    this._fireChanged();
  }

  _getDefaultEntities(plugin) {
    const defaults = {
      time: 'sensor.time',
      date: 'sensor.date'
    };
    
    if (plugin.requiresWeek) {
      defaults.week = 'sensor.xing_qi';
    }
    
    if (plugin.category === 'weather') {
      defaults.weather = 'weather.home';
    }
    
    if (plugin.id === 'clock-lunar') {
      defaults.lunar = 'sensor.lunar_date';
    }
    
    return { ...defaults, ...this.config.entities };
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

export { HaCardForgeEditor };