export class Registry {
    static _styles = new Map();
    static _initialized = false;
  
    static async initialize() {
      if (this._initialized) return;
      await this._discoverStyles();
      this._initialized = true;
    }
  
    static async _discoverStyles() {
      const styleFiles = [
        'time-week.js',
        'time-card.js',
        'clock-lunar.js',
        'welcome.js',
        'weather.js'
      ];
  
      console.log('🎨 开始加载外观样式...');
  
      for (const styleFile of styleFiles) {
        try {
          await this._loadStyle(`./styles/${styleFile}`);
        } catch (error) {
          console.warn(`加载外观 ${styleFile} 失败:`, error);
        }
      }
  
      console.log(`✅ 已加载 ${this._styles.size} 个外观样式`);
    }
  
    static async _loadStyle(stylePath) {
      try {
        const module = await import(stylePath);
        const styleConfig = module.default;
        
        if (this.validateStyleConfig(styleConfig)) {
          this._styles.set(styleConfig.name, styleConfig);
          console.log(`✅ 加载外观: ${styleConfig.displayName}`);
        } else {
          console.warn(`❌ 外观配置不完整: ${stylePath}`);
        }
      } catch (error) {
        console.warn(`❌ 加载外观失败 ${stylePath}:`, error);
      }
    }
  
    static validateStyleConfig(config) {
      const required = ['name', 'displayName', 'render'];
      const isValid = required.every(key => key in config);
      
      if (!isValid) {
        console.warn('外观配置缺少必需字段:', required.filter(key => !(key in config)));
      }
      
      return isValid;
    }
  
    static getStyle(styleName) {
      return this._styles.get(styleName);
    }
  
    static getAllStyles() {
      return Array.from(this._styles.values());
    }
  
    static getStylesByCategory(category) {
      return this.getAllStyles().filter(style => 
        !category || style.category === category
      );
    }
  
    static hasStyle(styleName) {
      return this._styles.has(styleName);
    }
  
    static registerStyle(styleConfig) {
      if (this.validateStyleConfig(styleConfig)) {
        this._styles.set(styleConfig.name, styleConfig);
        return true;
      }
      return false;
    }
  }
  
  window.Registry = Registry;