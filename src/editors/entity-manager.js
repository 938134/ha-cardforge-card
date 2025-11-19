// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentStrategy: { state: true },
    _contentBlocks: { state: true },
    _availableEntities: { state: true },
    _editingBlock: { state: true },
    _showBlockEditor: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      /* 标题和页脚字段 */
      .header-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .field-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: grid;
        grid-template-columns: 25% 75%;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .field-card.required {
        border-left: 3px solid var(--cf-error-color);
      }

      .field-label {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .required-mark {
        color: var(--cf-error-color);
        font-weight: 600;
      }

      .field-input {
        width: 100%;
      }

      /* 内容块管理区域 */
      .blocks-section {
        margin-top: var(--cf-spacing-lg);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .content-blocks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-md);
      }

      .content-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        transition: all var(--cf-transition-fast);
        cursor: pointer;
        min-height: 60px;
        position: relative;
      }

      .content-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }

      .content-block:hover .block-actions {
        opacity: 1;
      }

      .block-actions {
        position: absolute;
        top: var(--cf-spacing-xs);
        right: var(--cf-spacing-xs);
        display: flex;
        gap: var(--cf-spacing-xs);
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .block-action {
        width: 24px;
        height: 24px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
      }

      .block-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .block-action.delete:hover {
        background: var(--cf-error-color);
        border-color: var(--cf-error-color);
      }

      .block-icon {
        font-size: 1.2em;
        opacity: 0.7;
      }

      .block-info {
        flex: 1;
      }

      .block-title {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }

      .block-preview {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        opacity: 0.7;
      }

      .add-block-btn {
        width: 100%;
        padding: var(--cf-spacing-lg);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: transparent;
        color: var(--cf-text-secondary);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.9em;
      }

      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      /* 内容块编辑器模态框 */
      .block-editor-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--cf-spacing-lg);
      }

      .block-editor {
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--cf-shadow-xl);
      }

      .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-lg);
        padding-bottom: var(--cf-spacing-md);
        border-bottom: 1px solid var(--cf-border);
      }

      .editor-title {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .close-button {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-xs);
      }

      .close-button:hover {
        color: var(--cf-text-primary);
      }

      .editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .form-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .editor-actions {
        display: flex;
        gap: var(--cf-spacing-md);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      /* 提示卡片样式 */
      .info-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        text-align: center;
        margin-top: var(--cf-spacing-lg);
      }

      .info-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.7;
      }

      .info-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-sm);
      }

      .info-description {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
        margin: 0;
      }

      /* 空状态样式 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        margin-bottom: var(--cf-spacing-md);
      }

      .empty-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      .empty-text {
        font-size: 0.9em;
        margin: 0;
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .field-card,
        .content-block,
        .info-card,
        .block-editor {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .block-editor-modal {
          background: rgba(0, 0, 0, 0.7);
        }
      }

      /* 响应式优化 */
      @media (max-width: 600px) {
        .header-fields {
          grid-template-columns: 1fr;
        }

        .field-card {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .content-blocks-grid {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: var(--cf-spacing-sm);
        }

        .content-block {
          min-height: 55px;
          padding: var(--cf-spacing-sm);
        }

        .info-card {
          padding: var(--cf-spacing-md);
        }

        .block-editor-modal {
          padding: var(--cf-spacing-md);
        }

        .block-editor {
          padding: var(--cf-spacing-md);
        }
      }
    `
  ];

  constructor() {
    super();
    this._currentStrategy = 'stateless';
    this._contentBlocks = [];
    this._availableEntities = [];
    this._editingBlock = null;
    this._showBlockEditor = false;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest') || changedProperties.has('config')) {
      this._currentStrategy = this._detectStrategy();
      this._contentBlocks = this._extractContentBlocks();
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    const entities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    this._availableEntities = entities;
  }

  _detectStrategy() {
    const manifest = this.pluginManifest;
    if (!manifest) return 'stateless';

    if (manifest.layout_type === 'free') return 'free_layout';
    if (manifest.entity_requirements && Object.keys(manifest.entity_requirements).length > 0) {
      return 'structured';
    }
    return 'stateless';
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderStrategyContent()}
        ${this._renderBlockEditor()}
        ${this._renderInfoCard()}
      </div>
    `;
  }

  _renderStrategyContent() {
    switch (this._currentStrategy) {
      case 'free_layout':
        return this._renderFreeLayout();
      case 'structured':
        return this._renderStructured();
      default:
        return this._renderStateless();
    }
  }

  _renderFreeLayout() {
    return html`
      <div>
        <!-- 标题和页脚字段 -->
        ${this._renderHeaderFields()}
        
        <!-- 内容块管理 -->
        <div class="blocks-section">
          <div class="section-title">
            <span>内容块管理</span>
            <span class="cf-text-sm cf-text-secondary">${this._contentBlocks.length} 个内容块</span>
          </div>
          
          <div class="content-blocks-grid">
            ${this._contentBlocks.map(block => this._renderContentBlock(block))}
            <button class="add-block-btn" @click=${this._addContentBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加内容块
            </button>
          </div>

          ${this._contentBlocks.length === 0 ? html`
            <div class="empty-state">
              <ha-icon class="empty-icon" icon="mdi:package-variant"></ha-icon>
              <p class="empty-text">点击"添加内容块"开始构建布局</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderHeaderFields() {
    const capabilities = this.pluginManifest?.capabilities || {};
    
    if (!capabilities.supportsTitle && !capabilities.supportsFooter) {
      return '';
    }

    return html`
      <div class="header-fields">
        ${capabilities.supportsTitle ? html`
          <div class="field-card">
            <div class="field-label">标题</div>
            <div class="field-input">
              <ha-textfield
                .value=${this.config.entities?.title || ''}
                @input=${e => this._onHeaderFieldChanged('title', e.target.value)}
                label="卡片标题"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
          
          <div class="field-card">
            <div class="field-label">副标题</div>
            <div class="field-input">
              <ha-textfield
                .value=${this.config.entities?.subtitle || ''}
                @input=${e => this._onHeaderFieldChanged('subtitle', e.target.value)}
                label="副标题（可选）"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
        ` : ''}
        
        ${capabilities.supportsFooter ? html`
          <div class="field-card">
            <div class="field-label">页脚</div>
            <div class="field-input">
              <ha-textfield
                .value=${this.config.entities?.footer || ''}
                @input=${e => this._onHeaderFieldChanged('footer', e.target.value)}
                label="页脚文本"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderStructured() {
    const requirements = this.pluginManifest?.entity_requirements || {};

    return html`
      <div>
        ${Object.entries(requirements).map(([key, requirement]) => 
          this._renderEntityField(key, requirement)
        )}
      </div>
    `;
  }

  _renderStateless() {
    return html``;
  }

  _renderContentBlock(block) {
    return html`
      <div class="content-block" @click=${() => this._editContentBlock(block)}>
        <div class="block-actions">
          <div class="block-action edit" @click=${(e) => { e.stopPropagation(); this._editContentBlock(block); }}>
            <ha-icon icon="mdi:pencil" style="font-size: 14px;"></ha-icon>
          </div>
          <div class="block-action delete" @click=${(e) => { e.stopPropagation(); this._deleteContentBlock(block.id); }}>
            <ha-icon icon="mdi:delete" style="font-size: 14px;"></ha-icon>
          </div>
        </div>
        <ha-icon class="block-icon" .icon=${this._getBlockIcon(block.type)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${this._getBlockTypeName(block.type)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
      </div>
    `;
  }

  _renderEntityField(key, requirement) {
    const currentValue = this.config.entities?.[key] || '';

    return html`
      <div class="field-card ${requirement.required ? 'required' : ''}">
        <div class="field-label">
          ${requirement.name}
          ${requirement.required ? html`<span class="required-mark">(*)</span>` : ''}
        </div>
        <div class="field-input">
          <ha-combo-box
            .items=${this._availableEntities}
            .value=${currentValue}
            @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
            allow-custom-value
            label=${`选择 ${requirement.name}`}
          ></ha-combo-box>
        </div>
      </div>
    `;
  }

  _renderBlockEditor() {
    if (!this._showBlockEditor) return '';

    const blockTypes = [
      { value: 'text', label: '文本块', icon: 'mdi:text' },
      { value: 'sensor', label: '传感器', icon: 'mdi:gauge' },
      { value: 'weather', label: '天气', icon: 'mdi:weather-cloudy' },
      { value: 'switch', label: '开关', icon: 'mdi:power' }
    ];

    return html`
      <div class="block-editor-modal" @click=${this._closeBlockEditor}>
        <div class="block-editor" @click=${e => e.stopPropagation()}>
          <div class="editor-header">
            <div class="editor-title">
              ${this._editingBlock ? '编辑内容块' : '添加内容块'}
            </div>
            <button class="close-button" @click=${this._closeBlockEditor}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="editor-form">
            <div class="form-group">
              <label class="form-label">内容块类型</label>
              <ha-combo-box
                .items=${blockTypes}
                .value=${this._editingBlock?.type || 'text'}
                @value-changed=${e => this._onBlockTypeChange(e.detail.value)}
                label="选择内容块类型"
              ></ha-combo-box>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                ${this._editingBlock?.type === 'text' ? '文本内容' : 
                  this._editingBlock?.type === 'sensor' ? '传感器实体' :
                  this._editingBlock?.type === 'weather' ? '天气实体' :
                  this._editingBlock?.type === 'switch' ? '开关实体' : '内容'}
              </label>
              ${this._editingBlock?.type === 'text' ? html`
                <ha-textarea
                  .value=${this._editingBlock?.content || ''}
                  @input=${e => this._onBlockContentChange(e.target.value)}
                  label="输入文本内容"
                  rows="3"
                ></ha-textarea>
              ` : html`
                <ha-combo-box
                  .items=${this._availableEntities}
                  .value=${this._editingBlock?.content || ''}
                  @value-changed=${e => this._onBlockContentChange(e.detail.value)}
                  label="选择实体"
                  allow-custom-value
                ></ha-combo-box>
              `}
            </div>
            
            ${this._editingBlock?.type === 'text' ? html`
              <div class="form-group">
                <label class="form-label">自定义样式（可选）</label>
                <ha-textfield
                  .value=${this._editingBlock?.config?.background || ''}
                  @input=${e => this._onBlockStyleChange('background', e.target.value)}
                  label="背景颜色"
                  placeholder="#f0f0f0 或 rgba(255,255,255,0.8)"
                ></ha-textfield>
                <ha-textfield
                  .value=${this._editingBlock?.config?.textColor || ''}
                  @input=${e => this._onBlockStyleChange('textColor', e.target.value)}
                  label="文字颜色"
                  placeholder="#333333"
                ></ha-textfield>
              </div>
            ` : ''}
          </div>
          
          <div class="editor-actions">
            <mwc-button @click=${this._closeBlockEditor}>取消</mwc-button>
            <mwc-button raised @click=${this._saveContentBlock}>
              ${this._editingBlock ? '保存' : '添加'}
            </mwc-button>
          </div>
        </div>
      </div>
    `;
  }

  _renderInfoCard() {
    const strategyInfo = this._getStrategyInfo();
    
    return html`
      <div class="info-card">
        <ha-icon class="info-icon" .icon=${strategyInfo.icon}></ha-icon>
        <div class="info-title">${strategyInfo.name}</div>
        <p class="info-description">${strategyInfo.description}</p>
      </div>
    `;
  }

  _getStrategyInfo() {
    const strategyInfo = {
      free_layout: {
        name: '自由布局模式',
        description: '可任意添加和排列内容块，构建个性化布局。支持标题、页脚自定义。',
        icon: 'mdi:view-grid-plus'
      },
      structured: {
        name: '智能数据源',
        description: '配置所需的数据源实体，系统将自动获取并展示数据',
        icon: 'mdi:database-cog'
      },
      stateless: {
        name: '智能数据源',
        description: '此卡片使用内置数据源，无需额外配置实体。系统会自动提供相关数据展示。',
        icon: 'mdi:chart-donut'
      }
    };

    return strategyInfo[this._currentStrategy] || strategyInfo.stateless;
  }

  _extractContentBlocks(entities = this.config.entities) {
    const blocks = [];
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type') && !key.startsWith('_')) {
        const blockId = key.replace('_type', '');
        const configKey = `${blockId}_config`;
        
        try {
          blocks.push({
            id: blockId,
            type: value,
            content: entities[blockId] || '',
            config: entities[configKey] ? JSON.parse(entities[configKey]) : {},
            order: parseInt(entities[`${blockId}_order`]) || 0
          });
        } catch (e) {
          console.warn(`解析内容块配置失败: ${blockId}`, e);
        }
      }
    });

    return blocks.sort((a, b) => a.order - b.order);
  }

  _getBlockIcon(blockType) {
    const icons = {
      text: 'mdi:text',
      sensor: 'mdi:gauge',
      weather: 'mdi:weather-cloudy',
      switch: 'mdi:power',
      image: 'mdi:image'
    };
    return icons[blockType] || 'mdi:cube';
  }

  _getBlockTypeName(blockType) {
    const names = {
      text: '文本块',
      sensor: '传感器',
      weather: '天气',
      switch: '开关',
      image: '图片'
    };
    return names[blockType] || '内容块';
  }

  _getBlockPreview(block) {
    if (block.type === 'text') {
      return block.content.substring(0, 15) + (block.content.length > 15 ? '...' : '');
    }
    if (['sensor', 'weather', 'switch'].includes(block.type) && block.content) {
      return block.content.split('.')[1] || block.content;
    }
    return '点击编辑';
  }

  _onHeaderFieldChanged(field, value) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: {
        entities: {
          ...this.config.entities,
          [field]: value
        }
      }
    }));
  }

  _onEntityChanged(key, value) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: {
        entities: {
          ...this.config.entities,
          [key]: value
        }
      }
    }));
  }

  _addContentBlock() {
    const blockId = `block_${Date.now()}`;
    this._editingBlock = {
      id: blockId,
      type: 'text',
      content: '',
      config: {},
      order: this._contentBlocks.length
    };
    this._showBlockEditor = true;
  }

  _editContentBlock(block) {
    this._editingBlock = { ...block };
    this._showBlockEditor = true;
  }

  _deleteContentBlock(blockId) {
    if (!confirm('确定要删除这个内容块吗？')) {
      return;
    }

    const newEntities = { ...this.config.entities };
    
    // 删除与内容块相关的所有字段
    Object.keys(newEntities).forEach(key => {
      if (key.startsWith(blockId)) {
        delete newEntities[key];
      }
    });

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }

  _closeBlockEditor() {
    this._showBlockEditor = false;
    this._editingBlock = null;
  }

  _onBlockTypeChange(type) {
    if (this._editingBlock) {
      this._editingBlock.type = type;
      // 如果切换到非文本类型，清空自定义样式
      if (type !== 'text') {
        this._editingBlock.config = {};
      }
    }
  }

  _onBlockContentChange(content) {
    if (this._editingBlock) {
      this._editingBlock.content = content;
    }
  }

  _onBlockStyleChange(styleKey, value) {
    if (this._editingBlock) {
      this._editingBlock.config = {
        ...this._editingBlock.config,
        [styleKey]: value
      };
    }
  }

  _saveContentBlock() {
    if (!this._editingBlock) return;

    const newEntities = { ...this.config.entities };
    const blockId = this._editingBlock.id;

    // 保存内容块数据
    newEntities[blockId] = this._editingBlock.content;
    newEntities[`${blockId}_type`] = this._editingBlock.type;
    newEntities[`${blockId}_order`] = this._editingBlock.order.toString();
    
    // 保存配置（如果有）
    if (Object.keys(this._editingBlock.config).length > 0) {
      newEntities[`${blockId}_config`] = JSON.stringify(this._editingBlock.config);
    }

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));

    this._closeBlockEditor();
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}