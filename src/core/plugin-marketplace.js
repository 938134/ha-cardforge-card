// src/core/plugin-marketplace.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './plugin-registry.js';

export class PluginMarketplace {
  static render(searchQuery, selectedCategory, plugins, onPluginSelect, selectedPluginId, onSearchChange, onCategoryChange) {
    return html`
      <div class="marketplace-container">
        ${this._renderSearchHeader(searchQuery, selectedCategory, onSearchChange, onCategoryChange)}
        ${this._renderPluginGrid(plugins, onPluginSelect, selectedPluginId)}
        ${plugins.length === 0 ? this._renderEmptyState() : ''}
      </div>
    `;
  }

  static _renderSearchHeader(searchQuery, selectedCategory, onSearchChange, onCategoryChange) {
    const categories = PluginRegistry.getMarketplaceCategories();
    const allPlugins = PluginRegistry.getAllPlugins();
    
    // 获取所有插件的名称用于自动完成
    const pluginNames = allPlugins.map(plugin => plugin.name);

    return html`
      <div class="search-header">
        <div class="combo-box-container">
          <ha-combo-box
            .label=${"搜索插件名称..."}
            .value=${searchQuery}
            .items=${pluginNames}
            @value-changed=${e => onSearchChange(e.detail.value)}
            allow-custom-value
            style="width: 100%;"
          ></ha-combo-box>
        </div>
        
        <ha-select
          label="分类"
          .value=${selectedCategory}
          @selected=${e => onCategoryChange(e.target.value)}
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
      <div class="plugin-grid-compact">
        ${plugins.map(plugin => html`
          <ha-card 
            class="plugin-card-compact ${selectedPluginId === plugin.id ? 'selected' : ''}"
            @click=${() => onPluginSelect(plugin)}
          >
            <div class="plugin-content-compact">
              ${plugin.featured ? html`<div class="featured-badge">推荐</div>` : ''}
              <div class="plugin-icon-compact">${plugin.icon}</div>
              <div class="plugin-info-compact">
                <div class="plugin-name-compact">${plugin.name}</div>
                <div class="plugin-category-compact">${plugin.category}</div>
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
}