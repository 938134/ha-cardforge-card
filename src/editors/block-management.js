// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import '../core/block-base.js';
import './block-edit-form.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    permissionType: { type: String },
    cardDefinition: { type: Object },
    _editingBlockId: { state: true },
    _showEmptyState: { state: true },
    _areas: { state: true },
    _presetBlocks: { state: true },
    _blocksByArea: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-management {
        width: 100%;
      }
      
      /* 区域标签 */
      .area-section {
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .area-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
        padding-bottom: var(--cf-spacing-xs);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .area-title {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .area-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
      
      /* 块列表 */
      .block-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      /* 块项容器 */
      .block-item-container {
        position: relative;
      }
      
      .block-item-wrapper {
        position: relative;
        width: 100%;
      }
      
      /* 块操作 */
      .block-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
        z-index: 10;
        background: rgba(var(--cf-background, 255, 255, 255), 0.9);
        padding: 4px;
        border-radius: var(--cf-radius-sm);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .block-item-container:hover .block-actions {
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
        color: var(--cf-text-secondary);
        transition: all var(--cf-transition-fast);
        font-size: 0.85em;
      }
      
      .block-action:hover:not(.disabled) {
        background: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
        color: white;
      }
      
      .block-action.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
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
        background: rgba(var(--cf-rgb-primary), 0.02);
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .empty-title {
        font-size: 1em;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .empty-description {
        font-size: 0.85em;
        line-height: 1.4;
        margin-bottom: 16px;
      }
      
      /* 编辑表单容器 */
      .edit-form-container {
        margin-top: 12px;
      }
      
      /* 块预览 */
      .block-preview {
        pointer-events: none;
      }
      
      /* 响应式 */
      @media (max-width: 480px) {
        .block-actions {
          position: relative;
          top: 0;
          right: 0;
          opacity: 1;
          margin-top: 8px;
          justify-content: flex-end;
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        
        .block-action {
          width: 32px;
          height: 32px;
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = {};
    this.hass = null;
    this.permissionType = 'custom';
    this.cardDefinition = {};
    this._editingBlockId = null;
    this._showEmptyState = true;
    this._areas = [];
    this._presetBlocks = {};
    this._blocksByArea = {};
  }

  render() {
    const blocks = this._getAllBlocks();
    
    if (blocks.length === 0 && this.permissionType !== 'preset') {
      return this._renderEmptyState();
    }
    
    this._updateBlocksByArea(blocks);
    const hasMultipleAreas = this._areas.length > 1;
    
    return html`
      <div class="block-management">
        ${hasMultipleAreas ? this._renderAreas() : this._renderSingleArea(blocks)}
        ${this._shouldShowAddButton() ? this._renderAddButton() : ''}
      </div>
    `;
  }

  _renderAreas() {
    return html`
      ${this._areas.map(area => {
        const areaBlocks = this._blocksByArea[area.id] || [];
        return html`
          <div class="area-section">
            <div class="area-header">
              <ha-icon icon="${this._getAreaIcon(area.id)}"></ha-icon>
              <div>
                <div class="area-title">${area.label || area.id}</div>
                ${area.maxBlocks ? html`
                  <div class="area-description">
                    ${areaBlocks.length} / ${area.maxBlocks} 个块
                  </div>
                ` : ''}
              </div>
            </div>
            <div class="block-list">
              ${areaBlocks.map(block => this._renderBlockItem(block))}
            </div>
          </div>
        `;
      })}
    `;
  }

  _renderSingleArea(blocks) {
    return html`
      <div class="block-list">
        ${blocks.map(block => this._renderBlockItem(block))}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const isEditing = this._editingBlockId === block.id;
    const isPreset = block.presetKey || this.permissionType === 'preset';
    const presetDef = isPreset ? this._presetBlocks[block.presetKey] : null;
    
    // 准备传递给block-base的属性
    const blockData = {
      entity: block.entity || '',
      name: block.name || '',
      icon: block.icon || '',
      area: block.area || 'content',
      presetKey: block.presetKey || '',
      required: block.required || false
    };
    
    return html`
      <div class="block-item-container">
        <div class="block-item-wrapper">
          <block-base
            .block=${blockData}
            .hass=${this.hass}
            .compact=${true}
            class="block-preview"
          ></block-base>
          
          <div class="block-actions">
            <div 
              class="block-action ${this._canEditBlock(block) ? '' : 'disabled'}"
              @click=${() => this._canEditBlock(block) && this._startEdit(block.id)}
              title="${this._canEditBlock(block) ? '编辑' : '此块不可编辑'}"
            >
              <ha-icon icon="mdi:pencil"></ha-icon>
            </div>
            <div 
              class="block-action ${this._canDeleteBlock(block) ? '' : 'disabled'}"
              @click=${(e) => this._canDeleteBlock(block) && this._deleteBlock(e, block.id)}
              title="${this._canDeleteBlock(block) ? '删除' : '此块不可删除'}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </div>
          </div>
        </div>
        
        ${isEditing ? html`
          <div class="edit-form-container">
            <block-edit-form
              .block=${block}
              .hass=${this.hass}
              .areas=${this._areas}
              .presetDef=${presetDef}
              @field-change=${(e) => this._handleFieldChange(block.id, e.detail)}
              @cancel=${this._cancelEdit}
              @save=${this._finishEdit}
            ></block-edit-form>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderAddButton() {
    const canAdd = this.permissionType === 'custom';
    const isDisabled = !canAdd || this._isAreaFull();
    const disableReason = this._getDisableReason();
    
    return html`
      <button 
        class="add-block-btn" 
        @click=${this._addBlock}
        ?disabled=${isDisabled}
        title="${disableReason || (canAdd ? '添加新块' : '此卡片不支持添加块')}"
      >
        <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
        添加新块
        ${disableReason ? html`<span style="font-size:0.8em;margin-left:8px;">(${disableReason})</span>` : ''}
      </button>
    `;
  }

  _renderEmptyState() {
    const message = this.permissionType === 'preset' 
      ? '此卡片使用预设块结构'
      : '还没有添加任何块';
    
    const description = this.permissionType === 'preset'
      ? '请为每个预设块配置对应的实体'
      : '块可以显示实体的状态值';
    
    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <ha-icon icon="mdi:cube-outline"></ha-icon>
        </div>
        <div class="empty-title">${message}</div>
        <div class="empty-description">
          ${description}
        </div>
        ${this._shouldShowAddButton() ? html`
          <button class="add-block-btn" @click=${this._addBlock}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加第一个块
          </button>
        ` : ''}
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

  _updateBlocksByArea(blocks) {
    this._blocksByArea = {};
    this._areas.forEach(area => {
      this._blocksByArea[area.id] = blocks.filter(block => 
        (block.area || 'content') === area.id
      );
    });
  }

  _canEditBlock(block) {
    if (this.permissionType === 'none') return false;
    const presetDef = block.presetKey ? this._presetBlocks[block.presetKey] : null;
    return !presetDef?.fixed;
  }

  _canDeleteBlock(block) {
    if (this.permissionType !== 'custom') return false;
    const presetDef = block.presetKey ? this._presetBlocks[block.presetKey] : null;
    return !presetDef?.required;
  }

  _shouldShowAddButton() {
    return this.permissionType === 'custom';
  }

  _isAreaFull() {
    if (this._areas.length === 0) return false;
    
    const defaultArea = this._areas[0].id;
    const areaDef = this._areas.find(a => a.id === defaultArea);
    if (!areaDef?.maxBlocks) return false;
    
    const blocksInArea = (this._blocksByArea[defaultArea] || []).length;
    return blocksInArea >= areaDef.maxBlocks;
  }

  _getDisableReason() {
    if (this.permissionType !== 'custom') return '此卡片不支持添加块';
    if (this._isAreaFull()) {
      const defaultArea = this._areas[0].id;
      const areaDef = this._areas.find(a => a.id === defaultArea);
      return `${areaDef?.label || defaultArea}已满（最多 ${areaDef.maxBlocks} 个块）`;
    }
    return '';
  }

  updated(changedProperties) {
    if (changedProperties.has('cardDefinition')) {
      // 使用卡片定义的区域，如果没有则使用默认
      if (this.cardDefinition?.layout?.areas) {
        this._areas = this.cardDefinition.layout.areas;
      } else {
        this._areas = [
          { id: 'header', label: '标题区域', maxBlocks: 5 },
          { id: 'content', label: '内容区域', maxBlocks: 20 },
          { id: 'footer', label: '页脚区域', maxBlocks: 5 }
        ];
      }
    }
  }

  _updateAreas() {
    if (!this.cardDefinition?.layout?.areas) {
      this._areas = [{ id: 'content', label: '内容区' }];
      return;
    }
    
    this._areas = this.cardDefinition.layout.areas;
  }

  _updatePresetBlocks() {
    if (!this.cardDefinition?.presetBlocks) {
      this._presetBlocks = {};
      return;
    }
    
    this._presetBlocks = this.cardDefinition.presetBlocks;
  }

  _updateEmptyState() {
    const blocks = this._getAllBlocks();
    this._showEmptyState = blocks.length === 0 && this.permissionType !== 'preset';
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
    this._updateBlock(blockId, { [field]: value });
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

  _updateBlock(blockId, updates) {
    const currentBlocks = this.config.blocks || {};
    const currentBlock = currentBlocks[blockId] || {};
    
    // 如果实体改变，自动填充名称和图标（如果未设置且不是预设块）
    if (updates.entity && updates.entity !== currentBlock.entity) {
      const entity = this.hass?.states?.[updates.entity];
      if (entity && !currentBlock.presetKey) {
        if (!currentBlock.name && !updates.name) {
          updates.name = entity.attributes?.friendly_name || updates.entity;
        }
        if (!currentBlock.icon && !updates.icon) {
          const domain = updates.entity.split('.')[0];
          const iconMap = {
            light: 'mdi:lightbulb',
            switch: 'mdi:power',
            sensor: 'mdi:gauge',
            binary_sensor: 'mdi:toggle-switch',
            climate: 'mdi:thermostat',
            cover: 'mdi:blinds',
            media_player: 'mdi:speaker',
            vacuum: 'mdi:robot-vacuum',
            text_sensor: 'mdi:text-box',
            person: 'mdi:account'
          };
          const suggestedIcon = entity.attributes?.icon || iconMap[domain] || 'mdi:cube';
          updates.icon = suggestedIcon;
        }
      }
    }
    
    const newBlock = { ...currentBlock, ...updates };
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
  }

  _addBlock() {
    if (this.permissionType !== 'custom' || this._isAreaFull()) return;
    
    const blockId = `block_${Date.now()}`;
    const defaultArea = this._areas[0]?.id || 'content';
    
    const newBlock = {
      entity: '',
      name: '新块',
      icon: 'mdi:cube-outline',
      area: defaultArea
    };
    
    const currentBlocks = this.config.blocks || {};
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
    this._editingBlockId = blockId;
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    const block = (this.config.blocks || {})[blockId];
    if (block?.presetKey) {
      const presetDef = this._presetBlocks[block.presetKey];
      if (presetDef?.required) {
        alert('此预设块是必需的，不能删除');
        return;
      }
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
      bubbles: true,
      composed: true,
      detail: { config: newConfig }
    }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}

export { BlockManagement };
