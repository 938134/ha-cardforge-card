// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { EditorTabs } from './core/editor-tabs.js';
import { PluginMarketplace } from './core/plugin-marketplace.js';
import { EntityConfig } from './core/entity-config.js';
import { ThemeConfig } from './core/theme-config.js';
import { sharedStyles } from './core/shared-styles.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _filteredPlugins: { state: true },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _activeTab: { state: true },
    _initialized: { state: true }
  };

  static styles = [
    sharedStyles,
    css`
      .editor-container {
        padding: 16px;
      }
      
      .tabs-container {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 20px;
      }
      
      .tab-button {
        padding: 12px 24px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .tab-button:hover {
        color: var(--primary-text-color);
      }
      
      .tab-button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }
      
      .tab-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .card-actions {
        margin-top: 24px;
        text-align: right;
        border-top: 1px solid var(--divider-color);
        padding-top: 16px;
      }
    `
  ];

  constructor() {
    super();
    this.config = { plugin: '', entities: {}, theme: 'default' };
    this._filteredPlugins = [];
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this._activeTab = 0;
    this._initialized = false;
    this._entityChangeTimeout = null;
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    this._loadPlugins();
    this._initialized = true;
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      theme: 'default',
      ...config 
    };
  }

  render() {
    if (!this._initialized) {
      return html`
        <ha-card>
          <div class="empty-state">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div style="margin-top: 16px;">初始化插件系统...</div>
          </div>
        </ha-card>
      `;
    }

    const activePlugin = this._plugins.find(p => p.id === this.config.plugin);

    return html`
      <div class="editor-container">
        ${EditorTabs.renderTabs(this._activeTab, (tab) => this._switchTab(tab), !!this.config.plugin)}
        
        <div class="tab-content">
          ${this._renderActiveTab(activePlugin)}
        </div>

        <div class="card-actions">
          <mwc-button outlined label="取消" @click=${this._cancel}></mwc-button>
          <mwc-button 
            raised 
            label="保存配置" 
            @click=${this._save} 
            .disabled=${!this.config.plugin}
          ></mwc-button>
        </div>
      </div>
    `;
  }

  _renderActiveTab(activePlugin) {
    switch (this._activeTab) {
      case 0:
        return PluginMarketplace.render(
          this._searchQuery,
          this._selectedCategory,
          this._filteredPlugins,
          (plugin) => this._selectPlugin(plugin),
          this.config.plugin
        );
      
      case 1:
        return EntityConfig.render(
          this.hass,
          this.config,
          activePlugin,
          (key, value) => this._onEntityChange(key, value)
        );
      
      case 2:
        return ThemeConfig.render(
          this.config,
          activePlugin,
          (theme) => this._onThemeChange(theme)
        );
      
      default:
        return html`<div>未知选项卡</div>`;
    }
  }

  _loadPlugins() {
    this._filteredPlugins = PluginRegistry.getPluginsForMarketplace({
      category: this._selectedCategory,
      searchQuery: this._searchQuery
    });
  }

  get _plugins() {
    return PluginRegistry.getAllPlugins();
  }

  _switchTab(tabIndex) {
    this._activeTab = tabIndex;
    this.requestUpdate();
  }

  _selectPlugin(plugin) {
    const defaultEntities = {};
    const requirements = plugin.entityRequirements || [];
    requirements.forEach(req => {
      defaultEntities[req.key] = '';
    });

    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: { ...defaultEntities, ...this.config.entities }
    };
    
    this._notifyConfigUpdate();
    
    if (requirements.length > 0) {
      this._activeTab = 1;
    }
  }

  _onEntityChange(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    
    this.requestUpdate();
    
    clearTimeout(this._entityChangeTimeout);
    this._entityChangeTimeout = setTimeout(() => {
      this._notifyConfigUpdate();
    }, 300);
  }

  _onThemeChange(theme) {
    if (!theme || theme === '') return;
    
    this.config.theme = theme;
    this.requestUpdate();
    this._notifyConfigUpdate();
  }

  _onSearchChange(query) {
    this._searchQuery = query;
    this._loadPlugins();
    this.requestUpdate();
  }

  _onCategoryChange(category) {
    this._selectedCategory = category;
    this._loadPlugins();
    this.requestUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _save() {
    this._notifyConfigUpdate();
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
  }
}

customElements.get('ha-cardforge-editor') || customElements.define('ha-cardforge-editor', HaCardForgeEditor);
export { HaCardForgeEditor };
