// src/editors/dashboard/layout-presets.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class LayoutPresets extends LitElement {
  static properties = {
    selectedLayout: { type: String },
    onLayoutChange: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .layout-presets {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }

      .layout-preset {
        aspect-ratio: 1;
        border: 2px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        padding: var(--cf-spacing-sm);
        background: var(--cf-surface);
      }

      .layout-preset:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .layout-preset.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .layout-preview {
        flex: 1;
        width: 100%;
        display: grid;
        gap: 2px;
        margin-bottom: 4px;
      }

      .layout-name {
        font-size: 0.7em;
        text-align: center;
        color: var(--cf-text-secondary);
      }

      @media (max-width: 768px) {
        .layout-presets {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `
  ];

  constructor() {
    super();
    this.selectedLayout = '2x2';
    this.onLayoutChange = () => {};
  }

  render() {
    return html`
      <div class="layout-presets">
        ${Object.entries(BlockManager.LAYOUT_PRESETS).map(([key, preset]) => html`
          <div 
            class="layout-preset ${this.selectedLayout === key ? 'selected' : ''}"
            @click=${() => this._selectLayout(key)}
            title="${preset.name}"
          >
            <div class="layout-preview" style="
              grid-template-columns: repeat(${preset.cols}, 1fr);
              grid-template-rows: repeat(${preset.rows}, 1fr);
            ">
              ${Array.from({ length: preset.rows * preset.cols }, (_, i) => html`
                <div style="background: var(--cf-border); border-radius: 1px;"></div>
              `)}
            </div>
            <div class="layout-name">${preset.cols}×${preset.rows}</div>
          </div>
        `)}
      </div>
    `;
  }

  _selectLayout(layout) {
    this.selectedLayout = layout;
    this.onLayoutChange(layout);
  }
}

if (!customElements.get('layout-presets')) {
  customElements.define('layout-presets', LayoutPresets);
}