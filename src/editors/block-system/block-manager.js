// src/editors/block-system/block-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockSystem } from '../../core/block-system.js';
import './block-row.js';

class BlockManager extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    // 单一状态源
    _editingBlockId: { state: true },
    _editingConfig: { state: true },
    _availableEntities: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-manager {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .add-block-btn {
        width: 100%;
        padding: var(--cf-spacing-md);
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
        font-size: 0.9em;
      }

      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

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
    `
  ];

  constructor() {
    super();
    // 单一状态源
    this._editingBlockId = null;
    this._editingConfig = null;
    this._availableEntities = [];
    this._autoFillTimeout = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }
  }

  render() {
    const blocks = this._getAllBlocks();
    
    return html`
      <div class="block-manager">
        ${this._renderBlocksList(blocks)}
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

  _renderBlocksList(blocks) {
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
          <div class="cf-text-md cf-mb-sm">还没有任何块</div>
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
      <div class="blocks-list">
        ${sortedBlocks.map(block => this._renderBlockRow(block))}
      </div>
    `;
  }

  _renderBlockRow(block) {
    const isEditing = this._editingBlockId === block.id;
    
    return html`
      <block-row
        .block=${block}
        .hass=${this.hass}
        .isEditing=${isEditing}
        .editingConfig=${isEditing ? this._editingConfig : null}
        .availableEntities=${this._availableEntities}
        @edit-block=${() => this._startEditing(block.id)}
        @save-block=${(e) => this._saveBlock(e.detail)}
        @cancel-edit=${() => this._cancelEditing()}
        @delete-block=${(e) => this._deleteBlock(e.detail.blockId)}
        @update-editing-config=${(e) => this._updateEditingConfig(e.detail)}
      ></block-row>
    `;
  }

  _renderAddBlockButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus"></ha-icon>
        添加块
      </button>
    `;
  }

  // === 核心操作方法 ===
  _startEditing(blockId) {
    const block = this.config.blocks[blockId];
    if (!block) return;

    console.log('🚀 开始编辑块:', blockId);
    
    // 清除之前的自动填充定时器
    this._clearAutoFillTimeout();
    
    // 设置编辑状态
    this._editingBlockId = blockId;
    this._editingConfig = { ...block };
    
    this.requestUpdate();
  }

  _saveBlock({ blockId, config }) {
    console.log('💾 保存块:', blockId);
    
    // 验证配置
    const validation = BlockSystem.validateBlock(config);
    if (!validation.valid) {
      alert(`配置错误：${validation.errors.join(', ')}`);
      return;
    }
    
    // 更新配置
    this.config.blocks[blockId] = config;
    
    // 清除编辑状态
    this._editingBlockId = null;
    this._editingConfig = null;
    this._clearAutoFillTimeout();
    
    console.log('✅ 块保存完成');
    
    // 通知配置更新并重新渲染
    this._notifyConfigUpdate();
  }

  _cancelEditing() {
    console.log('❌ 取消编辑');
    
    this._editingBlockId = null;
    this._editingConfig = null;
    this._clearAutoFillTimeout();
    
    this.requestUpdate();
  }

  _deleteBlock(blockId) {
    if (!confirm('确定要删除这个块吗？')) return;
    
    console.log('🗑️ 删除块:', blockId);
    
    // 如果正在编辑这个块，先取消编辑
    if (this._editingBlockId === blockId) {
      this._cancelEditing();
    }
    
    delete this.config.blocks[blockId];
    this._notifyConfigUpdate();
  }

  _updateEditingConfig({ updates }) {
    if (!this._editingConfig) return;
    
    console.log('🔄 更新编辑配置:', updates);
    
    // 更新编辑配置
    this._editingConfig = { ...this._editingConfig, ...updates };
    
    // 处理实体自动填充
    if (updates.entity) {
      this._scheduleAutoFill(updates.entity);
    }
    
    this.requestUpdate();
  }

  _scheduleAutoFill(entityId) {
    // 清除之前的定时器
    this._clearAutoFillTimeout();
    
    this._autoFillTimeout = setTimeout(() => {
      this._autoFillFromEntity(entityId);
    }, 300);
  }

  _autoFillFromEntity(entityId) {
    if (!entityId || !this.hass?.states[entityId] || !this._editingConfig) {
      return;
    }
    
    const entity = this.hass.states[entityId];
    const updates = {};
    
    // 自动填充名称（如果当前名称为空或是默认值）
    if (!this._editingConfig.title || this._editingConfig.title === this._editingBlockId) {
      if (entity.attributes?.friendly_name) {
        updates.title = entity.attributes.friendly_name;
      }
    }
    
    // 自动填充图标（如果当前图标为空）
    if (!this._editingConfig.icon) {
      updates.icon = BlockSystem.getEntityIcon(entityId, this.hass);
    }
    
    // 应用更新
    if (Object.keys(updates).length > 0) {
      this._editingConfig = { ...this._editingConfig, ...updates };
      this.requestUpdate();
    }
  }

  _clearAutoFillTimeout() {
    if (this._autoFillTimeout) {
      clearTimeout(this._autoFillTimeout);
      this._autoFillTimeout = null;
    }
  }

  _addBlock() {
    const area = prompt('请选择要添加到的区域：\n\n输入: header(标题) / content(内容) / footer(页脚)', 'content');
    
    if (!area || !['header', 'content', 'footer'].includes(area)) {
      return;
    }
    
    const blockId = `block_${Date.now()}`;
    const blockConfig = {
      type: 'text',
      title: '',
      content: '新块内容',
      area: area
    };
    
    if (!this.config.blocks) {
      this.config.blocks = {};
    }
    
    this.config.blocks[blockId] = blockConfig;
    
    // 自动进入编辑模式
    this._startEditing(blockId);
    
    this._notifyConfigUpdate();
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

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { blocks: this.config.blocks } }
    }));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearAutoFillTimeout();
  }
}

if (!customElements.get('block-manager')) {
  customElements.define('block-manager', BlockManager);
}

export { BlockManager };