// src/editors/block-management.js - 完整代码
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
      
      /* 块列表容器 */
      .block-list-container {
        margin-bottom: var(--cf-spacing-lg);
      }
      
      /* 区域标题 */
      .area-section {
        margin-bottom: 24px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
      }
      
      .area-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: 12px 16px;
        background: linear-gradient(135deg, rgba(var(--cf-rgb-primary, 3, 169, 244), 0.08) 0%, transparent 100%);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .area-title {
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .area-icon {
        font-size: 1.1em;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
      
      .area-count {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-left: 8px;
        font-weight: normal;
      }
      
      /* 块列表 */
      .block-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
      }
      
      /* 块项容器 */
      .block-item-container {
        position: relative;
        margin-bottom: 8px;
      }
      
      .block-item-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
        transition: all var(--cf-transition-fast);
      }
      
      .block-item-wrapper:hover {
        border-color: var(--cf-primary-color);
        box-shadow: 0 2px 8px rgba(var(--cf-rgb-primary, 3, 169, 244), 0.1);
      }
      
      /* 区域标识列 */
      .block-area-indicator {
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
        background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.03);
        transition: all var(--cf-transition-fast);
      }
      
      .block-area-indicator:hover {
        background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.08);
        cursor: pointer;
      }
      
      .block-area-indicator ha-icon {
        font-size: 1.4em;
      }
      
      .area-label {
        font-size: 0.75em;
        font-weight: 600;
        text-align: center;
        line-height: 1.1;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      /* 块内容区域 */
      .block-content-wrapper {
        flex: 1;
        min-width: 0;
        padding: 12px;
      }
      
      /* 块操作 */
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
        padding: 12px 16px;
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
        background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.05);
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
        background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.02);
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
        padding: 12px;
        background: var(--cf-surface);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
      }
      
      /* 区域颜色定义 */
      .area-header-indicator {
        background: rgba(33, 150, 243, 0.08);
      }
      
      .area-header-indicator ha-icon {
        color: #2196f3;
      }
      
      .area-header-indicator .area-label {
        color: #2196f3;
      }
      
      .area-content-indicator {
        background: rgba(76, 175, 80, 0.08);
      }
      
      .area-content-indicator ha-icon {
        color: #4caf50;
      }
      
      .area-content-indicator .area-label {
        color: #4caf50;
      }
      
      .area-footer-indicator {
        background: rgba(255, 152, 0, 0.08);
      }
      
      .area-footer-indicator ha-icon {
        color: #ff9800;
      }
      
      .area-footer-indicator .area-label {
        color: #ff9800;
      }
      
      /* 响应式 */
      @media (max-width: 768px) {
        .block-area-indicator {
          width: 80px;
          min-width: 80px;
          padding: 8px;
        }
        
        .area-label {
          font-size: 0.7em;
        }
        
        .block-content-wrapper {
          padding: 8px;
        }
        
        .block-actions {
          padding: 8px;
        }
        
        .block-action {
          width: 28px;
          height: 28px;
        }
      }
      
      @media (max-width: 480px) {
        .block-item-wrapper {
          flex-direction: column;
        }
        
        .block-area-indicator {
          width: 100%;
          min-width: 100%;
          height: auto;
          flex-direction: row;
          justify-content: flex-start;
          gap: 8px;
          padding: 8px 12px;
          border-right: none;
          border-bottom: 1px solid var(--cf-border);
        }
        
        .block-content-wrapper {
          width: 100%;
        }
        
        .block-actions {
          width: 100%;
          justify-content: flex-end;
          border-left: none;
          border-top: 1px solid var(--cf-border);
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
        if (areaBlocks.length === 0 && area.id !== 'content') return '';
        
        return html`
          <div class="area-section">
            <div class="area-header">
              <ha-icon icon="${this._getAreaIcon(area.id)}"></ha-icon>
              <div class="area-title">
                ${area.label || area.id}
                <span class="area-count">(${areaBlocks.length}${area.maxBlocks ? `/${area.maxBlocks}` : ''})</span>
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
    
    // 获取区域信息
    const area = block.area || 'content';
    const areaInfo = this._areas.find(a => a.id === area) || { id: area, label: '内容区域' };
    const areaIcon = this._getAreaIcon(area);
    const areaClass = `area-${area}-indicator`;
    
    // 准备传递给block-base的属性
    const blockData = {
      entity: block.entity || '',
      name: block.name || '',
      icon: block.icon || '',
      area: area,
      presetKey: block.presetKey || '',
      required: block.required || false
    };
    
    return html`
      <div class="block-item-container">
        <div class="block-item-wrapper">
          <!-- 区域标识列 -->
          <div class="block-area-indicator ${areaClass}" @click=${() => this._canEditBlock(block) && this._startEdit(block.id)}>
            <ha-icon icon="${areaIcon}"></ha-icon>
            <span class="area-label">${areaInfo.label}</span>
          </div>
          
          <!-- 块预览 -->
          <div class="block-content-wrapper">
            <block-base
              .block=${blockData}
              .hass=${this.hass}
              .compact=${true}
            ></block-base>
          </div>
          
          <!-- 操作按钮 -->
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
    if (changedProperties.has('hass') || changedProperties.has('config') || 
        changedProperties.has('cardDefinition') || changedProperties.has('permissionType')) {
      this._updateAreas();
      this._updatePresetBlocks();
      this._updateEmptyState();
    }
  }

  _updateAreas() {
    if (!this.cardDefinition?.layout?.areas) {
      // 仪表盘卡片有固定区域
      if (this.config?.card_type === 'dashboard') {
        this._areas = [
          { id: 'header', label: '标题区域', maxBlocks: 5 },
          { id: 'content', label: '内容区域', maxBlocks: 20 },
          { id: 'footer', label: '页脚区域', maxBlocks: 5 }
        ];
      } else {
        this._areas = [{ id: 'content', label: '内容区' }];
      }
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
      footer: 'mdi:page-layout-footer',
      sidebar: 'mdi:page-layout-sidebar-left'
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
