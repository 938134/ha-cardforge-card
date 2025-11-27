// src/editors/card-selector.js
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
      .card-selector {
        width: 100%;
      }

      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
        width: 100%;
      }

      .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        min-height: 70px;
        text-align: center;
      }

      .card-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }

      .card-icon {
        font-size: 1.5em;
        margin-bottom: 6px;
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
        padding: var(--cf-spacing-lg);
        color: var(--cf-text-secondary);
      }

      @media (max-width: 768px) {
        .card-grid {
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          gap: var(--cf-spacing-xs);
        }

        .card-item {
          min-height: 60px;
          padding: 6px 4px;
        }

        .card-icon {
          font-size: 1.3em;
          margin-bottom: 4px;
        }

        .card-name {
          font-size: 0.75em;
        }
      }
    `
  ];

  render() {
    if (!this.cards || this.cards.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5; margin-bottom: var(--cf-spacing-sm);"></ha-icon>
          <div class="cf-text-sm cf-mb-xs">没有可用的卡片</div>
        </div>
      `;
    }

    return html`
      <div class="card-selector">
        <div class="card-grid">
          ${this.cards.map(card => html`
            <div 
              class="card-item ${this.selectedCard === card.id ? 'selected' : ''}"
              @click=${() => this._selectCard(card)}
              title="${card.description}"
            >
              <div class="card-icon">${card.icon}</div>
              <div class="card-name">${card.name}</div>
            </div>
          `)}
        </div>
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