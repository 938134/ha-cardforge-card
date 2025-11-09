// src/ui/plugin-browser.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class PluginBrowser extends LitElement {
  static properties = {
    plugins: { type: Array },
    categories: { type: Array },
    selectedPlugin: { type: String },
    searchQuery: { type: String },
    selectedCategory: { type: String },
    loading: { type: Boolean }
  };

  static styles = css`
    .plugin-browser {
      padding: 16px;
    }
    
    .search-header {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
    }
    
    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }
    
    .plugin-card {
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
      position: relative;
    }
    
    .plugin-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .plugin-card.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .plugin-icon {
      font-size: 2.2em;
      margin-bottom: 8px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .plugin-name {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 0.9em;
    }
    
    .plugin-description {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      line-height: 1.3;
      height: 32px;
      overflow: hidden;
    }
    
    .plugin-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--primary-color);
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 0.65em;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }
    
    .no-plugins {
      text-align: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }
    
    .flex {
      flex: 1;
    }
  `;

  constructor() {
    super();
    this.plugins = [];
    this.categories = ['all'];
    this.selectedPlugin = '';
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.loading = false;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <div style="margin-top: 16px;">加载插件市场中...</div>
        </div>
      `;
    }

    const filteredPlugins = this._getFilteredPlugins();

    return html`
      <div class="plugin-browser">
        <div class="search-header">
          <ha-textfield
            class="flex"
            label="搜索插件..."
            .value=${this.searchQuery}
            @input=${e => this._onSearchInput(e)}
            icon="mdi:magnify"
          ></ha-textfield>
          
          <ha-select
            label="分类"
            .value=${this.selectedCategory}
            @selected=${e => this._onCategorySelected(e)}
          >
            ${this.categories.map(category => html`
              <mwc-list-item value=${category}>
                ${category === 'all' ? '全部分类' : category}
              </mwc-list-item>
            `)}
          </ha-select>
        </div>

        <div class="plugin-grid">
          ${filteredPlugins.map(plugin => html`
            <div class="plugin-card ${this.selectedPlugin === plugin.id ? 'selected' : ''}"
                 @click=${() => this._onPluginSelected(plugin)}>
              ${plugin.featured ? html`<div class="plugin-badge">⭐</div>` : ''}
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-description">${plugin.description}</div>
            </div>
          `)}
        </div>

        ${filteredPlugins.length === 0 ? html`
          <div class="no-plugins">
            <ha-icon icon="mdi:alert-circle-outline" style="font-size: 3em;"></ha-icon>
            <div style="margin-top: 12px;">没有找到匹配的插件</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _getFilteredPlugins() {
    let filtered = this.plugins;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  _onSearchInput(e) {
    this.searchQuery = e.target.value;
    this.dispatchEvent(new CustomEvent('search-changed', {
      detail: { query: this.searchQuery }
    }));
  }

  _onCategorySelected(e) {
    this.selectedCategory = e.target.value;
    this.dispatchEvent(new CustomEvent('category-changed', {
      detail: { category: this.selectedCategory }
    }));
  }

  _onPluginSelected(plugin) {
    this.selectedPlugin = plugin.id;
    this.dispatchEvent(new CustomEvent('plugin-selected', {
      detail: { plugin }
    }));
  }

  // 公共方法
  clearSelection() {
    this.selectedPlugin = '';
    this.searchQuery = '';
    this.selectedCategory = 'all';
  }

  setPlugins(plugins) {
    this.plugins = plugins;
  }

  setCategories(categories) {
    this.categories = categories;
  }
}

customElements.define('plugin-browser', PluginBrowser);