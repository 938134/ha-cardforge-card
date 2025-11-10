// src/ha-cardforge-editor.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
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
      <div class="card">
        <!-- 标签页导航 - 使用简单的按钮实现 -->
        <div style="
          display: flex;
          border-bottom: 1px solid var(--divider-color);
          margin-bottom: 20px;
        ">
          ${this._renderTabButton(0, 'mdi:view-grid-outline', '插件市场')}
          ${this._renderTabButton(1, 'mdi:cog-outline', '实体配置', !this.config.plugin)}
          ${this._renderTabButton(2, 'mdi:palette-outline', '主题设置')}
        </div>

        <div class="card-content">
          ${this._renderActiveTab()}
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions">
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

  _renderTabButton(tabIndex, icon, label, disabled = false) {
    const isActive = this._activeTab === tabIndex;
    return html`
      <button
        style="
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 2px solid ${isActive ? 'var(--primary-color)' : 'transparent'};
          color: ${isActive ? 'var(--primary-color)' : 'var(--secondary-text-color)'};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          font-size: 0.9em;
          font-weight: 500;
          transition: all 0.2s ease;
          opacity: ${disabled ? 0.5 : 1};
          display: flex;
          align-items: center;
          gap: 8px;
        "
        @click=${() => !disabled && this._switchTab(tabIndex)}
        .disabled=${disabled}
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
    const categories = this._getCategories();

    return html`
      <!-- 搜索和分类 -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center;">
        <ha-textfield
          style="flex: 1;"
          label="搜索插件..."
          .value=${this._searchQuery}
          @input=${e => this._searchQuery = e.target.value}
          icon="mdi:magnify"
        ></ha-textfield>
        
        <ha-select
          label="分类"
          .value=${this._selectedCategory}
          @selected=${e => this._categoryChanged(e.target.value)}
          style="min-width: 120px;"
        >
          <mwc-list-item value="all">全部分类</mwc-list-item>
          ${categories.map(category => html`
            <mwc-list-item value=${category}>${category}</mwc-list-item>
          `)}
        </ha-select>
      </div>

      <!-- 插件网格 -->
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
      ">
        ${filteredPlugins.map(plugin => html`
          <ha-card 
            style="cursor: pointer; ${this.config.plugin === plugin.id ? 'border: 2px solid var(--primary-color);' : ''}"
            @click=${() => this._selectPlugin(plugin)}
          >
            <div style="padding: 16px; text-align: center; position: relative;">
              <div style="
                position: absolute;
                top: 4px;
                right: 4px;
                background: var(--primary-color);
                color: white;
                border-radius: 8px;
                padding: 1px 6px;
                font-size: 0.65em;
                font-weight: 500;
              ">${plugin.category}</div>
              
              <div style="font-size: 2em; margin-bottom: 8px; height: 40px; display: flex; align-items: center; justify-content: center;">
                ${plugin.icon}
              </div>
              <div style="font-weight: 600; margin-bottom: 4px; font-size: 0.85em; color: var(--primary-text-color); line-height: 1.2;">
                ${plugin.name}
              </div>
              <div style="font-size: 0.75em; color: var(--secondary-text-color); line-height: 1.3; height: 32px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                ${plugin.description}
              </div>
            </div>
          </ha-card>
        `)}
      </div>

      <!-- 空状态 -->
      ${filteredPlugins.length === 0 ? html`
        <div style="text-align: center; padding: 40px 20px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:package-variant-closed" style="font-size: 2.5em; margin-bottom: 12px; opacity: 0.5;"></ha-icon>
          <div style="font-size: 1em; margin-bottom: 8px;">没有找到匹配的插件</div>
          <div style="font-size: 0.85em;">尝试调整搜索条件或选择其他分类</div>
        </div>
      ` : ''}
    `;
  }

  _renderEntityTab() {
    if (!this.config.plugin) {
      return html`
        <div style="text-align: center; padding: 40px 20px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:alert-circle-outline" style="font-size: 2.5em; margin-bottom: 12px;"></ha-icon>
          <div style="font-size: 1em; margin-bottom: 8px;">请先选择插件</div>
          <div style="font-size: 0.85em;">在"插件市场"选项卡中选择一个插件以配置实体</div>
        </div>
      `;
    }

    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    if (!plugin) return this._renderError('插件不存在');

    return html`
      <ha-card style="margin: 24px 0;">
        <div style="
          padding: 16px;
          border-bottom: 1px solid var(--divider-color);
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
        <div style="padding: 16px;">
          ${this._renderEntityConfig(plugin)}
        </div>
      </ha-card>
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
        <div style="display: grid; grid-template-columns: 100px 1fr auto; gap: 12px; align-items: center; margin-bottom: 12px; padding: 8px; background: var(--card-background-color); border-radius: 6px;">
          <div style="font-weight: 500; font-size: 0.85em; color: var(--primary-text-color);">
            ${req.description}
          </div>
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
    // 简化主题选择，只提供基本选项
    const themeOptions = [
      { id: 'default', name: '默认主题', icon: 'mdi:palette-outline' },
      { id: 'dark', name: '深色主题', icon: 'mdi:weather-night' },
      { id: 'material', name: '材质设计', icon: 'mdi:material-design' },
      { id: 'minimal', name: '极简风格', icon: 'mdi:cellphone' }
    ];

    return html`
      <ha-card>
        <div style="
          padding: 16px;
          border-bottom: 1px solid var(--divider-color);
          font-size: 1em;
          font-weight: 600;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>主题设置</span>
        </div>
        <div style="padding: 16px;">
          <ha-select
            label="选择主题风格"
            .value=${this.config.theme || 'default'}
            @selected=${e => this._themeChanged(e.target.value)}
            style="width: 100%; margin-bottom: 20px;"
          >
            ${themeOptions.map(theme => html`
              <mwc-list-item value=${theme.id} graphic="icon">
                <ha-icon .icon=${theme.icon} slot="graphic"></ha-icon>
                ${theme.name}
              </mwc-list-item>
            `)}
          </ha-select>
          
          <div style="color: var(--secondary-text-color); font-size: 0.85em;">
            主题设置将影响卡片的外观样式
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderError(message) {
    return html`
      <div style="text-align: center; padding: 40px 20px; color: var(--secondary-text-color);">
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
    this.requestUpdate();
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