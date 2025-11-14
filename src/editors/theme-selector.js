// src/editors/theme-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { sharedStyles } from '../styles/shared-styles.js';
import { componentStyles } from '../styles/component-styles.js';
import { themeConfigs } from '../themes/index.js'; 

export class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String }
  };

  static styles = [
    sharedStyles,
    componentStyles
  ];

  constructor() {
    super();
    this.themes = themeConfigs; // 直接使用主题配置
  }

  render() {
    return html`
      <div class="form-row">
        <ha-select
          .label=${"选择主题样式"}
          .value=${this.selectedTheme}
          @selected=${this._onThemeSelected}
          @closed=${e => e.stopPropagation()}
          fullwidth
        >
          ${this.themes.map(theme => html`
            <mwc-list-item value=${theme.id}>
              <span style="margin-right: 8px;">${theme.icon}</span>
              ${theme.name}
            </mwc-list-item>
          `)}
        </ha-select>
      </div>
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
