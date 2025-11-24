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
      'neon': () => import('../themes/neon-theme.js')
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
          category: theme.category || 'general',
          preview: theme.preview || this._generatePreviewFromTheme(theme, themeId)
        },
        getStyles: theme.getStyles.bind(theme),
        applyTheme: theme.applyTheme ? theme.applyTheme.bind(theme) : (() => {}),
        getPreview: () => theme.preview || this._generatePreviewFromTheme(theme, themeId)
      });
    } else {
      console.warn(`主题 ${themeId} 格式不正确，跳过`);
    }
  }

  _generatePreviewFromTheme(theme, themeId) {
    try {
      const styles = theme.getStyles({});
      const backgroundMatch = styles.match(/background:\s*([^;]+)/) || styles.match(/background:\s*([^;]+)/);
      const colorMatch = styles.match(/color:\s*([^;]+)/);
      const borderMatch = styles.match(/border:\s*([^;]+)/);
      
      return {
        background: backgroundMatch ? backgroundMatch[1].trim() : this._getDefaultBackground(themeId),
        color: colorMatch ? colorMatch[1].trim() : '#ffffff',
        border: borderMatch ? borderMatch[1].trim() : '1px solid var(--divider-color)'
      };
    } catch (error) {
      console.warn(`无法从主题 ${themeId} 生成预览，使用默认预览:`, error);
      return this._getDefaultPreview(themeId);
    }
  }

  _getDefaultBackground(themeId) {
    const hash = this._stringToHash(themeId);
    const hue = hash % 360;
    
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 30) % 360}, 70%, 40%) 100%)`;
  }

  _getDefaultPreview(themeId) {
    return {
      background: this._getDefaultBackground(themeId),
      color: '#ffffff',
      border: 'none'
    };
  }

  _stringToHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
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

  getThemePreview(themeId) {
    const theme = this.getTheme(themeId);
    if (theme && typeof theme.getPreview === 'function') {
      return theme.getPreview();
    }
    return this._getDefaultPreview(themeId);
  }

  applyTheme(element, themeId, config = {}) {
    const theme = this.getTheme(themeId);
    if (theme && typeof theme.applyTheme === 'function') {
      theme.applyTheme(element, config);
    }
  }

  registerDynamicTheme(themeConfig) {
    if (!themeConfig.id || !themeConfig.name || !themeConfig.getStyles) {
      console.warn('动态主题配置不完整，跳过注册');
      return;
    }

    this.themes.set(themeConfig.id, {
      id: themeConfig.id,
      manifest: {
        id: themeConfig.id,
        name: themeConfig.name,
        description: themeConfig.description || `${themeConfig.name}主题`,
        icon: themeConfig.icon || '🎨',
        category: themeConfig.category || 'general',
        preview: themeConfig.preview || this._generatePreviewFromConfig(themeConfig)
      },
      getStyles: themeConfig.getStyles,
      applyTheme: themeConfig.applyTheme || (() => {}),
      getPreview: () => themeConfig.preview || this._generatePreviewFromConfig(themeConfig)
    });
  }

  _generatePreviewFromConfig(themeConfig) {
    try {
      const styles = themeConfig.getStyles({});
      const backgroundMatch = styles.match(/background:\s*([^;]+)/);
      const colorMatch = styles.match(/color:\s*([^;]+)/);
      const borderMatch = styles.match(/border:\s*([^;]+)/);
      
      return {
        background: backgroundMatch ? backgroundMatch[1].trim() : this._getDefaultBackground(themeConfig.id),
        color: colorMatch ? colorMatch[1].trim() : '#ffffff',
        border: borderMatch ? borderMatch[1].trim() : '1px solid var(--divider-color)'
      };
    } catch (error) {
      return this._getDefaultPreview(themeConfig.id);
    }
  }
}

const themeManager = new ThemeManager();
themeManager.initialize();

export { themeManager, ThemeManager };