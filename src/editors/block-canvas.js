// src/editors/block-canvas.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { BlockRegistry } from '../blocks/block-registry.js';
import { designSystem } from '../core/design-system.js';

class BlockCanvas extends LitElement {
  static properties = {
    blocks: { type: Array },
    layout: { type: String },
    gridConfig: { type: Object },
    selectedBlock: { type: Object },
    _previewMode: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-canvas {
        height: 100%;
        padding: var(--cf-spacing-lg);
        position: relative;
      }

      .canvas-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-lg);
        padding-bottom: var(--cf-spacing-md);
        border-bottom: 1px solid var(--cf-border);
      }

      .toolbar-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .toolbar-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
      }

      .preview-toggle {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .canvas-content {
        height: calc(100% - 60px);
        overflow: auto;
      }

      /* 网格布局 */
      .grid-layout {
        display: grid;
        gap: var(--cf-spacing-md);
        min-height: 400px;
      }

      .grid-block {
        position: relative;
        transition: all var(--cf-transition-fast);
      }

      .grid-block.selected {
        outline: 2px solid var(--cf-primary-color);
        outline-offset: 2px;
        border-radius: var(--cf-radius-md);
      }

      .grid-block:hover {
        transform: translateY(-2px);
      }

      .block-actions {
        position: absolute;
        top: -8px;
        right: -8px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .grid-block:hover .block-actions {
        opacity: 1;
      }

      .block-action {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
      }

      .block-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
        transform: scale(1.1);
      }

      .block-action.remove:hover {
        background: var(--cf-error-color);
        border-color: var(--cf-error-color);
      }

      /* 弹性布局 */
      .flex-layout {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-md);
        align-content: flex-start;
      }

      .flex-block {
        flex: 1;
        min-width: 150px;
        max-width: 300px;
      }

      /* 绝对定位布局 */
      .absolute-layout {
        position: relative;
        height: 500px;
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

      .absolute-block {
        position: absolute;
        min-width: 100px;
        min-height: 60px;
        cursor: move;
      }

      .absolute-block.selected {
        outline: 2px solid var(--cf-primary-color);
        z-index: 10;
      }

      .position-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--cf-primary-color);
        border-radius: 50%;
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .absolute-block:hover .position-handle {
        opacity: 1;
      }

      .handle-nw { top: -4px; left: -4px; cursor: nw-resize; }
      .handle-ne { top: -4px; right: -4px; cursor: ne-resize; }
      .handle-sw { bottom: -4px; left: -4px; cursor: sw-resize; }
      .handle-se { bottom: -4px; right: -4px; cursor: se-resize; }

      .empty-canvas {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .drop-zone {
        border: 2px dashed var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-xl);
        text-align: center;
        margin: var(--cf-spacing-md);
      }

      .block-preview {
        pointer-events: none;
      }

      .block-edit .block-container {
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .canvas-toolbar {
          flex-direction: column;
          gap: var(--cf-spacing-md);
          align-items: stretch;
        }
        
        .flex-block {
          min-width: 100%;
        }
        
        .absolute-layout {
          height: 300px;
        }
      }
    `
  ];

  constructor() {
    super();
    this.blocks = [];
    this.layout = 'grid';
    this.gridConfig = { columns: 4, gap: '8px' };
    this._previewMode = false;
  }

  render() {
    return html`
      <div class="block-canvas">
        <div class="canvas-toolbar">
          <div class="toolbar-title">
            ${this._getLayoutName()}布局
            ${this.blocks.length > 0 ? html`<span class="cf-text-secondary">(${this.blocks.length}个块)</span>` : ''}
          </div>
          
          <div class="toolbar-actions">
            <div class="preview-toggle">
              <ha-switch
                .checked=${this._previewMode}
                @change=${e => this._previewMode = e.target.checked}
              ></ha-switch>
              <span class="cf-text-sm">预览模式</span>
            </div>
          </div>
        </div>

        <div class="canvas-content">
          ${this._renderLayout()}
        </div>
      </div>
    `;
  }

  _renderLayout() {
    if (this.blocks.length === 0) {
      return this._renderEmptyState();
    }

    switch (this.layout) {
      case 'grid':
        return this._renderGridLayout();
      case 'flex':
        return this._renderFlexLayout();
      case 'absolute':
        return this._renderAbsoluteLayout();
      default:
        return this._renderGridLayout();
    }
  }

  _renderGridLayout() {
    const gridStyle = `
      grid-template-columns: repeat(${this.gridConfig.columns}, 1fr);
      gap: ${this.gridConfig.gap};
    `;

    return html`
      <div class="grid-layout" style="${gridStyle}">
        ${this.blocks.map(block => this._renderBlock(block))}
      </div>
    `;
  }

  _renderFlexLayout() {
    return html`
      <div class="flex-layout">
        ${this.blocks.map(block => this._renderBlock(block, 'flex-block'))}
      </div>
    `;
  }

  _renderAbsoluteLayout() {
    return html`
      <div class="absolute-layout">
        ${this.blocks.map(block => this._renderAbsoluteBlock(block))}
      </div>
    `;
  }

  _renderBlock(block, additionalClass = '') {
    const isSelected = this.selectedBlock?.id === block.id;
    const modeClass = this._previewMode ? 'block-preview' : 'block-edit';

    try {
      const blockHtml = BlockRegistry.render(block, this.hass);
      const blockStyles = BlockRegistry.getStyles(block);

      return html`
        <div 
          class="grid-block ${additionalClass} ${modeClass} ${isSelected ? 'selected' : ''}"
          @click=${() => this._selectBlock(block)}
        >
          ${!this._previewMode ? html`
            <div class="block-actions">
              <div class="block-action remove" @click=${e => this._removeBlock(e, block.id)} title="删除">
                <ha-icon icon="mdi:close"></ha-icon>
              </div>
            </div>
          ` : ''}
          
          ${unsafeHTML(blockHtml)}
          <style>${blockStyles}</style>
        </div>
      `;
    } catch (error) {
      return this._renderBlockError(block, error);
    }
  }

  _renderAbsoluteBlock(block) {
    const position = block.position || { x: 0, y: 0, w: 1, h: 1 };
    const isSelected = this.selectedBlock?.id === block.id;
    const style = `
      left: ${position.x * 20}%;
      top: ${position.y * 20}%;
      width: ${position.w * 20}%;
      height: ${position.h * 20}%;
    `;

    return html`
      <div 
        class="absolute-block ${isSelected ? 'selected' : ''}"
        style="${style}"
        @click=${() => this._selectBlock(block)}
      >
        ${this._renderBlock(block)}
        
        ${!this._previewMode && isSelected ? html`
          <div class="position-handle handle-nw" @mousedown=${e => this._startResize(e, block, 'nw')}></div>
          <div class="position-handle handle-ne" @mousedown=${e => this._startResize(e, block, 'ne')}></div>
          <div class="position-handle handle-sw" @mousedown=${e => this._startResize(e, block, 'sw')}></div>
          <div class="position-handle handle-se" @mousedown=${e => this._startResize(e, block, 'se')}></div>
        ` : ''}
      </div>
    `;
  }

  _renderBlockError(block, error) {
    return html`
      <div class="grid-block error">
        <div class="block-container cf-error">
          <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">渲染失败</div>
            <div class="cf-text-xs">${block.type}</div>
          </div>
        </div>
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-canvas">
        <ha-icon icon="mdi:view-grid-outline" style="font-size: 4em; opacity: 0.2;"></ha-icon>
        <div class="cf-text-lg cf-mt-md cf-text-secondary">画布为空</div>
        <div class="cf-text-sm cf-mt-sm">从左侧面板添加内容块开始创建</div>
        
        ${!this._previewMode ? html`
          <div class="drop-zone cf-mt-lg">
            <ha-icon icon="mdi:arrow-down-circle" style="font-size: 2em;"></ha-icon>
            <div class="cf-text-md cf-mt-sm">或拖拽块类型到此处</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _getLayoutName() {
    const names = {
      'grid': '网格',
      'flex': '弹性',
      'absolute': '绝对'
    };
    return names[this.layout] || this.layout;
  }

  _selectBlock(block) {
    if (this._previewMode) return;
    
    this.dispatchEvent(new CustomEvent('block-selected', {
      detail: { block }
    }));
  }

  _removeBlock(e, blockId) {
    e.stopPropagation();
    
    if (confirm('确定要删除这个块吗？')) {
      this.dispatchEvent(new CustomEvent('block-removed', {
        detail: { blockId }
      }));
    }
  }

  _startResize(e, block, direction) {
    e.stopPropagation();
    // 实现调整大小逻辑
  }

  firstUpdated() {
    this.addEventListener('dragover', this._onDragOver);
    this.addEventListener('drop', this._onDrop);
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  _onDrop(e) {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('text/plain');
    
    if (blockType) {
      this.dispatchEvent(new CustomEvent('block-added', {
        detail: { type: blockType }
      }));
    }
  }
}

if (!customElements.get('block-canvas')) {
  customElements.define('block-canvas', BlockCanvas);
}

export { BlockCanvas };