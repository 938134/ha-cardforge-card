// 主题选择器 - 紧凑版
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
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        gap: 8px;
      }
      
      .theme-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px 4px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        min-height: 80px;
        position: relative;
      }
      
      .theme-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(var(--cf-rgb-primary), 0.15);
      }
      
      .theme-item.selected {
        border-color: var(--cf-primary-color);
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(var(--cf-rgb-primary), 0.2);
      }
      
      .theme-item.selected::after {
        content: "✓";
        position: absolute;
        top: 4px;
        right: 4px;
        width: 16px;
        height: 16px;
        background: var(--cf-primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        font-weight: bold;
      }
      
      .theme-preview {
        width: 100%;
        height: 40px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 6px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        overflow: hidden;
        position: relative;
      }
      
      .theme-item.selected .theme-preview {
        border-color: var(--cf-primary-color);
      }
      
      .theme-preview-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        color: inherit;
        font-weight: 500;
      }
      
      .theme-name {
        font-size: 0.75em;
        font-weight: 500;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .empty-state {
        text-align: center;
        padding: 32px 20px;
        color: var(--cf-text-secondary);
      }
      
      @media (max-width: 768px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
          gap: 6px;
        }
        
        .theme-item {
          min-height: 75px;
          padding: 6px 3px;
        }
        
        .theme-preview {
          height: 36px;
          margin-bottom: 5px;
        }
        
        .theme-name {
          font-size: 0.7em;
        }
        
        .theme-item.selected::after {
          width: 14px;
          height: 14px;
          font-size: 0.65em;
        }
      }
      
      @media (max-width: 480px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        }
        
        .theme-item {
          min-height: 70px;
        }
        
        .theme-preview {
          height: 34px;
        }
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
                ${theme.preview?.boxShadow ? `box-shadow: ${theme.preview.boxShadow};` : ''}
              "
            >
              <div class="theme-preview-content">
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
