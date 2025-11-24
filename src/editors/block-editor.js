// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockRegistry } from '../core/block-registry.js';
import './block-palette.js';
import './layout-canvas.js';
import './block-properties.js';

class BlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _blocks: { state: true },
    _selectedBlock: { state: true },
    _initialized: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: grid;
        grid-template-columns: 200px 1fr 280px;
        gap: var(--cf-spacing-md);
        height: 600px;
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
      }

      .palette-section {
        background: var(--cf-surface);
        border-right: 1px solid var(--cf-border);
        overflow-y: auto;
      }

      .canvas-section {
        background: var(--cf-background);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .properties-section {
        background: var(--cf-surface);
        border-left: 1px solid var(--cf-border);
        overflow-y: auto;
      }

      .section-header {
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-bottom: 1px solid var(--cf-border);
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      @media (max-width: 1024px) {
        .editor-container {
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr auto;
          height: auto;
        }
        
        .palette-section, .properties-section {
          border: none;
          border-bottom: 1px solid var(--cf-border);
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = { 
      type: 'custom:ha-cardforge-card',
      blocks: [],
      layout: 'vertical',
      theme: 'auto'
    };
    this._blocks = [];
    this._selectedBlock = null;
    this._initialized = false;
  }

  async firstUpdated() {
    await blockRegistry.initialize();
    this._initialized = true;
    
    if (this.config.blocks) {
      this._blocks = [...this.config.blocks];
    }
  }

  setConfig(config) {
    this.config = { 
      type: 'custom:ha-cardforge-card',
      blocks: [],
      layout: 'vertical',
      theme: 'auto',
      ...config 
    };
    
    if (this.config.blocks && this._initialized) {
      this._blocks = [...this.config.blocks];
    }
  }

  render() {
    if (!this._initialized) {
      return html`<div class="cf-loading">初始化编辑器...</div>`;
    }

    return html`
      <div class="editor-container">
        <!-- 左侧：块选择面板 -->
        <div class="palette-section">
          <div class="section-header">块选择</div>
          <block-palette
            @block-selected=${this._onBlockSelected}
          ></block-palette>
        </div>

        <!-- 中间：布局画布 -->
        <div class="canvas-section">
          <div class="section-header">布局画布</div>
          <layout-canvas
            .blocks=${this._blocks}
            .hass=${this.hass}
            .selectedBlock=${this._selectedBlock}
            @block-selected=${this._onCanvasBlockSelected}
            @blocks-changed=${this._onBlocksChanged}
            @block-moved=${this._onBlockMoved}
          ></layout-canvas>
        </div>

        <!-- 右侧：属性面板 -->
        <div class="properties-section">
          <div class="section-header">属性设置</div>
          <block-properties
            .block=${this._selectedBlock}
            .hass=${this.hass}
            @block-updated=${this._onBlockUpdated}
            @block-removed=${this._onBlockRemoved}
          ></block-properties>
        </div>
      </div>
    `;
  }

  _onBlockSelected(e) {
    const blockType = e.detail.blockType;
    const newBlock = {
      id: `block_${Date.now()}`,
      type: blockType,
      config: {}
    };
    
    this._blocks = [...this._blocks, newBlock];
    this._selectedBlock = newBlock;
    this._notifyConfigUpdate();
  }

  _onCanvasBlockSelected(e) {
    this._selectedBlock = e.detail.block;
  }

  _onBlocksChanged(e) {
    this._blocks = e.detail.blocks;
    this._notifyConfigUpdate();
  }

  _onBlockMoved(e) {
    const { fromIndex, toIndex } = e.detail;
    const newBlocks = [...this._blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    
    this._blocks = newBlocks;
    this._notifyConfigUpdate();
  }

  _onBlockUpdated(e) {
    const updatedBlock = e.detail.block;
    this._blocks = this._blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._selectedBlock = updatedBlock;
    this._notifyConfigUpdate();
  }

  _onBlockRemoved(e) {
    const blockId = e.detail.blockId;
    this._blocks = this._blocks.filter(block => block.id !== blockId);
    
    if (this._selectedBlock?.id === blockId) {
      this._selectedBlock = null;
    }
    
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    const configToSend = {
      type: 'custom:ha-cardforge-card',
      ...this.config,
      blocks: this._blocks
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
    }));
  }
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}

export { BlockEditor };