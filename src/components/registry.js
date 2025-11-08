// ha-cardforge-card/components/registry.js
class StyleRegistry {
  static _styles = new Map();
  static _categories = new Set();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;

    try {
      // 动态加载所有样式
      await this._loadAllStyles();
      this._initialized = true;
      console.log(`✅ 样式注册表初始化完成，加载 ${this._styles.size} 个样式`);
    } catch (error) {
      console.error('❌ 样式注册表初始化失败:', error);
    }
  }

  static async _loadAllStyles() {
    const styleNames = [
      'time-week',
      'time-card', 
      'weather',
      'clock-lunar',
      'welcome'
    ];

    for (const styleName of styleNames) {
      try {
        await this._loadStyle(styleName);
      } catch (error) {
        console.warn(`加载样式 ${styleName} 失败:`, error);
      }
    }
  }

  static async _loadStyle(styleName) {
    try {
      const module = await import(`../styles/${styleName}.js`);
      const styleInstance = new module.default();
      
      if (this._validateStyle(styleInstance)) {
        this._styles.set(styleName, styleInstance);
        if (styleInstance.category) {
          this._categories.add(styleInstance.category);
        }
        console.log(`✅ 注册样式: ${styleInstance.displayName}`);
      }
    } catch (error) {
      console.error(`加载样式模块 ${styleName} 失败:`, error);
    }
  }

  static _validateStyle(style) {
    const required = ['name', 'displayName', 'getTemplate', 'getStyles'];
    const missing = required.filter(prop => !style[prop]);
    
    if (missing.length > 0) {
      console.warn(`样式验证失败，缺少: ${missing.join(', ')}`);
      return false;
    }
    return true;
  }

  // 公共 API
  static get isInitialized() {
    return this._initialized;
  }

  static getStyle(styleName) {
    return this._styles.get(styleName);
  }

  static hasStyle(styleName) {
    return this._styles.has(styleName);
  }

  static getAllStyles() {
    return Array.from(this._styles.values());
  }

  static getStylesByCategory(category) {
    return this.getAllStyles().filter(style => 
      category === 'all' || style.category === category
    );
  }

  static getCategories() {
    return Array.from(this._categories);
  }

  static getStyleRequirements(styleName) {
    const style = this.getStyle(styleName);
    if (!style) return null;
    
    return {
      required: style.requiredEntities || [],
      optional: style.optionalEntities || []
    };
  }

  // 样式管理
  static async registerStyle(styleInstance) {
    if (this._validateStyle(styleInstance)) {
      this._styles.set(styleInstance.name, styleInstance);
      if (styleInstance.category) {
        this._categories.add(styleInstance.category);
      }
      return true;
    }
    return false;
  }

  static unregisterStyle(styleName) {
    const style = this._styles.get(styleName);
    if (style) {
      this._styles.delete(styleName);
      console.log(`🗑️ 删除样式: ${styleName}`);
      return true;
    }
    return false;
  }

  // 工具方法
  static searchStyles(query) {
    const searchTerm = query.toLowerCase();
    return this.getAllStyles().filter(style => 
      style.displayName.toLowerCase().includes(searchTerm) ||
      style.description?.toLowerCase().includes(searchTerm) ||
      style.name.toLowerCase().includes(searchTerm)
    );
  }

  static getStyleInfo(styleName) {
    const style = this.getStyle(styleName);
    if (!style) return null;

    return {
      name: style.name,
      displayName: style.displayName,
      icon: style.icon,
      category: style.category,
      description: style.description,
      version: style.version || '1.0.0',
      requiresEntities: style.requiresEntities || false
    };
  }
}

window.Registry = StyleRegistry;
export { StyleRegistry };