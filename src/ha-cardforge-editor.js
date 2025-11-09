// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PLUGIN_INFO } from './core/plugin-registry.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _searchQuery: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 800px;
    }
    
    .search-header {
      margin-bottom: 20px;
    }
    
    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .plugin-card {
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .plugin-card:hover {
      border-color: var(--primary-color);
    }
    
    .plugin-card.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .plugin-icon {
      font-size: 2.2em;
      margin-bottom: 8px;
    }
    
    .plugin-name {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 0.9em;
    }
    
    .plugin-description {
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    
    .preview-section {
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 20px;
      margin: 20px 0;
      border: 1px solid var(--divider-color);
    }
    
    .preview-container {
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .preview-placeholder {
      text-align: center;
      color: var(--secondary-text-color);
    }
    
    .entity-config {
      margin: 20px 0;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .actions {
      margin-top: 24px;
      text-align: right;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._plugins = PLUGIN_INFO;
    this._searchQuery = '';
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      ...config 
    };
  }

  render() {
    return html`
      <div class="editor">
        <!-- 插件选择 -->
        <div class="search-header">
          <ha-textfield
            class="flex"
            label="搜索插件..."
            .value=${this._searchQuery}
            @input=${e => this._searchQuery = e.target.value}
            icon="mdi:magnify"
          ></ha-textfield>
        </div>

        <div class="plugin-grid">
          ${this._getFilteredPlugins().map(plugin => html`
            <div class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
                 @click=${() => this._selectPlugin(plugin)}>
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-description">${plugin.description}</div>
            </div>
          `)}
        </div>

        <!-- 实体配置 -->
        ${this.config.plugin ? this._renderEntityConfig() : ''}

        <!-- 预览区域 -->
        <div class="preview-section">
          <div class="preview-container">
            ${this._renderPreview()}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <mwc-button 
            outlined
            label="取消"
            @click=${this._cancel}
          ></mwc-button>
          <mwc-button 
            raised
            label="保存"
            @click=${this._save}
            .disabled=${!this.config.plugin}
          ></mwc-button>
        </div>
      </div>
    `;
  }

  _renderEntityConfig() {
    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    if (!plugin?.entityRequirements || plugin.entityRequirements.length === 0) {
      return html``;
    }

    return html`
      <div class="entity-config">
        <h3>实体配置</h3>
        ${plugin.entityRequirements.map(req => html`
          <div class="entity-row">
            <div>${req.description}</div>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this.config.entities?.[req.key] || ''}
              @value-changed=${e => this._entityChanged(req.key, e.detail.value)}
              allow-custom-entity
              .label=${`选择${req.description}`}
            ></ha-entity-picker>
          </div>
        `)}
      </div>
    `;
  }

  _renderPreview() {
    if (!this.config.plugin) {
      return html`
        <div class="preview-placeholder">
          <ha-icon icon="mdi:card-bulleted-outline"></ha-icon>
          <div>选择插件后显示预览</div>
        </div>
      `;
    }

    // 创建预览配置，确保包含所有必要字段
    const previewConfig = {
      plugin: this.config.plugin,
      entities: this.config.entities || {},
      // 添加其他必要字段
      ...this.config
    };

    return html`
      <ha-cardforge-card
        .hass=${this.hass}
        .config=${previewConfig}
      ></ha-cardforge-card>
    `;
  }

  _getFilteredPlugins() {
    if (!this._searchQuery) {
      return this._plugins;
    }
    
    const query = this._searchQuery.toLowerCase();
    return this._plugins.filter(plugin => 
      plugin.name.toLowerCase().includes(query) ||
      plugin.description.toLowerCase().includes(query)
    );
  }

  _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._getDefaultEntities(plugin)
    };
    this.requestUpdate();
  }

  _getDefaultEntities(plugin) {
    const defaults = {};
    plugin.entityRequirements?.forEach(req => {
      if (req.key === 'time') defaults.time = 'sensor.time';
      if (req.key === 'date') defaults.date = 'sensor.date';
      if (req.key === 'week') defaults.week = 'sensor.xing_qi';
    });
    return { ...defaults, ...this.config.entities };
  }

  _entityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this.requestUpdate();
  }

  _save() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
  }
}

export { HaCardForgeEditor };