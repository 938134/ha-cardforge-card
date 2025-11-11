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
    // 动态导入所有插件文件
    const pluginContext = import.meta.glob('../plugins/*.js', { eager: true });
    
    for (const [filePath, module] of Object.entries(pluginContext)) {
      try {
        const pluginId = this._extractPluginId(filePath);
        
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
        console.error(`❌ 加载插件 ${filePath} 失败:`, error);
      }
    }
  }
  
  static _extractPluginId(filePath) {
    return filePath.split('/').pop().replace('.js', '');
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
}

// 自动初始化
PluginRegistry.initialize();

export { PluginRegistry };
