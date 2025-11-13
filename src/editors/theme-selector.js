// src/editors/theme-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { ThemeManager, themeStyles } from '../styles/index.js';

export class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String }
  };

  static styles = [themeStyles];

  constructor() {
    super();
    this.themes = ThemeManager.getAllThemes();
  }

  render() {
    return html`
      <div class="theme-selector">
        <div class="theme-previews">
          ${this.themes.map(theme => html`
            <div 
              class="theme-preview ${theme.id} ${this.selectedTheme === theme.id ? 'active' : ''}"
              @click=${() => this._selectTheme(theme.id)}
              title="${theme.name}: ${theme.description}"
            ></div>
          `)}
        </div>
        
        <ha-select
          .label=${"选择主题"}
          .value=${this.selectedTheme}
          @selected=${this._onThemeSelected}
          @closed=${e => e.stopPropagation()}
          naturalMenuWidth
          fixedMenuPosition
        >
          ${this.themes.map(theme => html`
            <mwc-list-item value=${theme.id}>
              ${theme.name} - ${theme.description}
            </mwc-list-item>
          `)}
        </ha-select>
        
        <div class="entity-help">
          点击预览图或下拉选择主题样式
        </div>
      </div>
    `;
  }

  _selectTheme(themeId) {
    this.selectedTheme = themeId;
    this._notifyChange();
  }

  _onThemeSelected(event) {
    this.selectedTheme = event.target.value;
    this._notifyChange();
  }

  _notifyChange() {
    this.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: this.selectedTheme }
    }));
  }
}

if (!customElements.get('theme-selector')) {
  customElements.define('theme-selector', ThemeSelector);
}