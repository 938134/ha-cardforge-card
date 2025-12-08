import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { designSystem } from '../core/design-system.js';

/**
 * 卡片选择器 - 方形紧凑版
 */
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
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md) 0;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        width: 100%;
        aspect-ratio: 1;
        position: relative;
        overflow: hidden;
      }

      .card-item:hover {
        border-color: var(--cf-primary-color);
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }

      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-lg);
      }

      .card-item.selected::after {
        content: "✓";
        position: absolute;
        top: 4px;
        right: 4px;
        width: 16px;
        height: 16px;
        background: white;
        color: var(--cf-primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        font-weight: bold;
        box-shadow: var(--cf-shadow-sm);
      }

      .card-icon {
        font-size: 1.8em;
        margin-bottom: var(--cf-spacing-xs);
        line-height: 1;
        color: var(--cf-text-secondary);
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color var(--cf-transition-fast);
      }

      .card-item.selected .card-icon {
        color: white;
      }

      .card-name {
        font-size: var(--cf-font-size-xs);
        font-weight: var(--cf-font-weight-medium);
        line-height: 1.2;
        color: var(--cf-text-primary);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 var(--cf-spacing-xs);
        transition: color var(--cf-transition-fast);
      }

      .card-item.selected .card-name {
        color: white;
      }

      .card-description {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        font-size: var(--cf-font-size-xs);
        padding: var(--cf-spacing-xs);
        transform: translateY(100%);
        transition: transform var(--cf-transition-fast);
        pointer-events: none;
      }

      .card-item:hover .card-description {
        transform: translateY(0);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-2xl);
        color: var(--cf-text-secondary);
      }

      .empty-icon {
        font-size: 2.5em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      /* 响应式设计 */
      @container (max-width: 1024px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
          gap: var(--cf-spacing-xs);
        }
      }

      @container (max-width: 768px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        }
      }

      @container (max-width: 480px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
        }

        .card-item {
          padding: var(--cf-spacing-sm) 0;
        }

        .card-icon {
          font-size: 1.6em;
          height: 28px;
        }

        .card-name {
          font-size: 0.7em;
        }
      }
    `
  ];

  render() {
    if (!this.cards || this.cards.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">
            <ha-icon icon="mdi:package-variant-closed"></ha-icon>
          </div>
          <div>暂无可用卡片</div>
        </div>
      `;
    }

    return html`
      <div class="card-selector">
        <div class="card-grid">
          ${this.cards.map(card => {
            const isSelected = this.selectedCard === card.id;
            
            return html`
              <div 
                class="card-item ${isSelected ? 'selected' : ''}"
                @click=${() => this._selectCard(card)}
                title="${card.description || card.name}"
              >
                <div class="card-icon">${card.icon}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-description">${card.description}</div>
              </div>
            `;
          })}
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

// 注册自定义元素
if (!customElements.get('card-selector')) {
  customElements.define('card-selector', CardSelector);
}
