// src/core/plugin-marketplace.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './plugin-registry.js';

export class PluginMarketplace {
  static render(searchQuery, selectedCategory, plugins, onPluginSelect, selectedPluginId) {
    return html`
      <div class="marketplace-container">
        ${this._renderSearchHeader(searchQuery, selectedCategory)}
        ${this._renderPluginGrid(plugins, onPluginSelect, selectedPluginId)}
        ${plugins.length === 0 ? this._renderEmptyState() : ''}
      </div>
    `;
  }

  static _renderSearchHeader(searchQuery, selectedCategory) {
    const categories = PluginRegistry.getMarketplaceCategories();

    return html`
      <div class="search-header">
        <ha-textfield
          style="flex: 1;"
          label="搜索插件..."
          .value=${searchQuery}
          @input=${e => this._onSearchChange(e.target.value)}
          icon="mdi:magnify"
        ></ha-textfield>
        
        <ha-select
          label="分类"
          .value=${selectedCategory}
          @selected=${e => this._onCategoryChange(e.target.value)}
          style="min-width: 120px;"
        >
          ${categories.map(category => html`
            <mwc-list-item value=${category}>
              ${category === 'all' ? '全部分类' : category}
            </mwc-list-item>
          `)}
        </ha-select>
      </div>
    `;
  }

  static _renderPluginGrid(plugins, onPluginSelect, selectedPluginId) {
    return html`
      <div class="plugin-grid">
        ${plugins.map(plugin => html`
          <ha-card 
            class="plugin-card ${selectedPluginId === plugin.id ? 'selected' : ''}"
            @click=${() => onPluginSelect(plugin)}
          >
            <div class="plugin-content">
              ${plugin.featured ? html`<div class="featured-badge">推荐</div>` : ''}
              <div class="plugin-category">${plugin.category}</div>
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-description">${plugin.description}</div>
              <div class="plugin-meta">
                <span class="plugin-author">${plugin.author}</span>
                <span class="plugin-version">v${plugin.version}</span>
              </div>
            </div>
          </ha-card>
        `)}
      </div>
    `;
  }

  static _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:package-variant-closed" class="empty-icon"></ha-icon>
        <div style="font-size: 1.1em; margin-bottom: 8px;">没有找到匹配的插件</div>
        <div style="font-size: 0.9em;">尝试调整搜索条件或选择其他分类</div>
      </div>
    `;
  }

  static _onSearchChange(query) {
    this.dispatchEvent(new CustomEvent('search-change', { 
      detail: { query } 
    }));
  }

  static _onCategoryChange(category) {
    this.dispatchEvent(new CustomEvent('category-change', { 
      detail: { category } 
    }));
  }
}
