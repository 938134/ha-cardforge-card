// src/editors/layout-canvas.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockRegistry } from '../core/block-registry.js';

class LayoutCanvas extends LitElement {
  static properties = {
    blocks: { type: Array },
    hass: { type: Object },
    selectedBlock: { type: Object },
    _dragOverIndex: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .canvas-container {
        flex: 1;
        padding: var(--cf-spacing-md);
        overflow-y: auto;
        background: var(--cf-background);
        min-height: 400px;
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        min-height: 100px;
      }

      .block-render {
        background: var(--cf-surface);
        border: 2px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        position: relative;
      }

      .block-render:hover {
        border-color: var(--cf-primary-color);
      }

      .block-render.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-render.drag-over {
        border: 2px dashed var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.1);
      }

      .block-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
        padding-bottom: var(--cf-spacing-sm);
        border-bottom: 1px solid var(--cf-border);
      }

      .block-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .block-title {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .block-type {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-left: auto;
      }

      .block-content {
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }

      .drop-indicator {
        height: 2px;
        background: var(--cf-primary-color);
        margin: var(--cf-spacing-sm) 0;
        border-radius: 1px;
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .drop-indicator.visible {
        opacity: 1;
      }

      .drag-handle {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
        cursor: grab;
        color: var(--cf-text-secondary);
      }

      .block-render:hover .drag-handle {
        opacity: 1;
      }

      .drag-handle:active {
        cursor: grabbing;
      }
    `
  ];

  constructor() {
    super();
    this.blocks = [];
    this._dragOverIndex = -1;
  }

  render() {
    return html`
      <div 
        class="canvas-container"
        @dragover=${this._onDragOver}
        @drop=${this._onDrop}
        @dragleave=${this._onDragLeave}
      >
        ${this.blocks.length === 0 ? this._renderEmptyState() : this._renderBlocks()}
        
        <!-- 拖拽指示器 -->
        ${this._dragOverIndex >= 0 && this._dragOverIndex < this.blocks.length ? html`
          <div class="drop-indicator visible"></div>
        ` : ''}
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:package-variant" style="font-size: 3em; opacity: 0.5;"></ha-icon>
        <div class="cf-text-md cf-mt-md">从左侧选择块开始创建</div>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">或拖拽块到此处</div>
      </div>
    `;
  }

  _renderBlocks() {
    return html`
      <div class="blocks-list">
        ${this.blocks.map((block, index) => html`
          <!-- 拖拽指示器 -->
          ${this._dragOverIndex === index ? html`
            <div class="drop-indicator visible"></div>
          ` : ''}
          
          <div 
            class="block-render ${this.selectedBlock?.id === block.id ? 'selected' : ''}"
            @click=${() => this._selectBlock(block)}
            draggable="true"
            @dragstart=${e => this._onBlockDragStart(e, index)}
            @dragover=${e => this._onBlockDragOver(e, index)}
            @dragleave=${this._onBlockDragLeave}
            @drop=${e => this._onBlockDrop(e, index)}
            @dragend=${this._onBlockDragEnd}
          >
            <!-- 拖拽手柄 -->
            <div class="drag-handle" @mousedown=${e => e.stopPropagation()}>
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            
            ${this._renderBlockContent(block)}
          </div>
        `)}
      </div>
    `;
  }

  _renderBlockContent(block) {
    const blockInstance = blockRegistry.createBlockInstance(block.type);
    if (!blockInstance) return html`<div>未知块类型: ${block.type}</div>`;
    
    const manifest = blockInstance.getManifest();
    
    try {
      const template = blockInstance.render(block.config, this.hass);
      return html`
        <div class="block-header">
          <div class="block-icon">${manifest.icon}</div>
          <div class="block-title">${manifest.name}</div>
          <div class="block-type">${block.type}</div>
        </div>
        <div class="block-content">
          ${template}
        </div>
      `;
    } catch (error) {
      return html`<div class="cf-error">渲染错误: ${error.message}</div>`;
    }
  }

  _selectBlock(block) {
    this.dispatchEvent(new CustomEvent('block-selected', {
      detail: { block }
    }));
  }

  _onDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer.types.includes('text/plain')) {
      event.dataTransfer.dropEffect = 'copy';
      this._dragOverIndex = this.blocks.length;
    }
  }

  _onDrop(event) {
    event.preventDefault();
    const blockType = event.dataTransfer.getData('text/plain');
    
    if (blockType) {
      const newBlock = {
        id: `block_${Date.now()}`,
        type: blockType,
        config: {}
      };
      
      const newBlocks = [...this.blocks];
      const insertIndex = this._dragOverIndex >= 0 ? this._dragOverIndex : newBlocks.length;
      newBlocks.splice(insertIndex, 0, newBlock);
      
      this.dispatchEvent(new CustomEvent('blocks-changed', {
        detail: { blocks: newBlocks }
      }));
      
      this._selectBlock(newBlock);
    }
    
    this._dragOverIndex = -1;
  }

  _onDragLeave() {
    this._dragOverIndex = -1;
  }

  _onBlockDragStart(event, index) {
    event.dataTransfer.setData('text/plain', 'move');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify({ index }));
  }

  _onBlockDragOver(event, index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this._dragOverIndex = index;
  }

  _onBlockDragLeave() {
    this._dragOverIndex = -1;
  }

  _onBlockDrop(event, toIndex) {
    event.preventDefault();
    
    const data = event.dataTransfer.getData('application/json');
    if (data) {
      const { index: fromIndex } = JSON.parse(data);
      
      if (fromIndex !== toIndex) {
        this.dispatchEvent(new CustomEvent('block-moved', {
          detail: { fromIndex, toIndex }
        }));
      }
    }
    
    this._dragOverIndex = -1;
  }

  _onBlockDragEnd() {
    this._dragOverIndex = -1;
  }
}

if (!customElements.get('layout-canvas')) {
  customElements.define('layout-canvas', LayoutCanvas);
}

export { LayoutCanvas };