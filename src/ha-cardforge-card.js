// ha-cardforge-card/src/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';

const ButtonCard = customElements.get('button-card');

// 内联 PluginManager 定义
class PluginManager {
  constructor() {
    this._baseURL = this._getBaseURL();
    this._cache = new Map();
    this._pluginRegistry = null;
  }

  _getBaseURL() {
    const currentScript = document.currentScript || 
      Array.from(document.querySelectorAll('script')).find(s => 
        s.src && s.src.includes('ha-cardforge-card.js')
      );
    
    if (currentScript) {
      const url = new URL(currentScript.src);
      return url.origin + url.pathname.replace(/\/[^/]*$/, '/');
    }
    
    return '/local/ha-cardforge-card/';
  }

  async _loadPluginRegistry() {
    if (this._pluginRegistry) {
      return this._pluginRegistry;
    }

    try {
      const response = await fetch(`${this._baseURL}plugins/index.json`);
      if (!response.ok) {
        throw new Error(`获取插件注册表失败: ${response.status}`);
      }
      
      this._pluginRegistry = await response.json();
      console.log(`✅ 加载插件注册表，共 ${this._pluginRegistry.plugins?.length || 0} 个插件`);
      return this._pluginRegistry;
    } catch (error) {
      console.error('❌ 加载插件注册表失败:', error);
      this._pluginRegistry = { plugins: [] };
      return this._pluginRegistry;
    }
  }

  async loadPlugin(pluginId) {
    if (this._cache.has(pluginId)) {
      return this._cache.get(pluginId);
    }

    try {
      const registry = await this._loadPluginRegistry();
      const pluginInfo = registry.plugins?.find(p => p.id === pluginId);
      
      if (!pluginInfo) {
        throw new Error(`插件未在注册表中找到: ${pluginId}`);
      }

      const pluginURL = `${this._baseURL}plugins/${pluginId}.js`;
      console.log(`📥 加载插件: ${pluginURL}`);
      
      const response = await fetch(pluginURL);
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }
      
      const pluginCode = await response.text();
      const plugin = await this._createPluginInstance(pluginInfo, pluginCode);
      
      this._cache.set(pluginId, plugin);
      return plugin;
    } catch (error) {
      console.error(`❌ 加载插件失败: ${pluginId}`, error);
      return new FallbackPlugin(pluginId, error.message);
    }
  }

  async _createPluginInstance(pluginInfo, pluginCode) {
    try {
      const blob = new Blob([pluginCode], { type: 'application/javascript' });
      const blobURL = URL.createObjectURL(blob);
      
      const module = await import(blobURL);
      URL.revokeObjectURL(blobURL);
      
      if (module.default) {
        const pluginInstance = new module.default();
        
        this._validatePluginInterface(pluginInstance, pluginInfo);
        pluginInstance.pluginInfo = pluginInfo;
        
        return pluginInstance;
      } else {
        throw new Error('插件未导出默认类');
      }
    } catch (error) {
      console.error('插件实例化失败:', error);
      throw new Error(`插件格式错误: ${error.message}`);
    }
  }

  _validatePluginInterface(pluginInstance, pluginInfo) {
    const requiredMethods = ['getTemplate', 'getStyles'];
    const missingMethods = requiredMethods.filter(method => 
      typeof pluginInstance[method] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      throw new Error(`插件接口不完整，缺少方法: ${missingMethods.join(', ')}`);
    }
    
    const expectedClass = pluginInfo.mainClass;
    const actualClass = pluginInstance.constructor.name;
    
    if (expectedClass && expectedClass !== actualClass) {
      console.warn(`⚠️ 插件类名不匹配: 期望 ${expectedClass}, 实际 ${actualClass}`);
    }
  }

  async getAvailablePlugins() {
    try {
      const registry = await this._loadPluginRegistry();
      return registry.plugins || [];
    } catch (error) {
      console.error('获取可用插件失败:', error);
      return [];
    }
  }

  async getPluginInfo(pluginId) {
    try {
      const registry = await this._loadPluginRegistry();
      return registry.plugins?.find(p => p.id === pluginId) || null;
    } catch (error) {
      console.error(`获取插件信息失败: ${pluginId}`, error);
      return null;
    }
  }

  async getCategories() {
    try {
      const plugins = await this.getAvailablePlugins();
      const categories = new Set(['all']);
      plugins.forEach(plugin => {
        if (plugin.category) {
          categories.add(plugin.category);
        }
      });
      return Array.from(categories);
    } catch (error) {
      console.error('获取分类失败:', error);
      return ['all'];
    }
  }

  async searchPlugins(query = '', category = 'all') {
    try {
      const plugins = await this.getAvailablePlugins();
      
      return plugins.filter(plugin => {
        const matchesCategory = category === 'all' || plugin.category === category;
        if (!matchesCategory) return false;
        
        if (!query) return true;
        
        const searchTerm = query.toLowerCase();
        return (
          plugin.name.toLowerCase().includes(searchTerm) ||
          plugin.description.toLowerCase().includes(searchTerm) ||
          plugin.id.toLowerCase().includes(searchTerm)
        );
      });
    } catch (error) {
      console.error('搜索插件失败:', error);
      return [];
    }
  }

  clearCache() {
    this._cache.clear();
    this._pluginRegistry = null;
    console.log('🧹 插件缓存已清除');
  }
}

