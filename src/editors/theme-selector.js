// src/editors/theme-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { themeManager } from '../themes/index.js';
import { cardForgeStyles } from '../styles/index.js';

export class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String },
    _themes: { state: true }
  };

  static styles = cardForgeStyles;

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
        <div class="selector-grid">
          ${this._themes.map(theme => html`
            <div 
              class="selector-item ${this.selectedTheme === theme.id ? 'selected' : ''}"
              @click=${() => this._selectTheme(theme.id)}
            >
              <div class="theme-preview theme-preview-${theme.id}"></div>
              <div class="selector-name">${theme.name}</div>
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