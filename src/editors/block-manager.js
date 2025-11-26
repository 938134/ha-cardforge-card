// src/editors/block-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';

class BlockManager extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object }
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

      .block-item {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        position: relative;
        overflow: hidden;
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .block-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }

      .block-item.header-area::before {
        background: #2196F3; /* 蓝色 - 标题区域 */
      }

      .block-item.content-area::before {
        background: #4CAF50; /* 绿色 - 内容区域 */
      }

      .block-item.footer-area::before {
        background: #FF9800; /* 橙色 - 页脚区域 */
      }

      .block-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-badge {
        font-size: 0.7em;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: var(--cf-radius-sm);
        color: white;
      }

      .block-badge.header {
        background: #2196F3;
      }

      .block-badge.content {
        background: #4CAF50;
      }

      .block-badge.footer {
        background: #FF9800;
      }

      .block-title {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .block-icon {
        width: 24px;
        height: 24px;
        border-radius: var(--cf-radius-sm);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9em;
      }

      .block-preview {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
        margin-bottom: var(--cf-spacing-xs);
      }

      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .block-item:hover .block-actions {
        opacity: 1;
      }

      .block-action {
        width: 24px;
        height: 24px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
      }

      .block-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
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
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-lg);
        color: var(--cf-text-secondary);
        font-size: 0.9em;
      }

      .area-stats {
        display: none; /* 隐藏区域统计 */
      }
    `
  ];

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
          <ha-icon icon="mdi:cube-outline" style="font-size: 2em; opacity: 0.5; margin-bottom: var(--cf-spacing-sm);"></ha-icon>
          <div>暂无块</div>
          <div class="cf-text-xs cf-mt-xs">点击下方按钮添加块</div>
        </div>
      `;
    }

    // 按区域分组显示
    const headerBlocks = blocks.filter(block => block.area === 'header');
    const contentBlocks = blocks.filter(block => !block.area || block.area === 'content');
    const footerBlocks = blocks.filter(block => block.area === 'footer');

    return html`
      <div class="blocks-list">
        ${headerBlocks.map(block => this._renderBlockItem(block))}
        ${contentBlocks.map(block => this._renderBlockItem(block))}
        ${footerBlocks.map(block => this._renderBlockItem(block))}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const displayName = BlockSystem.getBlockDisplayName(block);
    const icon = BlockSystem.getBlockIcon(block);
    const preview = BlockSystem.getBlockPreview(block, this.hass);
    const areaClass = this._getAreaClass(block.area);
    const areaLabel = this._getAreaLabel(block.area);

    return html`
      <div class="block-item ${areaClass}" @click=${() => this._editBlock(block.id)}>
        <div class="block-header">
          <div class="block-title">
            <div class="block-icon">
              <ha-icon .icon=${icon}></ha-icon>
            </div>
            <span>${block.title || displayName}</span>
          </div>
          <div class="block-badge ${block.area || 'content'}">${areaLabel}</div>
        </div>
        
        <div class="block-preview">${preview}</div>
        
        <div class="block-actions">
          <div class="block-action" @click=${e => this._moveBlock(e, block.id)} title="移动区域">
            <ha-icon icon="mdi:arrow-all"></ha-icon>
          </div>
          <div class="block-action" @click=${e => this._deleteBlock(e, block.id)} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
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

  _getAreaClass(area) {
    const areaMap = {
      'header': 'header-area',
      'content': 'content-area', 
      'footer': 'footer-area'
    };
    return areaMap[area] || 'content-area';
  }

  _getAreaLabel(area) {
    const labelMap = {
      'header': '标题',
      'content': '内容',
      'footer': '页脚'
    };
    return labelMap[area] || '内容';
  }

  _editBlock(blockId) {
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId }
    }));
  }

  _addBlock() {
    this.dispatchEvent(new CustomEvent('add-block'));
  }

  _moveBlock(e, blockId) {
    e.stopPropagation();
    
    // 显示区域选择菜单
    const areas = [
      { id: 'header', label: '标题区域', color: '#2196F3' },
      { id: 'content', label: '内容区域', color: '#4CAF50' },
      { id: 'footer', label: '页脚区域', color: '#FF9800' }
    ];
    
    // 这里可以实现一个简单的区域选择对话框
    const currentArea = this.config.blocks[blockId]?.area || 'content';
    const newArea = prompt(`移动块到哪个区域？\n\n标题区域 | 内容区域 | 页脚区域`, currentArea);
    
    if (newArea && ['header', 'content', 'footer'].includes(newArea)) {
      this.config.blocks[blockId].area = newArea;
      this._notifyConfigUpdate();
    }
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    // 删除块配置
    delete this.config.blocks[blockId];
    
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { blocks: this.config.blocks } }
    }));
  }
}

if (!customElements.get('block-manager')) {
  customElements.define('block-manager', BlockManager);
}

export { BlockManager };