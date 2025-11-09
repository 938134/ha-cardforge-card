// ha-cardforge-card/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';

const ButtonCard = customElements.get('button-card');

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entities: { state: true }
  };

  constructor() {
    super();
    this._entities = new Map();
    this._pluginManager = new PluginManager();
  }

  async setConfig(config) {
    this._config = this._validateConfig(config);
    this._updateEntities();
    
    // 从市场加载插件
    const plugin = await this._pluginManager.loadPlugin(this._config.plugin);
    const buttonConfig = this._convertToButtonCard(this._config, plugin);
    
    super.setConfig(buttonConfig);
  }

  _validateConfig(config) {
    return {
      plugin: '',
      theme: 'default',
      entities: {},
      custom: {},
      ...config
    };
  }

  _updateEntities() {
    this._entities.clear();
    if (!this.hass || !this._config.entities) return;
    
    Object.entries(this._config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entities.set(key, this.hass.states[entityId]);
      }
    });
  }

  _convertToButtonCard(config, plugin) {
    const entities = Object.fromEntries(this._entities);
    
    return {
      type: 'custom:button-card',
      template: plugin.getTemplate(config, entities),
      styles: plugin.getStyles(config) + this._getThemeStyles(config.theme),
      ...this._applyTheme(config)
    };
  }

  _getThemeStyles(theme) {
    const themes = {
      'default': `
        .cardforge-card { 
          background: var(--card-background-color); 
          color: var(--primary-text-color);
        }
      `,
      'dark': `
        .cardforge-card { 
          background: #1e1e1e; 
          color: white;
        }
      `,
      'material': `
        .cardforge-card { 
          background: #fafafa; 
          color: #212121;
          border-radius: 8px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        }
      `
    };
    return themes[theme] || themes.default;
  }

  _applyTheme(config) {
    const themeConfigs = {
      'dark': { style: 'background: #1e1e1e; color: white;' },
      'material': { style: 'background: #fafafa; color: #212121;' }
    };
    return themeConfigs[config.theme] || {};
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntities();
      this.setConfig(this._config);
    }
  }

  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      plugin: 'time-week',
      theme: 'default',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date'
      }
    };
  }
}

// 插件管理器
class PluginManager {
  constructor() {
    this._cache = new Map();
    this._marketplace = new PluginMarketplace();
  }

  async loadPlugin(pluginId) {
    if (this._cache.has(pluginId)) {
      return this._cache.get(pluginId);
    }

    try {
      const plugin = await this._marketplace.downloadPlugin(pluginId);
      this._cache.set(pluginId, plugin);
      return plugin;
    } catch (error) {
      console.error(`加载插件失败: ${pluginId}`, error);
      return new FallbackPlugin(pluginId);
    }
  }

  async searchPlugins(query, category = 'all') {
    return await this._marketplace.searchPlugins(query, category);
  }

  async getPluginInfo(pluginId) {
    return await this._marketplace.getPluginInfo(pluginId);
  }

  async getCategories() {
    return await this._marketplace.getCategories();
  }

  clearCache() {
    this._cache.clear();
  }
}

// 插件市场
class PluginMarketplace {
  constructor() {
    this._baseURL = 'https://raw.githubusercontent.com/your-repo/cardforge-plugins/main/';
    this._cache = new Map();
  }

  async downloadPlugin(pluginId) {
    // 从缓存获取插件信息
    const pluginInfo = await this.getPluginInfo(pluginId);
    if (!pluginInfo) {
      throw new Error(`插件不存在: ${pluginId}`);
    }

    // 下载插件代码
    const pluginURL = `${this._baseURL}plugins/${pluginId}.js`;
    try {
      const response = await fetch(pluginURL);
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }
      
      const pluginCode = await response.text();
      return this._createPluginInstance(pluginId, pluginCode, pluginInfo);
    } catch (error) {
      throw new Error(`下载插件失败: ${error.message}`);
    }
  }

  _createPluginInstance(pluginId, pluginCode, pluginInfo) {
    // 安全地执行插件代码
    try {
      const pluginFunc = new Function('pluginInfo', `
        ${pluginCode}
        return new ${pluginInfo.mainClass}();
      `);
      
      const pluginInstance = pluginFunc(pluginInfo);
      
      // 验证插件接口
      if (typeof pluginInstance.getTemplate !== 'function' || 
          typeof pluginInstance.getStyles !== 'function') {
        throw new Error('插件接口不完整');
      }
      
      return pluginInstance;
    } catch (error) {
      throw new Error(`插件初始化失败: ${error.message}`);
    }
  }

  async searchPlugins(query = '', category = 'all') {
    const plugins = await this._getPluginList();
    
    return plugins.filter(plugin => {
      const matchesQuery = !query || 
        plugin.name.toLowerCase().includes(query.toLowerCase()) ||
        plugin.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = category === 'all' || plugin.category === category;
      
      return matchesQuery && matchesCategory;
    });
  }

  async getPluginInfo(pluginId) {
    if (this._cache.has(pluginId)) {
      return this._cache.get(pluginId);
    }

    try {
      const pluginList = await this._getPluginList();
      const pluginInfo = pluginList.find(p => p.id === pluginId);
      
      if (pluginInfo) {
        this._cache.set(pluginId, pluginInfo);
      }
      
      return pluginInfo;
    } catch (error) {
      console.error('获取插件信息失败:', error);
      return null;
    }
  }

  async getCategories() {
    const plugins = await this._getPluginList();
    const categories = new Set(['all']);
    plugins.forEach(plugin => categories.add(plugin.category));
    return Array.from(categories);
  }

  async _getPluginList() {
    // 从市场获取插件列表
    try {
      const response = await fetch(`${this._baseURL}plugins/index.json`);
      if (!response.ok) {
        throw new Error('获取插件列表失败');
      }
      return await response.json();
    } catch (error) {
      console.error('获取插件列表失败:', error);
      // 返回空列表，避免阻塞
      return [];
    }
  }
}

// 回退插件
class FallbackPlugin {
  constructor(pluginId) {
    this.pluginId = pluginId;
  }

  getTemplate(config, entities) {
    return `
      <div class="cardforge-card fallback">
        <div class="error-icon">❌</div>
        <div class="error-title">插件加载失败</div>
        <div class="error-message">${this.pluginId}</div>
        <div class="error-help">请检查插件ID或网络连接</div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      .fallback {
        padding: 24px;
        text-align: center;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border-radius: 12px;
      }
      .fallback .error-icon {
        font-size: 3em;
        margin-bottom: 16px;
        color: var(--error-color);
      }
      .fallback .error-title {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--error-color);
      }
      .fallback .error-message {
        font-size: 0.9em;
        margin-bottom: 12px;
        opacity: 0.8;
      }
      .fallback .error-help {
        font-size: 0.8em;
        opacity: 0.6;
      }
    `;
  }
}

export { HaCardForgeCard };