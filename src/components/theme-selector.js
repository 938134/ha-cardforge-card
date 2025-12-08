// components/theme-selector.js - 更新版
import { LitElement, html, css } from 'https://unpkg.com/lit@3.0.0/index.js?module';
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
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 12px;
      }
      
      .theme-item {
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
      
      .theme-item:hover {
        border-color: var(--cf-primary-color);
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(var(--cf-rgb-primary), 0.15);
      }
      
      .theme-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--cf-rgb-primary), 0.2);
      }
      
      .theme-item.selected::after {
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
      
      .theme-item.selected .theme-preview {
        border-color: white;
        box-shadow: 0 0 0 1px white;
      }
      
      .theme-preview {
        width: 48px;
        height: 32px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 6px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .theme-preview-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
        font-weight: 500;
      }
      
      .theme-name {
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
      
      .theme-item.selected .theme-name {
        color: white;
      }
      
      .empty-state {
        text-align: center;
        padding: 32px 20px;
        color: var(--cf-text-secondary);
      }
      
      @media (max-width: 1024px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
          gap: 10px;
        }
        
        .theme-item {
          width: 75px;
          height: 75px;
          padding: 8px 0;
        }
        
        .theme-preview {
          width: 45px;
          height: 30px;
          margin-bottom: 5px;
        }
        
        .theme-name {
          font-size: 0.75em;
          height: 15px;
        }
        
        .theme-item.selected::after {
          width: 14px;
          height: 14px;
          font-size: 0.65em;
        }
      }
      
      @media (max-width: 768px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 8px;
        }
        
        .theme-item {
          width: 70px;
          height: 70px;
          padding: 6px 0;
        }
        
        .theme-preview {
          width: 42px;
          height: 28px;
          margin-bottom: 4px;
        }
        
        .theme-name {
          font-size: 0.7em;
          height: 14px;
        }
        
        .theme-item.selected::after {
          width: 12px;
          height: 12px;
          font-size: 0.6em;
          top: 3px;
          right: 3px;
        }
      }
      
      @media (max-width: 480px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
          gap: 6px;
        }
        
        .theme-item {
          width: 65px;
          height: 65px;
          padding: 5px 0;
        }
        
        .theme-preview {
          width: 38px;
          height: 26px;
          margin-bottom: 3px;
        }
        
        .theme-name {
          font-size: 0.65em;
          height: 13px;
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
                border-color: ${theme.preview?.borderColor || 'var(--cf-border)'};
                ${theme.preview?.border ? `border: ${theme.preview.border};` : ''}
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
