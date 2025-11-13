// src/editors/theme-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String }
  };

  constructor() {
    super();
    this.themes = [
      { value: 'auto', label: '跟随系统' },
      { value: 'glass', label: '毛玻璃' },
      { value: 'gradient', label: '随机渐变' },
      { value: 'neon', label: '霓虹光影' }
    ];
  }

  render() {
    return html`
      <ha-select
        .label=${"选择主题"}
        .value=${this.selectedTheme}
        @selected=${this._onThemeSelected}
        @closed=${e => e.stopPropagation()}
      >
        ${this.themes.map(theme => html`
          <mwc-list-item value=${theme.value}>${theme.label}</mwc-list-item>
        `)}
      </ha-select>
    `;
  }

  _onThemeSelected(event) {
    this.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: event.target.value }
    }));
  }
}

if (!customElements.get('theme-selector')) {
  customElements.define('theme-selector', ThemeSelector);
}