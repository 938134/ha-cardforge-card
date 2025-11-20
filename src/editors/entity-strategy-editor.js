// src/editors/entity-strategy-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';
import './inline-block-editor.js';

export class EntityStrategyEditor extends LitElement {
  static properties = {
    strategyType: { type: String },
    strategyData: { type: Object },
    hass: { type: Object },
    _availableEntities: { state: true },
    _editingBlockId: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .strategy-editor {
        width: 100%;
      }

      .strategy-info {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        text-align: center;
        margin-bottom: var(--cf-spacing-lg);
      }

      .info-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-md);
      }

      .info-title {
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
      }

      .info-description {
        color: var(--cf-text-secondary);
        font-size: 0.9em;
      }

      /* 自由布局样式 */
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

      .content-blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .content-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
        cursor: pointer;
      }

      .content-block:hover {
        border-color: var(--cf-primary-color);
      }

      .block-icon {
        font-size: 1.2em;
        opacity: 0.7;
        width: 24px;
        text-align: center;
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

      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .content-block:hover .block-actions {
        opacity: 1;
      }

      .block-action {
        width: 32px;
        height: 32px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
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

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        margin-bottom: var(--cf-spacing-md);
      }

      /* 结构化实体样式 */
      .structured-fields {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
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

      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      @media (max-width: 600px) {
        .field-card {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._availableEntities = [];
    this._editingBlockId = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    return html`
      <div class="strategy-editor">
        ${this._renderStrategyInfo()}
        ${this._renderStrategyContent()}
      </div>
    `;
  }

  _renderStrategyInfo() {
    const strategyInfo = {
      free_layout: { 
        name: '自由布局模式', 
        description: '可任意添加和排列内容块，构建个性化布局',
        icon: 'mdi:view-grid-plus'
      },
      structured: { 
        name: '智能数据源', 
        description: '配置所需的数据源实体',
        icon: 'mdi:database-cog'
      },
      stateless: { 
        name: '内置数据源', 
        description: '使用插件内置数据，无需额外配置',
        icon: 'mdi:chart-donut'
      }
    };

    const info = strategyInfo[this.strategyType] || strategyInfo.stateless;

    return html`
      <div class="strategy-info">
        <ha-icon class="info-icon" .icon=${info.icon}></ha-icon>
        <div class="info-title">${info.name}</div>
        <p class="info-description">${info.description}</p>
      </div>
    `;
  }

  _renderStrategyContent() {
    switch (this.strategyType) {
      case 'free_layout':
        return this._renderFreeLayout();
      case 'structured':
        return this._renderStructured();
      case 'stateless':
        return this._renderStateless();
      default:
        return this._renderDefault();
    }
  }

  _renderFreeLayout() {
    const blocks = this.strategyData?.blocks || [];

    return html`
      <div class="blocks-section">
        <div class="section-title">
          <span>内容块管理</span>
          <span class="cf-text-sm cf-text-secondary">${blocks.length} 个内容块</span>
        </div>
        
        <div class="content-blocks-list">
          ${blocks.map(block => 
            block.id === this._editingBlockId ? 
              this._renderInlineEditor(block) : 
              this._renderContentBlock(block)
          )}
          
          ${blocks.length === 0 ? html`
            <div class="empty-state">
              <ha-icon class="empty-icon" icon="mdi:package-variant"></ha-icon>
              <p class="empty-text">点击"添加内容块"开始构建布局</p>
            </div>
          ` : ''}
          
          <button class="add-block-btn" @click=${this._addContentBlock}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加内容块
          </button>
        </div>
      </div>
    `;
  }

  _renderStructured() {
    const entities = this.strategyData?.entities || {};
    const requirements = this.strategyData?.requirementCount ? 
      Object.keys(entities) : [];

    return html`
      <div class="structured-fields">
        ${requirements.map(key => {
          const entity = entities[key];
          return html`
            <div class="field-card">
              <div class="field-label">
                ${entity.name || key}
                ${entity.required ? html`<span style="color: var(--cf-error-color)">*</span>` : ''}
              </div>
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${entity.value || ''}
                @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
                allow-custom-value
                label=${`选择 ${entity.name || key}`}
              ></ha-combo-box>
            </div>
          `;
        })}
        
        ${requirements.length === 0 ? html`
          <div class="empty-state">
            <ha-icon class="empty-icon" icon="mdi:check-circle"></ha-icon>
            <p class="empty-text">此卡片无需配置数据源</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderStateless() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:auto-fix"></ha-icon>
        <p class="empty-text">此卡片使用智能数据源，无需配置</p>
        <p class="cf-text-sm cf-mt-sm">插件将自动获取和显示相关信息</p>
      </div>
    `;
  }

  _renderDefault() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:help-circle"></ha-icon>
        <p class="empty-text">请先选择卡片类型</p>
      </div>
    `;
  }

  _renderContentBlock(block) {
    return html`
      <div class="content-block">
        <ha-icon class="block-icon" .icon=${this._getBlockIcon(block.type)}></ha-icon>
        <div class="block-info" @click=${() => this._editContentBlock(block.id)}>
          <div class="block-title">${this._getBlockTypeName(block.type)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
        <div class="block-actions">
          <div class="block-action" @click=${() => this._editContentBlock(block.id)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action delete" @click=${() => this._deleteContentBlock(block.id)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  _renderInlineEditor(block) {
    return html`
      <inline-block-editor
        .block=${block}
        .hass=${this.hass}
        .availableEntities=${this._availableEntities}
        .onSave=${(updatedBlock) => this._saveContentBlock(updatedBlock)}
        .onDelete=${(blockId) => this._deleteContentBlock(blockId)}
        .onCancel=${() => this._cancelEdit()}
      ></inline-block-editor>
    `;
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _getBlockIcon(type) {
    const icons = { 
      text: 'mdi:text', 
      sensor: 'mdi:gauge', 
      weather: 'mdi:weather-cloudy', 
      switch: 'mdi:power' 
    };
    return icons[type] || 'mdi:cube';
  }

  _getBlockTypeName(type) {
    const names = { 
      text: '文本块', 
      sensor: '传感器', 
      weather: '天气', 
      switch: '开关' 
    };
    return names[type] || '内容块';
  }

  _getBlockPreview(block) {
    if (block.type === 'text') {
      return (block.content || '').substring(0, 20) + ((block.content || '').length > 20 ? '...' : '');
    }
    return block.content || '点击编辑';
  }

  _onEntityChanged(key, value) {
    this._updateEntities({ [key]: value });
  }

  _addContentBlock() {
    const blockId = `block_${Date.now()}`;
    const newBlock = { 
      id: blockId, 
      type: 'text', 
      content: '', 
      config: {}, 
      order: (this.strategyData?.blocks?.length || 0) 
    };
    
    this._editContentBlock(blockId);
    this._saveContentBlock(newBlock);
  }

  _editContentBlock(blockId) {
    this._editingBlockId = blockId;
  }

  _deleteContentBlock(blockId) {
    if (!confirm('确定要删除这个内容块吗？')) return;
    
    const newEntities = { ...this._getCurrentEntities() };
    Object.keys(newEntities).forEach(key => {
      if (key.startsWith(blockId)) delete newEntities[key];
    });
    
    this._updateEntities(newEntities);
    this._editingBlockId = null;
  }

  _saveContentBlock(updatedBlock) {
    const entities = this._getCurrentEntities();
    
    // 更新实体数据
    entities[updatedBlock.id] = updatedBlock.content || '';
    entities[`${updatedBlock.id}_type`] = updatedBlock.type || 'text';
    entities[`${updatedBlock.id}_order`] = String(updatedBlock.order || '0');
    
    if (Object.keys(updatedBlock.config || {}).length > 0) {
      entities[`${updatedBlock.id}_config`] = JSON.stringify(updatedBlock.config);
    }
    
    this._updateEntities(entities);
    this._editingBlockId = null;
  }

  _cancelEdit() {
    this._editingBlockId = null;
  }

  _getCurrentEntities() {
    // 从策略数据重建实体结构
    const entities = {};
    const blocks = this.strategyData?.blocks || [];
    
    blocks.forEach(block => {
      entities[block.id] = block.content;
      entities[`${block.id}_type`] = block.type;
      entities[`${block.id}_order`] = String(block.order);
      
      if (Object.keys(block.config || {}).length > 0) {
        entities[`${block.id}_config`] = JSON.stringify(block.config);
      }
    });
    
    return entities;
  }

  _updateEntities(entities) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }
}

if (!customElements.get('entity-strategy-editor')) {
  customElements.define('entity-strategy-editor', EntityStrategyEditor);
}