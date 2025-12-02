// src/core/theme-system.js

class ThemeSystem {
  constructor() {
    this.themes = new Map();
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) return;
    
    console.log('🎨 初始化主题系统...');
    
    // 恢复原有的动态发现方式
    await this._discoverThemes();
    
    this._initialized = true;
    console.log(`✅ 主题系统初始化完成，加载 ${this.themes.size} 个主题`);
  }

  async _discoverThemes() {
    // 使用函数包装的导入，保持原有方式
    const themeModules = [
      () => import('../themes/auto.js'),
      () => import('../themes/glass.js'),
      () => import('../themes/gradient.js'),
      () => import('../themes/neon.js'),
      () => import('../themes/inkwash.js')
    ];

    for (const importFn of themeModules) {
      try {
        const module = await importFn();
        this._registerThemeModule(module);
      } catch (error) {
        console.warn(`⚠️ 加载主题失败:`, error);
      }
    }
  }

  _registerThemeModule(module) {
    if (!module.theme) {
      console.warn('主题缺少 theme 声明，跳过注册');
      return;
    }

    const themeId = module.theme.id;
    if (!themeId) {
      console.warn('主题缺少 id，跳过');
      return;
    }

    // 注册主题
    this.themes.set(themeId, module.theme);
    console.log(`✅ 注册主题: ${themeId} (${module.theme.name})`);
  }

  getTheme(themeId) {
    return this.themes.get(themeId) || this.themes.get('auto');
  }

  getAllThemes() {
    return Array.from(this.themes.values()).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      icon: theme.icon,
      preview: theme.preview || {}
    }));
  }

  getThemeVariables(themeId) {
    const theme = this.getTheme(themeId);
    return theme?.variables || {};
  }

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
    
    return styles;
  }

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

  _getDefaultPreview() {
    return {
      background: 'var(--cf-background)',
      color: 'var(--cf-text-primary)',
      border: '1px solid var(--cf-border)'
    };
  }

  _getDefaultBackground(themeId) {
    const hash = this._stringToHash(themeId);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 30) % 360}, 70%, 40%) 100%)`;
  }

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
