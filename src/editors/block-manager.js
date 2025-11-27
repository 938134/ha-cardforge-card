// src/editors/block-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';

class BlockManager extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { type: String }
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
        grid-template-columns: 80px 48px 1fr 40px 40px;
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
        justify-content: center;
        padding: 6px 8px;
        border-radius: var(--cf-radius-sm);
        font-size: 0.75em;
        font-weight: 600;
        color: white;
        text-align: center;
        line-height: 1.2;
        min-width: 60px;
      }

      .area-badge.header {
        background: #2196F3;
      }

      .area-badge.content {
        background: #4CAF50;
      }

      .area-badge.footer {
        background: #FF9800;
      }

      /* 列2 - 图标 */
      .block-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
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

      /* 列3 - 块信息 */
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

      .block-action.delete:hover {
        background: var(--cf-error-color);
      }

      /* 内联编辑容器 */
      .inline-editor-container {
        grid-column: 1 / -1;
        margin-top: var(--cf-spacing-sm);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.03);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
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
          grid-template-columns: 70px 40px 1fr 36px 36px;
          gap: var(--cf-spacing-xs);
          padding: var(--cf-spacing-xs);
          min-height: 54px;
        }

        .area-badge {
          font-size: 0.7em;
          padding: 4px 6px;
          min-width: 50px;
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
    const displayName = this._getBlockDisplayName(block);
    const icon = this._getBlockIcon(block);
    const state = BlockSystem.getBlockPreview(block, this.hass);
    const areaText = this._getAreaText(block.area);

    return html`
      <div class="block-row" @click=${() => this._editBlock(block.id)}>
        <!-- 列1: 区域标识 -->
        <div class="area-badge ${block.area || 'content'}">
          ${areaText}
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

        <!-- 内联编辑区域 -->
        ${this._editingBlockId === block.id ? html`
          <div class="inline-editor-container">
            <block-editor
              .blockConfig=${block}
              .hass=${this.hass}
              .availableEntities=${this._getAvailableEntities()}
              @block-saved=${e => this._onBlockSaved(block.id, e.detail.blockConfig)}
              @edit-cancelled=${this._onEditCancelled}
            ></block-editor>
          </div>
        ` : ''}
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

  _getAreaText(area) {
    const areaMap = {
      'header': '标题区域',
      'content': '内容区域', 
      'footer': '页脚区域'
    };
    return areaMap[area] || areaMap.content;
  }

  _getBlockDisplayName(blockConfig) {
    if (blockConfig.entity && this.hass?.states[blockConfig.entity]) {
      const entity = this.hass.states[blockConfig.entity];
      return entity.attributes?.friendly_name || blockConfig.entity;
    }
    return blockConfig.title || '未命名块';
  }

  _getBlockIcon(blockConfig) {
    // 优先使用块配置的图标
    if (blockConfig.icon) {
      return blockConfig.icon;
    }
    
    // 其次使用实体图标
    if (blockConfig.entity && this.hass?.states[blockConfig.entity]) {
      const entity = this.hass.states[blockConfig.entity];
      if (entity.attributes?.icon) {
        return entity.attributes.icon;
      }
    }
    
    // 最后使用块类型默认图标
    return BlockSystem.getBlockIcon(blockConfig);
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
