// src/core/plugin-registry.js
import { validatePluginManifest, PluginDeveloperTools } from '../plugins/index.js';

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
      () => import('../plugins/time-week.js'),
      () => import('../plugins/oilprice-card.js'),
      () => import('../plugins/poetry-card.js')
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
    try {
      if (!module.manifest) {
        throw new Error('插件缺少 manifest 导出');
      }
      
      validatePluginManifest(module.manifest);
      
      const pluginId = module.manifest.id;
      
      if (!module.default) {
        throw new Error('插件缺少默认导出');
      }
      
      PluginDeveloperTools.validatePluginClass(module.default);
      
      this._plugins.set(pluginId, {
        id: pluginId,
        class: module.default,
        manifest: module.manifest
      });
      
      console.log(`✅ 注册插件: ${module.manifest.name} (v${module.manifest.version})`);
      
    } catch (error) {
      console.error('❌ 插件注册失败:', error.message);
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

  // === 开发工具 ===
  static getDeveloperTools() {
    return PluginDeveloperTools;
  }
}

// 自动初始化
PluginRegistry.initialize();

export { PluginRegistry };