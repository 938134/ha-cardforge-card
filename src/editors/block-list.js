// src/editors/block-list.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockList extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    editingBlockId: { type: String }
  };

  static styles = [
    designSystem,
    css`
      .block-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      /* 四列网格布局 */
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
      }
    `
  ];

  render() {
    const blocks = this._getAllBlocks();
    
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
          <div class="cf-text-md cf-mb-sm">还没有添加任何块</div>
          <div class="cf-text-sm cf-text-secondary">点击下方按钮添加第一个块</div>
        </div>
      `;
    }

    return html`
      <div class="block-list">
        ${blocks.map(block => this._renderBlockItem(block))}
      </div>
    `;
  }

  _getAllBlocks() {
    if (!this.config.blocks) return [];
    
    return Object.entries(this.config.blocks)
      .map(([blockId, blockConfig]) => ({
        id: blockId,
        ...blockConfig
      }))
      .sort((a, b) => {
        const areaOrder = { 'header': 0, 'content': 1, 'footer': 2 };
        const orderA = areaOrder[a.area] ?? 1;
        const orderB = areaOrder[b.area] ?? 1;
        return orderA - orderB;
      });
  }

  _renderBlockItem(block) {
    const isEditing = this.editingBlockId === block.id;
    const displayName = this._getBlockDisplayName(block);
    const state = this._getBlockState(block);
    const icon = block.icon || this._getDefaultIcon(block);
    const areaInfo = this._getAreaInfo(block.area);

    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}"
           @click=${(e) => this._editBlock(e, block)}>
        
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
      </div>
    `;
  }

  _getBlockDisplayName(blockConfig) {
    // 如果有实体，使用实体友好名称
    if (blockConfig.entity && this.hass?.states[blockConfig.entity]) {
      const entity = this.hass.states[blockConfig.entity];
      return entity.attributes?.friendly_name || blockConfig.entity.split('.')[1] || '实体块';
    }
    
    // 根据内容生成名称
    if (blockConfig.content) {
      const content = String(blockConfig.content);
      return content.length > 15 ? content.substring(0, 15) + '...' : content;
    }
    
    return '内容块';
  }

  _getBlockState(blockConfig) {
    // 优先显示实体状态
    if (blockConfig.entity && this.hass?.states[blockConfig.entity]) {
      const entity = this.hass.states[blockConfig.entity];
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

  _editBlock(e, block) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId: block.id }
    }));
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('delete-block', {
      detail: { blockId }
    }));
  }
}

if (!customElements.get('block-list')) {
  customElements.define('block-list', BlockList);
}

export { BlockList };