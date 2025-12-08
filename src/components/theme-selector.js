import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { designSystem } from '../core/design-system.js';

/**
 * 主题选择器 - 方形紧凑版
 */
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
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      .theme-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md) 0;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        width: 100%;
        aspect-ratio: 1;
        position: relative;
        overflow: hidden;
      }

      .theme-item:hover {
        border-color: var(--cf-primary-color);
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }

      .theme-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-lg);
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
        box-shadow: var(--cf-shadow-sm);
      }

      .theme-preview {
        width: 48px;
        height: 32px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: var(--cf-spacing-xs);
        border: 1px solid rgba(0, 0, 0, 0.1);
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--cf-transition-fast);
      }

      .theme-item.selected .theme-preview {
        border-color: white;
        box-shadow: 0 0 0 1px white;
      }

      .theme-preview-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
        font-weight: var(--cf-font-weight-medium);
      }

      .theme-name {
        font-size: var(--cf-font-size-xs);
        font-weight: var(--cf-font-weight-medium);
        line-height: 1.2;
        color: var(--cf-text-primary);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 var(--cf-spacing-xs);
        transition: color var(--cf-transition-fast);
      }

      .theme-item.selected .theme-name {
        color: white;
      }

      .theme-description {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        font-size: var(--cf-font-size-xs);
        padding: var(--cf-spacing-xs);
        transform: translateY(100%);
        transition: transform var(--cf-transition-fast);
        pointer-events: none;
      }

      .theme-item:hover .theme-description {
        transform: translateY(0);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-2xl);
        color: var(--cf-text-secondary);
      }

      .empty-icon {
        font-size: 2.5em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      /* 响应式设计 */
      @container (max-width: 1024px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
          gap: var(--cf-spacing-xs);
        }
      }

      @container (max-width: 768px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        }
      }

      @container (max-width: 480px) {
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
        }

        .theme-item {
          padding: var(--cf-spacing-sm) 0;
        }

        .theme-preview {
          width: 42px;
          height: 28px;
        }

        .theme-name {
          font-size: 0.7em;
        }
      }
    `
  ];

  render() {
    if (!this.themes || this.themes.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">
            <ha-icon icon="mdi:palette-outline"></ha-icon>
          </div>
          <div>暂无可用主题</div>
        </div>
      `;
    }

    return html`
      <div class="theme-selector">
        <div class="theme-grid">
          ${this.themes.map(theme => {
            const isSelected = this.selectedTheme === theme.id;
            const previewStyle = theme.preview || {};
            
            return html`
              <div 
                class="theme-item ${isSelected ? 'selected' : ''}"
                @click=${() => this._selectTheme(theme)}
                title="${theme.description || theme.name}"
              >
                <div 
                  class="theme-preview"
                  style="
                    background: ${previewStyle.background || 'var(--cf-background)'};
                    color: ${previewStyle.color || 'var(--cf-text-primary)'};
                    border-color: ${previewStyle.borderColor || 'var(--cf-border)'};
                    ${previewStyle.border ? `border: ${previewStyle.border};` : ''}
                  "
                >
                  <div class="theme-preview-content">
                    ${theme.icon || '🎨'}
                  </div>
                </div>
                <div class="theme-name">${theme.name}</div>
                <div class="theme-description">${theme.description}</div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _selectTheme(theme) {
    this.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: theme.id }
    }));
  }
}

// 注册自定义元素
if (!customElements.get('theme-selector')) {
  customElements.define('theme-selector', ThemeSelector);
}
