// ha-cardforge-card/managers/plugin.js
class PluginManager {
  static _instance = null;
  static _installedPlugins = new Map();
  static _availablePlugins = new Map();
  static _cache = new Map();
  static _marketplaces = new Map();
  static _currentMarketplace = null;
  static _initialized = false;

  constructor() {
    if (PluginManager._instance) {
      return PluginManager._instance;
    }
    PluginManager._instance = this;
    
    // 注册默认市场
    this._registerDefaultMarketplaces();
  }

  // 注册默认市场
  _registerDefaultMarketplaces() {
    // 官方市场
    PluginManager._marketplaces.set('official', {
      id: 'official',
      name: '官方市场',
      description: 'CardForge 官方插件市场',
      baseURL: 'https://raw.githubusercontent.com/938134/ha-cardforge-card/plugins/',
      icon: '🏢',
      official: true,
      enabled: true
    });

    // 社区市场（预留）
    PluginManager._marketplaces.set('community', {
      id: 'community',
      name: '社区市场',
      description: '社区贡献的插件',
      baseURL: '',
      icon: '👥',
      official: false,
      enabled: false
    });

    // 本地市场
    PluginManager._marketplaces.set('local', {
      id: 'local',
      name: '本地插件',
      description: '用户自定义插件',
      baseURL: '',
      icon: '💻',
      official: false,
      enabled: true
    });

    PluginManager._currentMarketplace = 'official';
  }

  async init() {
    if (PluginManager._initialized) return;
    
    await this._loadInstalledPlugins();
    await this._loadBuiltinPlugins();
    await this._refreshMarketplacePlugins();
    PluginManager._initialized = true;
  }

  async _loadInstalledPlugins() {
    try {
      const stored = localStorage.getItem('cardforge-installed-plugins');
      if (stored) {
        const plugins = JSON.parse(stored);
        plugins.forEach(plugin => {
          PluginManager._installedPlugins.set(plugin.id, {
            ...plugin,
            installed: true,
            local: true,
            marketplace: plugin.marketplace || 'local'
          });
        });
      }
    } catch (error) {
      console.warn('加载已安装插件失败:', error);
    }
  }

  async _loadBuiltinPlugins() {
    console.log('🔧 加载内置插件...');
    const builtinPlugins = this._getBuiltinPluginsList();
    
    builtinPlugins.forEach(plugin => {
      const pluginInfo = {
        ...plugin,
        builtin: true,
        installed: true,
        local: true,
        marketplace: 'builtin'
      };
      PluginManager._availablePlugins.set(plugin.id, pluginInfo);
      PluginManager._installedPlugins.set(plugin.id, pluginInfo);
    });
  }

  _getBuiltinPluginsList() {
    // 基础内置插件
    return [
      {
        id: 'time-week',
        name: '时间星期',
        description: '垂直布局的时间星期显示',
        author: 'CardForge Team',
        version: '1.0.0',
        icon: '⏰',
        category: 'time',
        mainClass: 'TimeWeekPlugin',
        requiresWeek: true,
        featured: true
      },
      {
        id: 'time-card',
        name: '时间卡片',
        description: '水平布局的时间日期卡片',
        author: 'CardForge Team',
        version: '1.0.0',
        icon: '🕒',
        category: 'time',
        mainClass: 'TimeCardPlugin',
        requiresWeek: true
      },
      {
        id: 'weather',
        name: '天气卡片',
        description: '简洁的天气信息显示',
        author: 'CardForge Team',
        version: '1.0.0',
        icon: '🌤️',
        category: 'weather',
        mainClass: 'WeatherPlugin'
      },
      {
        id: 'clock-lunar',
        name: '时钟农历',
        description: '模拟时钟和农历信息',
        author: 'CardForge Team',
        version: '1.0.0',
        icon: '🌙',
        category: 'time',
        mainClass: 'ClockLunarPlugin'
      },
      {
        id: 'welcome',
        name: '欢迎卡片',
        description: '个性化欢迎信息',
        author: 'CardForge Team',
        version: '1.0.0',
        icon: '👋',
        category: 'info',
        mainClass: 'WelcomePlugin'
      }
    ];
  }

