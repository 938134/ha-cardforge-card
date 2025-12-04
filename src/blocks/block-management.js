// 块管理界面 - 基于blockType控制权限
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
    _editingBlockId: { state: true }
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
        display: flex;
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
        transition: all var(--cf-transition-fast);
      }
      
      .block-item:hover {
        border-color: var(--cf-primary-color);
      }
      
      .preset-block {
        background: rgba(var(--cf-rgb-primary), 0.03);
      }
      
      .area-indicator {
        width: 100px;
        min-width: 100px;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 12px;
        border-right: 1px solid var(--cf-border);
        transition: all var(--cf-transition-fast);
      }
      
      .preset-block .area-indicator {
        background: rgba(0, 0, 0, 0.03);
        border-left-color: #cccccc;
      }
      
      .preset-block .area-indicator ha-icon {
        color: #999999;
      }
      
      .area-label {
        font-size: 0.75em;
        font-weight: 600;
        text-align: center;
        line-height: 1.1;
      }
      
      .block-content {
        flex: 1;
        min-width: 0;
        padding: 12px;
      }
      
      .block-actions {
        display: flex;
        gap: 4px;
        padding: 12px;
        border-left: 1px solid var(--cf-border);
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
      
      .preset-notice {
        background: rgba(33, 150, 243, 0.1);
        border-left: 3px solid #2196f3;
        padding: 8px 12px;
        border-radius: 4px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9em;
      }
    `
  ];

  constructor() {
    super();
    this.config = {};
    this.hass = null;
    this.cardDefinition = {};
    this._editingBlockId = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    
    if (blocks.length === 0) {
      return this._renderEmptyState();
    }
    
    return html`
      <div class="block-management">
        ${isPresetCard ? html`
          <div class="preset-notice">
            <ha-icon icon="mdi:information-outline"></ha-icon>
            <span>此卡片使用预设块结构，只能配置实体，不能删除或更改区域</span>
          </div>
        ` : ''}
        
        <div class="block-list">
          ${blocks.map(block => this._renderBlockItem(block))}
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
    
    // 区域处理：预设卡片强制使用 content 区域
    const area = isPresetCard ? 'content' : (block.area || 'content');
    const areaInfo = AREAS[area] || AREAS.content;
    
    // 权限判断
    const canDelete = blockType === 'custom' && !isPresetBlock;
    const canEdit = true; // 始终可以编辑
    
    return html`
      <div class="block-item ${isPresetBlock ? 'preset-block' : ''}">
        <!-- 区域标识 -->
        <div class="area-indicator" style="border-left-color: ${this._getAreaColor(area)}">
          <ha-icon icon="${this._getAreaIcon(area)}"></ha-icon>
          <span class="area-label">
            ${isPresetCard ? '内容区域（固定）' : areaInfo.label}
          </span>
        </div>
        
        <!-- 块预览 -->
        <div class="block-content">
          <block-base
            .block=${block}
            .hass=${this.hass}
            .compact=${true}
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
        <div style="margin-top: 12px;">
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
    return Object.entries(this.config.blocks).map(([id, config]) => ({
      id,
      ...config
    }));
  }

  _getAreaColor(areaId) {
    const colorMap = {
      header: '#2196f3',
      content: '#4caf50',
      footer: '#ff9800'
    };
    return colorMap[areaId] || '#9e9e9e';
  }

  _getAreaIcon(areaId) {
    const iconMap = {
      header: 'mdi:format-header-1',
      content: 'mdi:view-grid',
      footer: 'mdi:page-layout-footer'
    };
    return iconMap[areaId] || 'mdi:view-grid';
  }

  _handleFieldChange(blockId, { field, value }) {
    const currentBlocks = this.config.blocks || {};
    const currentBlock = currentBlocks[blockId] || {};
    
    // 如果是预设卡片，强制区域为 content
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset' && field === 'area') {
      value = 'content';
    }
    
    const newBlock = { ...currentBlock, [field]: value };
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
