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
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
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
        background: var(--cf-background);
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

      .category-section {
        margin-bottom: var(--cf-spacing-lg);
      }

      .category-title {
        font-size: 0.9em;
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
      ${Object.entries(blocksByCategory).map(([category, blocks]) => html`
        <div class="category-section">
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
              </div>
            `)}
          </div>
        </div>
      `)}
    `;
  }

  _groupBlocksByCategory() {
    const groups = {};
    
    this._availableBlocks.forEach(block => {
      const category = this._getCategoryDisplayName(block.category);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(block);
    });
    
    return groups;
  }

  _getCategoryDisplayName(category) {
    const names = {
      'basic': '基础块',
      'data': '数据块', 
      'time': '时间块',
      'layout': '布局块',
      'other': '其他块'
    };
    return names[category] || category;
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