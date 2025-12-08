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
    // 主题模块路径映射 - 使用函数包装动态导入
    const themeModules = [
      () => import('../themes/auto-theme.js'),
      () => import('../themes/glass-theme.js'),
      () => import('../themes/gradient-theme.js'),
      () => import('../themes/neon-theme.js'),
      () => import('../themes/inkwash-theme.js')
    ];

    for (const importFn of themeModules) {
      try {
        const module = await importFn();
        if (module.theme) {
          this.registerTheme(module.theme);
        }
      } catch (error) {
        console.warn(`主题加载失败:`, error);
      }
    }
  }

  /**
   * 创建样式元素
   */
  _createStyleElement() {
    // 如果已存在样式元素，先移除
    const existingStyle = document.getElementById('cardforge-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
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
    // 处理自动主题
    if (themeId === 'auto') {
      const isDark = this._darkModeMediaQuery.matches;
      return this.themes.get(isDark ? 'dark' : 'light') || this.themes.get('auto');
    }
    
    // 处理light/dark别名
    if (themeId === 'light' || themeId === 'dark') {
      const theme = this.themes.get(themeId);
      if (theme) return theme;
      
      // 如果light/dark主题不存在，尝试查找类似的
      for (const [id, t] of this.themes) {
        if (id.includes(themeId)) return t;
      }
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

  /**
   * 添加默认主题
   */
  _addDefaultThemes() {
    // 确保有auto主题
    if (!this.themes.has('auto')) {
      this.registerTheme({
        id: 'auto',
        name: '自动',
        description: '跟随系统主题，无额外样式',
        icon: '⚙️',
        styles: `
          /* 自动主题 - 仅使用设计系统变量，无额外样式 */
          .cardforge-container {
            background: var(--cf-background) !important;
            border: 1px solid var(--cf-border) !important;
            border-radius: var(--cf-radius-md) !important;
          }
          
          /* 使用设计系统的文字颜色变量 */
          .cardforge-container .card-title {
            color: var(--cf-text-primary) !important;
            font-weight: var(--cf-font-weight-bold);
          }
          
          .cardforge-container .card-subtitle {
            color: var(--cf-text-secondary) !important;
            font-weight: var(--cf-font-weight-medium);
          }
          
          .cardforge-container .card-caption {
            color: var(--cf-text-tertiary) !important;
          }
          
          .cardforge-container .card-emphasis {
            color: var(--cf-primary-color) !important;
            font-weight: var(--cf-font-weight-semibold);
          }
        `,
        preview: {
          background: 'var(--cf-background)',
          border: '1px solid var(--cf-border)'
        }
      });
    }
  }
}

// 创建全局实例
const themeSystem = new ThemeSystem();

// 自动初始化并添加默认主题
themeSystem.initialize().then(() => {
  themeSystem._addDefaultThemes();
}).catch(console.error);

export { themeSystem };
