// src/editors/theme-selector.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class ThemeSelector extends LitElement {
  static properties = {
    themes: { type: Array },
    selectedTheme: { type: String }
  };

  static styles = [
    foundationStyles,
    css`
      .theme-selector {
        width: 100%;
      }

      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: var(--cf-spacing-md);
        width: 100%;
      }

      .theme-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-normal);
        background: var(--cf-surface);
        min-height: 100px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .theme-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }

      .theme-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        transform: translateY(-1px);
      }

      .theme-preview {
        width: 100%;
        height: 60px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: var(--cf-spacing-sm);
        border: 2px solid transparent;
        transition: all var(--cf-transition-fast);
      }

      .theme-item.selected .theme-preview {
        border-color: rgba(255, 255, 255, 0.5);
      }

      .theme-name {
        font-size: 0.9em;
        font-weight: 500;
        line-height: 1.2;
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .theme-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }

      /* 响应式优化 */
      @media (max-width: 600px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: var(--cf-spacing-sm);
        }

        .theme-item {
          min-height: 90px;
          padding: var(--cf-spacing-sm);
        }

        .theme-preview {
          height: 50px;
        }

        .theme-name {
          font-size: 0.85em;
        }
      }

      @media (max-width: 400px) {
        .theme-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .theme-item {
          min-height: 85px;
        }
      }
    `
  ];

  render() {
    return html`
      <div class="theme-selector">
        <div class="theme-grid">
          ${this.themes.map(theme => html`
            <div 
              class="theme-item ${this.selectedTheme === theme.id ? 'selected' : ''}"
              @click=${() => this._selectTheme(theme.id)}
            >
              <div class="theme-preview" style="
                background: ${theme.preview?.background || 'var(--cf-background)'};
                color: ${theme.preview?.color || 'var(--cf-text-primary)'};
                border: ${theme.preview?.border || '1px solid var(--cf-border)'};
                ${theme.preview?.boxShadow ? `box-shadow: ${theme.preview.boxShadow};` : ''}
              "></div>
              <div class="theme-name">${theme.name}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _selectTheme(themeId) {
    this.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: themeId }
    }));
  }
}

if (!customElements.get('theme-selector')) {
  customElements.define('theme-selector', ThemeSelector);
}
