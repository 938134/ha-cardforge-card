// blocks/block-management.js - 修改版（优化新块初始配置和预览）
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockBase } from './block-base.js';
import { BlockEditForm } from './block-edit-form.js';
import { AREAS } from './block-config.js';

export class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    cardDefinition: { type: Object },
    _editingBlockId: { state: true },
    _availableEntities: { state: true }  // 新增：缓存可用实体列表
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
        gap: 12px;
      }
      
      .block-item {
        display: grid;
        grid-template-columns: 70px 1fr 80px;
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
        transition: all var(--cf-transition-fast);
        padding: 8px 0;
      }
      
      .block-item:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .preset-block {
        background: rgba(0, 0, 0, 0.02);
      }
      
      /* 新增：空块样式 */
      .empty-block {
        opacity: 0.8;
        background: rgba(var(--cf-primary-color-rgb), 0.03);
        border-style: dashed;
        border-width: 1.5px;
      }
      
      .empty-block:hover {
        opacity: 1;
        background: rgba(var(--cf-primary-color-rgb), 0.08);
      }
      
      /* 区域标识 */
      .area-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 0 8px;
        border-right: 1px solid var(--cf-border);
        height: 100%;
        min-height: 60px;
      }
      
      .preset-block .area-indicator {
        color: var(--cf-text-tertiary);
      }
      
      .area-icon {
        font-size: 1.2em;
        margin-bottom: 2px;
      }
      
      .area-label {
        font-size: 0.75em;
        font-weight: 600;
        text-align: center;
        line-height: 1.1;
      }
      
      .preset-block .area-icon {
        opacity: 0.7;
      }
      
      /* 块视图容器 */
      .block-view-container {
        padding: 0 12px;
        min-height: 60px;
        display: flex;
        align-items: center;
      }
      
      /* 新增：空块预览样式 */
      .empty-block-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      
      .empty-block-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        border-radius: var(--cf-radius-md);
        color: var(--cf-text-tertiary);
        font-size: 1.2em;
        flex-shrink: 0;
      }
      
      .empty-block-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0; /* 防止文本溢出 */
      }
      
      .empty-block-name {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .empty-block-hint {
        font-size: 0.75em;
        color: var(--cf-text-tertiary);
        font-style: italic;
      }
      
      /* 块操作 */
      .block-actions {
        display: flex;
        gap: 4px;
        padding: 0 12px;
        justify-content: flex-end;
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
      }
      
      .block-action:hover:not(.disabled) {
        background: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
        color: white;
      }
      
      .block-action.disabled {
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
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      /* 新增：推荐实体样式 */
      .recommended-entities {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        width: 100%;
      }
      
      .recommended-entity {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        text-align: left;
      }
      
      .recommended-entity:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
        transform: translateX(2px);
      }
      
      .recommended-entity ha-icon {
        color: var(--cf-primary-color);
        font-size: 1.2em;
      }
      
      .recommended-entity span {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      /* 编辑表单容器 */
      .edit-form-container {
        margin-top: 12px;
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .block-item {
          grid-template-columns: 60px 1fr 70px;
          padding: 6px 0;
        }
        
        .area-indicator {
          padding: 0 6px;
        }
        
        .area-label {
          font-size: 0.7em;
        }
        
        .block-view-container {
          padding: 0 8px;
        }
        
        .empty-block-preview {
          gap: 8px;
        }
        
        .empty-block-icon {
          width: 32px;
          height: 32px;
          font-size: 1.1em;
        }
        
        .empty-block-name {
          font-size: 0.85em;
        }
        
        .empty-block-hint {
          font-size: 0.7em;
        }
        
        .block-actions {
          padding: 0 8px;
        }
      }
      
      @media (max-width: 480px) {
        .block-item {
          grid-template-columns: 50px 1fr 60px;
          padding: 4px 0;
        }
        
        .area-indicator {
          padding: 0 4px;
        }
        
        .area-label {
          font-size: 0.65em;
        }
        
        .empty-block-preview {
          gap: 6px;
        }
        
        .empty-block-icon {
          width: 28px;
          height: 28px;
          font-size: 1em;
        }
        
        .empty-block-name {
          font-size: 0.8em;
        }
        
        .block-action {
          width: 28px;
          height: 28px;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .empty-block {
          background: rgba(var(--cf-primary-color-rgb), 0.05);
          border-color: rgba(var(--cf-primary-color-rgb), 0.3);
        }
        
        .empty-block-icon {
          background: rgba(var(--cf-primary-color-rgb), 0.15);
          color: var(--cf-text-secondary);
        }
        
        .recommended-entity {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .recommended-entity:hover {
          background: rgba(var(--cf-rgb-primary), 0.1);
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = {};
    this.hass = null;
    this.cardDefinition = {};
    this._editingBlockId = null;
    this._availableEntities = [];  // 新增
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();  // 新增
    }
  }

  render() {
    const blocks = this._getAllBlocks();
    const blockType = this.cardDefinition?.blockType || 'none';
    
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
    const isPresetBlock = block.presetKey;
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    
    // 区域处理：预设卡片固定为 content，其他使用配置的区域
    const area = isPresetCard ? 'content' : (block.area || 'content');
    
    // 权限判断
    const canDelete = blockType === 'custom' && !isPresetBlock;
    
    // 检查是否是空块
    const isEmptyBlock = !block.entity || block.entity.trim() === '';
    
    return html`
      <div class="block-item ${isPresetBlock ? 'preset-block' : ''} ${isEmptyBlock ? 'empty-block' : ''}">
        <!-- 区域标识 -->
        <div class="area-indicator">
          <div class="area-icon">
            <ha-icon icon="${this._getAreaIcon(area)}"></ha-icon>
          </div>
          <div class="area-label">
            ${this._getAreaLabel(area)}
          </div>
        </div>
        
        <!-- 块视图（区分空块和已配置块） -->
        <div class="block-view-container">
          ${isEmptyBlock ? html`
            <!-- 空块预览 -->
            <div class="empty-block-preview">
              <div class="empty-block-icon">
                <ha-icon icon="${block.icon || 'mdi:cube-outline'}"></ha-icon>
              </div>
              <div class="empty-block-info">
                <div class="empty-block-name">${block.name || '新块'}</div>
                <div class="empty-block-hint">点击编辑配置实体</div>
              </div>
            </div>
          ` : html`
            <!-- 已配置块预览 -->
            <block-base
              .block=${block}
              .hass=${this.hass}
              .compact=${true}
              .showName=${true}
              .showValue=${true}
            ></block-base>
          `}
        </div>
        
        <!-- 操作按钮 -->
        <div class="block-actions">
          <div class="block-action" @click=${() => this._startEdit(block.id)} title="编辑">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          
          ${canDelete ? html`
            <div class="block-action" @click=${(e) => this._deleteBlock(e, block.id)} title="删除">
              <ha-icon icon="mdi:delete"></ha-icon>
            </div>
          ` : html`
            <div class="block-action disabled" title="预设块不能删除">
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </div>
          `}
        </div>
      </div>
      
      ${isEditing ? html`
        <div class="edit-form-container">
          <block-edit-form
            .block=${block}
            .hass=${this.hass}
            .cardDefinition=${this.cardDefinition}
            @field-change=${(e) => this._handleFieldChange(block.id, e.detail)}
            @cancel=${this._cancelEdit}
            @save=${this._finishEdit}
          ></block-edit-form>
        </div>
      ` : ''}
    `;
  }

  _renderAddButton() {
    const blockType = this.cardDefinition?.blockType || 'none';
    const canAddNew = blockType === 'custom';
    
    if (!canAddNew) return '';
    
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
        添加新块
      </button>
    `;
  }

  _renderEmptyState() {
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    
    const message = isPresetCard 
      ? '此卡片使用预设块结构'
      : '还没有添加任何块';
    
    const description = isPresetCard
      ? '请为每个预设块配置对应的实体'
      : '块可以显示实体的状态值';
    
    // 获取推荐实体（仅限自定义卡片）
    const recommendedEntities = !isPresetCard ? this._getRecommendedEntities() : [];
    
    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <ha-icon icon="mdi:cube-outline"></ha-icon>
        </div>
        <div style="font-weight: 600; margin-bottom: 8px;">${message}</div>
        <div style="font-size: 0.9em; margin-bottom: 16px;">${description}</div>
        
        ${!isPresetCard && recommendedEntities.length > 0 ? html`
          <div style="font-size: 0.85em; color: var(--cf-text-secondary); margin-bottom: 8px;">
            推荐从以下实体开始：
          </div>
          <div class="recommended-entities">
            ${recommendedEntities.map(entity => html`
              <div 
                class="recommended-entity" 
                @click=${() => this._addBlockWithEntity(entity)}
                title="${entity.entityId}"
              >
                <ha-icon icon="${entity.icon}"></ha-icon>
                <span>${entity.name}</span>
              </div>
            `)}
          </div>
        ` : ''}
        
        ${this._renderAddButton()}
      </div>
    `;
  }

  // =========== 新增方法：智能实体处理 ===========

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }
    
    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`,
        friendlyName: state.attributes?.friendly_name || '',
        hasChinese: /[\u4e00-\u9fa5]/.test(state.attributes?.friendly_name || '')
      }))
      .sort((a, b) => {
        // 中文实体优先
        if (a.hasChinese && !b.hasChinese) return -1;
        if (!a.hasChinese && b.hasChinese) return 1;
        return a.label.localeCompare(b.label, 'zh-CN');
      });
  }

  _getRecommendedEntities() {
    if (!this.hass?.states || this._availableEntities.length === 0) return [];
    
    // 筛选中文实体作为推荐
    return this._availableEntities
      .filter(item => item.hasChinese)
      .slice(0, 5)  // 最多显示5个
      .map(item => {
        const domain = item.value.split('.')[0];
        const iconMap = {
          sensor: 'mdi:gauge',
          weather: 'mdi:weather-partly-cloudy',
          binary_sensor: 'mdi:toggle-switch',
          light: 'mdi:lightbulb',
          switch: 'mdi:power',
          climate: 'mdi:thermostat',
          vacuum: 'mdi:robot-vacuum',
          media_player: 'mdi:speaker'
        };
        
        return {
          entityId: item.value,
          name: item.friendlyName || item.value,
          icon: iconMap[domain] || 'mdi:gauge'
        };
      });
  }

  _addBlockWithEntity(entity) {
    const blockId = `block_${Date.now()}`;
    
    const newBlock = {
      entity: entity.entityId,
      name: entity.name,
      icon: entity.icon,
      area: 'content'
    };
    
    const currentBlocks = this.config.blocks || {};
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
    this._editingBlockId = blockId;
  }

  // =========== 修改的_addBlock方法 ===========

  _addBlock() {
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType !== 'custom') {
      alert('此卡片不支持添加新块');
      return;
    }
    
    const blockId = `block_${Date.now()}`;
    
    // 智能选择初始实体（方案1的核心）
    let initialEntity = '';
    let initialName = '新块';
    let initialIcon = 'mdi:cube-outline';
    
    if (this._availableEntities.length > 0) {
      // 优先选择中文实体
      const chineseEntity = this._availableEntities.find(e => e.hasChinese);
      
      if (chineseEntity) {
        initialEntity = chineseEntity.value;
        // 从友好名称中提取中文名
        const friendlyName = chineseEntity.friendlyName;
        if (friendlyName && friendlyName.trim()) {
          // 移除实体ID部分
          initialName = friendlyName.replace(/\(.*?\)/g, '').trim();
          
          // 如果名称太长，截断
          if (initialName.length > 20) {
            initialName = initialName.substring(0, 17) + '...';
          }
        }
        
        // 根据实体类型设置图标
        const domain = initialEntity.split('.')[0];
        const iconMap = {
          sensor: 'mdi:gauge',
          binary_sensor: 'mdi:toggle-switch',
          weather: 'mdi:weather-partly-cloudy',
          light: 'mdi:lightbulb',
          switch: 'mdi:power',
          climate: 'mdi:thermostat',
          vacuum: 'mdi:robot-vacuum',
          media_player: 'mdi:speaker',
          cover: 'mdi:blinds',
          text_sensor: 'mdi:text-box',
          person: 'mdi:account',
          device_tracker: 'mdi:account'
        };
        initialIcon = iconMap[domain] || 'mdi:cube-outline';
      }
    }
    
    const newBlock = {
      entity: initialEntity,
      name: initialName,
      icon: initialIcon,
      area: 'content'
    };
    
    const currentBlocks = this.config.blocks || {};
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
    this._editingBlockId = blockId;
  }

  // =========== 原有方法保持不变 ===========

  _getAllBlocks() {
    if (!this.config?.blocks) return [];
    return Object.entries(this.config.blocks).map(([id, config]) => ({
      id,
      ...config
    }));
  }

  _getAreaIcon(areaId) {
    const iconMap = {
      header: 'mdi:format-header-1',
      content: 'mdi:view-grid',
      footer: 'mdi:page-layout-footer'
    };
    return iconMap[areaId] || 'mdi:view-grid';
  }

  _getAreaLabel(areaId) {
    const labelMap = {
      header: '标题',
      content: '内容',
      footer: '页脚'
    };
    return labelMap[areaId] || '内容';
  }

  _handleFieldChange(blockId, { field, value }) {
    const currentBlocks = this.config.blocks || {};
    const currentBlock = currentBlocks[blockId] || {};
    
    // 如果是预设卡片，强制区域为 content
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset' && field === 'area') {
      value = 'content';
    }
    
    const newBlock = { ...currentBlock, [field]: value };
    const newBlocks = { ...currentBlocks, [blockId]: newBlock };
    
    this._fireConfigChange({ blocks: newBlocks });
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

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    const blockType = this.cardDefinition?.blockType || 'none';
    const block = (this.config.blocks || {})[blockId];
    
    // 检查权限
    if (blockType !== 'custom' || block?.presetKey) {
      alert('此块不能删除');
      return;
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