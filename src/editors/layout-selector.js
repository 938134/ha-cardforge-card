// src/editors/layout-selector.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class LayoutSelector extends LitElement {
  static properties = {
    layouts: { type: Array },
    selectedLayout: { type: String }
  };

  static styles = [
    designSystem,
    css`
      .layout-selector {
        width: 100%;
      }

      .layout-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
        width: 100%;
      }

      .layout-item {
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

      .layout-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .layout-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }

      .layout-icon {
        font-size: 1.2em;
        margin-bottom: 6px;
      }

      .layout-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
      }

      .layout-item.selected .layout-name {
        color: white;
      }

      .layout-preview {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
      }

      .preview-single {
        width: 80%;
        height: 8px;
        background: currentColor;
        border-radius: 4px;
      }

      .preview-grid-2x2 {
        width: 60%;
        height: 30px;
        display: grid;
        grid-template: 1fr 1fr / 1fr 1fr;
        gap: 2px;
      }

      .preview-grid-1x4 {
        width: 80%;
        height: 20px;
        display: grid;
        grid-template: 1fr / repeat(4, 1fr);
        gap: 2px;
      }

      .preview-grid-3x3 {
        width: 60%;
        height: 30px;
        display: grid;
        grid-template: repeat(3, 1fr) / repeat(3, 1fr);
        gap: 1px;
      }

      .preview-cell {
        background: currentColor;
        border-radius: 1px;
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .layout-grid {
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          gap: var(--cf-spacing-xs);
        }

        .layout-item {
          min-height: 60px;
          padding: 6px 4px;
        }

        .layout-icon {
          font-size: 1em;
          margin-bottom: 4px;
        }

        .layout-name {
          font-size: 0.75em;
        }
      }
    `
  ];

  render() {
    return html`
      <div class="layout-selector">
        <div class="layout-grid">
          ${this.layouts.map(layout => html`
            <div 
              class="layout-item ${this.selectedLayout === layout.value ? 'selected' : ''}"
              @click=${() => this._selectLayout(layout.value)}
              title="${layout.description}"
            >
              <div class="layout-preview">
                ${this._renderLayoutPreview(layout.value)}
              </div>
              <div class="layout-name">${layout.label}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderLayoutPreview(layoutId) {
    switch (layoutId) {
      case 'single':
        return html`<div class="preview-single"></div>`;
      case 'grid-2x2':
        return html`
          <div class="preview-grid-2x2">
            ${Array(4).fill(0).map(() => html`<div class="preview-cell"></div>`)}
          </div>
        `;
      case 'grid-1x4':
        return html`
          <div class="preview-grid-1x4">
            ${Array(4).fill(0).map(() => html`<div class="preview-cell"></div>`)}
          </div>
        `;
      case 'grid-3x3':
        return html`
          <div class="preview-grid-3x3">
            ${Array(9).fill(0).map(() => html`<div class="preview-cell"></div>`)}
          </div>
        `;
      default:
        return html`<div class="preview-single"></div>`;
    }
  }

  _selectLayout(layout) {
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: { layout }
    }));
  }
}

if (!customElements.get('layout-selector')) {
  customElements.define('layout-selector', LayoutSelector);
}

export { LayoutSelector };