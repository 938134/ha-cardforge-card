// src/editors/dashboard/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';
import './inline-block-editor.js';

export class BlockEditor extends LitElement {
  static properties = {
    blocks: { type: Array },
    availableEntities: { type: Array },
    layout: { type: String },
    _editingBlockId: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-editor {
        width: 100%;
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-md);
        color: var(--cf-text-primary);
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
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
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
      }

      .block-position {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-top: 4px;
      }

      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
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

      .inline-editor-container {
        margin: var(--cf-spacing-sm) 0;
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
      }

      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }
    `
  ];

  constructor() {
    super();
    this.blocks = [];
    this.availableEntities = [];
    this.layout = '2x2';
    this._editingBlockId = null;
  }

  render() {
    return html`
      <div class="block-editor">
        <div class="section-title">内容块管理</div>
        
        <div class="blocks-list">
          ${this.blocks.map((block, index) => this._renderBlockItem(block, index))}
          
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
    const isEditing = this._editingBlockId === block.id;
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}" 
           @click=${() => this._editBlock(block)}>
        <ha-icon class="block-icon" .icon=${BlockManager.getBlockIcon(block)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${block.config?.title || BlockManager.getBlockDisplayName(block)}</div>
          <div class="block-preview">${BlockManager.getBlockPreview(block)}</div>
          ${block.position ? html`
            <div class="block-position">
              位置: ${block.position.row},${block.position.col}
            </div>
          ` : ''}
        </div>
        <div class="block-actions">
          <div class="block-action" @click=${(e) => this._editBlock(e, block)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action" @click=${(e) => this._deleteBlock(e, block.id)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
      
      ${isEditing ? html`
        <div class="inline-editor-container">
          <inline-block-editor
            .block=${block}
            .availableEntities=${this.availableEntities}
            .layout=${this.layout}
            @block-saved=${e => this._saveBlock(e.detail.block)}
            @edit-cancelled=${() => this._cancelEdit()}
            @block-deleted=${e => this._deleteBlock(null, e.detail.blockId)}
          ></inline-block-editor>
        </div>
      ` : ''}
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5;"></ha-icon>
        <div class="cf-text-sm cf-mt-md">点击"添加内容块"开始构建布局</div>
      </div>
    `;
  }

  _addBlock() {
    const newBlock = BlockManager.createBlock('text');
    newBlock.position = BlockManager.getNextPosition(this.blocks, this.layout);
    this.blocks = [...this.blocks, newBlock];
    this._notifyBlocksChanged();
  }

  _editBlock(e, block) {
    if (e) e.stopPropagation();
    this._editingBlockId = block.id;
  }

  _deleteBlock(e, blockId) {
    if (e) e.stopPropagation();
    
    if (!confirm('确定要删除这个内容块吗？')) return;
    
    this.blocks = this.blocks.filter(block => block.id !== blockId);
    this._editingBlockId = null;
    this._notifyBlocksChanged();
  }

  _saveBlock(updatedBlock) {
    this.blocks = this.blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._editingBlockId = null;
    this._notifyBlocksChanged();
  }

  _cancelEdit() {
    this._editingBlockId = null;
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