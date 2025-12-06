// 主题系统 - 修复版
class ThemeSystem {
  constructor() {
    this.themes = new Map();
    this._initialized = false;
  }

  // 初始化
  async initialize() {
    if (this._initialized) return;
    await this._discoverThemes();
    this._initialized = true;
  }

  // 动态发现主题
  async _discoverThemes() {
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
        this._registerThemeModule(module);
      } catch (error) {
        console.warn('主题加载失败:', error);
      }
    }
  }

  // 注册主题模块
  _registerThemeModule(module) {
    if (!module.theme) return;
    const themeId = module.theme.id;
    if (!themeId) return;
    this.themes.set(themeId, module.theme);
  }

  // 获取主题
  getTheme(themeId) {
    return this.themes.get(themeId) || this.themes.get('auto');
  }

  // 获取所有主题
  getAllThemes() {
    return Array.from(this.themes.values()).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      icon: theme.icon,
      preview: theme.preview || {}
    }));
  }

  // 获取主题变量
  getThemeVariables(themeId) {
    const theme = this.getTheme(themeId);
    return theme?.variables || {};
  }

  // 获取主题样式 - 修复：总是返回主题的样式
  getThemeStyles(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return '';
    
    let styles = '';
    
    // 添加CSS变量（如果存在）
    const variables = theme.variables || {};
    if (Object.keys(variables).length > 0) {
      const varStyles = Object.entries(variables)
        .map(([key, value]) => `${key}: ${value};`)
        .join('');
      styles += `:host { ${varStyles} }`;
    }
    
    // 添加主题样式（总是添加）
    if (theme.styles) {
      styles += theme.styles;
    }
    
    return styles;
  }
}

// 全局实例
const themeSystem = new ThemeSystem();
themeSystem.initialize();

export { themeSystem, ThemeSystem };