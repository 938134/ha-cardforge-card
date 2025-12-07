// blocks/block-management.js - 修复数据传递
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockBase } from './block-base.js';
import { BlockEditForm } from './block-edit-form.js';
import { AREAS } from './block-config.js';

export class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    cardDefinition: { type: Object },
    _editingBlockId: { state: true },
    _currentBlocks: { state: true }  // 新增：缓存块数据
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
        gap: 12px;
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
        padding: 8px 0;
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
        padding: 0 8px;
        border-right: 1px solid var(--cf-border);
        height: 100%;
        min-height: 60px;
      }
      
      .preset-block .area-indicator {
        color: var(--cf-text-tertiary);
      }
      
      .area-icon {
        font-size: 1.2em;
        margin-bottom: 2px;
      }
      
      .area-label {
        font-size: 0.75em;
        font-weight: 600;
        text-align: center;
        line-height: 1.1;
      }
      
      .preset-block .area-icon {
        opacity: 0.7;
      }
      
      /* 块视图容器 */
      .block-view-container {
        padding: 0 12px;
        min-height: 60px;
        display: flex;
        align-items: center;
      }
      
      /* 块操作 */
      .block-actions {
        display: flex;
        gap: 4px;
        padding: 0 12px;
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
        padding: 12px;
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: transparent;
        color: var(--cf-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.9em;
        font-weight: 500;
        margin-top: 12px;
        transition: all var(--cf-transition-fast);
      }
      
      .add-block-btn:hover:not(:disabled) {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .add-block-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 32px 20px;
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      /* 编辑表单容器 */
      .edit-form-container {
        margin-top: 12px;
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .block-item {
          grid-template-columns: 60px 1fr 70px;
          padding: 6px 0;
        }
        
        .area-indicator {
          padding: 0 6px;
        }
        
        .area-label {
          font-size: 0.7em;
        }
        
        .block-view-container {
          padding: 0 8px;
        }
        
        .block-actions {
          padding: 0 8px;
        }
      }
      
      @media (max-width: 480px) {
        .block-item {
          grid-template-columns: 50px 1fr 60px;
          padding: 4px 0;
        }
        
        .area-indicator {
          padding: 0 4px;
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
    this._editingBlockId = null;
    this._currentBlocks = [];  // 新增
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._currentBlocks = this._getAllBlocks();
    }
  }

  render() {
    if (this._currentBlocks.length === 0) {
      return this._renderEmptyState();
    }
    
    return html`
      <div class="block-management">
        <div class="block-list">
          ${this._currentBlocks.map(block => this._renderBlockItem(block))}
        </div>
        
        ${this._renderAddButton()}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const isEditing = this._editingBlockId === block.id;
    const isPresetBlock = block.presetKey;
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    
    // 区域处理：预设卡片固定为 content，其他使用配置的区域
    const area = isPresetCard ? 'content' : (block.area || 'content');
    
    // 权限判断
    const canDelete = blockType === 'custom' && !isPresetBlock;
    
    // 创建块配置的浅拷贝，确保是纯对象
    const blockConfig = {
      id: block.id,
      entity: block.entity || '',
      name: block.name || '',
      icon: block.icon || 'mdi:cube-outline',
      area: block.area || 'content',
      presetKey: block.presetKey
    };
    
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
          <!-- 关键修复：确保传递纯对象，而不是JSON字符串 -->
          <block-base
            .block=${blockConfig}
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
            .block=${blockConfig}
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

  _renderAddButton() {
    const blockType = this.cardDefinition?.blockType || 'none';
    const canAddNew = blockType === 'custom';
    
    if (!canAddNew) return '';
    
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
        添加新块
      </button>
    `;
  }

  _renderEmptyState() {
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    
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
        <div style="font-weight: 600; margin-bottom: 8px;">${message}</div>
        <div style="font-size: 0.9em; margin-bottom: 16px;">${description}</div>
        ${this._renderAddButton()}
      </div>
    `;
  }

  _getAllBlocks() {
    if (!this.config?.blocks) return [];
    
    const blocks = [];
    Object.entries(this.config.blocks).forEach(([id, config]) => {
      // 确保每个块都有正确的结构
      blocks.push({
        id,
        entity: config.entity || '',
        name: config.name || '',
        icon: config.icon || 'mdi:cube-outline',
        area: config.area || 'content',
        presetKey: config.presetKey
      });
    });
    
    return blocks;
  }

  _getAreaIcon(areaId) {
    const iconMap = {
      header: 'mdi:format-header-1',
      content: 'mdi:view-grid',
      footer: 'mdi:page-layout-footer'
    };
    return iconMap[areaId] || 'mdi:view-grid';
  }

  _getAreaLabel(areaId) {
    const labelMap = {
      header: '标题',
      content: '内容',
      footer: '页脚'
    };
    return labelMap[areaId] || '内容';
  }

  _handleFieldChange(blockId, { field, value, updates }) {
    const currentBlocks = this.config.blocks || {};
    const currentBlock = currentBlocks[blockId] || {};
    
    // 如果是预设卡片，强制区域为 content
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset' && field === 'area') {
      value = 'content';
    }
    
    // 应用主要字段更新
    let newBlock = { ...currentBlock, [field]: value };
    
    // 应用自动填充的更新（如果有）
    if (updates && typeof updates === 'object') {
      newBlock = { ...newBlock, ...updates };
    }
    
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
  }

  _startEdit(blockId) {
    this._editingBlockId = blockId;
  }

  _cancelEdit() {
    this._editingBlockId = null;
  }

  _finishEdit() {
    this._editingBlockId = null;
  }

  _addBlock() {
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType !== 'custom') {
      alert('此卡片不支持添加新块');
      return;
    }
    
    const blockId = `block_${Date.now()}`;
    
    // 简单的初始配置
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

  _fireConfigChange(updates) {
    const newConfig = { ...this.config, ...updates };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}