// src/core/plugin-registry.js
class PluginRegistry {
  static _plugins = new Map();
  static _initialized = false;
  static _listeners = new Set();

  static async initialize() {
    if (this._initialized) return;

    try {
      await this._discoverPlugins();
      this._initialized = true;
      this._notifyListeners('initialized');
      console.log(`✅ 插件注册表初始化完成，加载 ${this._plugins.size} 个插件`);
    } catch (error) {
      console.error('❌ 插件注册表初始化失败:', error);
      this._notifyListeners('error', error);
    }
  }

  static on(event, callback) {
    this._listeners.add({ event, callback });
    return () => this._listeners.delete({ event, callback });
  }

  static _notifyListeners(event, data) {
    this._listeners.forEach(({ event: listenerEvent, callback }) => {
      if (listenerEvent === event) {
        callback(data);
      }
    });
  }

  static async _discoverPlugins() {
    const pluginManifest = {
      'simple-clock': () => import('../plugins/simple-clock.js'),
      'weather-card': () => import('../plugins/weather-card.js'),
      'welcome-card': () => import('../plugins/welcome-card.js'),
      'time-week': () => import('../plugins/time-week.js')
    };

    const results = await Promise.allSettled(
      Object.entries(pluginManifest).map(async ([pluginId, importFn]) => {
        try {
          const module = await importFn();
          return this._validateAndRegister(pluginId, module);
        } catch (error) {
          console.error(`❌ 加载插件 ${pluginId} 失败:`, error);
          return null;
        }
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled' && result.value);
    console.log(`📦 成功加载 ${successful.length} 个插件`);
  }

  static _validateAndRegister(pluginId, module) {
    // 验证 manifest
    if (!module.manifest) {
      throw new Error('插件缺少 manifest');
    }

    if (!module.manifest.id) {
      throw new Error('插件缺少 id');
    }

    if (module.manifest.id !== pluginId) {
      throw new Error(`插件 ID 不匹配: ${module.manifest.id} !== ${pluginId}`);
    }

    // 验证类
    if (!module.default) {
      throw new Error('插件缺少默认导出类');
    }

    const PluginClass = module.default;
    
    // 创建实例验证接口
    let instance;
    try {
      instance = new PluginClass();
    } catch (error) {
      throw new Error(`插件实例化失败: ${error.message}`);
    }

    // 验证必需方法
    const requiredMethods = ['getTemplate', 'getStyles'];
    const missingMethods = requiredMethods.filter(method => 
      typeof instance[method] !== 'function'
    );

    if (missingMethods.length > 0) {
      throw new Error(`插件缺少必需方法: ${missingMethods.join(', ')}`);
    }

    // 确保 entityRequirements 存在
    if (!module.manifest.entityRequirements) {
      module.manifest.entityRequirements = [];
    }

    // 注册插件
    this._plugins.set(pluginId, {
      id: pluginId,
      class: PluginClass,
      manifest: module.manifest,
      instance: instance
    });

    console.log(`✅ 注册插件: ${module.manifest.name} (${pluginId})`);
    return pluginId;
  }

  // === 公共 API ===
  static getPlugin(pluginId) {
    const plugin = this._plugins.get(pluginId);
    if (!plugin) {
      console.warn(`插件不存在: ${pluginId}`);
    }
    return plugin;
  }

  static getAllPlugins() {
    return Array.from(this._plugins.values()).map(item => ({
      ...item.manifest,
      id: item.id,
      hasValidInstance: !!item.instance
    }));
  }

  static getPluginClass(pluginId) {
    const plugin = this.getPlugin(pluginId);
    return plugin ? plugin.class : null;
  }

  static createPluginInstance(pluginId) {
    const PluginClass = this.getPluginClass(pluginId);
    if (!PluginClass) return null;

    try {
      return new PluginClass();
    } catch (error) {
      console.error(`创建插件实例失败 ${pluginId}:`, error);
      return null;
    }
  }

  static getCategories() {
    const categories = new Set(['all']);
    this.getAllPlugins().forEach(plugin => {
      if (plugin.category) {
        categories.add(plugin.category);
      }
    });
    return Array.from(categories).sort();
  }

  static getPluginsByCategory(category) {
    if (category === 'all') return this.getAllPlugins();
    return this.getAllPlugins().filter(plugin => plugin.category === category);
  }

  // 动态插件注册
  static registerPlugin(manifest, PluginClass) {
    try {
      if (this._plugins.has(manifest.id)) {
        throw new Error(`插件已存在: ${manifest.id}`);
      }

      const result = this._validateAndRegister(manifest.id, { manifest, default: PluginClass });
      if (result) {
        this._notifyListeners('plugin-added', manifest.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('手动注册插件失败:', error);
      return false;
    }
  }

  static unregisterPlugin(pluginId) {
    if (this._plugins.delete(pluginId)) {
      this._notifyListeners('plugin-removed', pluginId);
      return true;
    }
    return false;
  }
}

// 自动初始化但不阻塞
PluginRegistry.initialize().catch(console.error);

export { PluginRegistry };
