// 卡片选择器 - 方形紧凑版（完全使用 Lit 框架）
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
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 12px;
      }
      
      .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 0;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        width: 80px;
        height: 80px;
        box-sizing: border-box;
        position: relative;
      }
      
      .card-item:hover {
        border-color: var(--cf-primary-color);
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(var(--cf-rgb-primary), 0.15);
      }
      
      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--cf-rgb-primary), 0.2);
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
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
      
      .card-item.selected .card-icon {
        color: white;
      }
      
      .card-item.selected .card-name {
        color: white;
      }
      
      .card-icon {
        font-size: 1.8em;
        margin-bottom: 6px;
        line-height: 1;
        color: var(--cf-text-secondary);
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .card-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
        color: var(--cf-text-primary);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 4px;
        height: 16px;
      }
      
      .empty-state {
        text-align: center;
        padding: 32px 20px;
        color: var(--cf-text-secondary);
      }
      
      /* 响应式设计 */
      @media (max-width: 1024px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
          gap: 10px;
        }
        
        .card-item {
          width: 75px;
          height: 75px;
          padding: 8px 0;
        }
        
        .card-icon {
          font-size: 1.7em;
          margin-bottom: 5px;
          height: 30px;
        }
        
        .card-name {
          font-size: 0.75em;
          height: 15px;
        }
        
        .card-item.selected::after {
          width: 14px;
          height: 14px;
          font-size: 0.65em;
        }
      }
      
      @media (max-width: 768px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 8px;
        }
        
        .card-item {
          width: 70px;
          height: 70px;
          padding: 6px 0;
        }
        
        .card-icon {
          font-size: 1.6em;
          margin-bottom: 4px;
          height: 28px;
        }
        
        .card-name {
          font-size: 0.7em;
          height: 14px;
        }
        
        .card-item.selected::after {
          width: 12px;
          height: 12px;
          font-size: 0.6em;
          top: 3px;
          right: 3px;
        }
      }
      
      @media (max-width: 480px) {
        .card-grid {
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
          gap: 6px;
        }
        
        .card-item {
          width: 65px;
          height: 65px;
          padding: 5px 0;
        }
        
        .card-icon {
          font-size: 1.5em;
          margin-bottom: 3px;
          height: 26px;
        }
        
        .card-name {
          font-size: 0.65em;
          height: 13px;
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