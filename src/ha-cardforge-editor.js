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
      
      .tab-content {
        min-height: 300px;
      }
    `
  ];

  constructor() {
    super();
    this.config = { plugin: '', entities: {}, theme: 'auto' };
    this._filteredPlugins = [];
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this._activeTab = 0;
    this._initialized = false;
    this._entityChangeTimeout = null;
  }

  async firstUpdated() {
    console.log('编辑器首次更新，初始化插件系统...');
    
    // 检查必要的自定义元素是否可用
    this._checkCustomElements();
    
    await PluginRegistry.initialize();
    this._loadPlugins();
    this._initialized = true;
    console.log('编辑器初始化完成，插件数量:', PluginRegistry.getAllPlugins().length);
  }

  _checkCustomElements() {
    const requiredElements = [
      'ha-entity-picker',
      'ha-card',
      'ha-icon',
      'ha-select',
      'ha-textfield',
      'ha-circular-progress',
      'ha-combo-box',
      'mwc-button',
      'mwc-list-item'
    ];

    requiredElements.forEach(elementName => {
      const isAvailable = customElements.get(elementName) !== undefined;
      console.log(`${elementName} 可用:`, isAvailable);
      
      if (!isAvailable) {
        console.warn(`自定义元素 ${elementName} 未注册，可能需要手动加载`);
        
        // 如果 ha-combo-box 不可用，给出提示
        if (elementName === 'ha-combo-box') {
          console.log('ha-combo-box 不可用，将使用 ha-textfield 作为备选');
        }
      }
    });
  }

  setConfig(config) {
    console.log('设置编辑器配置:', config);
    this.config = { 
      plugin: '',
      entities: {},
      theme: 'auto',
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

    // 获取完整的插件对象，而不仅仅是manifest
    const activePlugin = this.config.plugin ? 
      PluginRegistry.getPlugin(this.config.plugin) : null;

    console.log('渲染编辑器，活动插件:', activePlugin?.manifest?.name, '当前选项卡:', this._activeTab, '插件对象:', activePlugin);

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
    console.log('渲染活动选项卡:', this._activeTab, 'hass:', !!this.hass, 'plugin对象:', activePlugin);
    
    switch (this._activeTab) {
      case 0:
        return PluginMarketplace.render(
          this._searchQuery,
          this._selectedCategory,
          this._filteredPlugins,
          (plugin) => this._selectPlugin(plugin),
          this.config.plugin,
          (query) => this._onSearchChange(query),
          (category) => this._onCategoryChange(category)
        );
      
      case 1:
        console.log('渲染实体配置，hass 状态:', !!this.hass, '插件实体需求:', activePlugin?.manifest?.entityRequirements);
        // 传递完整的插件对象，而不仅仅是manifest
        return EntityConfig.render(
          this.hass,
          this.config,
          activePlugin, // 传递完整的插件对象
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
    console.log('加载插件完成，数量:', this._filteredPlugins.length);
  }

  _switchTab(tabIndex) {
    console.log('切换选项卡:', tabIndex);
    this._activeTab = tabIndex;
    this.requestUpdate();
  }

  _selectPlugin(plugin) {
    console.log('选择插件:', plugin.name, plugin.id);
    
    const defaultEntities = {};
    const fullPlugin = PluginRegistry.getPlugin(plugin.id);
    console.log('完整插件信息:', fullPlugin);
    
    const requirements = fullPlugin?.manifest.entityRequirements || [];
    console.log('实体需求:', requirements);
    
    requirements.forEach(req => {
      defaultEntities[req.key] = '';
    });

    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: { ...defaultEntities, ...this.config.entities }
    };
    
    console.log('更新后的配置:', this.config);
    
    this._notifyConfigUpdate();
    
    if (requirements.length > 0) {
      this._activeTab = 1;
      console.log('切换到实体配置选项卡');
    } else {
      this._activeTab = 2;
      console.log('切换到主题设置选项卡');
    }
    
    this.requestUpdate();
  }

  _onEntityChange(key, value) {
    console.log('实体变更:', key, value);
    
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    
    console.log('更新实体配置:', this.config.entities);
    
    this.requestUpdate();
    
    clearTimeout(this._entityChangeTimeout);
    this._entityChangeTimeout = setTimeout(() => {
      this._notifyConfigUpdate();
    }, 300);
  }

  _onThemeChange(theme) {
    console.log('主题变更:', theme);
    if (!theme || theme === '') return;
    
    this.config.theme = theme;
    this.requestUpdate();
    this._notifyConfigUpdate();
  }

  _onSearchChange(query) {
    console.log('搜索变更:', query);
    this._searchQuery = query;
    this._loadPlugins();
    this.requestUpdate();
  }

  _onCategoryChange(category) {
    console.log('分类变更:', category);
    this._selectedCategory = category;
    this._loadPlugins();
    this.requestUpdate();
  }

  _notifyConfigUpdate() {
    console.log('通知配置变更:', this.config);
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _save() {
    console.log('保存配置');
    this._notifyConfigUpdate();
  }

  _cancel() {
    console.log('取消编辑');
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      console.log('hass 对象已更新');
    }
    
    // 检查实体选择器是否渲染
    if (this._activeTab === 1 && this.config.plugin) {
      setTimeout(() => {
        const entityPickers = this.shadowRoot?.querySelectorAll('ha-entity-picker');
        console.log('实体选择器数量:', entityPickers?.length);
        if (entityPickers) {
          entityPickers.forEach((picker, index) => {
            console.log(`实体选择器 ${index}:`, picker, 'hass:', picker.hass);
          });
        }
      }, 100);
    }
  }
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

export { HaCardForgeEditor };