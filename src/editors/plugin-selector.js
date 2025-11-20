// src/editors/plugin-selector.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class PluginSelector extends LitElement {
  static properties = {
    plugins: { type: Array },
    selectedPlugin: { type: String },
    _filteredPlugins: { state: true },
    _searchQuery: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .plugin-selector {
        width: 100%;
      }

      .search-box {
        margin-bottom: var(--cf-spacing-lg);
      }

      .plugin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: var(--cf-spacing-md);
        width: 100%;
      }

      .plugin-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-normal);
        background: var(--cf-surface);
        min-height: 100px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .plugin-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }

      .plugin-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        transform: translateY(-1px);
      }

      .plugin-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-sm);
        line-height: 1;
      }

      .plugin-name {
        font-size: 0.9em;
        font-weight: 500;
        line-height: 1.2;
      }

      .plugin-item.selected .plugin-name {
        color: white;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      @media (max-width: 600px) {
        .plugin-grid {
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: var(--cf-spacing-sm);
        }

        .plugin-item {
          min-height: 90px;
          padding: var(--cf-spacing-sm);
        }

        .plugin-icon {
          font-size: 1.8em;
        }

        .plugin-name {
          font-size: 0.85em;
        }
      }

      @media (max-width: 400px) {
        .plugin-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .plugin-item {
          min-height: 85px;
        }
      }
    `
  ];

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
          <ha-icon icon="mdi:package-variant" style="font-size: 3em; opacity: 0.5; margin-bottom: var(--cf-spacing-md);"></ha-icon>
          <div class="cf-text-md cf-mb-sm">未找到匹配的插件</div>
          <div class="cf-text-sm cf-text-secondary">尝试使用不同的搜索关键词</div>
        </div>
      `;
    }

    return html`
      <div class="plugin-grid">
        ${this._filteredPlugins.map(plugin => html`
          <div 
            class="plugin-item ${this.selectedPlugin === plugin.id ? 'selected' : ''}"
            @click=${() => this._selectPlugin(plugin)}
          >
            <div class="plugin-icon">${plugin.icon}</div>
            <div class="plugin-name">${plugin.name}</div>
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