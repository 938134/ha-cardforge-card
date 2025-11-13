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
      >
        ${this.plugins.map(plugin => html`
          <mwc-list-item value=${plugin.id}>${plugin.name}</mwc-list-item>
        `)}
      </ha-select>
    `;
  }

  _onPluginSelected(event) {
    this.dispatchEvent(new CustomEvent('plugin-changed', {
      detail: { pluginId: event.target.value }
    }));
  }
}

if (!customElements.get('plugin-selector')) {
  customElements.define('plugin-selector', PluginSelector);
}