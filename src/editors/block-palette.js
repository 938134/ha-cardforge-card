// src/editors/block-palette.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { BlockRegistry } from '../blocks/block-registry.js';
import { designSystem } from '../core/design-system.js';

class BlockPalette extends LitElement {
  static properties = {
    _blockTypes: { state: true },
    _searchQuery: { state: true },
    _activeCategory: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-palette {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .palette-header {
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
      }

      .palette-title {
        font-size: 1.1em;
        font-weight: 600;
        margin: 0 0 var(--cf-spacing-md) 0;
        color: var(--cf-text-primary);
      }

      .search-box {
        margin-bottom: var(--cf-spacing-md);
      }

      .category-tabs {
        display: flex;
        gap: 2px;
        background: var(--cf-background);
        border-radius: var(--cf-radius-md);
        padding: 4px;
      }

      .category-tab {
        flex: 1;
        padding: 6px 8px;
        text-align: center;
        font-size: 0.8em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        background: transparent;
        border: none;
        border-radius: var(--cf-radius-sm);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .category-tab.active {
        background: var(--cf-primary-color);
        color: white;
      }

      .blocks-container {
        flex: 1;
        overflow-y: auto;
        padding: var(--cf-spacing-md);
      }

      .blocks-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--cf-spacing-sm);
      }

      .block-type-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .block-type-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }

      .block-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .block-info {
        flex: 1;
        min-width: 0;
      }

      .block-name {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }

      .block-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .drag-handle {
        opacity: 0.5;
        cursor: grab;
      }

      .block-type-item:active .drag-handle {
        cursor: grabbing;
      }

      @media (max-width: 768px) {
        .blocks-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .block-type-item {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
        }
        
        .block-info {
          text-align: center;
        }
      }
    `
  ];

  constructor() {
    super();
    this._blockTypes = [];
    this._searchQuery = '';
    this._activeCategory = 'all';
    this._loadBlockTypes();
  }

  async _loadBlockTypes() {
    await BlockRegistry.initialize();
    this._blockTypes = BlockRegistry.getAllBlockTypes();
  }

  render() {
    const filteredBlocks = this._getFilteredBlocks();
    const categories = this._getCategories();

    return html`
      <div class="block-palette">
        <div class="palette-header">
          <h3 class="palette-title">内容块</h3>
          
          <div class="search-box">
            <ha-textfield
              .label="搜索块类型..."
              .value=${this._searchQuery}
              @input=${this._onSearchInput}
              icon="mdi:magnify"
              fullwidth
            ></ha-textfield>
          </div>

          <div class="category-tabs">
            <button 
              class="category-tab ${this._activeCategory === 'all' ? 'active' : ''}"
              @click=${() => this._setActiveCategory('all')}
            >
              全部
            </button>
            ${categories.map(category => html`
              <button 
                class="category-tab ${this._activeCategory === category ? 'active' : ''}"
                @click=${() => this._setActiveCategory(category)}
              >
                ${this._getCategoryName(category)}
              </button>
            `)}
          </div>
        </div>

        <div class="blocks-container">
          ${filteredBlocks.length > 0 ? html`
            <div class="blocks-grid">
              ${filteredBlocks.map(blockType => html`
                <div 
                  class="block-type-item"
                  @click=${() => this._addBlock(blockType)}
                  draggable="true"
                  @dragstart=${e => this._onDragStart(e, blockType)}
                >
                  <div class="block-icon">
                    <ha-icon .icon=${blockType.icon}></ha-icon>
                  </div>
                  <div class="block-info">
                    <div class="block-name">${blockType.name}</div>
                    <div class="block-description">${blockType.description}</div>
                  </div>
                  <div class="drag-handle">
                    <ha-icon icon="mdi:drag"></ha-icon>
                  </div>
                </div>
              `)}
            </div>
          ` : html`
            <div class="empty-state">
              <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.3;"></ha-icon>
              <div class="cf-text-sm cf-mt-sm">未找到匹配的块类型</div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  _getFilteredBlocks() {
    let filtered = this._blockTypes;

    // 按分类过滤
    if (this._activeCategory !== 'all') {
      filtered = filtered.filter(block => block.category === this._activeCategory);
    }

    // 按搜索词过滤
    if (this._searchQuery) {
      const query = this._searchQuery.toLowerCase();
      filtered = filtered.filter(block => 
        block.name.toLowerCase().includes(query) ||
        block.description.toLowerCase().includes(query) ||
        block.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  _getCategories() {
    const categories = new Set(this._blockTypes.map(block => block.category));
    return Array.from(categories).sort();
  }

  _getCategoryName(category) {
    const names = {
      'basic': '基础',
      'sensors': '传感器',
      'information': '信息',
      'media': '媒体',
      'actions': '操作',
      'layout': '布局'
    };
    return names[category] || category;
  }

  _onSearchInput(e) {
    this._searchQuery = e.target.value;
  }

  _setActiveCategory(category) {
    this._activeCategory = category;
  }

  _addBlock(blockType) {
    this.dispatchEvent(new CustomEvent('block-added', {
      detail: { type: blockType.type }
    }));
  }

  _onDragStart(e, blockType) {
    e.dataTransfer.setData('text/plain', blockType.type);
    e.dataTransfer.effectAllowed = 'copy';
  }
}

if (!customElements.get('block-palette')) {
  customElements.define('block-palette', BlockPalette);
}

export { BlockPalette };