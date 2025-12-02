// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { state: true },
    _availableEntities: { state: true },
    _showEmptyState: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-management {
        width: 100%;
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      
      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
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
      
      /* 下拉菜单样式优化 */
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
  }

  render() {
    const blocks = this._getAllBlocks();
    
    if (blocks.length === 0) {
      return this._renderEmptyState();
    }
    
    return html`
      <div class="block-management">
        <div class="block-list">
          ${blocks.map(block => this._renderBlockItem(block))}
        </div>
        ${this._renderAddButton()}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const isEditing = this._editingBlockId === block.id;
    const entityInfo = this._getEntityInfo(block.entity);
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}">
        <div class="block-icon-preview">
          <ha-icon .icon=${block.icon || this._getDefaultIcon(block)}></ha-icon>
        </div>
        
        <div class="block-info">
          <div class="block-name">${this._getBlockName(block)}</div>
          <div class="block-details">
            ${block.entity ? html`
              <span class="block-entity">${block.entity}</span>
            ` : ''}
            <span>${this._getBlockValue(block)}</span>
          </div>
        </div>
        
        <div class="block-actions">
          <div class="block-action" @click=${() => this._startEdit(block.id)} title="编辑">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action" @click=${(e) => this._deleteBlock(e, block.id)} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
        
        ${isEditing ? this._renderEditForm(block, entityInfo) : ''}
      </div>
    `;
  }

  _renderEditForm(block, entityInfo) {
    const currentEntity = block.entity || '';
    
    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            <div class="form-label">实体</div>
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${currentEntity}
                @value-changed=${e => this._updateBlock(block.id, { entity: e.detail.value })}
                allow-custom-value
                label="选择实体或输入ID"
                fullwidth
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${currentEntity}
                @input=${e => this._updateBlock(block.id, { entity: e.target.value })}
                label="实体ID"
                placeholder="例如: light.living_room"
                fullwidth
              ></ha-textfield>
            `}
            ${entityInfo ? html`
              <div style="font-size: 0.8em; color: var(--cf-text-secondary); margin-top: 4px;">
                当前状态: ${entityInfo.state} ${entityInfo.unit ? entityInfo.unit : ''}
              </div>
            ` : ''}
          </div>
          
          <!-- 自定义名称 -->
          <div class="form-field">
            <div class="form-label">显示名称</div>
            <ha-textfield
              .value=${block.name || ''}
              @input=${e => this._updateBlock(block.id, { name: e.target.value })}
              label="块显示名称"
              placeholder="如果不填，将使用实体友好名称"
              fullwidth
            ></ha-textfield>
          </div>
          
          <!-- 自定义图标 -->
          <div class="form-field">
            <div class="form-label">图标</div>
            <ha-icon-picker
              .value=${block.icon || ''}
              @value-changed=${e => this._updateBlock(block.id, { icon: e.detail.value })}
              label="自定义图标"
              fullwidth
            ></ha-icon-picker>
            <div style="font-size: 0.8em; color: var(--cf-text-secondary); margin-top: 4px;">
              如果不填，将使用实体图标或默认图标
            </div>
          </div>
          
          <!-- 自定义值（覆盖实体值） -->
          <div class="form-field">
            <div class="form-label">自定义值（可选）</div>
            <ha-textfield
              .value=${block.value || ''}
              @input=${e => this._updateBlock(block.id, { value: e.target.value })}
              label="覆盖实体状态值"
              placeholder="如果留空，将显示实体状态"
              fullwidth
            ></ha-textfield>
          </div>
        </div>
        
        <div class="form-actions">
          <button class="action-btn" @click=${this._cancelEdit}>取消</button>
          <button class="action-btn primary" @click=${this._finishEdit}>保存</button>
        </div>
      </div>
    `;
  }

  _renderAddButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
        添加新块
      </button>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <ha-icon icon="mdi:cube-outline"></ha-icon>
        </div>
        <div class="empty-title">还没有添加任何块</div>
        <div class="empty-description">
          块可以显示实体的状态值，也可以显示自定义内容
        </div>
        <button class="add-block-btn" @click=${this._addBlock}>
          <ha-icon icon="mdi:plus"></ha-icon>
          添加第一个块
        </button>
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

// 在 block-management.js 中添加预设块识别
_getBlockName(block) {
  // 优先使用自定义名称
  if (block.name) return block.name;
  
  // 如果是预设块类型，显示类型名称
  if (block.type && block.type.includes('_')) {
    const typeMap = {
      'poetry_title': '诗词标题',
      'poetry_dynasty': '朝代',
      'poetry_author': '作者',
      'poetry_content': '诗词内容',
      'poetry_translation': '诗词译文',
      'greeting_block': '问候语',
      'time_block': '时间',
      'quote_block': '每日一言'
    };
    return typeMap[block.type] || block.type;
  }
  
  // 如果有实体，使用实体的友好名称
  if (block.entity && this.hass?.states?.[block.entity]) {
    const entity = this.hass.states[block.entity];
    return entity.attributes?.friendly_name || block.entity;
  }
  
  // 默认名称
  return block.entity ? '实体块' : '自定义块';
}

  _getBlockValue(block) {
    // 优先使用自定义值
    if (block.value !== undefined) {
      return block.value.length > 30 ? block.value.substring(0, 30) + '…' : block.value;
    }
    
    // 如果有实体，显示实体状态
    if (block.entity && this.hass?.states?.[block.entity]) {
      const entity = this.hass.states[block.entity];
      const state = entity.state;
      const unit = entity.attributes?.unit_of_measurement || '';
      const value = unit ? `${state} ${unit}` : state;
      return value.length > 30 ? value.substring(0, 30) + '…' : value;
    }
    
    // 默认值
    return '点击配置';
  }

  _getDefaultIcon(block) {
    if (block.icon) return block.icon;
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
      vacuum: 'mdi:robot-vacuum'
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

  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      this._updateAvailableEntities();
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

  _updateEmptyState() {
    const blocks = this._getAllBlocks();
    this._showEmptyState = blocks.length === 0;
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
    
    // 如果选择了实体，自动填充图标和名称（如果未设置）
    if (updates.entity && updates.entity !== currentBlock.entity) {
      const entity = this.hass?.states?.[updates.entity];
      if (entity) {
        if (!currentBlock.name && !updates.name) {
          updates.name = entity.attributes?.friendly_name || updates.entity;
        }
        if (!currentBlock.icon && !updates.icon) {
          updates.icon = entity.attributes?.icon || this._getDefaultIcon({ entity: updates.entity });
        }
      }
    }
    
    const newBlock = { ...currentBlock, ...updates };
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
  }

  _addBlock() {
    const blockId = `block_${Date.now()}`;
    const newBlock = {
      entity: '',
      name: '新块',
      icon: 'mdi:cube-outline',
      value: ''
    };
    
    const currentBlocks = this.config.blocks || {};
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
    this._editingBlockId = blockId;
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
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