  async _refreshMarketplacePlugins() {
    const marketplace = this.getCurrentMarketplace();
    if (!marketplace.enabled || !marketplace.baseURL) {
      console.log(`市场 ${marketplace.name} 未启用或无基础URL`);
      return;
    }

    try {
      const indexUrl = `${marketplace.baseURL}index.json`;
      console.log(`📡 从 ${indexUrl} 加载插件列表...`);
      
      const response = await fetch(indexUrl, { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ 从 ${marketplace.name} 发现 ${data.plugins?.length || 0} 个插件`);
        
        if (data.plugins && Array.isArray(data.plugins)) {
          data.plugins.forEach(plugin => {
            const pluginId = plugin.id;
            const existingPlugin = PluginManager._availablePlugins.get(pluginId);
            
            if (!existingPlugin || existingPlugin.marketplace === marketplace.id) {
              const pluginInfo = {
                ...plugin,
                marketplace: marketplace.id,
                remote: true,
                downloadUrl: `${marketplace.baseURL}${pluginId}.js`,
                installed: PluginManager._installedPlugins.has(pluginId),
                source: marketplace.name
              };
              PluginManager._availablePlugins.set(pluginId, pluginInfo);
            }
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`❌ 加载市场 ${marketplace.name} 插件失败:`, error);
    }
  }

  _saveInstalledPlugins() {
    try {
      const plugins = Array.from(PluginManager._installedPlugins.values())
        .filter(plugin => !plugin.builtin && plugin.marketplace !== 'builtin');
      localStorage.setItem('cardforge-installed-plugins', JSON.stringify(plugins));
    } catch (error) {
      console.warn('保存已安装插件失败:', error);
    }
  }

  // 市场管理 API
  getMarketplaces() {
    return Array.from(PluginManager._marketplaces.values());
  }

  getCurrentMarketplace() {
    return PluginManager._marketplaces.get(PluginManager._currentMarketplace);
  }

  setCurrentMarketplace(marketplaceId) {
    if (PluginManager._marketplaces.has(marketplaceId)) {
      PluginManager._currentMarketplace = marketplaceId;
      return true;
    }
    return false;
  }

  addMarketplace(marketplace) {
    if (!marketplace.id || !marketplace.baseURL) {
      throw new Error('市场配置不完整');
    }
    
    PluginManager._marketplaces.set(marketplace.id, {
      ...marketplace,
      enabled: true
    });
    
    this._saveMarketplaces();
    return true;
  }

  removeMarketplace(marketplaceId) {
    if (marketplaceId === 'official' || marketplaceId === 'builtin') {
      throw new Error('不能删除官方或内置市场');
    }
    
    if (PluginManager._marketplaces.has(marketplaceId)) {
      PluginManager._marketplaces.delete(marketplaceId);
      
      if (PluginManager._currentMarketplace === marketplaceId) {
        PluginManager._currentMarketplace = 'official';
      }
      
      this._saveMarketplaces();
      return true;
    }
    return false;
  }

  _saveMarketplaces() {
    try {
      const customMarketplaces = Array.from(PluginManager._marketplaces.values())
        .filter(m => !m.official && m.id !== 'builtin' && m.id !== 'local');
      localStorage.setItem('cardforge-custom-marketplaces', JSON.stringify(customMarketplaces));
    } catch (error) {
      console.warn('保存自定义市场失败:', error);
    }
  }

  // 插件管理 API
  async getAvailablePlugins(marketplaceId = null) {
    await this.init();
    
    let plugins = Array.from(PluginManager._availablePlugins.values());
    
    if (marketplaceId) {
      plugins = plugins.filter(plugin => plugin.marketplace === marketplaceId);
    }
    
    return plugins;
  }

  getInstalledPlugins() {
    return Array.from(PluginManager._installedPlugins.values());
  }

  async getCategories(marketplaceId = null) {
    const plugins = await this.getAvailablePlugins(marketplaceId);
    const categories = new Set(['all']);
    plugins.forEach(plugin => categories.add(plugin.category));
    return Array.from(categories);
  }

  async installPlugin(pluginId) {
    await this.init();
    
    const pluginInfo = PluginManager._availablePlugins.get(pluginId);
    if (!pluginInfo) {
      throw new Error(`插件不存在: ${pluginId}`);
    }

    if (PluginManager._installedPlugins.has(pluginId)) {
      console.log(`插件 ${pluginId} 已安装`);
      return true;
    }

    try {
      let pluginCode;
      if (pluginInfo.builtin || pluginInfo.marketplace === 'builtin') {
        pluginCode = await this._loadBuiltinPluginCode(pluginId);
      } else {
        pluginCode = await this._downloadPlugin(pluginId);
        localStorage.setItem(`cardforge-plugin-${pluginId}`, pluginCode);
      }

      if (!this._validatePluginCode(pluginCode)) {
        throw new Error('插件代码验证失败');
      }

      const installedPlugin = {
        ...pluginInfo,
        installed: true,
        installTime: new Date().toISOString()
      };
      
      PluginManager._installedPlugins.set(pluginId, installedPlugin);
      PluginManager._availablePlugins.set(pluginId, installedPlugin);
      this._saveInstalledPlugins();

      console.log(`✅ 插件安装成功: ${pluginInfo.name}`);
      return true;
    } catch (error) {
      console.error(`❌ 插件安装失败: ${pluginId}`, error);
      throw error;
    }
  }

  async uninstallPlugin(pluginId) {
    const pluginInfo = PluginManager._installedPlugins.get(pluginId);
    if (!pluginInfo) {
      throw new Error(`插件未安装: ${pluginId}`);
    }

    if (pluginInfo.builtin || pluginInfo.marketplace === 'builtin') {
      throw new Error('内置插件不能删除');
    }

    localStorage.removeItem(`cardforge-plugin-${pluginId}`);
    PluginManager._installedPlugins.delete(pluginId);
    PluginManager._cache.delete(pluginId);
    
    const availablePlugin = PluginManager._availablePlugins.get(pluginId);
    if (availablePlugin) {
      PluginManager._availablePlugins.set(pluginId, {
        ...availablePlugin,
        installed: false
      });
    }
    
    this._saveInstalledPlugins();

    console.log(`🗑️ 插件删除成功: ${pluginInfo.name}`);
    return true;
  }

  async loadPlugin(pluginId) {
    await this.init();
    
    if (PluginManager._cache.has(pluginId)) {
      return PluginManager._cache.get(pluginId);
    }

    const pluginInfo = PluginManager._installedPlugins.get(pluginId);
    if (!pluginInfo) {
      throw new Error(`插件未安装: ${pluginId}`);
    }

    try {
      let pluginCode;
      if (pluginInfo.builtin || pluginInfo.marketplace === 'builtin') {
        pluginCode = await this._loadBuiltinPluginCode(pluginId);
      } else {
        pluginCode = await this._loadInstalledPluginCode(pluginId);
      }

      const pluginInstance = this._createPluginInstance(pluginCode, pluginInfo);
      PluginManager._cache.set(pluginId, pluginInstance);

      return pluginInstance;
    } catch (error) {
      console.error(`加载插件失败: ${pluginId}`, error);
      throw error;
    }
  }

  async getFallbackPlugin(pluginId) {
    return {
      getTemplate: (config, entities) => {
        return `
          <div class="cardforge-card fallback">
            <div class="error-icon">❌</div>
            <div class="error-title">插件加载失败</div>
            <div class="error-message">${pluginId}</div>
            <div class="error-help">请检查插件ID或网络连接</div>
          </div>
        `;
      },
      getStyles: (config) => {
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
    };
  }

  async _downloadPlugin(pluginId) {
    const pluginInfo = PluginManager._availablePlugins.get(pluginId);
    if (!pluginInfo.downloadUrl) {
      throw new Error('插件下载地址未配置');
    }

    console.log(`📥 下载插件: ${pluginInfo.downloadUrl}`);
    const response = await fetch(pluginInfo.downloadUrl, { 
      cache: 'no-cache' 
    });
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    const code = await response.text();
    
    if (!code || code.trim().length === 0) {
      throw new Error('插件代码为空');
    }

    return code;
  }

  async _loadInstalledPluginCode(pluginId) {
    try {
      const stored = localStorage.getItem(`cardforge-plugin-${pluginId}`);
      if (!stored) {
        throw new Error('插件代码未找到');
      }
      return stored;
    } catch (error) {
      throw new Error(`加载插件代码失败: ${error.message}`);
    }
  }

  async _loadBuiltinPluginCode(pluginId) {
    return `
      class BuiltinPluginWrapper {
        constructor() {
          this.pluginId = '${pluginId}';
        }
        
        getTemplate(config, entities) {
          if (window.builtinPlugins && window.builtinPlugins['${pluginId}']) {
            return window.builtinPlugins['${pluginId}'].getTemplate(config, entities);
          }
          return '<div class="fallback-plugin">插件加载中...</div>';
        }
        
        getStyles(config) {
          if (window.builtinPlugins && window.builtinPlugins['${pluginId}']) {
            return window.builtinPlugins['${pluginId}'].getStyles(config);
          }
          return '.fallback-plugin { padding: 20px; text-align: center; color: #666; }';
        }
      }
    `;
  }

  _validatePluginCode(code) {
    if (typeof code !== 'string') return false;
    if (code.length > 100000) return false;
    if (code.length < 10) return false;
    
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'document.write',
      'window.location',
      'XMLHttpRequest',
      'fetch(',
      'importScripts'
    ];
    
    for (const pattern of dangerousPatterns) {
      if (code.includes(pattern)) {
        console.warn(`插件代码包含危险模式: ${pattern}`);
        return false;
      }
    }
    
    return true;
  }

  _createPluginInstance(code, pluginInfo) {
    try {
      const pluginFunc = new Function('pluginInfo', `
        "use strict";
        ${code}
        return new ${pluginInfo.mainClass}();
      `);
      
      const pluginInstance = pluginFunc(pluginInfo);
      
      if (typeof pluginInstance.getTemplate !== 'function' || 
          typeof pluginInstance.getStyles !== 'function') {
        throw new Error('插件接口不完整');
      }
      
      return pluginInstance;
    } catch (error) {
      throw new Error(`插件初始化失败: ${error.message}`);
    }
  }

  async refreshMarketplace(marketplaceId = null) {
    if (marketplaceId) {
      await this._refreshMarketplacePlugins();
    } else {
      for (const marketplace of this.getMarketplaces()) {
        if (marketplace.enabled) {
          PluginManager._currentMarketplace = marketplace.id;
          await this._refreshMarketplacePlugins();
        }
      }
      PluginManager._currentMarketplace = this.getCurrentMarketplace().id;
    }
  }

  clearCache() {
    PluginManager._cache.clear();
    return true;
  }

  getStats() {
    const totalPlugins = PluginManager._availablePlugins.size;
    const installedPlugins = PluginManager._installedPlugins.size;
    const marketplaces = this.getMarketplaces().filter(m => m.enabled).length;
    
    return {
      totalPlugins,
      installedPlugins,
      marketplaces,
      cacheSize: PluginManager._cache.size
    };
  }
}

// 全局单例
window.PluginManager = PluginManager;
export { PluginManager };