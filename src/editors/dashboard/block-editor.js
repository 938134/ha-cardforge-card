// src/editors/dashboard/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class BlockEditor extends LitElement {
  static properties = {
    blocks: { type: Array },
    onBlocksChange: { type: Object }
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
    this.onBlocksChange = () => {};
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
    return html`
      <div class="block-item" @click=${() => this._editBlock(block)}>
        <ha-icon class="block-icon" .icon=${BlockManager.getBlockIcon(block)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${block.config?.title || BlockManager.getBlockDisplayName(block)}</div>
          <div class="block-preview">${BlockManager.getBlockPreview(block)}</div>
        </div>
      </div>
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
    this.blocks = [...this.blocks, newBlock];
    this.onBlocksChange(this.blocks);
  }

  _editBlock(block) {
    // 内联编辑功能待实现
    console.log('编辑块:', block);
  }
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}

export { BlockEditor };