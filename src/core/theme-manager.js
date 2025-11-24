// src/core/theme-manager.js
class ThemeManager {
  constructor() {
    this.themes = new Map();
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) return;

    try {
      await this._discoverThemes();
      this._initialized = true;
    } catch (error) {
      console.error('❌ 主题系统初始化失败:', error);
    }
  }

  async _discoverThemes() {
    const themeFiles = {
      'auto': () => import('../themes/auto-theme.js'),
      'glass': () => import('../themes/glass-theme.js'),
      'gradient': () => import('../themes/gradient-theme.js'),
      'neon': () => import('../themes/neon-theme.js'),
      'ink-wash': () => import('../themes/ink-wash-theme.js')
    };

    for (const [themeId, importFn] of Object.entries(themeFiles)) {
      try {
        const module = await importFn();
        this._registerThemeModule(themeId, module);
      } catch (error) {
        console.warn(`⚠️ 加载主题 ${themeId} 失败:`, error);
      }
    }
  }

  _registerThemeModule(themeId, module) {
    if (module.default && typeof module.default.getStyles === 'function') {
      const theme = module.default;
      
      this.themes.set(themeId, {
        id: themeId,
        manifest: {
          id: theme.id || themeId,
          name: theme.name || this._formatThemeName(themeId),
          description: theme.description || `${this._formatThemeName(themeId)}主题`,
          icon: theme.icon || '🎨',
          category: theme.category || 'general'
        },
        getStyles: theme.getStyles.bind(theme),
        applyTheme: theme.applyTheme ? theme.applyTheme.bind(theme) : (() => {}),
        getConfigSchema: theme.getConfigSchema ? theme.getConfigSchema.bind(theme) : (() => ({}))
      });
    } else {
      console.warn(`主题 ${themeId} 格式不正确，跳过`);
    }
  }

  _formatThemeName(themeId) {
    return themeId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getTheme(themeId) {
    return this.themes.get(themeId) || this.themes.get('auto');
  }

  getAllThemes() {
    return Array.from(this.themes.values()).map(item => ({
      ...item.manifest,
      id: item.id
    }));
  }

  getThemeStyles(themeId, config = {}) {
    const theme = this.getTheme(themeId);
    if (theme && typeof theme.getStyles === 'function') {
      return theme.getStyles(config);
    }
    return '';
  }

  applyTheme(element, themeId, config = {}) {
    const theme = this.getTheme(themeId);
    if (theme && typeof theme.applyTheme === 'function') {
      theme.applyTheme(element, config);
    }
  }

  getThemeConfigSchema(themeId) {
    const theme = this.getTheme(themeId);
    if (theme && typeof theme.getConfigSchema === 'function') {
      return theme.getConfigSchema();
    }
    return {};
  }
}

const themeManager = new ThemeManager();
themeManager.initialize();

export { themeManager, ThemeManager };