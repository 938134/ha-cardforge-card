// src/core/plugin-registry.js
class PluginRegistry {
  static _plugins = new Map();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;

    try {
      await this._discoverPlugins();
      this._initialized = true;
    } catch (error) {
      console.error('❌ 插件注册表初始化失败:', error);
    }
  }

  static async _discoverPlugins() {
    const pluginModules = [
      () => import('../plugins/clock-card.js'),
      () => import('../plugins/welcome-card.js'),
      () => import('../plugins/dashboard-card.js'),
      () => import('../plugins/week-card.js'),
      () => import('../plugins/poetry-card.js'),
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
    if (!module.manifest) {
      console.warn('插件缺少 manifest，跳过注册');
      return;
    }

    const pluginId = module.manifest.id;
    if (!pluginId) {
      console.warn('插件缺少 manifest.id，跳过');
      return;
    }

    if (module.default) {
      const PluginClass = module.default;
      
      if (typeof PluginClass.prototype.getTemplate === 'function' && 
          typeof PluginClass.prototype.getStyles === 'function') {
        
        this._plugins.set(pluginId, {
          id: pluginId,
          class: PluginClass,
          manifest: module.manifest
        });
      } else {
        console.warn(`插件 ${pluginId} 接口不完整，跳过`);
      }
    } else {
      console.warn(`插件 ${pluginId} 缺少默认导出，跳过`);
    }
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

  static getPluginManifest(pluginId) {
    const plugin = this._plugins.get(pluginId);
    return plugin ? plugin.manifest : null;
  }
}

// 自动初始化
PluginRegistry.initialize();

export { PluginRegistry };