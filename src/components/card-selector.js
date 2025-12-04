// 卡片选择器 - 紧凑版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class CardSelector extends LitElement {
  static properties = {
    cards: { type: Array },
    selectedCard: { type: String }
  };

  static styles = [
    designSystem,
    css`
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        gap: 8px;
      }
      
      .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px 4px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        min-height: 80px;
      }
      
      .card-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(var(--cf-rgb-primary), 0.15);
      }
      
      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(var(--cf-rgb-primary), 0.2);
      }
      
      .card-item.selected .card-name {
        color: white;
      }
      
      .card-icon {
        font-size: 1.5em;
        margin-bottom: 6px;
        line-height: 1;
      }
      
      .card-name {
        font-size: 0.75em;
        font-weight: 500;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .empty-state {
        text-align: center;
        padding: 32px 20px;
        color: var(--cf-text-secondary);
      }
      
      @media (max-width: 768px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
          gap: 6px;
        }
        
        .card-item {
          min-height: 75px;
          padding: 6px 3px;
        }
        
        .card-icon {
          font-size: 1.4em;
          margin-bottom: 5px;
        }
        
        .card-name {
          font-size: 0.7em;
        }
      }
      
      @media (max-width: 480px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        }
        
        .card-item {
          min-height: 70px;
        }
        
        .card-icon {
          font-size: 1.3em;
        }
      }
    `
  ];

  render() {
    if (!this.cards || this.cards.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:package-variant-closed"></ha-icon>
          <div>暂无可用卡片</div>
        </div>
      `;
    }

    return html`
      <div class="card-grid">
        ${this.cards.map(card => html`
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
    `;
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
