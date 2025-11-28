// src/editors/block-list.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';

class BlockList extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    editorState: { type: Object },
    _touchStartX: { state: true },
    _swipeThreshold: { state: true },
    _entityStates: { state: true } // 新增：实体状态缓存
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

      .block-item {
        display: grid;
        grid-template-columns: 40px 48px 1fr 60px;
        gap: var(--cf-spacing-sm);
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm);
        transition: all var(--cf-transition-fast);
        min-height: 70px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
        transform: translateY(-1px);
      }

      .block-item.editing {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
        box-shadow: 0 0 0 2px var(--cf-primary-color);
      }

      /* 滑动删除效果 */
      .block-item.swiping {
        transition: transform 0.2s ease;
      }

      .slide-actions {
        position: absolute;
        right: -80px;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        padding: 0 var(--cf-spacing-sm);
        background: var(--cf-error-color);
        border-radius: var(--cf-radius-md);
        transition: right 0.2s ease;
      }

      .block-item.swipe-active .slide-actions {
        right: 0;
      }

      .delete-btn {
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: var(--cf-radius-sm);
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        color: var(--cf-error-color);
        font-size: 0.8em;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
      }

      /* 区域标识 */
      .area-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
      }

      .area-letter {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
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

      /* 图标 */
      .block-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        transition: all var(--cf-transition-fast);
      }

      .block-item:hover .block-icon {
        background: rgba(var(--cf-rgb-primary), 0.2);
        transform: scale(1.05);
      }

      /* 块信息 - 两行布局 */
      .block-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
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
        opacity: 0.6;
        transition: opacity var(--cf-transition-fast);
      }

      .block-item:hover .block-actions {
        opacity: 1;
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
        transition: all var(--cf-transition-fast);
      }

      .block-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
        transform: scale(1.1);
      }

      .block-action.delete:hover {
        background: var(--cf-error-color);
      }

      /* 添加块按钮 */
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
      @media (max-width: 600px) {
        .block-item {
          grid-template-columns: 36px 40px 1fr 56px;
          gap: var(--cf-spacing-xs);
          padding: var(--cf-spacing-xs);
          min-height: 64px;
        }

        .block-icon {
          width: 36px;
          height: 36px;
          font-size: 1.1em;
        }

        .block-name {
          font-size: 0.85em;
        }

        .block-state {
          font-size: 0.75em;
        }

        .block-action {
          width: 28px;
          height: 28px;
        }
      }
    `
  ];

  constructor() {
    super();
    this._touchStartX = 0;
    this._swipeThreshold = 50;
    this._entityStates = new Map(); // 初始化实体状态缓存
  }

  // 新增：监听 hass 状态变化
  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      this._updateEntityStates();
    }
  }

  // 新增：更新实体状态缓存
  _updateEntityStates() {
    if (!this.hass || !this.config.blocks) return;

    const entityStates = new Map();
    Object.values(this.config.blocks).forEach(block => {
      if (block.entity && this.hass.states[block.entity]) {
        const entity = this.hass.states[block.entity];
        entityStates.set(block.entity, {
          state: entity.state,
          unit: entity.attributes?.unit_of_measurement || '',
          friendlyName: entity.attributes?.friendly_name || block.entity
        });
      }
    });
    
    this._entityStates = entityStates;
  }

  _getAllBlocks() {
    if (!this.config.blocks) return [];
    
    return Object.entries(this.config.blocks).map(([blockId, blockConfig]) => ({
      id: blockId,
      ...blockConfig
    }));
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

  _renderBlocksContainer(blocks) {
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
          <div class="cf-text-md cf-mb-sm">还没有任何块</div>
          <div class="cf-text-sm cf-text-secondary">点击下方按钮添加第一个块</div>
        </div>
      `;
    }

    // 按区域排序：标题 → 内容 → 页脚
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
    const displayName = block.title || BlockSystem.getBlockDisplayName(block);
    const icon = block.icon || BlockSystem.getBlockIcon(block);
    
    // 使用缓存的实体状态或实时获取
    let state = '';
    if (block.entity) {
      const entityInfo = this._entityStates.get(block.entity);
      if (entityInfo) {
        state = this._formatEntityState(block.entity, entityInfo.state, entityInfo.unit);
      } else if (this.hass?.states[block.entity]) {
        // 如果缓存中没有，实时获取
        const entity = this.hass.states[block.entity];
        const unit = entity.attributes?.unit_of_measurement || '';
        state = this._formatEntityState(block.entity, entity.state, unit);
      } else {
        state = '实体未找到';
      }
    } else {
      state = block.title || '点击配置';
    }
    
    const areaInfo = this._getAreaInfo(block.area);
    const isEditing = this.editorState?.editingBlockId === block.id;

    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}"
           data-block-id="${block.id}"
           @click=${() => this._editBlock(block.id, block.area)}
           @touchstart=${(e) => this._onTouchStart(e, block.id)}
           @touchmove=${this._onTouchMove}
           @touchend=${this._onTouchEnd}
           @touchcancel=${this._onTouchEnd}>
        
        <!-- 滑动删除操作 -->
        <div class="slide-actions">
          <button class="delete-btn" @click=${(e) => this._deleteBlock(e, block.id)}>
            删除
          </button>
        </div>

        <!-- 区域标识 -->
        <div class="area-badge">
          <div class="area-letter ${block.area || 'content'}">${areaInfo.letter}</div>
        </div>

        <!-- 图标 -->
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>

        <!-- 名称与状态 - 两行布局 -->
        <div class="block-info">
          <div class="block-name">${displayName}</div>
          <div class="block-state">${state}</div>
        </div>

        <!-- 操作按钮 -->
        <div class="block-actions">
          <div class="block-action delete" @click=${e => this._deleteBlock(e, block.id)} title="删除块">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  // 新增：格式化实体状态显示
  _formatEntityState(entityId, state, unit) {
    const entityType = entityId.split('.')[0];
    
    switch (entityType) {
      case 'light':
      case 'switch':
        return state === 'on' ? '开启' : '关闭';
      case 'climate':
        return this._formatClimateState(state, this.hass.states[entityId]);
      case 'cover':
        return state === 'open' ? '打开' : state === 'closed' ? '关闭' : state;
      default:
        return `${state}${unit ? ' ' + unit : ''}`;
    }
  }

  // 新增：格式化空调状态
  _formatClimateState(state, entity) {
    if (state === 'off') return '关闭';
    
    const temp = entity?.attributes?.temperature;
    const mode = entity?.attributes?.hvac_mode;
    
    const modeText = {
      'heat': '制热',
      'cool': '制冷',
      'auto': '自动',
      'fan_only': '仅风扇'
    }[mode] || mode;
    
    return temp ? `${modeText} ${temp}°C` : modeText;
  }

  _renderAddBlockButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus"></ha-icon>
        添加块
      </button>
    `;
  }

  _getAreaInfo(area) {
    const areaMap = {
      'header': { letter: 'H', fullText: '标题', color: '#2196F3' },
      'content': { letter: 'C', fullText: '内容', color: '#4CAF50' },
      'footer': { letter: 'F', fullText: '页脚', color: '#FF9800' }
    };
    return areaMap[area] || areaMap.content;
  }

  _editBlock(blockId, area = 'content') {
    // 设置编辑状态
    this.dispatchEvent(new CustomEvent('editor-state-changed', {
      detail: {
        state: {
          editingBlockId: blockId,
          editingArea: area,
          tempConfig: this.config.blocks[blockId] ? {...this.config.blocks[blockId]} : null
        }
      }
    }));
  }

  _addBlock() {
    const area = prompt('请选择要添加到的区域：\n\n输入: H(标题) / C(内容) / F(页脚)', 'C');
    
    if (!area) return;
    
    const areaMap = { 'H': 'header', 'C': 'content', 'F': 'footer' };
    const areaName = areaMap[area.toUpperCase()] || 'content';
    
    const blockId = `block_${Date.now()}`;
    
    // 使用简化的块配置
    const blockConfig = {
      area: areaName,
      title: '',
      entity: '',
      icon: ''
    };
    
    if (!this.config.blocks) {
      this.config.blocks = {};
    }
    
    this.config.blocks[blockId] = blockConfig;
    
    // 直接进入编辑模式
    this._editBlock(blockId, areaName);
    this._notifyConfigUpdate();
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    delete this.config.blocks[blockId];
    
    // 如果删除的是当前编辑的块，清除编辑状态
    if (this.editorState?.editingBlockId === blockId) {
      this.dispatchEvent(new CustomEvent('editor-state-changed', {
        detail: {
          state: {
            editingBlockId: null,
            tempConfig: null
          }
        }
      }));
    }
    
    this._notifyConfigUpdate();
  }

  // 滑动删除相关方法
  _onTouchStart(e, blockId) {
    this._touchStartX = e.touches[0].clientX;
    this._currentBlockId = blockId;
    e.currentTarget.classList.add('swiping');
  }

  _onTouchMove(e) {
    if (!this._touchStartX) return;
    
    const touchX = e.touches[0].clientX;
    const diffX = this._touchStartX - touchX;
    
    if (diffX > 0) {
      // 向左滑动
      e.currentTarget.style.transform = `translateX(-${Math.min(diffX, 80)}px)`;
      
      if (diffX > this._swipeThreshold) {
        e.currentTarget.classList.add('swipe-active');
      } else {
        e.currentTarget.classList.remove('swipe-active');
      }
    }
  }

  _onTouchEnd(e) {
    if (!this._touchStartX) return;
    
    const touchX = e.changedTouches[0].clientX;
    const diffX = this._touchStartX - touchX;
    
    if (diffX > this._swipeThreshold) {
      // 滑动距离足够，保持删除状态
      e.currentTarget.style.transform = 'translateX(-80px)';
    } else {
      // 滑动距离不足，恢复原位
      e.currentTarget.style.transform = 'translateX(0)';
      e.currentTarget.classList.remove('swipe-active');
    }
    
    e.currentTarget.classList.remove('swiping');
    this._touchStartX = 0;
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { blocks: this.config.blocks } }
    }));
    
    // 配置更新后重新计算实体状态
    this._updateEntityStates();
  }
}

if (!customElements.get('block-list')) {
  customElements.define('block-list', BlockList);
}

export { BlockList };
