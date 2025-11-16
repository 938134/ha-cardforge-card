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
        <div class="cf-grid cf-grid-auto cf-gap-md">
          ${this._themes.map(theme => html`
            <div 
              class="cf-card theme-item ${this.selectedTheme === theme.id ? 'selected' : ''}"
              @click=${() => this._selectTheme(theme.id)}
            >
              <div class="theme-preview theme-preview-${theme.id}"></div>
              <div class="theme-name">${theme.name}</div>
              <div class="theme-description">${theme.description}</div>
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