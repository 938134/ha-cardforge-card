// ha-cardforge-card/src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginManager } from './components/plugins.js';

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
    _previewConfig: { state: true }
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
    }
    
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      font-weight: 500;
    }
    
    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    .tab:hover {
      background: var(--secondary-background-color);
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
    this._pluginManager = new PluginManager();
  }

  async firstUpdated() {
    await this._loadPlugins();
    this._updatePreview();
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
        <div class="tabs">
          <div class="tab ${this._activeTab === 0 ? 'active' : ''}" @click=${() => this._activeTab = 0}>
            插件市场
          </div>
          <div class="tab ${this._activeTab === 1 ? 'active' : ''}" @click=${() => this._activeTab = 1}>
            实体配置
          </div>
          <div class="tab ${this._activeTab === 2 ? 'active' : ''}" @click=${() => this._activeTab = 2}>
            主题设置
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
      </div>
    `;
  }

  _renderThemeTab() {
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

    if (!this._previewConfig) {
      return html`
        <div class="preview-placeholder">
          <ha-circular-progress active></ha-circular-progress>
          <div>生成预览中...</div>
        </div>
      `;
    }

    // 修复预览：创建真实的卡片元素
    return html`
      <ha-cardforge-card
        .hass=${this.hass}
        .config=${this._previewConfig}
      ></ha-cardforge-card>
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

  _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._getDefaultEntities(plugin)
    };
    this._updatePreview();
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
    
    return { ...defaults, ...this.config.entities };
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

  async _updatePreview() {
    if (!this.config.plugin) {
      this._previewConfig = null;
      return;
    }

    try {
      this._previewConfig = {
        ...this.config,
        _preview: true
      };
    } catch (error) {
      console.error('更新预览失败:', error);
      this._previewConfig = null;
    }
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