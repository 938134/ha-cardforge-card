// src/editors/block-list.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockList extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    editingBlockId: { type: String },
    _editingBlockConfig: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .blocks-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      /* 四列网格布局 - 正常状态 */
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

      /* 区域标识 - 第一列 */
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

      .area-letter.header {
        background: #2196F3;
      }

      .area-letter.content {
        background: #4CAF50;
      }

      .area-letter.footer {
        background: #FF9800;
      }

      /* 图标 - 第二列 */
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

      /* 名称状态 - 第三列 */
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

      /* 操作按钮 - 第四列 */
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

      /* 编辑表单样式 - 展开状态 */
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
    this._editingBlockConfig = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    
    return html`
      <div class="block-list">
        ${this._renderBlocksContainer(blocks)}
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

  _renderBlocksContainer(blocks) {
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
          <div class="cf-text-md cf-mb-sm">还没有添加任何块</div>
          <div class="cf-text-sm cf-text-secondary">点击下方按钮添加第一个块</div>
        </div>
      `;
    }

    // 按区域排序：header → content → footer
    const sortedBlocks = [...blocks].sort((a, b) => {
      const areaOrder = { 'header': 0, 'content': 1, 'footer': 2 };
      const orderA = areaOrder[a.area] ?? 1;
      const orderB = areaOrder[b.area] ?? 1;
      return orderA - orderB;
    });

    return html`
      <div class="blocks-container">
        ${sortedBlocks.map(block => this._renderBlockItem(block))}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const isEditing = this.editingBlockId === block.id;
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}">
        ${this._renderNormalBlock(block)}
        ${isEditing ? this._renderEditForm(block) : ''}
      </div>
    `;
  }

  _renderNormalBlock(block) {
    const displayName = block.title || this._getBlockDisplayName(block);
    const state = this._getBlockState(block, this.hass);
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
    // 初始化编辑配置
    if (!this._editingBlockConfig) {
      this._editingBlockConfig = { ...block };
    }

    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 区域选择 -->
          <div class="form-label">区域</div>
          <div class="form-field">
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="area" value="header" 
                  ?checked=${this._editingBlockConfig.area === 'header'}
                  @change=${e => this._updateEditingField('area', e.target.value)}>
                标题
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="content" 
                  ?checked=${!this._editingBlockConfig.area || this._editingBlockConfig.area === 'content'}
                  @change=${e => this._updateEditingField('area', e.target.value)}>
                内容
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="footer" 
                  ?checked=${this._editingBlockConfig.area === 'footer'}
                  @change=${e => this._updateEditingField('area', e.target.value)}>
                页脚
              </label>
            </div>
          </div>

          <!-- 实体选择 -->
          <div class="form-label">实体</div>
          <div class="form-field">
            ${this._getAvailableEntities() ? html`
              <ha-combo-box
                .items=${this._getAvailableEntities()}
                .value=${this._editingBlockConfig.entity || ''}
                @value-changed=${e => this._onEntityChange(e.detail.value)}
                allow-custom-value
                label="选择实体"
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this._editingBlockConfig.entity || ''}
                @input=${e => this._updateEditingField('entity', e.target.value)}
                placeholder="输入实体ID"
                fullwidth
              ></ha-textfield>
            `}
          </div>

          <!-- 图标选择 -->
          <div class="form-label">图标</div>
          <div class="form-field">
            <ha-icon-picker
              .value=${this._editingBlockConfig.icon || ''}
              @value-changed=${e => this._updateEditingField('icon', e.detail.value)}
              label="选择图标"
            ></ha-icon-picker>
          </div>

          <!-- 内容输入 -->
          <div class="form-label">内容</div>
          <div class="form-field">
            <ha-textfield
              .value=${this._editingBlockConfig.content || ''}
              @input=${e => this._updateEditingField('content', e.target.value)}
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

  _getBlockDisplayName(blockConfig) {
    if (blockConfig.title && blockConfig.title.trim()) {
      return blockConfig.title;
    }
    if (blockConfig.entity) {
      return '实体块';
    }
    return '内容块';
  }

  _getBlockState(blockConfig, hass) {
    // 优先显示实体状态
    if (blockConfig.entity && hass?.states[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      const unit = entity.attributes?.unit_of_measurement || '';
      return this._formatEntityState(entity.state, unit);
    }
    
    // 显示静态内容（截断处理）
    if (blockConfig.content) {
      const content = String(blockConfig.content);
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }
    
    return '点击配置';
  }

  _formatEntityState(state, unit) {
    const stateMap = {
      'on': '开启',
      'off': '关闭',
      'open': '打开',
      'closed': '关闭',
      'home': '在家',
      'not_home': '外出'
    };
    
    const displayState = stateMap[state] || state;
    return unit ? `${displayState} ${unit}` : displayState;
  }

  _getDefaultIcon(blockConfig) {
    if (blockConfig.entity) {
      const entityType = blockConfig.entity.split('.')[0];
      const iconMap = {
        'light': 'mdi:lightbulb',
        'switch': 'mdi:power',
        'sensor': 'mdi:gauge',
        'binary_sensor': 'mdi:checkbox-marked-circle-outline',
        'climate': 'mdi:thermostat',
        'cover': 'mdi:blinds',
        'media_player': 'mdi:speaker'
      };
      return iconMap[entityType] || 'mdi:cube';
    }
    return 'mdi:text-box';
  }

  _getAreaInfo(area) {
    const areaMap = {
      'header': { letter: 'H', color: '#2196F3' },
      'content': { letter: 'C', color: '#4CAF50' },
      'footer': { letter: 'F', color: '#FF9800' }
    };
    return areaMap[area] || areaMap.content;
  }

  _getAvailableEntities() {
    if (!this.hass?.states) return null;
    
    return Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _renderAddBlockButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus"></ha-icon>
        添加新块
      </button>
    `;
  }

  _editBlock(e, block) {
    e.stopPropagation();
    this._editingBlockConfig = { ...block };
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId: block.id }
    }));
  }

  _onEntityChange(entityId) {
    this._updateEditingField('entity', entityId);
    
    // 自动填充实体信息
    if (entityId && this.hass?.states[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 自动填充图标
      if (entity.attributes?.icon && !this._editingBlockConfig.icon) {
        this._updateEditingField('icon', entity.attributes.icon);
      }
      
      // 自动填充内容（状态值）
      this._updateEditingField('content', entity.state);
    }
  }

  _updateEditingField(key, value) {
    if (this._editingBlockConfig) {
      this._editingBlockConfig[key] = value;
      this.requestUpdate();
    }
  }

  _saveEdit() {
    if (this._editingBlockConfig) {
      // 直接更新原配置
      this.config.blocks[this.editingBlockId] = { ...this._editingBlockConfig };
      this._editingBlockConfig = null;
      
      // 通知配置变更
      this._notifyConfigUpdate();
      
      // 退出编辑状态
      this.dispatchEvent(new CustomEvent('edit-block', {
        detail: { blockId: null }
      }));
    }
  }

  _cancelEdit() {
    this._editingBlockConfig = null;
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId: null }
    }));
  }

  _addBlock() {
    const blockId = `block_${Date.now()}`;
    
    const blockConfig = {
      area: 'content',
      entity: '',
      icon: 'mdi:text-box',
      content: '请配置内容...'
    };
    
    if (!this.config.blocks) {
      this.config.blocks = {};
    }
    
    this.config.blocks[blockId] = blockConfig;
    
    // 直接进入编辑状态
    this._editingBlockConfig = { ...blockConfig, id: blockId };
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId }
    }));
    
    this._notifyConfigUpdate();
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    delete this.config.blocks[blockId];
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { blocks: this.config.blocks } }
    }));
  }
}

if (!customElements.get('block-list')) {
  customElements.define('block-list', BlockList);
}

export { BlockList };