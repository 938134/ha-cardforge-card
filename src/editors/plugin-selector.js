// src/editors/plugin-selector.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { editorStyles } from '../styles/editor-styles.js';

export class PluginSelector extends LitElement {
  static properties = {
    plugins: { type: Array },
    selectedPlugin: { type: String },
    _filteredPlugins: { state: true },
    _searchQuery: { state: true }
  };

  static styles = [editorStyles];

  constructor() {
    super();
    this._filteredPlugins = [];
    this._searchQuery = '';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('plugins') || changedProperties.has('_searchQuery')) {
      this._filterPlugins();
    }
  }

  render() {
    return html`
      <div class="plugin-selector">
        <div class="search-box">
          <ha-textfield
            .label=${"搜索插件..."}
            .value=${this._searchQuery}
            @input=${this._onSearchInput}
            icon="mdi:magnify"
            fullwidth
          ></ha-textfield>
        </div>
        
        ${this._renderPluginList()}
      </div>
    `;
  }

  _renderPluginList() {
    if (this._filteredPlugins.length === 0) {
      return html`
        <div class="empty-state">
          未找到匹配的插件
        </div>
      `;
    }

    return html`
      <div class="plugin-list">
        ${this._filteredPlugins.map(plugin => html`
          <div 
            class="plugin-item ${this.selectedPlugin === plugin.id ? 'selected' : ''}"
            @click=${() => this._selectPlugin(plugin)}
          >
            <div class="plugin-item-icon">${plugin.icon}</div>
            <div class="plugin-item-name">${plugin.name}</div>
            <div class="plugin-item-description">${plugin.version}</div>
          </div>
        `)}
      </div>
    `;
  }

  _filterPlugins() {
    if (!this.plugins) {
      this._filteredPlugins = [];
      return;
    }

    if (!this._searchQuery) {
      this._filteredPlugins = this.plugins;
      return;
    }

    const query = this._searchQuery.toLowerCase();
    this._filteredPlugins = this.plugins.filter(plugin =>
      plugin.name.toLowerCase().includes(query) ||
      plugin.description.toLowerCase().includes(query) ||
      plugin.category.toLowerCase().includes(query)
    );
  }

  _onSearchInput(event) {
    this._searchQuery = event.target.value;
  }

  _selectPlugin(plugin) {
    this.dispatchEvent(new CustomEvent('plugin-changed', {
      detail: { pluginId: plugin.id }
    }));
  }
}

if (!customElements.get('plugin-selector')) {
  customElements.define('plugin-selector', PluginSelector);
}