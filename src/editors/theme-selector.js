// src/editors/theme-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { sharedStyles } from '../styles/shared-styles.js';
import { componentStyles } from '../styles/component-styles.js';

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
    this.themes = [
      { value: 'auto', label: '跟随系统', icon: '⚙️' },
      { value: 'glass', label: '毛玻璃', icon: '🔮' },
      { value: 'gradient', label: '随机渐变', icon: '🌈' },
      { value: 'neon', label: '霓虹光影', icon: '💫' }
    ];
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
            <mwc-list-item value=${theme.value}>
              <span style="margin-right: 8px;">${theme.icon}</span>
              ${theme.label}
            </mwc-list-item>
          `)}
        </ha-select>
        <div class="config-hint">
          🎨 选择卡片的视觉主题样式
        </div>
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
