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
        grid-template-columns: 80px 60px 1fr 40px 40px;
        gap: var(--cf-spacing-sm);
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm);
        transition: all var(--cf-transition-fast);
        min-height: 70px;
        cursor: pointer;
      }

      .block-row:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
        transform: translateY(-1px);
      }

      /* 列1 - 区域标识（双字+彩色圆点） */
      .area-badge {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.85em;
        font-weight: 600;
      }

      .area-dot {
        width: 16px;
        height: 16px;
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
      }

      /* 列2 - 图标 */
      .block-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4em;
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
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .block-state {
        font-size: 0.85em;
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
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .editor-form {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: var(--cf-spacing-md);
        align-items: end;
      }

      .form-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
      }

      .action-btn {
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
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

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-btn:hover {
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
      @media (max-width: 768px) {
        .block-row {
          grid-template-columns: 70px 50px 1fr 36px 36px;
          gap: var(--cf-spacing-xs);
          padding: var(--cf-spacing-xs);
          min-height: 60px;
        }

        .area-badge {
          font-size: 0.8em;
          gap: 6px;
        }

        .area-dot {
          width: 14px;
          height: 14px;
        }

        .block-icon {
          width: 42px;
          height: 42px;
          font-size: 1.2em;
        }

        .block-name {
          font-size: 0.9em;
        }

        .block-state {
          font-size: 0.8em;
        }

        .block-action {
          width: 28px;
          height: 28px;
        }

        .editor-form {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .form-actions {
          justify-content: flex-end;
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
    const icon = BlockSystem.getBlockIcon(block);
    const state = BlockSystem.getBlockPreview(block, this.hass);
    const areaInfo = this._getAreaInfo(block.area);
    const isEditing = this._editingBlockId === block.id;

    return html`
      <div class="block-row" @click=${() => this._editBlock(block.id)}>
        <!-- 列1: 区域标识（双字+彩色圆点） -->
        <div class="area-badge">
          <div class="area-dot ${block.area || 'content'}"></div>
          <div class="area-text">${areaInfo.text}</div>
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

        <!-- 列4: 编辑按钮 -->
        <div class="block-actions">
          <div class="block-action" @click=${e => this._editBlock(e, block.id)} title="编辑块">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
        </div>

        <!-- 列5: 删除按钮 -->
        <div class="block-actions">
          <div class="block-action delete" @click=${e => this._deleteBlock(e, block.id)} title="删除块">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>

        ${isEditing ? this._renderInlineEditor(block) : ''}
      </div>
    `;
  }

  _renderInlineEditor(block) {
    return html`
      <div class="inline-editor">
        <div class="editor-form">
          <div class="form-field">
            <div class="field-label">实体</div>
            <ha-combo-box
              .items=${this._getAvailableEntities()}
              .value=${block.entity || ''}
              @value-changed=${e => this._updateBlockConfig(block.id, 'entity', e.detail.value)}
              allow-custom-value
              label="选择实体"
              fullwidth
            ></ha-combo-box>
          </div>

          <div class="form-field">
            <div class="field-label">显示名称</div>
            <ha-textfield
              .value=${block.title || ''}
              @input=${e => this._updateBlockConfig(block.id, 'title', e.target.value)}
              placeholder="输入显示名称"
              fullwidth
            ></ha-textfield>
          </div>

          <div class="form-field">
            <div class="field-label">图标</div>
            <ha-icon-picker
              .value=${block.icon || ''}
              @value-changed=${e => this._updateBlockConfig(block.id, 'icon', e.detail.value)}
              label="选择图标"
              fullwidth
            ></ha-icon-picker>
          </div>

          <div class="form-actions">
            <button class="action-btn" @click=${this._cancelEdit}>取消</button>
            <button class="action-btn primary" @click=${this._saveEdit}>保存</button>
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

  _getBlockDisplayName(block) {
    if (block.title) return block.title;
    if (block.entity && this.hass?.states[block.entity]) {
      return this.hass.states[block.entity].attributes?.friendly_name || block.entity;
    }
    return block.id;
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
    this._editingBlockId = this._editingBlockId === blockId ? null : blockId;
  }

  _updateBlockConfig(blockId, key, value) {
    if (!this.config.blocks[blockId]) return;
    
    this.config.blocks[blockId] = {
      ...this.config.blocks[blockId],
      [key]: value
    };
    
    // 立即更新显示
    this.requestUpdate();
  }

  _saveEdit() {
    this._editingBlockId = null;
    this._notifyConfigUpdate();
  }

  _cancelEdit() {
    this._editingBlockId = null;
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
      content: '新块内容',
      area: area
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