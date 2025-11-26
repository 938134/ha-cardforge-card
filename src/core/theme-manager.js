// src/core/theme-manager.js
class ThemeManager {
  constructor() {
    this.themes = new Map();
    this._initialized = false;
    this._initializationPromise = null;
  }

  async initialize() {
    if (this._initialized) return;

    // 防止重复初始化
    if (!this._initializationPromise) {
      this._initializationPromise = this._discoverThemes();
    }

    await this._initializationPromise;
    this._initialized = true;
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
    if (module.default) {
      const theme = module.default;
      
      this.themes.set(themeId, {
        id: themeId,
        name: theme.name || this._formatThemeName(themeId),
        description: theme.description || `${this._formatThemeName(themeId)}主题`,
        icon: theme.icon || '🎨',
        getStyles: theme.getStyles.bind(theme)
      });
      console.log(`✅ 注册主题: ${themeId}`, theme.name);
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
    return Array.from(this.themes.values());
  }

  getThemeStyles(themeId, config = {}) {
    const theme = this.getTheme(themeId);
    if (theme && typeof theme.getStyles === 'function') {
      return theme.getStyles(config);
    }
    return '';
  }

  // 检查是否已初始化
  isInitialized() {
    return this._initialized;
  }
}

const themeManager = new ThemeManager();

// 立即开始初始化，但不阻塞
themeManager.initialize().catch(error => {
  console.error('主题管理器初始化失败:', error);
});

export { themeManager, ThemeManager };
