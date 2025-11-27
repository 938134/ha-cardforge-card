// src/editors/block-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';

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
        grid-template-columns: 60px 48px 1fr 40px 40px;
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
        align-items: center;
        gap: var(--cf-spacing-xs);
        font-size: 0.8em;
        font-weight: 600;
      }

      .area-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .area-dot.header {
        background: #2196F3;
      }

      .area-dot.content {
        background: #4CAF50;
      }

      .area-dot.footer {
        background: #FF9800;
      }

      .area-text {
        color: var(--cf-text-primary);
        line-height: 1;
        white-space: nowrap;
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
        gap: 2px;
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

      /* 列4 & 5 - 操作按钮 */
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

      /* 内联编辑面板 */
      .inline-editor {
        grid-column: 1 / -1;
        background: rgba(var(--cf-rgb-primary), 0.03);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-sm);
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .editor-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-md);
      }

      .editor-btn {
        padding: var(--cf-spacing-sm) var(--cf-spacing-lg);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
        min-width: 80px;
      }

      .editor-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .editor-btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
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
          grid-template-columns: 50px 36px 1fr 32px 32px;
          gap: var(--cf-spacing-xs);
          padding: var(--cf-spacing-xs);
          min-height: 54px;
        }

        .area-badge {
          font-size: 0.7em;
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

        .editor-btn {
          min-width: 70px;
          padding: var(--cf-spacing-xs) var(--cf-spacing-md);
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
    const displayName = BlockSystem.getBlockDisplayName(block);
    const icon = BlockSystem.getBlockIcon(block);
    const state = BlockSystem.getBlockPreview(block, this.hass);
    const areaInfo = this._getAreaInfo(block.area);
    const isEditing = this._editingBlockId === block.id;

    return html`
      <div class="block-row" @click=${() => this._editBlock(block.id)}>
        <!-- 列1: 区域标识 -->
        <div class="area-badge">
          <div class="area-dot ${block.area || 'content'}"></div>
          <span class="area-text">${areaInfo.text}</span>
        </div>

        <!-- 列2: 图标 -->
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>

        <!-- 列3: 名称与状态 -->
        <div class="block-info">
          <div class="block-name">${block.title || displayName}</div>
          <div class="block-state">${state}</div>
        </div>

        <!-- 列4: 编辑按钮 -->
        <div class="block-actions">
          <div class="block-action edit" @click=${e => this._editBlock(e, block.id)} title="编辑块">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
        </div>

        <!-- 列5: 删除按钮 -->
        <div class="block-actions">
          <div class="block-action delete" @click=${e => this._deleteBlock(e, block.id)} title="删除块">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>

        <!-- 内联编辑面板 -->
        ${isEditing ? this._renderInlineEditor(block) : ''}
      </div>
    `;
  }

  _renderInlineEditor(block) {
    return html`
      <div class="inline-editor">
        <block-editor
          .blockConfig=${block}
          .hass=${this.hass}
          .availableEntities=${this._getAvailableEntities()}
          @block-saved=${e => this._onBlockSaved(block.id, e.detail.blockConfig)}
          @edit-cancelled=${this._onEditCancelled}
        ></block-editor>
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
      'header': { text: '标题', color: '#2196F3' },
      'content': { text: '内容', color: '#4CAF50' },
      'footer': { text: '页脚', color: '#FF9800' }
    };
    return areaMap[area] || areaMap.content;
  }

  _getAvailableEntities() {
    if (!this.hass?.states) return [];
    
    return Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _editBlock(e, blockId) {
    if (e) e.stopPropagation();
    
    if (this._editingBlockId === blockId) {
      this._editingBlockId = null;
    } else {
      this._editingBlockId = blockId;
    }
  }

  _addBlock() {
    const area = prompt('请选择要添加到的区域：\n\n输入: header(标题) / content(内容) / footer(页脚)', 'content');
    
    if (!area || !['header', 'content', 'footer'].includes(area)) {
      return;
    }
    
    const blockId = `block_${Date.now()}`;
    const blockConfig = {
      type: 'text',
      title: '',
      content: '',
      area: area
    };
    
    if (!this.config.blocks) {
      this.config.blocks = {};
    }
    
    this.config.blocks[blockId] = blockConfig;
    this._editingBlockId = blockId;
    this._notifyConfigUpdate();
  }

  _onBlockSaved(blockId, updatedConfig) {
    this.config.blocks[blockId] = updatedConfig;
    this._editingBlockId = null;
    this._notifyConfigUpdate();
  }

  _onEditCancelled() {
    this._editingBlockId = null;
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    delete this.config.blocks[blockId];
    this._editingBlockId = null;
    this._notifyConfigUpdate();
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