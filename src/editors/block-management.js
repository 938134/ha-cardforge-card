// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
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
        min-height: 70px;
        cursor: pointer;
      }

      .block-item.editing {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

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
        color: var(--cf-text-secondary);
      }

      .edit-form {
        grid-column: 1 / -1;
        background: var(--cf-surface);
        border: 2px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        margin-top: var(--cf-spacing-md);
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
        min-width: 80px;
      }

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .add-block-btn {
        width: 100%;
        padding: var(--cf-spacing-lg);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: transparent;
        color: var(--cf-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.95em;
        font-weight: 500;
        margin-top: var(--cf-spacing-md);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }
    `
  ];

  constructor() {
    super();
    this._editingBlockId = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
          <div class="cf-text-md cf-mb-sm">还没有添加任何块</div>
          <button class="add-block-btn" @click=${this._addBlock}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加第一个块
          </button>
        </div>
      `;
    }

    return html`
      <div class="block-management">
        <div class="block-list">
          ${blocks.map(block => this._renderBlock(block))}
        </div>
        <button class="add-block-btn" @click=${this._addBlock}>
          <ha-icon icon="mdi:plus"></ha-icon>
          添加新块
        </button>
      </div>
    `;
  }

  _getAllBlocks() {
    if (!this.config.blocks) return [];
    return Object.entries(this.config.blocks).map(([id, config]) => ({ id, ...config }));
  }

  _renderBlock(block) {
    const isEditing = this._editingBlockId === block.id;
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}">
        <!-- 块显示 -->
        <div class="area-badge">
          <div class="area-letter ${block.area || 'content'}">
            ${block.area === 'header' ? 'H' : block.area === 'footer' ? 'F' : 'C'}
          </div>
        </div>

        <div class="block-icon">
          <ha-icon .icon=${block.icon || this._getDefaultIcon(block)}></ha-icon>
        </div>

        <div class="block-info">
          <div class="block-name">${this._getBlockName(block)}</div>
          <div class="block-state">${this._getBlockState(block)}</div>
        </div>

        <div class="block-actions">
          <div class="block-action" @click=${e => this._startEdit(e, block.id)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action" @click=${e => this._deleteBlock(e, block.id)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>

        <!-- 编辑表单 -->
        ${isEditing ? this._renderEditForm(block) : ''}
      </div>
    `;
  }

  _renderEditForm(block) {
    return html`
      <div class="edit-form">
        <div class="form-grid">
          <div class="form-label">区域</div>
          <div class="form-field">
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="area" value="header" 
                  ?checked=${block.area === 'header'}
                  @change=${e => this._updateBlock(block.id, 'area', e.target.value)}>
                标题
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="content" 
                  ?checked=${!block.area || block.area === 'content'}
                  @change=${e => this._updateBlock(block.id, 'area', e.target.value)}>
                内容
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="footer" 
                  ?checked=${block.area === 'footer'}
                  @change=${e => this._updateBlock(block.id, 'area', e.target.value)}>
                页脚
              </label>
            </div>
          </div>

          <div class="form-label">实体</div>
          <div class="form-field">
            <ha-combo-box
              .items=${this._getEntities()}
              .value=${block.entity || ''}
              @value-changed=${e => this._handleEntityChange(block.id, e.detail.value)}
              allow-custom-value
              label="选择实体"
            ></ha-combo-box>
          </div>

          <div class="form-label">图标</div>
          <div class="form-field">
            <ha-icon-picker
              .value=${block.icon || ''}
              @value-changed=${e => this._updateBlock(block.id, 'icon', e.detail.value)}
              label="选择图标"
            ></ha-icon-picker>
          </div>

          <div class="form-label">内容</div>
          <div class="form-field">
            <ha-textfield
              .value=${block.content || ''}
              @input=${e => this._updateBlock(block.id, 'content', e.target.value)}
              placeholder="输入显示内容"
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

  _getBlockName(block) {
    if (block.entity && this.hass?.states[block.entity]) {
      return this.hass.states[block.entity].attributes?.friendly_name || '实体块';
    }
    if (block.content) {
      return String(block.content).substring(0, 15) + (String(block.content).length > 15 ? '...' : '');
    }
    return '内容块';
  }

  _getBlockState(block) {
    if (block.entity && this.hass?.states[block.entity]) {
      const entity = this.hass.states[block.entity];
      const unit = entity.attributes?.unit_of_measurement || '';
      return `${entity.state}${unit ? ' ' + unit : ''}`;
    }
    if (block.content) {
      return String(block.content).substring(0, 30) + (String(block.content).length > 30 ? '...' : '');
    }
    return '点击配置';
  }

  _getDefaultIcon(block) {
    if (block.entity) {
      const type = block.entity.split('.')[0];
      const icons = {
        'light': 'mdi:lightbulb', 'switch': 'mdi:power', 'sensor': 'mdi:gauge',
        'binary_sensor': 'mdi:checkbox-marked-circle-outline', 'climate': 'mdi:thermostat'
      };
      return icons[type] || 'mdi:cube';
    }
    return 'mdi:text-box';
  }

  _getEntities() {
    if (!this.hass?.states) return [];
    return Object.entries(this.hass.states).map(([id, state]) => ({
      value: id,
      label: `${state.attributes?.friendly_name || id} (${id})`
    })).sort((a, b) => a.label.localeCompare(b.label));
  }

  _startEdit(e, blockId) {
    e.stopPropagation();
    this._editingBlockId = blockId;
  }

  _handleEntityChange(blockId, entityId) {
    this._updateBlock(blockId, 'entity', entityId);
    
    if (entityId && this.hass?.states[entityId]) {
      const entity = this.hass.states[entityId];
      // 自动设置图标
      if (entity.attributes?.icon) {
        this._updateBlock(blockId, 'icon', entity.attributes.icon);
      }
      // 自动设置内容
      const unit = entity.attributes?.unit_of_measurement || '';
      this._updateBlock(blockId, 'content', `${entity.state}${unit ? ' ' + unit : ''}`);
    }
  }

  _updateBlock(blockId, key, value) {
    // 直接修改当前配置（最简单直接的方式）
    if (this.config.blocks[blockId]) {
      this.config.blocks[blockId][key] = value;
      // 立即通知配置变化
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this.config }
      }));
    }
  }

  _finishEdit() {
    this._editingBlockId = null;
  }

  _cancelEdit() {
    this._editingBlockId = null;
  }

  _addBlock() {
    const blockId = `block_${Date.now()}`;
    const newBlock = {
      area: 'content',
      entity: '',
      icon: 'mdi:text-box',
      content: '请配置内容...'
    };

    if (!this.config.blocks) this.config.blocks = {};
    this.config.blocks[blockId] = newBlock;

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));

    this._editingBlockId = blockId;
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    if (!confirm('确定要删除这个块吗？')) return;

    delete this.config.blocks[blockId];
    if (this._editingBlockId === blockId) {
      this._editingBlockId = null;
    }

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}

export { BlockManagement };