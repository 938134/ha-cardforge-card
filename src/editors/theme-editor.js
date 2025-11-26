// src/editors/theme-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { themeManager } from '../core/theme-manager.js';

class ThemeEditor extends LitElement {
  static properties = {
    config: { type: Object },
    _availableThemes: { state: true },
    _loading: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--cf-spacing-md);
      }

      .theme-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 2px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
      }

      .theme-option:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
      }

      .theme-option.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .theme-icon {
        font-size: 1.8em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .theme-name {
        font-size: 0.85em;
        font-weight: 500;
        line-height: 1.2;
      }

      .loading-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }
    `
  ];

  constructor() {
    super();
    this._availableThemes = [];
    this._loading = true;
  }

  async firstUpdated() {
    try {
      // 等待主题管理器初始化完成
      await themeManager.initialize();
      this._availableThemes = themeManager.getAllThemes();
      console.log('可用主题:', this._availableThemes);
    } catch (error) {
      console.error('加载主题失败:', error);
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  render() {
    if (this._loading) {
      return html`
        <div class="loading-state">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="cf-text-sm cf-mt-md">加载主题中...</div>
        </div>
      `;
    }

    const currentTheme = this.config?.theme || 'auto';

    return html`
      <div class="themes-grid">
        ${this._availableThemes.map(theme => html`
          <div 
            class="theme-option ${currentTheme === theme.id ? 'selected' : ''}"
            @click=${() => this._selectTheme(theme.id)}
            title="${theme.description}"
          >
            <div class="theme-icon">${theme.icon}</div>
            <div class="theme-name">${theme.name}</div>
          </div>
        `)}
      </div>

      <div class="cf-text-sm cf-text-secondary cf-mt-md">
        主题更改会立即在预览窗口中显示效果
      </div>
    `;
  }

  _selectTheme(themeId) {
    const newConfig = {
      ...this.config,
      theme: themeId
    };

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
  }
}

if (!customElements.get('theme-editor')) {
  customElements.define('theme-editor', ThemeEditor);
}

export { ThemeEditor };
