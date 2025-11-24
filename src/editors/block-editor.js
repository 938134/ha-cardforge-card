// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { BlockRegistry } from '../blocks/block-registry.js';
import { designSystem } from '../core/design-system.js';
import './block-palette.js';
import './block-canvas.js';
import './block-inspector.js';
import './layout-toolbar.js';

class BlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _blocks: { state: true },
    _selectedBlock: { state: true },
    _activeTab: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        max-width: 100%;
      }

      .editor-header {
        background: var(--cf-surface);
        border-bottom: 1px solid var(--cf-border);
        padding: var(--cf-spacing-lg);
      }

      .editor-title {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0;
      }

      .editor-body {
        display: grid;
        grid-template-columns: 280px 1fr 320px;
        gap: var(--cf-spacing-lg);
        min-height: 600px;
      }

      .editor-sidebar {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
      }

      .editor-main {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        min-height: 500px;
      }

      .editor-inspector {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .empty-icon {
        font-size: 3em;
        opacity: 0.3;
        margin-bottom: var(--cf-spacing-md);
      }

      @media (max-width: 1200px) {
        .editor-body {
          grid-template-columns: 250px 1fr;
        }
        
        .editor-inspector {
          grid-column: 1 / -1;
          order: 3;
        }
      }

      @media (max-width: 768px) {
        .editor-body {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
        }
        
        .editor-sidebar {
          order: 2;
        }
        
        .editor-main {
          order: 1;
          min-height: 400px;
        }
        
        .editor-inspector {
          order: 3;
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = {};
    this._blocks = [];
    this._selectedBlock = null;
    this._activeTab = 'blocks';
  }

  setConfig(config) {
    this.config = {
      type: 'custom:ha-cardforge-card',
      layout: 'grid',
      theme: 'auto',
      grid: { columns: 4, gap: '8px' },
      blocks: [],
      ...config
    };
    this._blocks = [...(this.config.blocks || [])];
  }

  render() {
    return html`
      <div class="editor-container">
        <div class="editor-header">
          <h2 class="editor-title">卡片工坊编辑器</h2>
          <layout-toolbar
            .layout=${this.config.layout}
            .gridConfig=${this.config.grid}
            @layout-changed=${this._onLayoutChanged}
          ></layout-toolbar>
        </div>
        
        <div class="editor-body">
          <!-- 左侧：块面板 -->
          <div class="editor-sidebar">
            <block-palette
              @block-added=${this._onBlockAdded}
            ></block-palette>
          </div>
          
          <!-- 中间：编辑画布 -->
          <div class="editor-main">
            ${this._blocks.length > 0 ? html`
              <block-canvas
                .blocks=${this._blocks}
                .layout=${this.config.layout}
                .gridConfig=${this.config.grid}
                .selectedBlock=${this._selectedBlock}
                @block-selected=${this._onBlockSelected}
                @blocks-reordered=${this._onBlocksReordered}
                @block-removed=${this._onBlockRemoved}
              ></block-canvas>
            ` : html`
              <div class="empty-state">
                <ha-icon class="empty-icon" icon="mdi:view-grid-plus"></ha-icon>
                <div class="cf-text-lg cf-mb-sm">从左侧添加内容块</div>
                <div class="cf-text-sm cf-text-secondary">拖拽或点击块类型添加到画布</div>
              </div>
            `}
          </div>
          
          <!-- 右侧：属性检查器 -->
          <div class="editor-inspector">
            ${this._selectedBlock ? html`
              <block-inspector
                .block=${this._selectedBlock}
                .hass=${this.hass}
                @block-updated=${this._onBlockUpdated}
                @block-removed=${this._onBlockRemoved}
              ></block-inspector>
            ` : html`
              <div class="empty-state">
                <ha-icon class="empty-icon" icon="mdi:cursor-default-click"></ha-icon>
                <div class="cf-text-md">选择块进行配置</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  _onBlockAdded(e) {
    const blockType = e.detail.type;
    const defaultConfig = BlockRegistry.getDefaultConfig(blockType);
    
    const newBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      config: defaultConfig,
      position: { x: 0, y: 0, w: 1, h: 1 }
    };
    
    this._blocks = [...this._blocks, newBlock];
    this._selectedBlock = newBlock;
    this._notifyConfigChanged();
  }

  _onBlockSelected(e) {
    this._selectedBlock = e.detail.block;
  }

  _onBlockUpdated(e) {
    const updatedBlock = e.detail.block;
    this._blocks = this._blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._selectedBlock = updatedBlock;
    this._notifyConfigChanged();
  }

  _onBlockRemoved(e) {
    const blockId = e.detail.blockId;
    this._blocks = this._blocks.filter(block => block.id !== blockId);
    
    if (this._selectedBlock?.id === blockId) {
      this._selectedBlock = null;
    }
    
    this._notifyConfigChanged();
  }

  _onBlocksReordered(e) {
    this._blocks = e.detail.blocks;
    this._notifyConfigChanged();
  }

  _onLayoutChanged(e) {
    this.config = {
      ...this.config,
      layout: e.detail.layout,
      grid: e.detail.gridConfig
    };
    this._notifyConfigChanged();
  }

  _notifyConfigChanged() {
    const configToSend = {
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