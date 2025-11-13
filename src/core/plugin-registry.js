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
      // 验证插件清单
      if (!module.manifest) {
        throw new Error('插件缺少 manifest 导出');
      }
      
      this.validatePluginManifest(module.manifest);
      
      const pluginId = module.manifest.id;
      
      // 验证插件类
      if (!module.default) {
        throw new Error('插件缺少默认导出');
      }
      
      this.validatePluginClass(module.default);
      
      // 注册插件
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

  // === 插件验证工具 ===
  static validatePluginManifest(manifest) {
    const requiredFields = ['id', 'name', 'version', 'description', 'author', 'category'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`插件清单缺少必需字段: ${missingFields.join(', ')}`);
    }
    
    if (!manifest.id.match(/^[a-z-]+$/)) {
      throw new Error('插件ID只能包含小写字母和连字符');
    }
    
    if (!manifest.version.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error('版本号格式不正确，应为 x.x.x');
    }
    
    // 验证分类有效性
    const validCategories = Object.keys(this.getPluginCategories());
    if (!validCategories.includes(manifest.category)) {
      console.warn(`⚠️ 插件分类 "${manifest.category}" 不在推荐分类中，建议使用: ${validCategories.join(', ')}`);
    }
    
    return true;
  }

  static validatePluginClass(PluginClass) {
    const requiredMethods = ['getTemplate', 'getStyles'];
    const missingMethods = requiredMethods.filter(method => 
      typeof PluginClass.prototype[method] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      throw new Error(`插件类缺少必需方法: ${missingMethods.join(', ')}`);
    }
    
    // 检查是否继承自 BasePlugin
    if (!PluginClass.prototype._getCardValue) {
      console.warn('⚠️ 插件类建议继承 BasePlugin 以获得完整功能');
    }
    
    return true;
  }

  // === 市场相关功能 ===
  static getPluginsForMarketplace(filter = {}) {
    let plugins = Array.from(this._plugins.values()).map(item => ({
      ...item.manifest,
      id: item.id,
      installed: true
    }));

    if (filter.category && filter.category !== 'all') {
      plugins = plugins.filter(p => p.category === filter.category);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      plugins = plugins.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query)
      );
    }

    // 排序：按名称字母顺序
    plugins.sort((a, b) => a.name.localeCompare(b.name));

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

  // === 插件分类系统 ===
  static getPluginCategories() {
    return {
      'info': '信息显示',
      'time': '时间日期', 
      'weather': '天气',
      'sensor': '传感器',
      'control': '设备控制',
      'media': '媒体',
      'system': '系统',
      'utility': '工具'
    };
  }

  static getPluginsByCategory() {
    const categories = {};
    const categoryMap = this.getPluginCategories();
    
    // 初始化分类
    Object.keys(categoryMap).forEach(category => {
      categories[category] = [];
    });
    
    // 按分类分组插件
    this.getAllPlugins().forEach(plugin => {
      if (categories[plugin.category]) {
        categories[plugin.category].push(plugin);
      } else {
        // 如果插件使用了未定义的分类，创建该分类
        if (!categories[plugin.category]) {
          categories[plugin.category] = [];
        }
        categories[plugin.category].push(plugin);
      }
    });
    
    return categories;
  }

  // === 插件开发工具 ===
  static generatePluginStub(pluginId, pluginName, category = 'info') {
    const pascalCaseId = this._toPascalCase(pluginId);
    
    return `
// 插件模板: ${pluginName}
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: '${pluginId}',
  name: '${pluginName}',
  version: '1.0.0',
  description: '${pluginName} 插件描述',
  author: 'Your Name',
  category: '${category}',
  icon: '🔧',
  entityRequirements: [
    {
      key: 'example_source',
      description: '示例数据源',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: false
};

export default class ${pascalCaseId}Plugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    // 使用统一数据获取方法
    const exampleData = this._getCardValue(hass, entities, 'example_source', '默认值');
    
    return \`
      <div class="cardforge-card ${pluginId}-card">
        <div class="card-content">
          <div class="example-text">\${exampleData}</div>
        </div>
      </div>
    \`;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + \`
      .${pluginId}-card {
        \${this._responsivePadding('20px', '16px')}
        \${this._responsiveHeight('120px', '100px')}
        \${this._flexCenter()}
      }
      
      .card-content {
        \${this._flexColumn()}
        \${this._textCenter()}
      }
      
      .example-text {
        \${this._responsiveFontSize('1.2em', '1em')}
        color: var(--primary-color);
        font-weight: 600;
      }
      
      /* 响应式优化 */
      @media (max-width: 480px) {
        .${pluginId}-card {
          \${this._responsivePadding('16px', '12px')}
        }
      }
    \`;
  }

  // 可选：自定义主题配置
  getThemeConfig() {
    return {
      useGradient: false,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }
}
    `.trim();
  }

  // === 插件质量检查 ===
  static checkPluginQuality(pluginId) {
    const plugin = this.getPlugin(pluginId);
    if (!plugin) {
      return { score: 0, issues: ['插件不存在'], suggestions: [] };
    }

    const issues = [];
    const manifest = plugin.manifest;
    const pluginClass = plugin.class;

    // 检查清单完整性
    if (!manifest.icon) {
      issues.push('建议添加图标(icon)字段');
    }
    
    if (!manifest.entityRequirements) {
      issues.push('建议明确定义实体需求(entityRequirements)');
    }
    
    if (!manifest.themeSupport) {
      issues.push('建议添加主题支持');
    }

    // 检查插件实现
    try {
      const instance = new pluginClass();
      const styles = instance.getStyles({});
      
      // 检查响应式支持
      if (!styles.includes('@media')) {
        issues.push('建议添加响应式样式支持');
      }
      
      // 检查样式工具方法使用
      if (!styles.includes('_responsive')) {
        issues.push('建议使用响应式样式工具方法');
      }
      
    } catch (error) {
      issues.push(`插件实例化失败: ${error.message}`);
    }

    // 计算质量分数
    const score = Math.max(0, 10 - issues.length);
    
    return {
      score,
      issues,
      suggestions: issues.map(issue => `💡 ${issue}`),
      rating: score >= 8 ? '优秀' : score >= 6 ? '良好' : score >= 4 ? '一般' : '需要改进'
    };
  }

  // === 统计信息 ===
  static getRegistryStats() {
    const plugins = this.getAllPlugins();
    const categories = this.getPluginsByCategory();
    
    return {
      totalPlugins: plugins.length,
      categories: Object.keys(categories).length,
      pluginsByCategory: Object.keys(categories).reduce((acc, category) => {
        acc[category] = categories[category].length;
        return acc;
      }, {}),
      themeSupport: plugins.filter(p => p.themeSupport).length,
      gradientSupport: plugins.filter(p => p.gradientSupport).length,
      averageQuality: this._calculateAverageQuality()
    };
  }

  static _calculateAverageQuality() {
    const plugins = this.getAllPlugins();
    if (plugins.length === 0) return 0;
    
    const totalScore = plugins.reduce((sum, plugin) => {
      const quality = this.checkPluginQuality(plugin.id);
      return sum + quality.score;
    }, 0);
    
    return Math.round((totalScore / plugins.length) * 10) / 10;
  }

  // === 工具方法 ===
  static _toPascalCase(str) {
    return str.replace(/(^\w|-\w)/g, match => match.replace('-', '').toUpperCase());
  }

  // === 调试工具 ===
  static debugRegistry() {
    console.group('🔧 插件注册表调试信息');
    console.log('📊 统计信息:', this.getRegistryStats());
    console.log('📁 已注册插件:', Array.from(this._plugins.keys()));
    
    this.getAllPlugins().forEach(plugin => {
      const quality = this.checkPluginQuality(plugin.id);
      console.log(`- ${plugin.name} (${plugin.id}): ${quality.rating} (${quality.score}/10)`);
    });
    
    console.groupEnd();
  }

  // === 插件搜索 ===
  static searchPlugins(query) {
    const results = [];
    const searchTerms = query.toLowerCase().split(' ');
    
    this.getAllPlugins().forEach(plugin => {
      let score = 0;
      const searchableText = [
        plugin.name,
        plugin.description,
        plugin.author,
        plugin.category,
        ...(plugin.entityRequirements || []).map(req => req.description)
      ].join(' ').toLowerCase();
      
      searchTerms.forEach(term => {
        if (searchableText.includes(term)) {
          score += term.length;
        }
      });
      
      if (score > 0) {
        results.push({ plugin, score });
      }
    });
    
    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.plugin);
  }
}

// 自动初始化
PluginRegistry.initialize();

export { PluginRegistry };