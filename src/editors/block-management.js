// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import './block-list.js';
import './block-editor.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { state: true },
    _availableEntities: { state: true },
    _forceUpdate: { state: true } // 新增：强制更新标记
  };

  static styles = [
    designSystem,
    css`
      .block-management {
        width: 100%;
      }

      .management-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-md);
      }

      .header-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .editing-indicator {
        display: inline-flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-radius: var(--cf-radius-sm);
        font-size: 0.85em;
        color: var(--cf-primary-color);
      }

      .editing-indicator ha-icon {
        font-size: 0.9em;
      }

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
    `
  ];

  constructor() {
    super();
    this._editingBlockId = null;
    this._availableEntities = [];
    this._forceUpdate = 0; // 强制更新计数器
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }
  }

  render() {
    return html`
      <div class="block-management">
        <div class="management-header">
          <span class="header-title">块管理</span>
          ${this._editingBlockId ? html`
            <span class="editing-indicator">
              <ha-icon icon="mdi:pencil"></ha-icon>
              正在编辑块
            </span>
          ` : ''}
        </div>

        <block-list
          .config=${this.config}
          .hass=${this.hass}
          .editingBlockId=${this._editingBlockId}
          .forceUpdate=${this._forceUpdate} <!-- 传递强制更新标记 -->
          @edit-block=${this._onEditBlock}
          @delete-block=${this._onDeleteBlock}
        ></block-list>

        ${this._editingBlockId ? html`
          <block-editor
            .blockConfig=${this.config.blocks[this._editingBlockId]}
            .hass=${this.hass}
            .availableEntities=${this._availableEntities}
            @save=${this._onSaveEdit}
            @cancel=${this._onCancelEdit}
            @config-change=${this._onBlockConfigChange}
          ></block-editor>
        ` : ''}

        <button class="add-block-btn" @click=${this._addBlock}>
          <ha-icon icon="mdi:plus"></ha-icon>
          添加新块
        </button>
      </div>
    `;
  }

  _onEditBlock(e) {
    this._editingBlockId = e.detail.blockId;
    this.requestUpdate();
  }

  _onDeleteBlock(e) {
    const blockId = e.detail.blockId;
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    delete this.config.blocks[blockId];
    
    // 如果删除的是正在编辑的块，退出编辑状态
    if (this._editingBlockId === blockId) {
      this._editingBlockId = null;
    }
    
    this._forceUpdateBlocks(); // 强制更新
    this._notifyConfigUpdate();
  }

  _onBlockConfigChange(e) {
    const { blockId, changes } = e.detail;
    
    // 关键修复：直接修改原配置对象
    if (this.config.blocks[blockId]) {
      Object.assign(this.config.blocks[blockId], changes);
      // 实时强制更新块列表显示
      this._forceUpdateBlocks();
    }
  }

  _onSaveEdit() {
    // 保存时确保配置已经通过实时更新同步
    this._editingBlockId = null;
    this._forceUpdateBlocks(); // 保存时强制更新
    this._notifyConfigUpdate();
  }

  _onCancelEdit() {
    this._editingBlockId = null;
    this.requestUpdate();
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
    this._editingBlockId = blockId;
    
    this._forceUpdateBlocks(); // 添加块时强制更新
    this._notifyConfigUpdate();
  }

  // 新增：强制更新块列表
  _forceUpdateBlocks() {
    this._forceUpdate = (this._forceUpdate || 0) + 1;
    this.requestUpdate();
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
      detail: { config: this.config }
    }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}

export { BlockManagement };