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
    // 静态导入所有插件
    const pluginModules = [
      () => import('../plugins/simple-clock.js'),
      () => import('../plugins/weather-card.js'),
      () => import('../plugins/welcome-card.js'),
      () => import('../plugins/time-week.js')
    ];

    for (const importFn of pluginModules) {
      try {
        const module = await importFn();
        const pluginId = module.manifest?.id;
        
        if (!pluginId) {
          console.warn('插件缺少 manifest.id，跳过');
          continue;
        }

        if (module.manifest && module.default) {
          // 验证插件接口
          const PluginClass = module.default;
          const instance = new PluginClass();
          
          if (typeof instance.getTemplate !== 'function' || 
              typeof instance.getStyles !== 'function') {
            console.warn(`插件 ${pluginId} 接口不完整，跳过`);
            continue;
          }

          this._plugins.set(pluginId, {
            id: pluginId,
            class: PluginClass,
            manifest: module.manifest,
            instance: instance
          });

          console.log(`✅ 注册插件: ${module.manifest.name}`);
        }
      } catch (error) {
        console.error(`❌ 加载插件失败:`, error);
      }
    }
  }

  // === 公共 API ===
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

  static getCategories() {
    const categories = new Set(['all']);
    this.getAllPlugins().forEach(plugin => {
      categories.add(plugin.category);
    });
    return Array.from(categories);
  }

  // 手动注册插件的方法（用于动态添加）
  static registerPlugin(manifest, PluginClass) {
    try {
      const pluginId = manifest.id;
      const instance = new PluginClass();
      
      if (typeof instance.getTemplate !== 'function' || 
          typeof instance.getStyles !== 'function') {
        throw new Error('插件接口不完整');
      }

      this._plugins.set(pluginId, {
        id: pluginId,
        class: PluginClass,
        manifest: manifest,
        instance: instance
      });

      console.log(`✅ 手动注册插件: ${manifest.name}`);
      return true;
    } catch (error) {
      console.error(`❌ 手动注册插件失败:`, error);
      return false;
    }
  }
}

// 自动初始化
PluginRegistry.initialize();

export { PluginRegistry };
