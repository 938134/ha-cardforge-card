/**
 * 主题系统 - 负责主题加载、管理、样式注入
 * 合并了原theme-manager的功能
 */
class ThemeSystem {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'auto';
    this._styleElement = null;
    this._initialized = false;
    this._darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  /**
   * 初始化主题系统
   */
  async initialize() {
    if (this._initialized) return;
    
    try {
      // 动态发现主题
      await this._discoverThemes();
      
      // 创建样式元素
      this._createStyleElement();
      
      // 监听深色模式变化
      this._darkModeMediaQuery.addEventListener('change', (e) => {
        this._applyTheme(this.currentTheme);
      });
      
      this._initialized = true;
      console.log(`主题系统初始化完成，发现 ${this.themes.size} 个主题`);
    } catch (error) {
      console.error('主题系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 动态发现主题
   */
  async _discoverThemes() {
    // 主题模块路径映射
    const themeModules = [
      { path: '../themes/auto-theme.js', id: 'auto' },
      { path: '../themes/glass-theme.js', id: 'glass' },
      { path: '../themes/gradient-theme.js', id: 'gradient' },
      { path: '../themes/neon-theme.js', id: 'neon' },
      { path: '../themes/inkwash-theme.js', id: 'inkwash' }
    ];

    for (const moduleInfo of themeModules) {
      try {
        const module = await import(moduleInfo.path);
        if (module.theme) {
          this.registerTheme(module.theme);
        }
      } catch (error) {
        console.warn(`主题加载失败 ${moduleInfo.id}:`, error);
      }
    }
  }

  /**
   * 创建样式元素
   */
  _createStyleElement() {
    this._styleElement = document.createElement('style');
    this._styleElement.id = 'cardforge-theme-styles';
    document.head.appendChild(this._styleElement);
  }

  /**
   * 注册主题
   */
  registerTheme(themeDef) {
    if (!themeDef.id || !themeDef.styles) {
      console.warn('主题定义不完整，跳过注册:', themeDef);
      return;
    }

    // 确保有预览配置
    const theme = {
      id: themeDef.id,
      name: themeDef.name || themeDef.id,
      description: themeDef.description || '',
      icon: themeDef.icon || '🎨',
      styles: themeDef.styles,
      preview: themeDef.preview || {
        background: 'var(--cf-background)',
        border: '1px solid var(--cf-border)'
      }
    };

    this.themes.set(theme.id, theme);
    console.log(`主题注册成功: ${theme.id} (${theme.name})`);
  }

  /**
   * 获取主题
   */
  getTheme(themeId) {
    if (themeId === 'auto') {
      // 自动主题根据系统设置决定
      const isDark = this._darkModeMediaQuery.matches;
      return this.themes.get(isDark ? 'dark' : 'light') || this.themes.get('auto');
    }
    return this.themes.get(themeId) || this.themes.get('auto');
  }

  /**
   * 获取所有主题
   */
  getAllThemes() {
    return Array.from(this.themes.values()).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      icon: theme.icon,
      preview: theme.preview
    }));
  }

  /**
   * 应用主题
   */
  async applyTheme(themeId) {
    if (!this._initialized) {
      await this.initialize();
    }

    const theme = this.getTheme(themeId);
    if (!theme) {
      console.warn(`主题不存在: ${themeId}，使用默认主题`);
      return this.applyTheme('auto');
    }

    this.currentTheme = themeId;
    this._injectThemeStyles(theme);
    
    // 触发主题变化事件
    document.dispatchEvent(new CustomEvent('cardforge-theme-changed', {
      detail: { theme: themeId }
    }));
    
    console.log(`主题已切换: ${themeId} (${theme.name})`);
  }

  /**
   * 注入主题样式
   */
  _injectThemeStyles(theme) {
    if (!this._styleElement) {
      this._createStyleElement();
    }

    // 生成完整的CSS
    const css = `
      /* === CardForge 主题: ${theme.name} === */
      .cardforge-container {
        container-type: inline-size;
        container-name: cardforge-container;
      }
      
      ${theme.styles}
    `;

    this._styleElement.textContent = css;
  }

  /**
   * 获取当前主题ID
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * 获取主题样式（用于动态创建元素）
   */
  getThemeStyles(themeId) {
    const theme = this.getTheme(themeId);
    return theme?.styles || '';
  }

  /**
   * 深色模式是否启用
   */
  isDarkMode() {
    return this._darkModeMediaQuery.matches;
  }

  /**
   * 监听主题变化
   */
  onThemeChange(callback) {
    document.addEventListener('cardforge-theme-changed', (e) => {
      callback(e.detail.theme);
    });
  }

  /**
   * 监听深色模式变化
   */
  onDarkModeChange(callback) {
    this._darkModeMediaQuery.addEventListener('change', (e) => {
      callback(e.matches);
    });
  }
}

// 创建全局实例
const themeSystem = new ThemeSystem();

// 自动初始化
themeSystem.initialize().catch(console.error);

export { themeSystem };
