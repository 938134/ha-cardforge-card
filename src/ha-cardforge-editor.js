import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './components/card-registry.js';
import './components/entity.js';
import './components/theme.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _activeTab: { state: true },
    _availableCards: { state: true },
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
    
    /* 卡片选择样式 */
    .card-selection-header {
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
    
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .card-option {
      padding: 16px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      background: var(--card-background-color);
    }
    
    .card-option:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    
    .card-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--primary-color-rgb), 0.1);
    }
    
    .card-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }
    
    .card-preview {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      background: var(--secondary-background-color);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .preview-content {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    
    /* 实体配置样式 */
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
    
    /* 主题设置样式 */
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
    
    /* 实时预览样式 */
    .preview-container {
      padding: 20px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._activeTab = 0;
    this._availableCards = [];
    this._categories = [];
    this._searchQuery = '';
    this._selectedCategory = 'all';
  }

  async firstUpdated() {
    await window.CardRegistry.initialize();
    this._availableCards = window.CardRegistry.getAllCards();
    this._categories = window.CardRegistry.getCategories();
    
    // 设置默认配置
    if (!this.config.type && this._availableCards.length > 0) {
      this.config.type = this._availableCards[0].type;
    }
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
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
            <ha-tab>基础属性</ha-tab>
            <ha-tab>主题设置</ha-tab>
            <ha-tab>卡片样式</ha-tab>
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
      case 1: return this._renderThemeTab();
      case 2: return this._renderStyleTab();
      case 3: return this._renderAdvancedTab();
      default: return html`<div>未知选项卡</div>`;
    }
  }

  _renderBasicTab() {
    const filteredCards = this._getFilteredCards();
    const cardConfig = this.config.type ? window.CardRegistry.getCardConfig(this.config.type) : null;

    return html`
      <!-- 卡片类型选择 -->
      <div class="section">
        <h3 class="section-title">🎨 选择卡片类型</h3>
        
        <div class="card-selection-header">
          <ha-textfield
            class="search-box"
            label="搜索卡片..."
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
            <mwc-list-item value="all">全部</mwc-list-item>
            ${this._categories.map(category => html`
              <mwc-list-item value=${category.name}>${category.name}</mwc-list-item>
            `)}
          </ha-select>
        </div>

        <div class="card-grid">
          ${filteredCards.map(card => html`
            <div 
              class="card-option ${this.config.type === card.type ? 'selected' : ''}"
              @click=${() => this._selectCardType(card.type)}
            >
              <div class="card-preview">
                <div class="preview-content">
                  ${card.icon} ${card.name}
                </div>
              </div>
              <div class="card-icon">${card.icon}</div>
              <div style="font-weight: 500; margin-bottom: 4px;">${card.name}</div>
              <div style="font-size: 0.8em; color: var(--secondary-text-color);">
                ${card.description}
              </div>
            </div>
          `)}
        </div>
      </div>

      <!-- 实体配置 -->
      ${cardConfig?.entityInterfaces ? this._renderEntityConfig(cardConfig) : ''}

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
            <mwc-list-item value="url">打开链接</mwc-list-item>
          </ha-select>
        </div>

        ${this.config.tap_action?.action === 'more-info' ? html`
          <div class="form-group">
            <ha-entity-picker
              label="目标实体"
              .hass=${this.hass}
              .value=${this.config.tap_action?.entity || ''}
              @value-changed=${e => this._updateConfig('tap_action.entity', e.detail.value)}
              style="width: 100%;"
            ></ha-entity-picker>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityConfig(cardConfig) {
    return html`
      <div class="section">
        <h3 class="section-title">🔧 实体配置</h3>
        
        ${cardConfig.entityInterfaces.required?.map(entity => html`
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
        
        ${cardConfig.entityInterfaces.optional?.map(entity => html`
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
      </div>
    `;
  }

  _renderThemeTab() {
    const themes = window.ThemeManager ? window.ThemeManager.getAllThemes() : [];

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

      <!-- 颜色定制 -->
      <div class="section">
        <h3 class="section-title">🎯 自定义颜色</h3>
        <div class="color-picker-group">
          <ha-textfield
            label="背景颜色"
            .value=${this.config.style?.backgroundColor || ''}
            @input=${e => this._updateConfig('style.backgroundColor', e.target.value)}
            style="width: 100%;"
          ></ha-textfield>
          
          <ha-textfield
            label="文字颜色"
            .value=${this.config.style?.textColor || ''}
            @input=${e => this._updateConfig('style.textColor', e.target.value)}
            style="width: 100%;"
          ></ha-textfield>
          
          <ha-textfield
            label="主色调"
            .value=${this.config.style?.primaryColor || ''}
            @input=${e => this._updateConfig('style.primaryColor', e.target.value)}
            style="width: 100%;"
          ></ha-textfield>
        </div>
      </div>

      <!-- 布局设置 -->
      <div class="section">
        <h3 class="section-title">📐 布局设置</h3>
        <div class="form-group">
          <ha-select
            label="内边距"
            .value=${this.config.style?.padding || '16px'}
            @selected=${e => this._updateConfig('style.padding', e.target.value)}
            style="width: 100%;"
          >
            <mwc-list-item value="8px">小 (8px)</mwc-list-item>
            <mwc-list-item value="16px">中 (16px)</mwc-list-item>
            <mwc-list-item value="24px">大 (24px)</mwc-list-item>
          </ha-select>
        </div>
      </div>
    `;
  }

  _renderStyleTab() {
    return html`
      <!-- 样式微调 -->
      <div class="section">
        <h3 class="section-title">🔧 样式微调</h3>
        <div class="form-group">
          <ha-select
            label="字体大小"
            .value=${this.config.style?.fontSize || 'medium'}
            @selected=${e => this._updateConfig('style.fontSize', e.target.value)}
            style="width: 100%;"
          >
            <mwc-list-item value="small">小</mwc-list-item>
            <mwc-list-item value="medium">中</mwc-list-item>
            <mwc-list-item value="large">大</mwc-list-item>
          </ha-select>
        </div>
      </div>

      <!-- 显示选项 -->
      <div class="section">
        <h3 class="section-title">📊 显示选项</h3>
        <div class="form-group">
          <ha-formfield label="显示秒针">
            <ha-switch
              .checked=${this.config.style?.showSeconds !== false}
              @change=${e => this._updateConfig('style.showSeconds', e.target.checked)}
            ></ha-switch>
          </ha-formfield>
        </div>
      </div>

      <!-- 实时预览 -->
      <div class="section">
        <h3 class="section-title">🎭 实时预览</h3>
        <div class="preview-container">
          <div class="preview-content">
            ${this._renderPreview()}
          </div>
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
            .value=${this.config.advanced?.refreshInterval || '30s'}
            @selected=${e => this._updateConfig('advanced.refreshInterval', e.target.value)}
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
          .value=${this.config.advanced?.customCSS || ''}
          @input=${e => this._updateConfig('advanced.customCSS', e.target.value)}
          style="width: 100%;"
          rows="4"
        ></ha-textarea>
      </div>
    `;
  }

  _getFilteredCards() {
    let filtered = this._availableCards;

    // 分类筛选
    if (this._selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === this._selectedCategory);
    }

    // 搜索筛选
    if (this._searchQuery) {
      const query = this._searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  _selectCardType(cardType) {
    const cardConfig = window.CardRegistry.getCardConfig(cardType);
    
    // 创建新配置
    const newConfig = { 
      type: cardType,
      entities: {},
      style: {},
      advanced: {}
    };

    // 设置实体默认值
    if (cardConfig.entityInterfaces) {
      cardConfig.entityInterfaces.required?.forEach(entity => {
        if (entity.default) {
          newConfig.entities[entity.key] = entity.default;
        }
      });
    }

    this.config = newConfig;
    this._fireConfigChanged();
  }

  _updateConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this.config);
    
    target[lastKey] = value;
    this.requestUpdate();
    this._fireConfigChanged();
  }

  _renderPreview() {
    if (!this.config.type) {
      return html`<div>请先选择卡片类型</div>`;
    }

    const cardConfig = window.CardRegistry.getCardConfig(this.config.type);
    if (!cardConfig.preview) {
      return html`<div>暂无预览</div>`;
    }

    // 简单的文本预览
    return html`
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 1.5em; margin-bottom: 8px;">${cardConfig.icon}</div>
        <div style="font-weight: bold;">${cardConfig.name}</div>
        <div style="font-size: 0.9em; color: var(--secondary-text-color); margin-top: 4px;">
          ${cardConfig.description}
        </div>
      </div>
    `;
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-cancel', { bubbles: true, composed: true }));
  }

  _save() {
    this._fireConfigChanged();
    this.dispatchEvent(new CustomEvent('config-save', { bubbles: true, composed: true }));
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('ha-cardforge-editor', HaCardForgeEditor);