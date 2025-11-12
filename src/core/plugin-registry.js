// src/core/plugin-registry.js
class PluginRegistry {
  static _plugins = new Map();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;

    try {
      await this._discoverPlugins();
      this._initialized = true;
      console.log(`✅ 插件注册表初始化完成，加载 ${this._plugins.size} 个插件`);
    } catch (error) {
      console.error('❌ 插件注册表初始化失败:', error);
    }
  }

  static async _discoverPlugins() {
    const pluginModules = [
      () => import('../plugins/simple-clock.js'),
      () => import('../plugins/weather-card.js'),
      () => import('../plugins/welcome-card.js'),
      () => import('../plugins/time-week.js')
    ];

    for (const importFn of pluginModules) {
      try {
        const module = await importFn();
        this._registerPluginModule(module);
      } catch (error) {
        console.error(`❌ 加载插件失败:`, error);
      }
    }
  }

  static _registerPluginModule(module) {
    const pluginId = module.manifest?.id;
    if (!pluginId) {
      console.warn('插件缺少 manifest.id，跳过');
      return;
    }

    if (module.manifest && module.default) {
      const PluginClass = module.default;
      
      if (typeof PluginClass.prototype.getTemplate === 'function' && 
          typeof PluginClass.prototype.getStyles === 'function') {
        
        this._plugins.set(pluginId, {
          id: pluginId,
          class: PluginClass,
          manifest: module.manifest
        });
        console.log(`✅ 注册插件: ${module.manifest.name}`);
      } else {
        console.warn(`插件 ${pluginId} 接口不完整，跳过`);
      }
    }
  }

  // === 市场相关功能 ===
  static getPluginsForMarketplace(filter = {}) {
    let plugins = Array.from(this._plugins.values()).map(item => ({
      ...item.manifest,
      id: item.id
    }));

    if (filter.category && filter.category !== 'all') {
      plugins = plugins.filter(p => p.category === filter.category);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      plugins = plugins.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    return plugins;
  }

  static getMarketplaceCategories() {
    const categories = new Set(['all']);
    this.getAllPlugins().forEach(plugin => {
      categories.add(plugin.category);
    });
    return Array.from(categories);
  }

  // === 核心API ===
  static getPlugin(pluginId) {
    return this._plugins.get(pluginId);
  }

  static getAllPlugins() {
    return Array.from(this._plugins.values()).map(item => ({
      ...item.manifest,
      id: item.id
    }));
  }

  static getPluginClass(pluginId) {
    const plugin = this._plugins.get(pluginId);
    return plugin ? plugin.class : null;
  }

  static createPluginInstance(pluginId) {
    const PluginClass = this.getPluginClass(pluginId);
    return PluginClass ? new PluginClass() : null;
  }
}

PluginRegistry.initialize();

export { PluginRegistry };
