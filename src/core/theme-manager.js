// src/core/theme-manager.js
class ThemeManager {
  static _themes = new Map();
  static _currentTheme = 'default';
  static _subscribers = new Set();

  static init() {
    this._registerBuiltinThemes();
    this._loadUserPreference();
  }

  static _registerBuiltinThemes() {
    const builtinThemes = {
      'default': {
        id: 'default',
        name: '默认主题',
        description: '简洁的默认主题',
        colors: {
          primary: 'var(--primary-color)',
          accent: 'var(--accent-color)',
          background: 'var(--card-background-color)',
          text: 'var(--primary-text-color)'
        }
      },
      'dark': {
        id: 'dark',
        name: '深色主题',
        description: '适合暗色环境的主题',
        colors: {
          primary: '#BB86FC',
          accent: '#03DAC6',
          background: '#1E1E1E',
          text: '#FFFFFF'
        }
      },
      'material': {
        id: 'material',
        name: '材质设计',
        description: 'Material Design 风格主题',
        colors: {
          primary: '#2196F3',
          accent: '#FF4081',
          background: '#FFFFFF',
          text: '#212121'
        }
      }
    };

    Object.entries(builtinThemes).forEach(([id, theme]) => {
      this._themes.set(id, theme);
    });
  }

  static _loadUserPreference() {
    try {
      const saved = localStorage.getItem('cardforge-theme');
      if (saved && this._themes.has(saved)) {
        this._currentTheme = saved;
      }
    } catch (error) {
      console.warn('加载主题偏好失败:', error);
    }
  }

  static subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  static _notifySubscribers() {
    this._subscribers.forEach(callback => callback(this._currentTheme));
  }

  static getTheme(themeId) {
    return this._themes.get(themeId) || this._themes.get('default');
  }

  static getCurrentTheme() {
    return this.getTheme(this._currentTheme);
  }

  static setTheme(themeId) {
    if (!this._themes.has(themeId)) {
      console.warn(`主题不存在: ${themeId}`);
      return false;
    }

    this._currentTheme = themeId;
    
    try {
      localStorage.setItem('cardforge-theme', themeId);
    } catch (error) {
      console.warn('保存主题偏好失败:', error);
    }

    this._notifySubscribers();
    return true;
  }

  static getAllThemes() {
    return Array.from(this._themes.values());
  }

  static registerTheme(theme) {
    if (!theme.id || !theme.name) {
      throw new Error('主题必须包含 id 和 name');
    }

    this._themes.set(theme.id, theme);
    this._notifySubscribers();
  }

  // 应用主题到元素
  static applyTheme(element, themeId) {
    const theme = this.getTheme(themeId);
    if (!theme || !element) return false;

    try {
      Object.entries(theme.colors || {}).forEach(([key, value]) => {
        element.style.setProperty(`--theme-${key}`, value);
      });

      element.setAttribute('data-theme', themeId);
      return true;
    } catch (error) {
      console.error('应用主题失败:', error);
      return false;
    }
  }

  // 生成主题 CSS 变量
  static generateThemeCSS(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return '';

    return Object.entries(theme.colors || {})
      .map(([key, value]) => `--theme-${key}: ${value};`)
      .join('\n');
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };
