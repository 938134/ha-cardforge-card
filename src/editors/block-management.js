// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { state: true },
    _editingBlockConfig: { state: true } // 编辑时的临时配置
  };

  static styles = [
    designSystem,
    css`
      .block-management {
        width: 100%;
      }

      /* 块列表样式 */
      .block-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .block-item {
        display: grid;
        grid-template-columns: 40px 50px 1fr 80px;
        gap: var(--cf-spacing-md);
        align-items: center;
        background: var(--cf-surface);
        border: 2px solid transparent;
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
        min-height: 70px;
        cursor: pointer;
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

      .block-item.editing {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      /* 区域标识 */
      .area-badge {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .area-letter {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9em;
        font-weight: 700;
        color: white;
      }

      .area-letter.header { background: #2196F3; }
      .area-letter.content { background: #4CAF50; }
      .area-letter.footer { background: #FF9800; }

      /* 图标 */
      .block-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3em;
      }

      /* 名称状态 */
      .block-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
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
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* 操作按钮 */
      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        justify-content: flex-end;
      }

      .block-action {
        width: 36px;
        height: 36px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        color: var(--cf-text-secondary);
      }

      .block-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .block-action.delete:hover {
        background: var(--cf-error-color);
        border-color: var(--cf-error-color);
      }

      /* 编辑表单 */
      .edit-form {
        grid-column: 1 / -1;
        background: var(--cf-surface);
        border: 2px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        margin-top: var(--cf-spacing-md);
        animation: expandIn 0.3s ease;
      }

      @keyframes expandIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .form-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      .form-field {
        display: flex;
        gap: var(--cf-spacing-sm);
        align-items: center;
      }

      .form-field ha-select,
      .form-field ha-combo-box,
      .form-field ha-textfield {
        flex: 1;
      }

      .radio-group {
        display: flex;
        gap: var(--cf-spacing-md);
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        cursor: pointer;
      }

      .radio-option input[type="radio"] {
        margin: 0;
      }

      .form-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      .action-btn {
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
        padding: var(--cf-spacing-lg);
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
        font-size: 0.95em;
        font-weight: 500;
        margin-top: var(--cf-spacing-md);
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

      /* 响应式 */
      @media (max-width: 768px) {
        .block-item {
          grid-template-columns: 35px 40px 1fr 70px;
          gap: var(--cf-spacing-sm);
          padding: var(--cf-spacing-sm);
        }

        .area-letter {
          width: 28px;
          height: 28px;
        }

        .block-icon {
          width: 36px;
          height: 36px;
        }

        .form-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .form-label {
          margin-top: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._editingBlockId = null;
    this._editingBlockConfig = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    
    return html`
      <div class="block-management">
        ${this._renderBlocks(blocks)}
        ${this._renderAddButton()}
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

  _renderBlocks(blocks) {
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
          <div class="cf-text-md cf-mb-sm">还没有添加任何块</div>
          <div class="cf-text-sm cf-text-secondary">点击下方按钮添加第一个块</div>
        </div>
      `;
    }

    const sortedBlocks = [...blocks].sort((a, b) => {
      const areaOrder = { 'header': 0, 'content': 1, 'footer': 2 };
      const orderA = areaOrder[a.area] ?? 1;
      const orderB = areaOrder[b.area] ?? 1;
      return orderA - orderB;
    });

    return html`
      <div class="block-list">
        ${sortedBlocks.map(block => this._renderBlockItem(block))}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const isEditing = this._editingBlockId === block.id;
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}">
        ${this._renderBlockDisplay(block)}
        ${isEditing ? this._renderEditForm(block) : ''}
      </div>
    `;
  }

  _renderBlockDisplay(block) {
    const displayName = this._getBlockDisplayName(block);
    const state = this._getBlockState(block);
    const icon = block.icon || this._getDefaultIcon(block);
    const areaInfo = this._getAreaInfo(block.area);

    return html`
      <!-- 第一列：区域标识 -->
      <div class="area-badge">
        <div class="area-letter ${block.area || 'content'}">${areaInfo.letter}</div>
      </div>

      <!-- 第二列：图标 -->
      <div class="block-icon">
        <ha-icon .icon=${icon}></ha-icon>
      </div>

      <!-- 第三列：名称和状态 -->
      <div class="block-info">
        <div class="block-name" title=${displayName}>${displayName}</div>
        <div class="block-state" title=${state}>${state}</div>
      </div>

      <!-- 第四列：操作按钮 -->
      <div class="block-actions">
        <div class="block-action" @click=${e => this._editBlock(e, block)} title="编辑块">
          <ha-icon icon="mdi:pencil"></ha-icon>
        </div>
        <div class="block-action delete" @click=${e => this._deleteBlock(e, block.id)} title="删除块">
          <ha-icon icon="mdi:delete"></ha-icon>
        </div>
      </div>
    `;
  }

  _renderEditForm(block) {
    // 使用编辑时的临时配置，如果没有则使用当前配置
    const editingConfig = this._editingBlockConfig || this.config.blocks[block.id];

    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 区域选择 -->
          <div class="form-label">区域</div>
          <div class="form-field">
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="area" value="header" 
                  ?checked=${editingConfig.area === 'header'}
                  @change=${e => this._updateEditingBlock('area', e.target.value)}>
                标题
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="content" 
                  ?checked=${!editingConfig.area || editingConfig.area === 'content'}
                  @change=${e => this._updateEditingBlock('area', e.target.value)}>
                内容
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="footer" 
                  ?checked=${editingConfig.area === 'footer'}
                  @change=${e => this._updateEditingBlock('area', e.target.value)}>
                页脚
              </label>
            </div>
          </div>

          <!-- 实体选择 -->
          <div class="form-label">实体</div>
          <div class="form-field">
            <ha-combo-box
              .items=${this._getAvailableEntities()}
              .value=${editingConfig.entity || ''}
              @value-changed=${e => this._onEntityChange(e.detail.value)}
              allow-custom-value
              label="选择实体"
            ></ha-combo-box>
          </div>

          <!-- 图标选择 -->
          <div class="form-label">图标</div>
          <div class="form-field">
            <ha-icon-picker
              .value=${editingConfig.icon || ''}
              @value-changed=${e => this._updateEditingBlock('icon', e.detail.value)}
              label="选择图标"
            ></ha-icon-picker>
          </div>

          <!-- 内容输入 -->
          <div class="form-label">内容</div>
          <div class="form-field">
            <ha-textfield
              .value=${editingConfig.content || ''}
              @input=${e => this._updateEditingBlock('content', e.target.value)}
              placeholder="输入显示内容"
              fullwidth
            ></ha-textfield>
          </div>
        </div>

        <div class="form-actions">
          <button class="action-btn" @click=${this._cancelEdit}>
            取消
          </button>
          <button class="action-btn primary" @click=${this._saveEdit}>
            保存
          </button>
        </div>
      </div>
    `;
  }

  _renderAddButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus"></ha-icon>
        添加新块
      </button>
    `;
  }

  _getBlockDisplayName(blockConfig) {
    if (blockConfig.entity && this.hass?.states[blockConfig.entity]) {
      const entity = this.hass.states[blockConfig.entity];
      return entity.attributes?.friendly_name || blockConfig.entity.split('.')[1] || '实体块';
    }
    
    if (blockConfig.content) {
      const content = String(blockConfig.content);
      return content.length > 15 ? content.substring(0, 15) + '...' : content;
    }
    
    return '内容块';
  }

  _getBlockState(blockConfig) {
    if (blockConfig.entity && this.hass?.states[blockConfig.entity]) {
      const entity = this.hass.states[blockConfig.entity];
      const unit = entity.attributes?.unit_of_measurement || '';
      return this._formatEntityState(entity.state, unit);
    }
    
    if (blockConfig.content) {
      const content = String(blockConfig.content);
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }
    
    return '点击配置';
  }

  _formatEntityState(state, unit) {
    const stateMap = {
      'on': '开启', 'off': '关闭', 'open': '打开', 'closed': '关闭',
      'home': '在家', 'not_home': '外出'
    };
    const displayState = stateMap[state] || state;
    return unit ? `${displayState} ${unit}` : displayState;
  }

  _getDefaultIcon(blockConfig) {
    if (blockConfig.entity) {
      const entityType = blockConfig.entity.split('.')[0];
      const iconMap = {
        'light': 'mdi:lightbulb', 'switch': 'mdi:power', 'sensor': 'mdi:gauge',
        'binary_sensor': 'mdi:checkbox-marked-circle-outline', 'climate': 'mdi:thermostat',
        'cover': 'mdi:blinds', 'media_player': 'mdi:speaker'
      };
      return iconMap[entityType] || 'mdi:cube';
    }
    return 'mdi:text-box';
  }

  _getAreaInfo(area) {
    const areaMap = {
      'header': { letter: 'H' }, 'content': { letter: 'C' }, 'footer': { letter: 'F' }
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

  _editBlock(e, block) {
    e.stopPropagation();
    
    // 关键修复：创建编辑配置的深拷贝
    this._editingBlockConfig = JSON.parse(JSON.stringify(this.config.blocks[block.id]));
    this._editingBlockId = block.id;
    
    this.requestUpdate();
  }

  _onEntityChange(entityId) {
    this._updateEditingBlock('entity', entityId);
    
    if (entityId && this.hass?.states[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 自动填充图标
      if (entity.attributes?.icon) {
        this._updateEditingBlock('icon', entity.attributes.icon);
      } else {
        // 使用默认图标
        const entityType = entityId.split('.')[0];
        const iconMap = {
          'light': 'mdi:lightbulb', 'switch': 'mdi:power', 'sensor': 'mdi:gauge',
          'binary_sensor': 'mdi:checkbox-marked-circle-outline', 'climate': 'mdi:thermostat',
          'cover': 'mdi:blinds', 'media_player': 'mdi:speaker'
        };
        this._updateEditingBlock('icon', iconMap[entityType] || 'mdi:cube');
      }
      
      // 自动填充内容
      const unit = entity.attributes?.unit_of_measurement || '';
      const stateDisplay = unit ? `${entity.state} ${unit}` : entity.state;
      this._updateEditingBlock('content', stateDisplay);
    }
  }

  _updateEditingBlock(key, value) {
    if (this._editingBlockConfig) {
      // 更新编辑配置
      this._editingBlockConfig[key] = value;
      this.requestUpdate();
    }
  }

  _saveEdit() {
    if (this._editingBlockId && this._editingBlockConfig) {
      // 关键修复：创建全新的配置对象
      const newConfig = {
        ...this.config,
        blocks: {
          ...this.config.blocks,
          [this._editingBlockId]: { ...this._editingBlockConfig }
        }
      };
      
      // 提交新配置
      this._submitConfigChange(newConfig);
      
      // 重置编辑状态
      this._editingBlockId = null;
      this._editingBlockConfig = null;
    }
  }

  _cancelEdit() {
    // 直接丢弃编辑配置，不保存
    this._editingBlockId = null;
    this._editingBlockConfig = null;
    this.requestUpdate();
  }

  _addBlock() {
    const blockId = `block_${Date.now()}`;
    
    // 创建新块配置
    const newBlockConfig = {
      area: 'content',
      entity: '',
      icon: 'mdi:text-box',
      content: '请配置内容...'
    };
    
    // 创建全新配置对象
    const newConfig = {
      ...this.config,
      blocks: {
        ...this.config.blocks,
        [blockId]: newBlockConfig
      }
    };
    
    // 提交新配置
    this._submitConfigChange(newConfig);
    
    // 进入编辑状态
    this._editingBlockConfig = JSON.parse(JSON.stringify(newBlockConfig));
    this._editingBlockId = blockId;
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    // 创建删除后的新配置
    const newBlocks = { ...this.config.blocks };
    delete newBlocks[blockId];
    
    const newConfig = {
      ...this.config,
      blocks: newBlocks
    };
    
    // 提交新配置
    this._submitConfigChange(newConfig);
    
    // 如果删除的是正在编辑的块，重置编辑状态
    if (this._editingBlockId === blockId) {
      this._editingBlockId = null;
      this._editingBlockConfig = null;
    }
  }

  _submitConfigChange(newConfig) {
    // 关键修复：使用全新的配置对象
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}

export { BlockManagement };