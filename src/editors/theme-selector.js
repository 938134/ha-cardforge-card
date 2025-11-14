// src/editors/theme-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { themeManager } from '../themes/index.js';

export class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String },
    _themes: { state: true }
  };

  constructor() {
    super();
    this._themes = [];
  }

  firstUpdated() {
    this._themes = themeManager.getAllThemes();
  }

  render() {
    return html`
      <div class="theme-selector">
        <div class="theme-selector-grid">
          ${this._themes.map(theme => html`
            <div 
              class="theme-selector-card ${this.selectedTheme === theme.id ? 'selected' : ''}"
              @click=${() => this._selectTheme(theme.id)}
            >
              <div class="theme-preview-box ${this._getPreviewClass(theme.id)}"></div>
              <div class="theme-selector-name">${theme.name}</div>
              <div class="theme-selector-description">${theme.description}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _getPreviewClass(themeId) {
    return `theme-${themeId}-preview`;
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