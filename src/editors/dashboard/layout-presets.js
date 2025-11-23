// src/editors/dashboard/layout-presets.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class LayoutPresets extends LitElement {
  static properties = {
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
        position: relative;
        overflow: hidden;
      }

      .layout-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }

      .layout-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        transform: translateY(-1px);
      }

      .layout-preview {
        width: 100%;
        height: 40px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 6px;
        border: 2px solid transparent;
        transition: all var(--cf-transition-fast);
        display: grid;
        gap: 2px;
        padding: 4px;
      }

      .layout-item.selected .layout-preview {
        border-color: rgba(255, 255, 255, 0.5);
      }

      .layout-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .layout-item.selected .layout-name {
        color: white;
      }

      /* 紧凑模式 - 移动端优化 */
      @media (max-width: 768px) {
        .layout-grid {
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          gap: var(--cf-spacing-xs);
        }

        .layout-item {
          min-height: 60px;
          padding: 6px 4px;
        }

        .layout-preview {
          height: 35px;
          margin-bottom: 4px;
        }

        .layout-name {
          font-size: 0.75em;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .layout-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }
    `
  ];

  render() {
    return html`
      <div class="layout-selector">
        <div class="layout-grid">
          ${Object.entries(BlockManager.LAYOUT_PRESETS).map(([key, preset]) => html`
            <div 
              class="layout-item ${this.selectedLayout === key ? 'selected' : ''}"
              @click=${() => this._selectLayout(key)}
              title="${preset.name}"
            >
              <div class="layout-preview" style="
                grid-template-columns: repeat(${preset.cols}, 1fr);
                grid-template-rows: repeat(${preset.rows}, 1fr);
              ">
                ${Array.from({ length: preset.rows * preset.cols }, (_, i) => html`
                  <div style="
                    background: ${this.selectedLayout === key ? 'rgba(255,255,255,0.8)' : 'var(--cf-border)'}; 
                    border-radius: 1px;
                  "></div>
                `)}
              </div>
              <div class="layout-name">${preset.cols}×${preset.rows}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _selectLayout(layout) {
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: { layout }
    }));
  }
}

if (!customElements.get('layout-presets')) {
  customElements.define('layout-presets', LayoutPresets);
}