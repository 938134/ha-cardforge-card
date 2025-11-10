// src/core/plugin-registry.js
class PluginRegistry {
  static _plugins = new Map();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;

    try {
      // 自动发现并加载所有插件
      await this._discoverPlugins();
      this._initialized = true;
      console.log(`✅ 插件注册表初始化完成，加载 ${this._plugins.size} 个插件`);
    } catch (error) {
      console.error('❌ 插件注册表初始化失败:', error);
    }
  }

  static async _discoverPlugins() {
    // 插件映射表 - 新增插件只需在这里添加
    const pluginModules = {
      'simple-clock': () => import('../plugins/simple-clock.js'),
      'welcome-card': () => import('../plugins/welcome-card.js')
      // 新增插件：在这里添加一行即可
      // 'new-plugin': () => import('../plugins/new-plugin.js')
    };

    for (const [pluginId, importFn] of Object.entries(pluginModules)) {
      try {
        const module = await importFn();
        const PluginClass = module.default;
        
        // 创建插件实例并验证
        const pluginInstance = new PluginClass();
        
        if (typeof pluginInstance.getTemplate !== 'function' || 
            typeof pluginInstance.getStyles !== 'function') {
          console.warn(`插件 ${pluginId} 接口不完整，跳过`);
          continue;
        }

        // 获取插件信息
        const pluginInfo = this._extractPluginInfo(pluginId, pluginInstance);
        
        this._plugins.set(pluginId, {
          id: pluginId,
          class: PluginClass,
          info: pluginInfo,
          instance: pluginInstance
        });

        console.log(`✅ 注册插件: ${pluginInfo.name}`);
        
      } catch (error) {
        console.error(`❌ 加载插件 ${pluginId} 失败:`, error);
      }
    }
  }

  static _extractPluginInfo(pluginId, pluginInstance) {
    // 从插件实例中提取信息
    const entityRequirements = pluginInstance.getEntityRequirements ? 
      pluginInstance.getEntityRequirements() : [];
    
    const themeConfig = pluginInstance.getThemeConfig ? 
      pluginInstance.getThemeConfig() : { useGradient: false };

    // 默认插件信息
    const defaultInfo = {
      id: pluginId,
      name: this._formatPluginName(pluginId),
      description: '自定义卡片插件',
      icon: '🔧',
      category: 'general',
      entityRequirements: entityRequirements,
      supportsGradient: themeConfig.useGradient || false
    };

    // 如果插件有自定义信息方法，使用它
    if (pluginInstance.getPluginInfo) {
      return { ...defaultInfo, ...pluginInstance.getPluginInfo() };
    }

    return defaultInfo;
  }

  static _formatPluginName(pluginId) {
    // 将 plugin-id 转换为 Plugin Name
    return pluginId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // 公共 API
  static getPlugin(pluginId) {
    return this._plugins.get(pluginId);
  }

  static getAllPlugins() {
    return Array.from(this._plugins.values()).map(item => item.info);
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