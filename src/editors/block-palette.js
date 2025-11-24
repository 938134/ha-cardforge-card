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
        padding: var(--cf-spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .block-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: grab;
        transition: all var(--cf-transition-fast);
        user-select: none;
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }

      .block-item:active {
        cursor: grabbing;
      }

      .block-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
      }

      .block-info {
        flex: 1;
      }

      .block-name {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .block-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }

      .category-section {
        margin-top: var(--cf-spacing-lg);
      }

      .category-title {
        font-size: 0.85em;
        font-weight: 600;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-sm);
        text-transform: uppercase;
        letter-spacing: 0.5px;
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
      <div class="palette-container">
        ${Object.entries(blocksByCategory).map(([category, blocks]) => html`
          <div class="category-section">
            <div class="category-title">${category}</div>
            ${blocks.map(block => html`
              <div 
                class="block-item" 
                draggable="true"
                @dragstart=${e => this._onDragStart(e, block.type)}
                @click=${() => this._selectBlock(block.type)}
              >
                <div class="block-icon">${block.icon}</div>
                <div class="block-info">
                  <div class="block-name">${block.name}</div>
                  <div class="block-description">${block.description}</div>
                </div>
              </div>
            `)}
          </div>
        `)}
      </div>
    `;
  }

  _groupBlocksByCategory() {
    const groups = {};
    
    this._availableBlocks.forEach(block => {
      const category = block.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(block);
    });
    
    return groups;
  }

  _onDragStart(event, blockType) {
    event.dataTransfer.setData('text/plain', blockType);
    event.dataTransfer.effectAllowed = 'copy';
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