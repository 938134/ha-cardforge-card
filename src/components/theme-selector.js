// 主题选择器
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
      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 12px;
      }
      
      .theme-item {
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
        min-height: 100px;
      }
      
      .theme-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
      }
      
      .theme-item.selected {
        border-color: var(--cf-primary-color);
        border-width: 2px;
      }
      
      .theme-preview {
        width: 100%;
        height: 50px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 10px;
        overflow: hidden;
      }
      
      .theme-name {
        font-size: 0.8em;
        font-weight: 500;
      }
      
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--cf-text-secondary);
      }
    `
  ];

  render() {
    if (!this.themes || this.themes.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:palette-outline"></ha-icon>
          <div>暂无可用主题</div>
        </div>
      `;
    }

    return html`
      <div class="theme-grid">
        ${this.themes.map(theme => html`
          <div 
            class="theme-item ${this.selectedTheme === theme.id ? 'selected' : ''}"
            @click=${() => this._selectTheme(theme)}
            title="${theme.description || theme.name}"
          >
            <div 
              class="theme-preview"
              style="
                background: ${theme.preview?.background || 'var(--cf-background)'};
                color: ${theme.preview?.color || 'var(--cf-text-primary)'};
                border: ${theme.preview?.border || '1px solid var(--cf-border)'};
              "
            >
              <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.8em;font-weight:500;">
                ${theme.icon || '🎨'}
              </div>
            </div>
            <div class="theme-name">${theme.name}</div>
          </div>
        `)}
      </div>
    `;
  }

  _selectTheme(theme) {
    this.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: theme.id }
    }));
  }
}

if (!customElements.get('theme-selector')) {
  customElements.define('theme-selector', ThemeSelector);
}
