// src/editors/block-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';
import './block-editor-overlay.js';

class BlockManager extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-manager {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .blocks-grid {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .block-row {
        display: grid;
        grid-template-columns: 40px 48px 1fr 60px;
        gap: var(--cf-spacing-sm);
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm);
        transition: all var(--cf-transition-fast);
        min-height: 60px;
        cursor: pointer;
      }

      .block-row:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
        transform: translateY(-1px);
      }

      /* 列1 - 区域标识 */
      .area-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
      }

      .area-letter {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        font-weight: 700;
        color: white;
      }

      .area-letter.header {
        background: #2196F3;
      }

      .area-letter.content {
        background: #4CAF50;
      }

      .area-letter.footer {
        background: #FF9800;
      }

      /* 列2 - 图标 */
      .block-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        transition: all var(--cf-transition-fast);
      }

      .block-row:hover .block-icon {
        background: rgba(var(--cf-rgb-primary), 0.2);
        transform: scale(1.05);
      }

      /* 列3 - 名称与状态 */
      .block-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .block-name {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .block-state {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* 列4 - 操作按钮 */
      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        opacity: 0.6;
        transition: opacity var(--cf-transition-fast);
      }

      .block-row:hover .block-actions {
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
        transform: scale(1.1);
      }

      .block-action.edit:hover {
        background: var(--cf-primary-color);
      }

      .block-action.delete:hover {
        background: var(--cf-error-color);
      }

      /* 添加块按钮 */
      .add-block-btn {
        width: 100%;
        padding: var(--cf-spacing-md);
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
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

      /* 空状态 */
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

      /* 响应式适配 */
      @media (max-width: 600px) {
        .block-row {
          grid-template-columns: 36px 40px 1fr 56px;
          gap: var(--cf-spacing-xs);
          padding: var(--cf-spacing-xs);
          min-height: 54px;
        }

        .block-icon {
          width: 36px;
          height: 36px;
          font-size: 1.1em;
        }

        .block-name {
          font-size: 0.85em;
        }

        .block-state {
          font-size: 0.75em;
        }

        .block-action {
          width: 28px;
          height: 28px;
        }
      }
    `
  ];

  constructor() {
    super();
    this._editingBlockId = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    
    return html`
      <div class="block-manager">
        ${this._renderBlocksGrid(blocks)}
        ${this._renderAddBlockButton()}
        
        <block-editor-overlay
          .open=${!!this._editingBlockId}
          .blockConfig=${this._editingBlockId ? this.config.blocks[this._editingBlockId] : {}}
          .hass=${this.hass}
          @block-saved=${this._onBlockSaved}
          @edit-cancelled=${this._onEditCancelled}
        ></block-editor-overlay>
      </div>
    `;
  }

  _getAllBlocks() {
    if (!this.config.blocks) return [];
    
    return Object.entries(this.config.blocks).map(([blockId, blockConfig]) => ({
      id: blockId,
      ...blockConfig
    }));
  }

  _renderBlocksGrid(blocks) {
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
          <div class="cf-text-md cf-mb-sm">还没有任何块</div>
          <div class="cf-text-sm cf-text-secondary">点击下方按钮添加第一个块</div>
        </div>
      `;
    }

    // 按区域排序：标题 → 内容 → 页脚
    const sortedBlocks = [...blocks].sort((a, b) => {
      const areaOrder = { 'header': 0, 'content': 1, 'footer': 2 };
      const orderA = areaOrder[a.area] ?? 1;
      const orderB = areaOrder[b.area] ?? 1;
      return orderA - orderB;
    });

    return html`
      <div class="blocks-grid">
        ${sortedBlocks.map(block => this._renderBlockRow(block))}
      </div>
    `;
  }

  _renderBlockRow(block) {
    const displayName = block.title || BlockSystem.getBlockDisplayName(block);
    const icon = block.icon || BlockSystem.getBlockIcon(block);
    const state = BlockSystem.getBlockPreview(block, this.hass);
    const areaInfo = this._getAreaInfo(block.area);

    return html`
      <div class="block-row" @click=${() => this._editBlock(block.id)}>
        <!-- 列1: 区域标识 -->
        <div class="area-badge">
          <div class="area-letter ${block.area || 'content'}">${areaInfo.letter}</div>
        </div>

        <!-- 列2: 图标 -->
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>

        <!-- 列3: 名称与状态 -->
        <div class="block-info">
          <div class="block-name">${displayName}</div>
          <div class="block-state">${state}</div>
        </div>

        <!-- 列4: 操作按钮 -->
        <div class="block-actions">
          <div class="block-action edit" @click=${e => this._editBlock(e, block.id)} title="编辑块">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action delete" @click=${e => this._deleteBlock(e, block.id)} title="删除块">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  _renderAddBlockButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus"></ha-icon>
        添加块
      </button>
    `;
  }

  _getAreaInfo(area) {
    const areaMap = {
      'header': { letter: 'H', fullText: '标题', color: '#2196F3' },
      'content': { letter: 'C', fullText: '内容', color: '#4CAF50' },
      'footer': { letter: 'F', fullText: '页脚', color: '#FF9800' }
    };
    return areaMap[area] || areaMap.content;
  }

  _editBlock(e, blockId) {
    if (e) e.stopPropagation();
    this._editingBlockId = blockId;
  }

  _addBlock() {
    const area = prompt('请选择要添加到的区域：\n\n输入: H(标题) / C(内容) / F(页脚)', 'C');
    
    if (!area) return;
    
    const areaMap = { 'H': 'header', 'C': 'content', 'F': 'footer' };
    const areaName = areaMap[area.toUpperCase()] || 'content';
    
    const blockId = `block_${Date.now()}`;
    const blockConfig = {
      type: 'text',
      title: '',
      content: '',
      area: areaName
    };
    
    if (!this.config.blocks) {
      this.config.blocks = {};
    }
    
    this.config.blocks[blockId] = blockConfig;
    this._editingBlockId = blockId;
    this._notifyConfigUpdate();
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    delete this.config.blocks[blockId];
    this._notifyConfigUpdate();
  }

  _onBlockSaved(e) {
    if (this._editingBlockId) {
      this.config.blocks[this._editingBlockId] = e.detail.blockConfig;
      this._editingBlockId = null;
      this._notifyConfigUpdate();
    }
  }

  _onEditCancelled() {
    this._editingBlockId = null;
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { blocks: this.config.blocks } }
    }));
  }
}

if (!customElements.get('block-manager')) {
  customElements.define('block-manager', BlockManager);
}

export { BlockManager };