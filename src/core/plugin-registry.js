// src/core/plugin-registry.js
class PluginRegistry {
  static _plugins = new Map();
  static _categories = new Set(['all']);
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;
    
    try {
      // 动态发现并加载插件
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
        await this._registerPlugin(pluginId, importFn);
      } catch (error) {
        console.error(`❌ 加载插件 ${pluginId} 失败:`, error);
      }
    }
  }

  static async _registerPlugin(pluginId, importFn) {
    try {
      const module = await importFn();
      const PluginClass = module.default;
      
      // 创建插件实例并验证
      const pluginInstance = new PluginClass();
      const pluginInfo = this._extractPluginInfo(pluginId, pluginInstance);
      
      this._plugins.set(pluginId, {
        id: pluginId,
        class: PluginClass,
        info: pluginInfo,
        instance: pluginInstance
      });
      
      // 更新分类
      this._categories.add(pluginInfo.category);
      
      console.log(`✅ 注册插件: ${pluginInfo.name}`);
    } catch (error) {
      console.error(`❌ 注册插件 ${pluginId} 失败:`, error);
      throw error;
    }
  }

  static _extractPluginInfo(pluginId, pluginInstance) {
    // 默认插件信息
    const defaultInfo = {
      id: pluginId,
      name: this._formatPluginName(pluginId),
      description: '自定义卡片插件',
      icon: '🔧',
      category: 'general',
      version: '1.0.0',
      author: 'CardForge Team',
      featured: false,
      supportsGradient: false
    };

    // 如果插件有自定义信息方法，使用它
    if (pluginInstance.getPluginInfo) {
      const instanceInfo = pluginInstance.getPluginInfo();
      return { 
        ...defaultInfo, 
        ...instanceInfo
      };
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

  // === 公共 API ===

  static get isInitialized() {
    return this._initialized;
  }

  static getPlugin(pluginId) {
    return this._plugins.get(pluginId);
  }

  static getAllPlugins() {
    return Array.from(this._plugins.values()).map(plugin => plugin.info);
  }

  static getPluginClass(pluginId) {
    const plugin = this._plugins.get(pluginId);
    return plugin ? plugin.class : null;
  }

  static createPluginInstance(pluginId) {
    const PluginClass = this.getPluginClass(pluginId);
    if (!PluginClass) {
      throw new Error(`插件未注册: ${pluginId}`);
    }
    return new PluginClass();
  }

  static getCategories() {
    return Array.from(this._categories);
  }

  // 获取插件配置表单
  static getPluginConfigForm(pluginId) {
    const plugin = this._plugins.get(pluginId);
    if (!plugin) return null;
    
    const instance = plugin.instance;
    const baseForm = {
      entityRequirements: instance.getEntityRequirements ? 
        instance.getEntityRequirements() : [],
      themeConfig: instance.getThemeConfig ? 
        instance.getThemeConfig() : {},
      customFields: []
    };
    
    // 如果插件有自定义配置方法，使用它
    if (instance.getConfigForm) {
      return { ...baseForm, ...instance.getConfigForm() };
    }
    
    return baseForm;
  }

  // 搜索和过滤插件
  static searchPlugins(query = '', category = 'all') {
    const plugins = this.getAllPlugins();
    
    return plugins.filter(plugin => {
      const matchesQuery = !query || 
        plugin.name.toLowerCase().includes(query.toLowerCase()) ||
        plugin.description.toLowerCase().includes(query.toLowerCase()) ||
        plugin.category.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = category === 'all' || plugin.category === category;
      
      return matchesQuery && matchesCategory;
    });
  }

  // 验证插件配置
  static validatePluginConfig(pluginId, config, hass) {
    const plugin = this.getPlugin(pluginId);
    if (!plugin) {
      return { valid: false, errors: ['插件不存在'] };
    }

    const requirements = plugin.instance.getEntityRequirements ? 
      plugin.instance.getEntityRequirements() : [];
    
    const errors = [];
    const warnings = [];

    // 验证必需实体
    requirements.forEach(req => {
      if (req.required) {
        const entityId = config.entities?.[req.key];
        if (!entityId) {
          errors.push(`必须配置实体: ${req.description}`);
          return;
        }

        // 验证实体存在性和类型
        if (hass && hass.states) {
          const entity = hass.states[entityId];
          if (!entity) {
            errors.push(`实体不存在: ${entityId}`);
          } else if (req.domains) {
            const domain = entityId.split('.')[0];
            if (!req.domains.includes(domain)) {
              warnings.push(`实体类型不匹配: ${entityId} (期望: ${req.domains.join(', ')})`);
            }
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 手动注册插件（用于动态添加）
  static async registerNewPlugin(pluginId, importFn) {
    try {
      await this._registerPlugin(pluginId, importFn);
      return true;
    } catch (error) {
      console.error(`手动注册插件失败: ${pluginId}`, error);
      return false;
    }
  }

  // 清理缓存（开发时使用）
  static clearCache() {
    this._plugins.clear();
    this._categories.clear();
    this._categories.add('all');
    this._initialized = false;
  }
}

// 自动初始化
PluginRegistry.initialize().catch(console.error);

export { PluginRegistry };