// src/editors/block-system/block-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockSystem } from '../../core/block-system.js';
import { BlockRow } from './block-row.js';

class BlockManager extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlocks: { state: true },
    _availableEntities: { state: true },
    _blocksVersion: { state: true } // 添加版本号强制刷新
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
    this._editingBlocks = new Map();
    this._availableEntities = [];
    this._autoFillTimeouts = new Map();
    this._blocksVersion = 0; // 初始化版本号
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
        ${sortedBlocks.map(block => {
          const isEditing = this._editingBlocks.has(block.id);
          const editingConfig = this._editingBlocks.get(block.id);
          
          return html`
            <block-row
              .block=${block}
              .hass=${this.hass}
              .isEditing=${isEditing}
              .editingConfig=${editingConfig}
              .availableEntities=${this._availableEntities}
              .blocksVersion=${this._blocksVersion} // 传递版本号
              @edit-block=${this._onEditBlock}
              @save-block=${this._onSaveBlock}
              @cancel-edit=${this._onCancelEdit}
              @delete-block=${this._onDeleteBlock}
              @update-editing-config=${this._onUpdateEditingConfig}
            ></block-row>
          `;
        })}
      </div>
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

  _onEditBlock(e) {
    const blockId = e.detail.blockId;
    const block = this.config.blocks[blockId];
    
    if (!block) return;
    
    console.log('开始编辑块:', blockId);
    
    // 初始化编辑配置
    this._editingBlocks.set(blockId, { ...block });
    this.requestUpdate();
  }

  _onSaveBlock(e) {
    const { blockId, config } = e.detail;
    
    console.log('保存块:', blockId, config);
    
    // 验证配置
    const validation = BlockSystem.validateBlock(config);
    if (!validation.valid) {
      alert(`配置错误：${validation.errors.join(', ')}`);
      return;
    }
    
    // 1. 先更新配置
    this.config.blocks[blockId] = config;
    
    // 2. 清除编辑状态
    this._editingBlocks.delete(blockId);
    this._clearAutoFillTimeout(blockId);
    
    // 3. 增加版本号强制刷新UI
    this._blocksVersion++;
    
    console.log('块保存完成，版本号:', this._blocksVersion);
    
    // 4. 通知配置更新
    this._notifyConfigUpdate();
    
    // 5. 强制重新渲染
    this.requestUpdate();
  }

  _onCancelEdit(e) {
    const blockId = e.detail?.blockId;
    
    if (!blockId) return;
    
    console.log('取消编辑块:', blockId);
    
    // 清除编辑状态
    this._editingBlocks.delete(blockId);
    this._clearAutoFillTimeout(blockId);
    
    // 增加版本号强制刷新UI
    this._blocksVersion++;
    
    this.requestUpdate();
  }

  _onDeleteBlock(e) {
    const blockId = e.detail.blockId;
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    console.log('删除块:', blockId);
    
    // 清除相关状态
    delete this.config.blocks[blockId];
    this._editingBlocks.delete(blockId);
    this._clearAutoFillTimeout(blockId);
    
    // 增加版本号强制刷新UI
    this._blocksVersion++;
    
    this._notifyConfigUpdate();
  }

  _onUpdateEditingConfig(e) {
    const { blockId, updates } = e.detail;
    
    if (!this._editingBlocks.has(blockId)) return;
    
    const currentConfig = this._editingBlocks.get(blockId);
    const newConfig = { ...currentConfig, ...updates };
    
    this._editingBlocks.set(blockId, newConfig);
    
    // 处理实体自动填充
    if (updates.entity && updates.entity !== currentConfig.entity) {
      this._scheduleAutoFill(blockId, updates.entity);
    }
  }

  _scheduleAutoFill(blockId, entityId) {
    // 清除之前的定时器
    this._clearAutoFillTimeout(blockId);
    
    const timeoutId = setTimeout(() => {
      this._autoFillFromEntity(blockId, entityId);
    }, 300);
    
    this._autoFillTimeouts.set(blockId, timeoutId);
  }

  _autoFillFromEntity(blockId, entityId) {
    if (!entityId || !this.hass?.states[entityId] || !this._editingBlocks.has(blockId)) {
      return;
    }
    
    const entity = this.hass.states[entityId];
    const currentConfig = this._editingBlocks.get(blockId);
    const updates = {};
    
    // 自动填充名称（如果当前名称为空或是默认值）
    if (!currentConfig.title || currentConfig.title === currentConfig.id) {
      if (entity.attributes?.friendly_name) {
        updates.title = entity.attributes.friendly_name;
      }
    }
    
    // 自动填充图标（如果当前图标为空）
    if (!currentConfig.icon) {
      updates.icon = BlockSystem.getEntityIcon(entityId, this.hass);
    }
    
    // 应用更新
    if (Object.keys(updates).length > 0) {
      const newConfig = { ...currentConfig, ...updates };
      this._editingBlocks.set(blockId, newConfig);
      this.requestUpdate();
    }
  }

  _clearAutoFillTimeout(blockId) {
    if (this._autoFillTimeouts.has(blockId)) {
      clearTimeout(this._autoFillTimeouts.get(blockId));
      this._autoFillTimeouts.delete(blockId);
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
    this._editingBlocks.set(blockId, { ...blockConfig });
    
    // 增加版本号强制刷新UI
    this._blocksVersion++;
    
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
    // 清理所有定时器
    this._autoFillTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this._autoFillTimeouts.clear();
  }
}

if (!customElements.get('block-manager')) {
  customElements.define('block-manager', BlockManager);
}

export { BlockManager };