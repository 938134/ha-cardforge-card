// src/editors/theme-selector.js - 完整版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { themeSystem } from '../core/theme-system.js';

class ThemeSelector extends LitElement {
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
        position: relative;
      }
      
      .theme-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .theme-item.selected {
        border-color: var(--cf-primary-color);
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .theme-item.selected::after {
        content: "✓";
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        background: var(--cf-primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
        font-weight: bold;
      }
      
      .theme-preview {
        width: 100%;
        height: 50px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 10px;
        border: 2px solid transparent;
        transition: all var(--cf-transition-fast);
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
        font-size: 0.8em;
        color: inherit;
        font-weight: 500;
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
      
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2.5em;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      @media (max-width: 768px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
        }
        
        .theme-item {
          padding: 10px 6px;
          min-height: 90px;
        }
        
        .theme-preview {
          height: 45px;
          margin-bottom: 8px;
        }
        
        .theme-name {
          font-size: 0.75em;
        }
      }
    `
  ];

  render() {
    if (!this.themes || this.themes.length === 0) {
      return this._renderEmptyState();
    }

    return html`
      <div class="theme-selector">
        <div class="theme-grid">
          ${this.themes.map(theme => {
            const preview = themeSystem.getThemePreview(theme.id);
            return html`
              <div 
                class="theme-item ${this.selectedTheme === theme.id ? 'selected' : ''}"
                @click=${() => this._selectTheme(theme)}
                title="${theme.description}"
              >
                <div 
                  class="theme-preview"
                  style="
                    background: ${preview.background};
                    color: ${preview.color};
                    border: ${preview.border};
                    ${preview.boxShadow ? `box-shadow: ${preview.boxShadow};` : ''}
                  "
                ></div>
                <div class="theme-name">${theme.name}</div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="theme-selector">
        <div class="empty-state">
          <div class="empty-icon">
            <ha-icon icon="mdi:palette-outline"></ha-icon>
          </div>
          <div>暂无可用主题</div>
        </div>
      </div>
    `;
  }

  _selectTheme(theme) {
    if (this.selectedTheme === theme.id) return;
    
    this.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: theme.id }
    }));
  }
}

if (!customElements.get('theme-selector')) {
  customElements.define('theme-selector', ThemeSelector);
}

export { ThemeSelector };