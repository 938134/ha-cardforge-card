// src/editors/block-system/block-actions.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';

class BlockActions extends LitElement {
  static properties = {
    blockId: { type: String }
  };

  static styles = [
    designSystem,
    css`
      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        opacity: 0.6;
        transition: opacity var(--cf-transition-fast);
      }

      .block-row:hover .block-actions {
        opacity: 1;
      }

      .block-action {
        width: 32px;
        height: 32px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .block-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
        transform: scale(1.1);
      }

      .block-action.delete:hover {
        background: var(--cf-error-color);
      }

      @media (max-width: 768px) {
        .block-action {
          width: 28px;
          height: 28px;
        }
      }
    `
  ];

  render() {
    return html`
      <div class="block-actions">
        <div class="block-action" @click=${this._onEdit} title="编辑块">
          <ha-icon icon="mdi:pencil"></ha-icon>
        </div>
        <div class="block-action delete" @click=${this._onDelete} title="删除块">
          <ha-icon icon="mdi:delete"></ha-icon>
        </div>
      </div>
    `;
  }

  _onEdit(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('edit'));
  }

  _onDelete(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('delete'));
  }
}

if (!customElements.get('block-actions')) {
  customElements.define('block-actions', BlockActions);
}

export { BlockActions }; 