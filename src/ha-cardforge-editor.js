import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './components/registry.js';
import './components/theme.js';
import './components/entity.js';

// 导出编辑器类
export class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _activeTab: { state: true },
    _availableStyles: { state: true },
    _categories: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .tabs-container {
      margin-bottom: 24px;
      border-bottom: 1px solid var(--divider-color);
    }
    
    .tab-content {
      padding: 16px 0;
    }
    
    .section {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--card-background-color);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
    }
    
    .section-title {
      margin: 0 0 16px 0;
      font-size: 1.1em;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 24px;
      justify-content: flex-end;
    }
    
    /* 样式选择 */
    .style-selection-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: center;
    }
    
    .search-box {
      flex: 1;
    }
    
    .category-filter {
      min-width: 120px;
    }
    
    .style-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .style-option {
      padding: 16px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      background: var(--card-background-color);
    }
    
    .style-option:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    
    .style-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--primary-color-rgb), 0.1);
    }
    
    .style-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }
    
    .style-preview {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      background: var(--secondary-background-color);
      border-radius: 4px;
      overflow: hidden;
    }
    
    /* 实体配置 */
    .entity-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: end;
    }
    
    .entity-status {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
    
    /* 主题设置 */
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }
    
    .theme-option {
      padding: 16px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
    }
    
    .theme-option.selected {
      border-color: var(--primary-color);
    }
    
    .color-picker-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    
    /* 实时预览 */
    .preview-container {
      padding: 20px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .preview-content {
      max-width: 300px;
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.config = this._getDefaultConfig();
    this._activeTab = 0;
    this._availableStyles = [];
    this._categories = [];
    this._searchQuery = '';
    this._selectedCategory = 'all';
  }

  async firstUpdated() {
    await window.Registry.initialize();
    this._availableStyles = window.Registry.getAllStyles();
    this._categories = this._getCategories();
    console.log('✅ 编辑器初始化完成');
  }

  setConfig(config) {
    console.log('📝 设置编辑器配置:', config);
    this.config = this._deepClone({ ...this._getDefaultConfig(), ...config });
    console.log('✅ 最终编辑器配置:', this.config);
  }

  _getDefaultConfig() {
    return {
      style: 'time-week',
      theme: 'default',
      entities: {},
      custom: {},
      tap_action: {
        action: 'more-info'
      }
    };
  }

  _getCategories() {
    const categories = new Set();
    this._availableStyles.forEach(style => {
      if (style.category) {
        categories.add(style.category);
      }
    });
    return ['all', ...Array.from(categories)];
  }

  render() {
    return html`
      <div class="editor">
        <div class="tabs-container">
          <ha-tabs 
            .selected=${this._activeTab}
            @selected=${e => this._activeTab = e.detail.index}
            scrollable
          >
            <ha-tab>基础设置</ha-tab>
            <ha-tab>外观样式</ha-tab>
            <ha-tab>主题设置</ha-tab>
            <ha-tab>高级设置</ha-tab>
          </ha-tabs>
        </div>

        <div class="tab-content">
          ${this._renderTabContent()}
        </div>

        <div class="action-buttons">
          <mwc-button @click=${this._cancel} label="取消"></mwc-button>
          <mwc-button @click=${this._save} unelevated label="保存"></mwc-button>
        </div>
      </div>
    `;
  }

  _renderTabContent() {
    switch (this._activeTab) {
      case 0: return this._renderBasicTab();
      case 1: return this._renderStyleTab();
      case 2: return this._renderThemeTab();
      case 3: return this._renderAdvancedTab();
      default: return html`<div>未知选项卡</div>`;
    }
  }

  _renderBasicTab() {
    const currentStyle = window.Registry.getStyle(this.config.style);
    
    return html`
      <!-- 当前样式信息 -->
      <div class="section">
        <h3 class="section-title">🎯 当前样式</h3>
        ${currentStyle ? html`
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 2em;">${currentStyle.icon}</div>
            <div>
              <div style="font-weight: bold; font-size: 1.1em;">${currentStyle.displayName}</div>
              <div style="color: var(--secondary-text-color); font-size: 0.9em;">
                ${currentStyle.description}
              </div>
            </div>
          </div>
        ` : html`<div>未选择样式</div>`}
      </div>

      <!-- 实体配置 -->
      ${currentStyle?.requiresEntities ? this._renderEntityConfig(currentStyle) : html`
        <div class="section">
          <h3 class="section-title">🔧 实体配置</h3>
          <div style="color: var(--secondary-text-color); text-align: center; padding: 20px;">
            当前样式无需配置实体
          </div>
        </div>
      `}

      <!-- 交互动作 -->
      <div class="section">
        <h3 class="section-title">⚡ 交互动作</h3>
        <div class="form-group">
          <ha-select
            label="点击动作"
            .value=${this.config.tap_action?.action || 'more-info'}
            @selected=${e => this._updateConfig('tap_action.action', e.target.value)}
            style="width: 100%;"
          >
            <mwc-list-item value="none">无动作</mwc-list-item>
            <mwc-list-item value="more-info">显示详情</mwc-list-item>
            <mwc-list-item value="navigate">导航</mwc-list-item>
            <mwc-list-item value="call-service">调用服务</mwc-list-item>
          </ha-select>
        </div>

        ${this.config.tap_action?.action === 'more-info' && currentStyle?.requiresEntities ? html`
          <div class="form-group">
            <ha-select
              label="目标实体"
              .value=${this.config.tap_action?.entity || ''}
              @selected=${e => this._updateConfig('tap_action.entity', e.target.value)}
              style="width: 100%;"
            >
              <mwc-list-item value="">无</mwc-list-item>
              ${currentStyle.entityInterfaces.required?.map(entity => html`
                <mwc-list-item value=${this.config.entities?.[entity.key] || ''}>
                  ${entity.description}
                </mwc-list-item>
              `)}
              ${currentStyle.entityInterfaces.optional?.map(entity => html`
                <mwc-list-item value=${this.config.entities?.[entity.key] || ''}>
                  ${entity.description}
                </mwc-list-item>
              `)}
            </ha-select>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityConfig(styleConfig) {
    return html`
      <div class="section">
        <h3 class="section-title">🔧 实体配置</h3>
        
        ${styleConfig.entityInterfaces.required?.map(entity => html`
          <div class="form-group">
            <div class="entity-grid">
              <ha-entity-picker
                label="${entity.description} (必需)"
                .hass=${this.hass}
                .value=${this.config.entities?.[entity.key] || ''}
                @value-changed=${e => this._updateConfig(`entities.${entity.key}`, e.detail.value)}
                style="width: 100%;"
              ></ha-entity-picker>
              ${this._renderEntityStatus(this.config.entities?.[entity.key])}
            </div>
          </div>
        `)}
        
        ${styleConfig.entityInterfaces.optional?.map(entity => html`
          <div class="form-group">
            <div class="entity-grid">
              <ha-entity-picker
                label="${entity.description} (可选)"
                .hass=${this.hass}
                .value=${this.config.entities?.[entity.key] || ''}
                @value-changed=${e => this._updateConfig(`entities.${entity.key}`, e.detail.value)}
                style="width: 100%;"
                allow-custom-entity
              ></ha-entity-picker>
              ${this._renderEntityStatus(this.config.entities?.[entity.key])}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _renderEntityStatus(entityId) {
    if (!entityId || !this.hass?.states[entityId]) return '';

    const entity = this.hass.states[entityId];
    return html`
      <div class="entity-status">
        状态: ${entity.state}
        ${entity.attributes.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ''}
      </div>
    `;
  }

  _renderStyleTab() {
    const filteredStyles = this._getFilteredStyles();

    return html`
      <!-- 样式选择 -->
      <div class="section">
        <h3 class="section-title">🎨 选择外观样式</h3>
        
        <div class="style-selection-header">
          <ha-textfield
            class="search-box"
            label="搜索样式..."
            .value=${this._searchQuery}
            @input=${e => this._searchQuery = e.target.value}
            icon="mdi:magnify"
          ></ha-textfield>
          
          <ha-select
            class="category-filter"
            label="分类"
            .value=${this._selectedCategory}
            @selected=${e => this._selectedCategory = e.target.value}
          >
            ${this._categories.map(category => html`
              <mwc-list-item value=${category}>
                ${category === 'all' ? '全部' : category}
              </mwc-list-item>
            `)}
          </ha-select>
        </div>

        <div class="style-grid">
          ${filteredStyles.map(style => html`
            <div 
              class="style-option ${this.config.style === style.name ? 'selected' : ''}"
              @click=${() => this._selectStyle(style.name)}
            >
              <div class="style-preview">
                ${this._renderStylePreview(style)}
              </div>
              <div class="style-icon">${style.icon}</div>
              <div style="font-weight: 500; margin-bottom: 4px;">${style.displayName}</div>
              <div style="font-size: 0.8em; color: var(--secondary-text-color);">
                ${style.description}
              </div>
            </div>
          `)}
        </div>

        ${filteredStyles.length === 0 ? html`
          <div style="text-align: center; padding: 40px; color: var(--secondary-text-color);">
            没有找到匹配的样式
          </div>
        ` : ''}
      </div>

      <!-- 实时预览 -->
      <div class="section">
        <h3 class="section-title">🎭 实时预览</h3>
        <div class="preview-container">
          <div class="preview-content">
            ${this._renderLivePreview()}
          </div>
        </div>
      </div>
    `;
  }

  _renderStylePreview(style) {
    if (style.preview) {
      try {
        const previewResult = style.preview();
        if (typeof previewResult === 'string') {
          const template = document.createElement('template');
          template.innerHTML = previewResult;
          return html`${template.content}`;
        }
        return previewResult;
      } catch (error) {
        console.error('样式预览失败:', error);
      }
    }
    
    return html`
      <div style="text-align: center; padding: 10px;">
        <div style="font-size: 1.5em;">${style.icon}</div>
        <div style="font-size: 0.7em; margin-top: 4px;">${style.displayName}</div>
      </div>
    `;
  }

  _renderLivePreview() {
    const styleConfig = window.Registry.getStyle(this.config.style);
    if (!styleConfig) {
      return html`<div>请先选择外观样式</div>`;
    }

    try {
      const mockEntities = new Map();
      if (styleConfig.requiresEntities && styleConfig.entityInterfaces) {
        styleConfig.entityInterfaces.required?.forEach(entity => {
          const entityId = this.config.entities?.[entity.key];
          if (entityId && this.hass?.states[entityId]) {
            mockEntities.set(entity.key, this.hass.states[entityId]);
          } else {
            mockEntities.set(entity.key, {
              state: entity.key === 'time' ? '14:30' : 
                     entity.key === 'date' ? '2024-08-15' : 
                     entity.key === 'week' ? '星期四' : '预览数据',
              attributes: { friendly_name: entity.description }
            });
          }
        });
      }

      const previewResult = styleConfig.render(this.config, this.hass, mockEntities);
      
      if (typeof previewResult === 'string') {
        const template = document.createElement('template');
        template.innerHTML = previewResult;
        return html`${template.content}`;
      }
      
      return previewResult;

    } catch (error) {
      console.error('预览渲染失败:', error);
      return html`<div style="text-align: center; padding: 20px; color: var(--secondary-text-color);">
        预览渲染失败: ${error.message}
      </div>`;
    }
  }

  _renderThemeTab() {
    const themes = window.ThemeManager.getAllThemes();

    return html`
      <!-- 主题选择 -->
      <div class="section">
        <h3 class="section-title">🎨 选择主题</h3>
        <div class="theme-grid">
          ${themes.map(theme => html`
            <div 
              class="theme-option ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._updateConfig('theme', theme.id)}
            >
              <div style="font-size: 2em; margin-bottom: 8px;">${theme.icon}</div>
              <div style="font-weight: 500;">${theme.name}</div>
              <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px;">
                ${theme.description}
              </div>
            </div>
          `)}
        </div>
      </div>

      <!-- 自定义样式 -->
      <div class="section">
        <h3 class="section-title">🎯 自定义样式</h3>
        <div class="color-picker-group">
          <ha-textfield
            label="背景颜色"
            .value=${this.config.custom?.backgroundColor || ''}
            @input=${e => this._updateConfig('custom.backgroundColor', e.target.value)}
            style="width: 100%;"
          ></ha-textfield>
          
          <ha-textfield
            label="文字颜色"
            .value=${this.config.custom?.textColor || ''}
            @input=${e => this._updateConfig('custom.textColor', e.target.value)}
            style="width: 100%;"
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  _renderAdvancedTab() {
    return html`
      <!-- 高级选项 -->
      <div class="section">
        <h3 class="section-title">⚙️ 高级选项</h3>
        <div class="form-group">
          <ha-select
            label="刷新间隔"
            .value=${this.config.custom?.refreshInterval || '30s'}
            @selected=${e => this._updateConfig('custom.refreshInterval', e.target.value)}
            style="width: 100%;"
          >
            <mwc-list-item value="10s">10秒</mwc-list-item>
            <mwc-list-item value="30s">30秒</mwc-list-item>
            <mwc-list-item value="60s">1分钟</mwc-list-item>
          </ha-select>
        </div>
      </div>

      <!-- 自定义CSS -->
      <div class="section">
        <h3 class="section-title">📝 自定义CSS</h3>
        <ha-textarea
          label="自定义样式"
          .value=${this.config.custom?.css || ''}
          @input=${e => this._updateConfig('custom.css', e.target.value)}
          style="width: 100%;"
          rows="4"
        ></ha-textarea>
      </div>
    `;
  }

  _getFilteredStyles() {
    let filtered = this._availableStyles;

    if (this._selectedCategory !== 'all') {
      filtered = filtered.filter(style => style.category === this._selectedCategory);
    }

    if (this._searchQuery) {
      const query = this._searchQuery.toLowerCase();
      filtered = filtered.filter(style => 
        style.displayName.toLowerCase().includes(query) ||
        style.description.toLowerCase().includes(query) ||
        style.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  _selectStyle(styleName) {
    const styleConfig = window.Registry.getStyle(styleName);
    if (!styleConfig) return;

    const newConfig = this._deepClone({ 
      style: styleName,
      theme: this.config.theme || 'default',
      entities: {},
      custom: this.config.custom || {},
      tap_action: this.config.tap_action || { action: 'more-info' }
    });

    if (styleConfig.requiresEntities && styleConfig.entityInterfaces) {
      styleConfig.entityInterfaces.required?.forEach(entity => {
        if (entity.default) {
          newConfig.entities[entity.key] = entity.default;
        }
      });
    }

    this.config = newConfig;
    this._fireConfigChanged();
  }

  _updateConfig(path, value) {
    // 创建配置的深拷贝，避免修改冻结对象
    const newConfig = this._deepClone(this.config);
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, newConfig);
    
    target[lastKey] = value;
    
    // 更新整个配置对象
    this.config = newConfig;
    this.requestUpdate();
    this._fireConfigChanged();
  }

  // 深拷贝方法
  _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this._deepClone(item));
    }
    
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this._deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-cancel', { 
      bubbles: true, 
      composed: true 
    }));
  }

  _save() {
    this._fireConfigChanged();
    this.dispatchEvent(new CustomEvent('config-save', { 
      bubbles: true, 
      composed: true 
    }));
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }
}