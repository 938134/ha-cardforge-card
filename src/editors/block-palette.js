// src/editors/block-palette.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';

class BlockPalette extends LitElement {
  static properties = {
    _availableBlocks: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .palette-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      .block-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        text-align: center;
        background: var(--cf-surface);
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }

      .block-icon {
        font-size: 1.8em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-name {
        font-size: 0.8em;
        font-weight: 500;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }
    `
  ];

  constructor() {
    super();
    this._availableBlocks = [];
  }

  willUpdate() {
    // 只显示4个指定的块类型
    const allowedBlocks = ['text', 'entity', 'time', 'layout'];
    const allBlocks = blockRegistry.getAllBlocks();
    this._availableBlocks = allBlocks.filter(block => 
      allowedBlocks.includes(block.type)
    );
  }

  render() {
    return html`
      <div class="palette-container">
        ${this._availableBlocks.map(block => html`
          <div 
            class="block-item" 
            @click=${() => this._selectBlock(block.type)}
            title="${block.description}"
          >
            <div class="block-icon">${block.icon}</div>
            <div class="block-name">${block.name}</div>
          </div>
        `)}
      </div>
    `;
  }

  _selectBlock(blockType) {
    this.dispatchEvent(new CustomEvent('block-selected', {
      detail: { blockType }
    }));
  }
}

if (!customElements.get('block-palette')) {
  customElements.define('block-palette', BlockPalette);
}

export { BlockPalette };
