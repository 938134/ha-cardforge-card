// src/editors/block-palette.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockRegistry } from '../core/block-registry.js';

class BlockPalette extends LitElement {
  static properties = {
    _availableBlocks: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .palette-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }

      .block-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        text-align: center;
        min-height: 80px;
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }

      .block-icon {
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-name {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }

      .block-description {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
        display: none; /* 简化版隐藏描述 */
      }

      .category-title {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-secondary);
        margin: var(--cf-spacing-lg) 0 var(--cf-spacing-sm) 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .category-title:first-child {
        margin-top: 0;
      }
    `
  ];

  constructor() {
    super();
    this._availableBlocks = [];
  }

  willUpdate() {
    this._availableBlocks = blockRegistry.getAllBlocks();
  }

  render() {
    const blocksByCategory = this._groupBlocksByCategory();
    
    return html`
      ${Object.entries(blocksByCategory).map(([category, blocks]) => html`
        <div class="category-title">${category}</div>
        <div class="palette-container">
          ${blocks.map(block => html`
            <div 
              class="block-item" 
              @click=${() => this._selectBlock(block.type)}
              title="${block.description}"
            >
              <div class="block-icon">${block.icon}</div>
              <div class="block-name">${block.name}</div>
              <div class="block-description">${block.description}</div>
            </div>
          `)}
        </div>
      `)}
    `;
  }

  _groupBlocksByCategory() {
    const groups = {};
    
    this._availableBlocks.forEach(block => {
      const category = block.category || '其他';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(block);
    });
    
    return groups;
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