// 卡片选择器
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
      }
      
      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
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
      }
      
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--cf-text-secondary);
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
