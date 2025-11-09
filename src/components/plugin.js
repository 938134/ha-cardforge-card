// ha-cardforge-card/components/plugin.js
class PluginManager {
  constructor() {
    this._baseURL = this._getBaseURL();
    this._cache = new Map();
    this._pluginRegistry = null;
  }

  _getBaseURL() {
    // 获取当前卡片文件的基准URL
    const currentScript = document.currentScript || 
      Array.from(document.querySelectorAll('script')).find(s => 
        s.src && s.src.includes('ha-cardforge-card.js')
      );
    
    if (currentScript) {
      const url = new URL(currentScript.src);
      return url.origin + url.pathname.replace(/\/[^/]*$/, '/');
    }
    
    // 回退方案
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
      // 首先加载插件注册表
      const registry = await this._loadPluginRegistry();
      const pluginInfo = registry.plugins?.find(p => p.id === pluginId);
      
      if (!pluginInfo) {
        throw new Error(`插件未在注册表中找到: ${pluginId}`);
      }

      // 根据注册表信息加载插件
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
      // 使用动态import来安全加载
      const blob = new Blob([pluginCode], { type: 'application/javascript' });
      const blobURL = URL.createObjectURL(blob);
      
      const module = await import(blobURL);
      URL.revokeObjectURL(blobURL);
      
      if (module.default) {
        const pluginInstance = new module.default();
        
        // 验证插件接口
        this._validatePluginInterface(pluginInstance, pluginInfo);
        
        // 注入插件信息
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
    
    // 验证类名是否匹配
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
        // 分类过滤
        const matchesCategory = category === 'all' || plugin.category === category;
        if (!matchesCategory) return false;
        
        // 搜索过滤
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

  async preloadFeaturedPlugins() {
    try {
      const plugins = await this.getAvailablePlugins();
      const featured = plugins.filter(p => p.featured).slice(0, 3);
      const promises = featured.map(p => this.loadPlugin(p.id));
      return Promise.allSettled(promises);
    } catch (error) {
      console.error('预加载推荐插件失败:', error);
      return [];
    }
  }

  clearCache() {
    this._cache.clear();
    this._pluginRegistry = null;
    console.log('🧹 插件缓存已清除');
  }

  async getStats() {
    const plugins = await this.getAvailablePlugins();
    const categories = await this.getCategories();
    
    return {
      total: plugins.length,
      loaded: this._cache.size,
      categories: categories.length - 1,
      featured: plugins.filter(p => p.featured).length
    };
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

export { PluginManager };