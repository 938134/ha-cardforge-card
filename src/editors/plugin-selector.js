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
        margin-bottom: var(--cf-spacing-md);
      }

      .plugin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
        width: 100%;
      }

      .plugin-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        min-height: 70px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .plugin-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }

      .plugin-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        transform: translateY(-1px);
      }

      .plugin-icon {
        font-size: 1.2em;
        margin-bottom: 4px;
        line-height: 1;
      }

      .plugin-name {
        font-size: 0.75em;
        font-weight: 500;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .plugin-item.selected .plugin-name {
        color: white;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-lg);
        color: var(--cf-text-secondary);
      }

      /* 紧凑模式 - 更小的间距和尺寸 */
      @media (max-width: 768px) {
        .plugin-grid {
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          gap: var(--cf-spacing-xs);
        }

        .plugin-item {
          min-height: 60px;
          padding: 6px 4px;
        }

        .plugin-icon {
          font-size: 1em;
          margin-bottom: 2px;
        }

        .plugin-name {
          font-size: 0.7em;
        }
      }

      /* 超小屏幕优化 */
      @media (max-width: 480px) {
        .plugin-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .plugin-item {
          min-height: 55px;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .plugin-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
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
          <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5; margin-bottom: var(--cf-spacing-sm);"></ha-icon>
          <div class="cf-text-sm cf-mb-xs">未找到匹配的插件</div>
          <div class="cf-text-xs cf-text-secondary">尝试使用不同的搜索关键词</div>
        </div>
      `;
    }

    return html`
      <div class="plugin-grid">
        ${this._filteredPlugins.map(plugin => html`
          <div 
            class="plugin-item ${this.selectedPlugin === plugin.id ? 'selected' : ''}"
            @click=${() => this._selectPlugin(plugin)}
            title="${plugin.description}"
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