// src/editors/card-selector.js - 优化版
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class CardSelector extends LitElement {
  static properties = {
    cards: { type: Array },
    selectedCard: { type: String },
    _filteredCards: { state: true },
    _selectedCategory: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .card-selector {
        width: 100%;
      }
      
      .category-filter {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--cf-border);
      }
      
      .category-btn {
        padding: 6px 12px;
        border: 1px solid var(--cf-border);
        border-radius: 20px;
        background: var(--cf-surface);
        color: var(--cf-text-secondary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
      }
      
      .category-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
      }
      
      .category-btn.active {
        background: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
        color: white;
      }
      
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 12px;
      }
      
      .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 8px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        min-height: 90px;
      }
      
      .card-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .card-icon {
        font-size: 1.8em;
        margin-bottom: 8px;
        line-height: 1;
      }
      
      .card-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .card-item.selected .card-name {
        color: white;
      }
      
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2.5em;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      @media (max-width: 768px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
        }
        
        .card-item {
          padding: 10px 6px;
          min-height: 80px;
        }
        
        .card-icon {
          font-size: 1.6em;
          margin-bottom: 6px;
        }
        
        .card-name {
          font-size: 0.75em;
        }
      }
    `
  ];

  constructor() {
    super();
    this._filteredCards = [];
    this._selectedCategory = 'all';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('cards')) {
      this._filterCards();
    }
  }

  render() {
    if (!this.cards || this.cards.length === 0) {
      return this._renderEmptyState();
    }

    const categories = this._getCategories();
    
    return html`
      <div class="card-selector">
        ${categories.length > 1 ? html`
          <div class="category-filter">
            <button 
              class="category-btn ${this._selectedCategory === 'all' ? 'active' : ''}"
              @click=${() => this._selectCategory('all')}
            >
              全部
            </button>
            ${categories.map(category => html`
              <button 
                class="category-btn ${this._selectedCategory === category ? 'active' : ''}"
                @click=${() => this._selectCategory(category)}
              >
                ${category}
              </button>
            `)}
          </div>
        ` : ''}
        
        <div class="card-grid">
          ${this._filteredCards.map(card => html`
            <div 
              class="card-item ${this.selectedCard === card.id ? 'selected' : ''}"
              @click=${() => this._selectCard(card)}
              title="${card.description || card.name}"
            >
              <div class="card-icon">${card.icon}</div>
              <div class="card-name">${card.name}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="card-selector">
        <div class="empty-state">
          <div class="empty-icon">
            <ha-icon icon="mdi:package-variant-closed"></ha-icon>
          </div>
          <div>暂无可用卡片</div>
        </div>
      </div>
    `;
  }

  _getCategories() {
    if (!this.cards) return [];
    
    const categories = new Set();
    this.cards.forEach(card => {
      if (card.category) {
        categories.add(card.category);
      }
    });
    
    return Array.from(categories).sort();
  }

  _filterCards() {
    if (!this.cards) {
      this._filteredCards = [];
      return;
    }
    
    if (this._selectedCategory === 'all') {
      this._filteredCards = [...this.cards];
    } else {
      this._filteredCards = this.cards.filter(card => card.category === this._selectedCategory);
    }
    
    this._filteredCards.sort((a, b) => a.name.localeCompare(b.name));
  }

  _selectCategory(category) {
    this._selectedCategory = category;
    this._filterCards();
  }

  _selectCard(card) {
    this.dispatchEvent(new CustomEvent('card-changed', {
      detail: { cardId: card.id }
    }));
  }
}

if (!customElements.get('card-selector')) {
  customElements.define('card-selector', CardSelector);
}

export { CardSelector };