// src/editors/plugin-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { sharedStyles } from '../styles/shared-styles.js';
import { componentStyles } from '../styles/component-styles.js';

export class PluginSelector extends LitElement {
  static properties = {
    plugins: { type: Array },
    selectedPlugin: { type: String }
  };

  static styles = [
    sharedStyles,
    componentStyles
  ];

  render() {
    return html`
      <div class="form-row">
        <ha-select
          .label=${"选择卡片类型"}
          .value=${this.selectedPlugin}
          @selected=${this._onPluginSelected}
          @closed=${e => e.stopPropagation()}
          fullwidth
        >
          ${this.plugins.map(plugin => html`
            <mwc-list-item value=${plugin.id}>${plugin.name}</mwc-list-item>
          `)}
        </ha-select>
      </div>
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
