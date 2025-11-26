// src/editors/area-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';

class AreaEditor extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _expandedAreas: { state: true },
    _blocksByArea: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .area-editor {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .area-section {
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        overflow: hidden;
      }

      .area-header {
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .area-header:hover {
        background: rgba(var(--cf-rgb-primary), 0.1);
      }

      .area-title {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .area-badge {
        background: var(--cf-primary-color);
        color: white;
        padding: 2px 8px;
        border-radius: var(--cf-radius-sm);
        font-size: 0.8em;
        font-weight: 500;
      }

      .area-content {
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
      }

      .blocks-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .block-item {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .block-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--cf-radius-sm);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 0.9em;
      }

      .block-info {
        flex: 1;
        min-width: 0;
      }

      .block-title {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .block-preview {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .block-area {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-left: auto;
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
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }
    `
  ];

  constructor() {
    super();
    this._expandedAreas = {
      header: true,
      content: true,
      footer: false
    };
    this._blocksByArea = {
      header: [],
      content: [],
      footer: []
    };
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._groupBlocksByArea();
    }
  }

  _groupBlocksByArea() {
    const blocksByArea = {
      header: [],
      content: [],
      footer: []
    };
    
    Object.entries(this.config.blocks || {}).forEach(([blockId, blockConfig]) => {
      const area = blockConfig.area || 'content';
      if (blocksByArea[area]) {
        blocksByArea[area].push({ id: blockId, ...blockConfig });
      }
    });
    
    this._blocksByArea = blocksByArea;
  }

  render() {
    const areas = [
      { id: 'header', name: '标题区域', icon: 'mdi:header', description: '卡片顶部区域' },
      { id: 'content', name: '内容区域', icon: 'mdi:view-grid', description: '卡片主要内容区域' },
      { id: 'footer', name: '页脚区域', icon: 'mdi:footer', description: '卡片底部区域' }
    ];

    return html`
      <div class="area-editor">
        ${areas.map(area => this._renderAreaSection(area))}
      </div>
    `;
  }

  _renderAreaSection(area) {
    const blocks = this._blocksByArea[area.id] || [];
    const isExpanded = this._expandedAreas[area.id];
    const blockCount = blocks.length;

    return html`
      <div class="area-section">
        <div class="area-header" @click=${() => this._toggleArea(area.id)}>
          <div class="area-title">
            <ha-icon .icon=${area.icon}></ha-icon>
            <span>${area.name}</span>
            <span class="area-badge">${blockCount}</span>
          </div>
          <ha-icon .icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        
        ${isExpanded ? html`
          <div class="area-content">
            ${this._renderBlocksSection(area.id, blocks)}
            ${this._renderAddBlockButton(area.id)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderBlocksSection(areaId, blocks) {
    if (blocks.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:cube-outline" style="font-size: 2em; opacity: 0.5; margin-bottom: var(--cf-spacing-sm);"></ha-icon>
          <div>暂无块</div>
          <div class="cf-text-xs cf-mt-xs">点击下方按钮添加块</div>
        </div>
      `;
    }

    return html`
      <div class="blocks-section">
        ${blocks.map(block => this._renderBlockItem(block))}
      </div>
    `;
  }

  _renderBlockItem(block) {
    const displayName = BlockSystem.getBlockDisplayName(block);
    const icon = BlockSystem.getBlockIcon(block);
    const preview = BlockSystem.getBlockPreview(block, this.hass);
    const areaNames = {
      'header': '标题',
      'content': '内容', 
      'footer': '页脚'
    };

    return html`
      <div class="block-item" @click=${() => this._editBlock(block.id)}>
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="block-info">
          <div class="block-title">${block.title || displayName}</div>
          <div class="block-preview">${preview}</div>
        </div>
        <div class="block-area">${areaNames[block.area || 'content']}</div>
        <div class="block-actions">
          <div class="block-action" @click=${e => this._moveBlock(e, block.id)} title="移动区域">
            <ha-icon icon="mdi:swap-horizontal"></ha-icon>
          </div>
          <div class="block-action" @click=${e => this._deleteBlock(e, block.id)} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  _renderAddBlockButton(areaId) {
    return html`
      <button class="add-block-btn" @click=${() => this._addBlock(areaId)}>
        <ha-icon icon="mdi:plus"></ha-icon>
        添加块到${this._getAreaName(areaId)}
      </button>
    `;
  }

  _getAreaName(areaId) {
    const names = {
      'header': '标题区域',
      'content': '内容区域',
      'footer': '页脚区域'
    };
    return names[areaId] || '区域';
  }

  _toggleArea(areaId) {
    this._expandedAreas[areaId] = !this._expandedAreas[areaId];
    this.requestUpdate();
  }

  _editBlock(blockId) {
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId }
    }));
  }

  _moveBlock(e, blockId) {
    e.stopPropagation();
    
    const currentArea = this.config.blocks[blockId]?.area || 'content';
    const areas = ['header', 'content', 'footer'];
    const currentIndex = areas.indexOf(currentArea);
    const nextArea = areas[(currentIndex + 1) % areas.length];
    
    this.config.blocks[blockId].area = nextArea;
    this._groupBlocksByArea();
    this._notifyConfigUpdate();
  }

  _addBlock(areaId) {
    const blockId = `block_${Date.now()}`;
    const blockConfig = BlockSystem.createBlock();
    blockConfig.area = areaId; // 设置区域属性
    
    this.dispatchEvent(new CustomEvent('add-block', {
      detail: {
        area: areaId,
        blockId,
        blockConfig
      }
    }));
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个块吗？')) return;
    
    // 删除块配置
    delete this.config.blocks[blockId];
    
    this._groupBlocksByArea();
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { blocks: this.config.blocks } }
    }));
  }
}

if (!customElements.get('area-editor')) {
  customElements.define('area-editor', AreaEditor);
}

export { AreaEditor };