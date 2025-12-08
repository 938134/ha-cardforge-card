import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { designSystem } from '../core/design-system.js';
import './block-base.js';
import './block-edit-form.js';

/**
 * 块管理组件
 */
export class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    cardDefinition: { type: Object },
    _blocks: { state: true },
    _editingBlockId: { state: true },
    _nextBlockId: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-management {
        width: 100%;
      }

      .block-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .block-item {
        display: grid;
        grid-template-columns: 70px 1fr 80px;
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
        transition: all var(--cf-transition-fast);
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
      }

      .preset-block {
        background: rgba(0, 0, 0, 0.02);
      }

      /* 区域标识 */
      .area-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: var(--cf-spacing-sm);
        border-right: 1px solid var(--cf-border);
        height: 100%;
        min-height: 60px;
        background: rgba(var(--cf-primary-color-rgb), 0.05);
      }

      .preset-block .area-indicator {
        background: rgba(0, 0, 0, 0.03);
        color: var(--cf-text-tertiary);
      }

      .area-icon {
        font-size: 1.2em;
        margin-bottom: 2px;
      }

      .area-label {
        font-size: var(--cf-font-size-xs);
        font-weight: var(--cf-font-weight-semibold);
        text-align: center;
        line-height: 1.1;
      }

      /* 块视图容器 */
      .block-view-container {
        padding: 0 var(--cf-spacing-md);
        min-height: 60px;
        display: flex;
        align-items: center;
      }

      /* 块操作 */
      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        padding: 0 var(--cf-spacing-md);
        justify-content: flex-end;
      }

      .block-action {
        width: 32px;
        height: 32px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        color: var(--cf-text-secondary);
        transition: all var(--cf-transition-fast);
      }

      .block-action:hover:not(.disabled) {
        background: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
        color: white;
      }

      .block-action.disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        margin-top: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
      }

      .add-block-btn:hover:not(:disabled) {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-primary-color-rgb), 0.05);
      }

      .add-block-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-2xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }

      .empty-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      /* 编辑表单容器 */
      .edit-form-container {
        margin-top: var(--cf-spacing-sm);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
        animation: slideDown var(--cf-transition-fast);
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* 响应式设计 */
      @container (max-width: 768px) {
        .block-item {
          grid-template-columns: 60px 1fr 70px;
        }

        .area-indicator {
          padding: var(--cf-spacing-xs);
        }

        .area-label {
          font-size: 0.7em;
        }

        .block-view-container {
          padding: 0 var(--cf-spacing-sm);
        }

        .block-actions {
          padding: 0 var(--cf-spacing-sm);
        }
      }

      @container (max-width: 480px) {
        .block-item {
          grid-template-columns: 50px 1fr 60px;
        }

        .area-indicator {
          padding: var(--cf-spacing-xs);
        }

        .area-label {
          font-size: 0.65em;
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
    this.config = {};
    this.hass = null;
    this.cardDefinition = {};
    this._blocks = [];
    this._editingBlockId = null;
    this._nextBlockId = 1;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._updateBlocksList();
    }
  }

  /**
   * 更新块列表
   */
  _updateBlocksList() {
    const blocks = this.config?.blocks || {};
    const blockList = [];

    Object.entries(blocks).forEach(([id, blockConfig]) => {
      blockList.push({
        id,
        ...blockConfig
      });
    });

    // 按区域排序：header -> content -> footer
    blockList.sort((a, b) => {
      const order = { header: 1, content: 2, footer: 3 };
      return (order[a.area] || 2) - (order[b.area] || 2);
    });

    this._blocks = blockList;
  }

  /**
   * 获取区域图标
   */
  _getAreaIcon(areaId) {
    const iconMap = {
      header: 'mdi:format-header-1',
      content: 'mdi:view-grid',
      footer: 'mdi:page-layout-footer'
    };
    return iconMap[areaId] || 'mdi:view-grid';
  }

  /**
   * 获取区域标签
   */
  _getAreaLabel(areaId) {
    const labelMap = {
      header: '标题',
      content: '内容',
      footer: '页脚'
    };
    return labelMap[areaId] || '内容';
  }

  render() {
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    const canAddBlocks = blockType === 'custom';

    if (this._blocks.length === 0) {
      return this._renderEmptyState();
    }

    return html`
      <div class="block-management">
        <div class="block-list">
          ${this._blocks.map(block => this._renderBlockItem(block))}
        </div>

        ${canAddBlocks ? html`
          <button class="add-block-btn" @click=${this._addBlock}>
            <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
            添加新块
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染空状态
   */
  _renderEmptyState() {
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    const canAddBlocks = blockType === 'custom';

    const message = isPresetCard 
      ? '此卡片使用预设块结构'
      : '还没有添加任何块';
    
    const description = isPresetCard
      ? '请为每个预设块配置对应的实体'
      : '块可以显示实体的状态值';

    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <ha-icon icon="mdi:cube-outline"></ha-icon>
        </div>
        <div style="font-weight: var(--cf-font-weight-semibold); margin-bottom: var(--cf-spacing-sm);">
          ${message}
        </div>
        <div style="font-size: var(--cf-font-size-sm); margin-bottom: var(--cf-spacing-lg);">
          ${description}
        </div>
        
        ${canAddBlocks ? html`
          <button class="add-block-btn" @click=${this._addBlock}>
            <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
            添加第一个块
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染块项目
   */
  _renderBlockItem(block) {
    const isEditing = this._editingBlockId === block.id;
    const isPresetBlock = !!block.presetKey;
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    const area = isPresetCard ? 'content' : (block.area || 'content');
    const canDelete = blockType === 'custom' && !isPresetBlock;

    return html`
      <div class="block-item ${isPresetBlock ? 'preset-block' : ''}">
        <!-- 区域标识 -->
        <div class="area-indicator">
          <div class="area-icon">
            <ha-icon icon="${this._getAreaIcon(area)}"></ha-icon>
          </div>
          <div class="area-label">
            ${this._getAreaLabel(area)}
          </div>
        </div>

        <!-- 块视图 -->
        <div class="block-view-container">
          <block-base
            .block=${block}
            .hass=${this.hass}
            .compact=${true}
            .showName=${true}
            .showValue=${true}
          ></block-base>
        </div>

        <!-- 操作按钮 -->
        <div class="block-actions">
          <div class="block-action" @click=${() => this._startEdit(block.id)} title="编辑">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>

          ${canDelete ? html`
            <div class="block-action" @click=${(e) => this._deleteBlock(e, block.id)} title="删除">
              <ha-icon icon="mdi:delete"></ha-icon>
            </div>
          ` : html`
            <div class="block-action disabled" title="预设块不能删除">
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </div>
          `}
        </div>
      </div>

      ${isEditing ? html`
        <div class="edit-form-container">
          <block-edit-form
            .block=${block}
            .hass=${this.hass}
            .cardDefinition=${this.cardDefinition}
            @field-change=${(e) => this._handleFieldChange(block.id, e.detail)}
            @cancel=${this._cancelEdit}
            @save=${this._finishEdit}
          ></block-edit-form>
        </div>
      ` : ''}
    `;
  }

  /**
   * 开始编辑
   */
  _startEdit(blockId) {
    this._editingBlockId = blockId;
  }

  /**
   * 取消编辑
   */
  _cancelEdit() {
    this._editingBlockId = null;
  }

  /**
   * 完成编辑
   */
  _finishEdit() {
    this._editingBlockId = null;
  }

  /**
   * 处理字段变化
   */
  _handleFieldChange(blockId, { field, value, updates }) {
    const currentBlocks = { ...this.config.blocks };
    const currentBlock = currentBlocks[blockId] || {};

    // 如果是预设卡片，强制区域为 content
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset' && field === 'area') {
      value = 'content';
    }

    // 更新块配置
    let newBlock = { ...currentBlock, [field]: value };
    
    // 应用自动填充的更新
    if (updates && typeof updates === 'object') {
      newBlock = { ...newBlock, ...updates };
    }

    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    this._fireConfigChange({ blocks: newBlocks });
  }

  /**
   * 添加新块
   */
  _addBlock() {
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType !== 'custom') {
      alert('此卡片不支持添加新块');
      return;
    }

    const blockId = `block_${Date.now()}_${this._nextBlockId++}`;
    const newBlock = {
      entity: '',
      name: '新块',
      icon: 'mdi:cube-outline',
      area: 'content'
    };

    const currentBlocks = this.config.blocks || {};
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };

    this._fireConfigChange({ blocks: newBlocks });
    this._editingBlockId = blockId;
  }

  /**
   * 删除块
   */
  _deleteBlock(e, blockId) {
    e.stopPropagation();

    const blockType = this.cardDefinition?.blockType || 'none';
    const block = (this.config.blocks || {})[blockId];

    // 检查权限
    if (blockType !== 'custom' || block?.presetKey) {
      alert('此块不能删除');
      return;
    }

    if (!confirm('确定要删除这个块吗？')) return;

    const currentBlocks = { ...this.config.blocks };
    delete currentBlocks[blockId];

    this._fireConfigChange({ blocks: currentBlocks });

    if (this._editingBlockId === blockId) {
      this._editingBlockId = null;
    }
  }

  /**
   * 触发配置变化事件
   */
  _fireConfigChange(updates) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this.config, ...updates } }
    }));
  }
}

// 注册自定义元素
if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}
