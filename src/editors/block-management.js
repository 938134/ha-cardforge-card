// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    permissionType: { type: String }, // 'custom', 'preset', 'none'
    cardDefinition: { type: Object },
    _editingBlockId: { state: true },
    _availableEntities: { state: true },
    _showEmptyState: { state: true },
    _areas: { state: true }
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
      
      /* 块项 */
      .block-item {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        gap: 12px;
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: 12px;
        min-height: 60px;
        transition: all var(--cf-transition-fast);
      }
      
      .block-item:hover {
        border-color: var(--cf-primary-color);
        background: var(--cf-surface);
      }
      
      .block-item.editing {
        border-color: var(--cf-primary-color);
        background: var(--cf-surface);
      }
      
      .block-item.preset-block {
        border-left: 3px solid var(--cf-primary-color);
      }
      
      .preset-badge {
        background: rgba(var(--cf-rgb-primary), 0.1);
        color: var(--cf-primary-color);
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-left: 8px;
      }
      
      /* 块图标 */
      .block-icon-preview {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        flex-shrink: 0;
      }
      
      /* 块信息 */
      .block-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }
      
      .block-name {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
        display: flex;
        align-items: center;
      }
      
      .block-details {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.2;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .block-entity {
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        font-size: 0.75em;
      }
      
      .block-area {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: var(--cf-surface);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
      }
      
      /* 块操作 */
      .block-actions {
        display: flex;
        gap: 4px;
        align-items: center;
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
        color: var(--cf-text-secondary);
        transition: all var(--cf-transition-fast);
        font-size: 0.9em;
      }
      
      .block-action:hover {
        background: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
        color: white;
      }
      
      .block-action:disabled,
      .block-action.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
      
      /* 编辑表单 */
      .edit-form {
        grid-column: 1 / -1;
        background: var(--cf-surface);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: 16px;
        margin-top: 12px;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .form-label {
        font-weight: 500;
        font-size: 0.85em;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .required-mark {
        color: var(--cf-error-color);
        margin-left: 2px;
      }
      
      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--cf-border);
      }
      
      .action-btn {
        padding: 8px 16px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        min-width: 70px;
        transition: all var(--cf-transition-fast);
      }
      
      .action-btn:hover {
        background: var(--cf-background);
      }
      
      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }
      
      .action-btn.primary:hover {
        background: var(--cf-primary-color);
        opacity: 0.9;
      }
      
      .action-btn:disabled {
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
      
      /* 响应式 */
      @media (max-width: 480px) {
        .block-item {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        
        .block-icon-preview {
          width: 32px;
          height: 32px;
        }
        
        .block-actions {
          grid-column: 1 / -1;
          justify-content: flex-end;
        }
      }
      
      ha-combo-box, ha-select, ha-textfield, ha-icon-picker {
        width: 100%;
      }
    `
  ];

  constructor() {
    super();
    this._editingBlockId = null;
    this._availableEntities = [];
    this._showEmptyState = true;
    this._areas = [];
    this.permissionType = 'custom';
  }

  render() {
    const blocks = this._getAllBlocks();
    
    if (blocks.length === 0 && this.permissionType !== 'preset') {
      return this._renderEmptyState();
    }
    
    const blocksByArea = this._groupBlocksByArea(blocks);
    const hasMultipleAreas = this._areas.length > 1;
    
    return html`
      <div class="block-management">
        ${hasMultipleAreas ? html`
          ${this._areas.map(area => html`
            <div class="area-section">
              <div class="area-header">
                <ha-icon icon="${this._getAreaIcon(area)}"></ha-icon>
                <span class="area-title">${this._getAreaLabel(area)}</span>
              </div>
              <div class="block-list">
                ${blocksByArea[area]?.map(block => this._renderBlockItem(block)) || ''}
              </div>
            </div>
          `)}
        ` : html`
          <div class="block-list">
            ${blocks.map(block => this._renderBlockItem(block))}
          </div>
        `}
        
        ${this._shouldShowAddButton() ? this._renderAddButton() : ''}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const isEditing = this._editingBlockId === block.id;
    const isPreset = block.presetKey || this.permissionType === 'preset';
    const entityInfo = this._getEntityInfo(block.entity);
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''} ${isPreset ? 'preset-block' : ''}">
        <div class="block-icon-preview">
          <ha-icon .icon=${block.icon || this._getDefaultIcon(block)}></ha-icon>
        </div>
        
        <div class="block-info">
          <div class="block-name">
            ${this._getBlockName(block)}
            ${isPreset ? html`<span class="preset-badge">预设</span>` : ''}
          </div>
          <div class="block-details">
            ${block.entity ? html`
              <span class="block-entity" title="${block.entity}">
                ${this._truncateText(block.entity, 20)}
              </span>
            ` : ''}
            ${this._areas.length > 1 && block.area ? html`
              <span class="block-area">${this._getAreaLabel(block.area)}</span>
            ` : ''}
            <span title="${this._getBlockValue(block)}">
              ${this._truncateText(this._getBlockValue(block), 30)}
            </span>
          </div>
        </div>
        
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
        
        ${isEditing ? this._renderEditForm(block, entityInfo) : ''}
      </div>
    `;
  }

  _renderEditForm(block, entityInfo) {
    const isPreset = block.presetKey || this.permissionType === 'preset';
    const presetDef = isPreset ? this._getPresetDefinition(block.presetKey) : null;
    
    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            <div class="form-label">
              实体
              ${presetDef?.required ? html`<span class="required-mark">*</span>` : ''}
            </div>
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${block.entity || ''}
                @value-changed=${e => this._updateBlock(block.id, { entity: e.detail.value })}
                allow-custom-value
                label="选择实体或输入ID"
                fullwidth
                ?disabled=${presetDef?.entityType === 'fixed'}
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${block.entity || ''}
                @input=${e => this._updateBlock(block.id, { entity: e.target.value })}
                label="实体ID"
                placeholder="例如: sensor.poetry_title"
                fullwidth
                ?disabled=${presetDef?.entityType === 'fixed'}
              ></ha-textfield>
            `}
            ${entityInfo ? html`
              <div style="font-size: 0.8em; color: var(--cf-text-secondary); margin-top: 4px;">
                当前状态: ${entityInfo.state} ${entityInfo.unit ? entityInfo.unit : ''}
              </div>
            ` : ''}
            ${presetDef?.entityType === 'fixed' ? html`
              <div style="font-size: 0.8em; color: var(--cf-text-secondary); margin-top: 4px;">
                此预设块需要固定类型的实体
              </div>
            ` : ''}
          </div>
          
          <!-- 显示名称 -->
          <div class="form-field">
            <div class="form-label">显示名称</div>
            <ha-textfield
              .value=${block.name || ''}
              @input=${e => this._updateBlock(block.id, { name: e.target.value })}
              label="块显示名称"
              placeholder="如果不填，将使用实体友好名称"
              fullwidth
              ?disabled=${presetDef?.fixedName}
            ></ha-textfield>
          </div>
          
          <!-- 图标 -->
          <div class="form-field">
            <div class="form-label">图标</div>
            <ha-icon-picker
              .value=${block.icon || ''}
              @value-changed=${e => this._updateBlock(block.id, { icon: e.detail.value })}
              label="自定义图标"
              fullwidth
            ></ha-icon-picker>
          </div>
          
          <!-- 区域选择 (仅custom权限且支持多区域) -->
          ${this.permissionType === 'custom' && this._areas.length > 1 ? html`
            <div class="form-field">
              <div class="form-label">区域</div>
              <ha-select
                .value=${block.area || 'content'}
                @change=${e => this._updateBlock(block.id, { area: e.target.value })}
                label="选择区域"
                fullwidth
              >
                ${this._areas.map(area => html`
                  <ha-list-item .value=${area}>
                    <ha-icon icon="${this._getAreaIcon(area)}" slot="itemIcon"></ha-icon>
                    ${this._getAreaLabel(area)}
                  </ha-list-item>
                `)}
              </ha-select>
            </div>
          ` : ''}
        </div>
        
        <div class="form-actions">
          <button class="action-btn" @click=${this._cancelEdit}>取消</button>
          <button class="action-btn primary" @click=${this._finishEdit}>保存</button>
        </div>
      </div>
    `;
  }

  _renderAddButton() {
    const canAdd = this.permissionType === 'custom';
    
    return html`
      <button 
        class="add-block-btn" 
        @click=${this._addBlock}
        ?disabled=${!canAdd}
        title="${canAdd ? '添加新块' : '此卡片不支持添加块'}"
      >
        <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
        添加新块
      </button>
    `;
  }

  _renderEmptyState() {
    const message = this.permissionType === 'preset' 
      ? '此卡片使用预设块结构，请配置对应的实体'
      : '还没有添加任何块';
    
    const description = this.permissionType === 'preset'
      ? '块结构已预设，您需要为每个块关联对应的实体'
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

  _groupBlocksByArea(blocks) {
    const groups = {};
    this._areas.forEach(area => {
      groups[area] = blocks.filter(block => block.area === area);
    });
    return groups;
  }

  _getBlockName(block) {
    if (block.name) return block.name;
    
    if (block.entity && this.hass?.states?.[block.entity]) {
      const entity = this.hass.states[block.entity];
      return entity.attributes?.friendly_name || block.entity;
    }
    
    if (block.presetKey && this.cardDefinition?.presetBlocks?.[block.presetKey]?.defaultName) {
      return this.cardDefinition.presetBlocks[block.presetKey].defaultName;
    }
    
    return block.entity ? '实体块' : '自定义块';
  }

  _getBlockValue(block) {
    if (block.entity && this.hass?.states?.[block.entity]) {
      const entity = this.hass.states[block.entity];
      const state = entity.state;
      const unit = entity.attributes?.unit_of_measurement || '';
      return unit ? `${state} ${unit}` : state;
    }
    
    return '未配置实体';
  }

  _getDefaultIcon(block) {
    if (block.icon) return block.icon;
    
    if (block.presetKey && this.cardDefinition?.presetBlocks?.[block.presetKey]?.defaultIcon) {
      return this.cardDefinition.presetBlocks[block.presetKey].defaultIcon;
    }
    
    if (!block.entity) return 'mdi:cube-outline';
    
    const domain = block.entity.split('.')[0];
    const iconMap = {
      light: 'mdi:lightbulb',
      switch: 'mdi:power',
      sensor: 'mdi:gauge',
      binary_sensor: 'mdi:toggle-switch',
      climate: 'mdi:thermostat',
      cover: 'mdi:blinds',
      media_player: 'mdi:speaker',
      vacuum: 'mdi:robot-vacuum',
      text_sensor: 'mdi:text-box'
    };
    return iconMap[domain] || 'mdi:cube';
  }

  _getEntityInfo(entityId) {
    if (!entityId || !this.hass?.states?.[entityId]) return null;
    
    const entity = this.hass.states[entityId];
    return {
      state: entity.state,
      unit: entity.attributes?.unit_of_measurement || '',
      friendly_name: entity.attributes?.friendly_name || entityId
    };
  }

  _getPresetDefinition(presetKey) {
    return this.cardDefinition?.presetBlocks?.[presetKey] || null;
  }

  _canEditBlock(block) {
    if (this.permissionType === 'none') return false;
    
    const presetDef = block.presetKey ? this._getPresetDefinition(block.presetKey) : null;
    if (presetDef?.fixed) return false;
    
    return true;
  }

  _canDeleteBlock(block) {
    if (this.permissionType !== 'custom') return false;
    
    const presetDef = block.presetKey ? this._getPresetDefinition(block.presetKey) : null;
    if (presetDef?.required) return false;
    
    return true;
  }

  _shouldShowAddButton() {
    return this.permissionType === 'custom';
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('config') || 
        changedProperties.has('cardDefinition') || changedProperties.has('permissionType')) {
      this._updateAvailableEntities();
      this._updateAreas();
      this._updateEmptyState();
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }
    
    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _updateAreas() {
    if (!this.cardDefinition?.layout?.areas) {
      this._areas = ['content']; // 默认区域
      return;
    }
    
    this._areas = this.cardDefinition.layout.areas.map(area => area.id);
  }

  _updateEmptyState() {
    const blocks = this._getAllBlocks();
    this._showEmptyState = blocks.length === 0 && this.permissionType !== 'preset';
  }

  _getAreaLabel(areaId) {
    if (!this.cardDefinition?.layout?.areas) return areaId;
    
    const areaDef = this.cardDefinition.layout.areas.find(a => a.id === areaId);
    return areaDef?.label || areaId;
  }

  _getAreaIcon(areaId) {
    const iconMap = {
      header: 'mdi:format-header-1',
      content: 'mdi:view-grid',
      footer: 'mdi:page-layout-footer'
    };
    return iconMap[areaId] || 'mdi:view-grid';
  }

  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
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
    
    if (updates.entity && updates.entity !== currentBlock.entity) {
      const entity = this.hass?.states?.[updates.entity];
      if (entity) {
        if (!currentBlock.name && !updates.name && !currentBlock.presetKey) {
          updates.name = entity.attributes?.friendly_name || updates.entity;
        }
        if (!currentBlock.icon && !updates.icon && !currentBlock.presetKey) {
          updates.icon = entity.attributes?.icon || this._getDefaultIcon({ entity: updates.entity });
        }
      }
    }
    
    const newBlock = { ...currentBlock, ...updates };
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
  }

  _addBlock() {
    if (this.permissionType !== 'custom') return;
    
    const blockId = `block_${Date.now()}`;
    const newBlock = {
      entity: '',
      name: '新块',
      icon: 'mdi:cube-outline',
      area: this._areas[0] || 'content'
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
      const presetDef = this._getPresetDefinition(block.presetKey);
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
      detail: { config: newConfig }
    }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}

export { BlockManagement };
