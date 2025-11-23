// src/editors/dashboard/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';
import './inline-block-editor.js';

export class BlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
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
        box-shadow: var(--cf-shadow-sm);
      }

      .block-item.editing {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all var(--cf-transition-fast);
      }

      .block-item:hover .block-icon {
        background: rgba(var(--cf-rgb-primary), 0.2);
        transform: scale(1.05);
      }

      .block-info {
        flex: 1;
        min-width: 0;
      }

      .block-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: 4px;
      }

      .block-title {
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }

      .block-type {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
      }

      .block-preview {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
        margin-bottom: 4px;
      }

      .block-meta {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.75em;
        color: var(--cf-text-secondary);
      }

      .block-position {
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
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
        width: 28px;
        height: 28px;
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
        transform: scale(1.1);
      }

      .inline-editor-container {
        margin: var(--cf-spacing-sm) 0;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

      .empty-icon {
        font-size: 3em;
        opacity: 0.5;
        margin-bottom: var(--cf-spacing-md);
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
        <div class="blocks-list">
          ${this.blocks.map((block, index) => this._renderBlockItem(block, index))}
          
          ${this.blocks.length === 0 ? this._renderEmptyState() : ''}
        </div>
      </div>
    `;
  }

  _renderBlockItem(block, index) {
    const isEditing = this._editingBlockId === block.id;
    const customIcon = block.config?.icon;
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}" 
           @click=${() => this._editBlock(block)}>
        <div class="block-icon">
          <ha-icon .icon=${customIcon || BlockManager.getBlockIcon(block)}></ha-icon>
        </div>
        <div class="block-info">
          <div class="block-header">
            <div class="block-title">${block.config?.title || BlockManager.getBlockDisplayName(block)}</div>
            <div class="block-type">${BlockManager.getBlockDisplayName(block)}</div>
          </div>
          <div class="block-preview">${BlockManager.getBlockPreview(block)}</div>
          <div class="block-meta">
            <div class="block-position">位置: ${block.position?.row || 0},${block.position?.col || 0}</div>
            ${block.type !== 'text' && block.content ? html`
              <div>实体: ${block.content.split('.')[1] || block.content}</div>
            ` : ''}
          </div>
        </div>
        <div class="block-actions">
          <div class="block-action" @click=${(e) => this._editBlock(e, block)} title="编辑">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action" @click=${(e) => this._deleteBlock(e, block.id)} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
      
      ${isEditing ? html`
        <div class="inline-editor-container">
          <inline-block-editor
            .hass=${this.hass}
            .block=${block}
            .availableEntities=${this.availableEntities}
            .layout=${this.layout}
            @block-saved=${e => this._saveBlock(e.detail.block)}
            @edit-cancelled=${() => this._cancelEdit()}
          ></inline-block-editor>
        </div>
      ` : ''}
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:view-grid-plus"></ha-icon>
        <div class="cf-text-md cf-mb-sm">还没有内容块</div>
        <div class="cf-text-sm cf-text-secondary">在仪表盘编辑器中添加内容块</div>
      </div>
    `;
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