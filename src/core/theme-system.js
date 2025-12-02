// src/core/theme-system.js

class ThemeSystem {
  constructor() {
    this.themes = new Map();
    this._initialized = false;
  }

  // 初始化主题系统
  async initialize() {
    if (this._initialized) return;
    
    // 动态发现所有主题
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
        // 静默失败，不影响其他主题
      }
    }
  }

  // 注册主题模块
  _registerThemeModule(module) {
    if (!module.theme) {
      return;
    }

    const themeId = module.theme.id;
    if (!themeId) {
      return;
    }

    // 注册主题
    this.themes.set(themeId, module.theme);
  }

  // 获取主题
  getTheme(themeId) {
    return this.themes.get(themeId) || this.themes.get('auto');
  }

  // 获取默认主题
  getDefaultTheme() {
    return this.getTheme('auto');
  }

  // 按类型获取主题
  getThemesByType(type) {
    return Array.from(this.themes.values())
      .filter(theme => theme.type === type)
      .map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        icon: theme.icon,
        preview: theme.preview || {}
      }));
  }

  // 获取所有主题列表
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

  // 获取主题样式
  getThemeStyles(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return '';
    
    let styles = '';
    
    // 添加CSS变量
    const variables = theme.variables || {};
    if (Object.keys(variables).length > 0) {
      const varStyles = Object.entries(variables)
        .map(([key, value]) => `${key}: ${value};`)
        .join('');
      styles += `:host { ${varStyles} }`;
    }
    
    // 添加主题样式
    if (theme.styles) {
      styles += theme.styles;
    }
    
    // 确保有背景色
    if (!styles.includes('background') && !styles.includes('--cf-background')) {
      styles += `
        .cardforge-container {
          background: var(--cf-background, var(--card-background-color, #ffffff));
        }
      `;
    }
    
    return styles;
  }

  // 获取主题预览
  getThemePreview(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return this._getDefaultPreview();
    
    if (theme.preview) {
      return {
        background: theme.preview.background || this._getDefaultBackground(themeId),
        color: theme.preview.color || '#ffffff',
        border: theme.preview.border || 'none'
      };
    }
    
    return this._getDefaultPreview();
  }

  // 获取默认预览
  _getDefaultPreview() {
    return {
      background: 'var(--cf-background)',
      color: 'var(--cf-text-primary)',
      border: '1px solid var(--cf-border)'
    };
  }

  // 获取默认背景
  _getDefaultBackground(themeId) {
    const hash = this._stringToHash(themeId);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 30) % 360}, 70%, 40%) 100%)`;
  }

  // 字符串哈希
  _stringToHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// 创建全局实例
const themeSystem = new ThemeSystem();

// 自动初始化
themeSystem.initialize();

export { themeSystem, ThemeSystem };