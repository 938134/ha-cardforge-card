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
    _editingBlock: { state: true }
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

      /* 标题和页脚配置 */
      .header-footer-config {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .header-footer-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .field-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      /* 内容块管理 */
      .blocks-section {
        margin-top: var(--cf-spacing-lg);
      }

      .blocks-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-md);
      }

      .section-title {
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .content-blocks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
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
        min-height: 70px;
        position: relative;
      }

      .content-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }

      .content-block.editing {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-icon {
        font-size: 1.5em;
        opacity: 0.7;
        flex-shrink: 0;
      }

      .block-info {
        flex: 1;
        min-width: 0;
      }

      .block-title {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .block-preview {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        opacity: 0.7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

      .action-btn {
        padding: var(--cf-spacing-xs);
        border: none;
        background: transparent;
        color: var(--cf-text-secondary);
        cursor: pointer;
        border-radius: var(--cf-radius-sm);
        transition: all var(--cf-transition-fast);
      }

      .action-btn:hover {
        background: var(--cf-primary-color);
        color: white;
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

      /* 块编辑器模态框 */
      .block-editor {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        margin-top: var(--cf-spacing-md);
      }

      .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-md);
      }

      .editor-title {
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .form-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      .editor-actions {
        display: flex;
        gap: var(--cf-spacing-md);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-lg);
      }

      /* 空状态样式 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        margin: var(--cf-spacing-md) 0;
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
        .content-block,
        .block-editor {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .header-footer-config {
          grid-template-columns: 1fr;
        }

        .content-blocks-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }

        .content-block {
          min-height: 60px;
          padding: var(--cf-spacing-sm);
        }
      }

      @media (max-width: 480px) {
        .content-blocks-grid {
          grid-template-columns: 1fr;
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

  // ... _updateAvailableEntities, _detectStrategy 方法保持不变 ...

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderStrategyContent()}
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
        <!-- 标题和页脚配置 -->
        ${this._renderHeaderFooterConfig()}
        
        <!-- 内容块管理 -->
        <div class="blocks-section">
          <div class="blocks-header">
            <div class="section-title">内容块管理</div>
            <div class="cf-text-sm cf-text-secondary">${this._contentBlocks.length} 个内容块</div>
          </div>
          
          <div class="content-blocks-grid">
            ${this._contentBlocks.map(block => this._renderContentBlock(block))}
            <button class="add-block-btn" @click=${this._showBlockCreator}>
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

        <!-- 块编辑器 -->
        ${this._editingBlock ? this._renderBlockEditor() : ''}
      </div>
    `;
  }

  _renderHeaderFooterConfig() {
    const title = this.config.entities?.title || '';
    const footer = this.config.entities?.footer || '';

    return html`
      <div class="header-footer-config">
        <div class="header-footer-field">
          <label class="field-label">标题</label>
          <ha-textfield
            .value=${title}
            @input=${e => this._onHeaderFooterChanged('title', e.target.value)}
            placeholder="输入卡片标题..."
            outlined
          ></ha-textfield>
        </div>
        
        <div class="header-footer-field">
          <label class="field-label">页脚</label>
          <ha-textfield
            .value=${footer}
            @input=${e => this._onHeaderFooterChanged('footer', e.target.value)}
            placeholder="输入页脚文本..."
            outlined
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  _renderContentBlock(block) {
    const isEditing = this._editingBlock?.id === block.id;
    
    return html`
      <div class="content-block ${isEditing ? 'editing' : ''}" 
           @click=${() => this._editContentBlock(block)}>
        <ha-icon class="block-icon" .icon=${this._getBlockIcon(block.type)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${this._getBlockTypeName(block.type)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
        <div class="block-actions">
          <button class="action-btn" @click=${(e) => this._deleteContentBlock(e, block.id)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderBlockEditor() {
    if (!this._editingBlock) return '';

    return html`
      <div class="block-editor">
        <div class="editor-header">
          <div class="editor-title">编辑内容块</div>
          <button class="action-btn" @click=${this._closeBlockEditor}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        
        <div class="editor-form">
          <div class="form-field">
            <label class="form-label">内容块类型</label>
            <ha-combo-box
              .items=${this._getBlockTypeOptions()}
              .value=${this._editingBlock.type}
              @value-changed=${e => this._onBlockTypeChanged(e.detail.value)}
              allow-custom-value
            ></ha-combo-box>
          </div>
          
          <div class="form-field">
            <label class="form-label">内容</label>
            ${this._editingBlock.type === 'sensor' || this._editingBlock.type === 'entity' ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._editingBlock.content}
                @value-changed=${e => this._onBlockContentChanged(e.detail.value)}
                allow-custom-value
                label="选择实体"
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this._editingBlock.content}
                @input=${e => this._onBlockContentChanged(e.target.value)}
                placeholder="输入内容..."
                outlined
                fullwidth
              ></ha-textfield>
            `}
          </div>
          
          <div class="editor-actions">
            <mwc-button @click=${this._closeBlockEditor}>取消</mwc-button>
            <mwc-button @click=${this._saveBlockEditor} raised>保存</mwc-button>
          </div>
        </div>
      </div>
    `;
  }

  _getBlockTypeOptions() {
    return [
      { value: 'text', label: '文本块' },
      { value: 'sensor', label: '传感器' },
      { value: 'entity', label: '实体状态' },
      { value: 'markdown', label: 'Markdown' }
    ];
  }

  _showBlockCreator() {
    const newBlockId = `block_${Date.now()}`;
    this._editingBlock = {
      id: newBlockId,
      type: 'text',
      content: '新内容块',
      isNew: true
    };
  }

  _editContentBlock(block) {
    this._editingBlock = { ...block };
  }

  _closeBlockEditor() {
    this._editingBlock = null;
  }

  _saveBlockEditor() {
    if (!this._editingBlock) return;

    const newEntities = { ...this.config.entities };
    
    // 更新内容块数据
    newEntities[this._editingBlock.id] = this._editingBlock.content;
    newEntities[`${this._editingBlock.id}_type`] = this._editingBlock.type;

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));

    this._editingBlock = null;
  }

  _deleteContentBlock(e, blockId) {
    e.stopPropagation();
    
    const newEntities = { ...this.config.entities };
    delete newEntities[blockId];
    delete newEntities[`${blockId}_type`];

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }

  _onHeaderFooterChanged(key, value) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: {
        entities: {
          ...this.config.entities,
          [key]: value
        }
      }
    }));
  }

  _onBlockTypeChanged(type) {
    if (this._editingBlock) {
      this._editingBlock.type = type;
      this.requestUpdate();
    }
  }

  _onBlockContentChanged(content) {
    if (this._editingBlock) {
      this._editingBlock.content = content;
      this.requestUpdate();
    }
  }

  // ... 其他辅助方法保持不变 ...
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}