class FallbackPlugin {
  constructor(pluginId, errorMessage = '未知错误') {
    this.pluginId = pluginId;
    this.errorMessage = errorMessage;
    this.pluginInfo = {
      id: pluginId,
      name: '加载失败',
      description: '插件加载异常',
      icon: '❌',
      category: 'system'
    };
  }

  getTemplate(config, entities) {
    return `
      <div class="cardforge-card fallback">
        <div class="error-icon">⚠️</div>
        <div class="error-title">插件加载失败</div>
        <div class="error-plugin">${this.pluginId}</div>
        <div class="error-message">${this.errorMessage}</div>
        <div class="error-help">请检查插件配置或网络连接</div>
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
        border: 2px dashed var(--error-color);
      }
      .fallback .error-icon {
        font-size: 3em;
        margin-bottom: 16px;
        color: var(--warning-color);
      }
      .fallback .error-title {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--error-color);
      }
      .fallback .error-plugin {
        font-size: 1em;
        margin-bottom: 8px;
        opacity: 0.8;
        font-family: monospace;
      }
      .fallback .error-message {
        font-size: 0.9em;
        margin-bottom: 12px;
        opacity: 0.7;
      }
      .fallback .error-help {
        font-size: 0.8em;
        opacity: 0.6;
      }
    `;
  }

  getEntityRequirements() {
    return { required: [], optional: [] };
  }
}

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entities: { state: true },
    _plugin: { state: true },
    _error: { state: true }
  };

  constructor() {
    super();
    this._entities = new Map();
    this._pluginManager = new PluginManager();
    this._plugin = null;
    this._error = null;
  }

  async setConfig(config) {
    this._config = this._validateConfig(config);
    this._updateEntities();
    this._error = null;
    
    try {
      this._plugin = await this._pluginManager.loadPlugin(this._config.plugin);
      
      const validation = this._validateEntities();
      if (!validation.valid) {
        this._error = validation.errors.join(', ');
      }
      
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
      
    } catch (error) {
      this._error = `插件加载失败: ${error.message}`;
      console.error('卡片配置错误:', error);
      
      this._plugin = new FallbackPlugin(this._config.plugin);
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
    }
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

  _validateEntities() {
    const requirements = this._plugin?.getEntityRequirements?.() || { required: [] };
    const errors = [];
    
    requirements.required.forEach(req => {
      if (!this._config.entities?.[req.key]) {
        errors.push(`缺少必需实体: ${req.description}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
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
      if (this._config) {
        this.setConfig(this._config);
      }
    }
  }

  render() {
    if (this._error) {
      return html`
        <div class="cardforge-error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <div>${this._error}</div>
        </div>
      `;
    }
    return super.render();
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

export { HaCardForgeCard };