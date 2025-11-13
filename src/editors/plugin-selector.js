// src/editors/plugin-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class PluginSelector extends LitElement {
  static properties = {
    plugins: { type: Array },
    selectedPlugin: { type: String }
  };

  render() {
    return html`
      <ha-select
        .label=${"选择卡片"}
        .value=${this.selectedPlugin}
        @selected=${this._onPluginSelected}
        @closed=${e => e.stopPropagation()}
        naturalMenuWidth
        fixedMenuPosition
      >
        ${this.plugins.map(plugin => html`
          <mwc-list-item value=${plugin.id}>
            ${plugin.name} 
            <span style="opacity: 0.6; font-size: 0.9em; margin-left: 8px;">
              ${plugin.description}
            </span>
          </mwc-list-item>
        `)}
      </ha-select>
    `;
  }

  _onPluginSelected(event) {
    const pluginId = event.target.value;
    this.dispatchEvent(new CustomEvent('plugin-changed', {
      detail: { pluginId }
    }));
  }
}

if (!customElements.get('plugin-selector')) {
  customElements.define('plugin-selector', PluginSelector);
}