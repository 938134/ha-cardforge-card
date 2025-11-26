// src/editors/theme-selector.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class ThemeSelector extends LitElement {
  static properties = {
    themes: { type: Array },
    selectedTheme: { type: String }
  };

  static styles = [
    designSystem,
    css`
      .theme-selector {
        width: 100%;
      }

      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
        width: 100%;
      }

      .theme-item {
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

      .theme-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .theme-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }

      .theme-preview {
        width: 100%;
        height: 40px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 6px;
        border: 2px solid transparent;
        transition: all var(--cf-transition-fast);
      }

      .theme-item.selected .theme-preview {
        border-color: rgba(255, 255, 255, 0.5);
      }

      .theme-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .theme-item.selected .theme-name {
        color: white;
      }

      @media (max-width: 768px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          gap: var(--cf-spacing-xs);
        }

        .theme-item {
          min-height: 60px;
          padding: 6px 4px;
        }

        .theme-preview {
          height: 35px;
          margin-bottom: 4px;
        }

        .theme-name {
          font-size: 0.75em;
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
              title="${theme.description}"
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