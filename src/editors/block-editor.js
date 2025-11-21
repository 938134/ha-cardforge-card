// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockManager } from '../core/block-manager.js';

export class BlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    blocks: { type: Array },
    availableEntities: { type: Array },
    _editingBlock: { state: true },
    _draggingBlockId: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-editor {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-md);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .block-count {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }

      .block-item {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
        cursor: pointer;
        position: relative;
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .block-item.dragging {
        opacity: 0.6;
        border-style: dashed;
      }

      .block-item.editing {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-icon {
        font-size: 1.2em;
        opacity: 0.7;
        width: 24px;
        text-align: center;
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
      }

      .block-preview {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        opacity: 0.7;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .block-item:hover .block-actions {
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

      .drag-handle {
        cursor: grab;
        opacity: 0.5;
        padding: 4px;
        margin-right: -4px;
      }

      .drag-handle:active {
        cursor: grabbing;
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

      .inline-editor-container {
        margin: var(--cf-spacing-sm) 0;
      }

      @media (max-width: 600px) {
        .block-item {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }

        .block-actions {
          opacity: 1; /* 移动端始终显示操作按钮 */
        }
      }
    `
  ];

  constructor() {
    super();
    this.blocks = [];
    this.availableEntities = [];
    this._editingBlock = null;
    this._draggingBlockId = null;
  }

  render() {
    return html`
      <div class="block-editor">
        <div class="section-header">
          <span class="section-title">内容块管理</span>
          <span class="block-count">${this.blocks.length} 个内容块</span>
        </div>
        
        <div class="blocks-list">
          ${this.blocks.map((block, index) => 
            this._editingBlock?.id === block.id
              ? this._renderInlineEditor(block)
              : this._renderBlockItem(block, index)
          )}
          
          ${this.blocks.length === 0 ? this._renderEmptyState() : ''}
        </div>

        <button class="add-block-btn" @click=${this._addBlock}>
          <ha-icon icon="mdi:plus"></ha-icon>
          添加内容块
        </button>
      </div>
    `;
  }

  _renderBlockItem(block, index) {
    const isDragging = this._draggingBlockId === block.id;
    
    return html`
      <div 
        class="block-item ${isDragging ? 'dragging' : ''}"
        @click=${() => this._editBlock(block)}
        draggable="true"
        @dragstart=${(e) => this._onDragStart(e, block.id)}
        @dragend=${this._onDragEnd}
        @dragover=${(e) => this._onDragOver(e, index)}
        @drop=${(e) => this._onDrop(e, index)}
      >
        <ha-icon class="drag-handle" icon="mdi:drag"></ha-icon>
        <ha-icon class="block-icon" .icon=${BlockManager.getBlockIcon(block)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${BlockManager.getBlockDisplayName(block)}</div>
          <div class="block-preview">${BlockManager.getBlockPreview(block)}</div>
        </div>
        <div class="block-actions">
          <div class="block-action" @click=${(e) => this._editBlock(e, block)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action delete" @click=${(e) => this._deleteBlock(e, block.id)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  _renderInlineEditor(block) {
    return html`
      <div class="block-item editing">
        <div class="inline-editor-container" style="width: 100%;">
          <inline-block-editor
            .block=${block}
            .hass=${this.hass}
            .availableEntities=${this.availableEntities}
            .onSave=${(updatedBlock) => this._saveBlock(updatedBlock)}
            .onDelete=${(blockId) => this._deleteBlock(null, blockId)}
            .onCancel=${() => this._cancelEdit()}
          ></inline-block-editor>
        </div>
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:package-variant"></ha-icon>
        <p class="empty-text">点击"添加内容块"开始构建布局</p>
      </div>
    `;
  }

  _addBlock() {
    const newBlock = BlockManager.createBlock('text');
    this.blocks = [...this.blocks, newBlock];
    this._editingBlock = newBlock;
    this._notifyBlocksChanged();
  }

  _editBlock(e, block) {
    if (e) e.stopPropagation();
    this._editingBlock = block;
  }

  _deleteBlock(e, blockId) {
    if (e) e.stopPropagation();
    
    if (!confirm('确定要删除这个内容块吗？')) return;
    
    this.blocks = this.blocks.filter(block => block.id !== blockId);
    this._editingBlock = null;
    this._notifyBlocksChanged();
  }

  _saveBlock(updatedBlock) {
    this.blocks = this.blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._editingBlock = null;
    this._notifyBlocksChanged();
  }

  _cancelEdit() {
    this._editingBlock = null;
  }

  _onDragStart(e, blockId) {
    this._draggingBlockId = blockId;
    e.dataTransfer.effectAllowed = 'move';
  }

  _onDragEnd() {
    this._draggingBlockId = null;
  }

  _onDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  _onDrop(e, targetIndex) {
    e.preventDefault();
    
    if (!this._draggingBlockId) return;
    
    const fromIndex = this.blocks.findIndex(block => block.id === this._draggingBlockId);
    if (fromIndex === -1 || fromIndex === targetIndex) return;
    
    this.blocks = BlockManager.reorderBlocks(this.blocks, fromIndex, targetIndex);
    this._draggingBlockId = null;
    this._notifyBlocksChanged();
  }

  _notifyBlocksChanged() {
    this.dispatchEvent(new CustomEvent('blocks-changed', {
      detail: { blocks: this.blocks }
    }));
  }
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}