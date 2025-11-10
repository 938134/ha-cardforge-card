// src/core/theme-manager.js
class ThemeManager {
  static _themes = new Map();

  static init() {
    this._registerBuiltinThemes();
  }

  static _registerBuiltinThemes() {
    const builtinThemes = {
      'default': {
        id: 'default',
        name: '默认主题',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color)',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)'
        }
      },
      'dark': {
        id: 'dark',
        name: '深色主题',
        variables: {
          '--cardforge-bg-color': '#1e1e1e',
          '--cardforge-text-color': '#ffffff',
          '--cardforge-primary-color': '#bb86fc'
        }
      },
      'material': {
        id: 'material',
        name: '材质设计',
        variables: {
          '--cardforge-bg-color': '#fafafa',
          '--cardforge-text-color': '#212121',
          '--cardforge-primary-color': '#6200ee'
        }
      },
      'minimal': {
        id: 'minimal',
        name: '极简风格',
        variables: {
          '--cardforge-bg-color': 'transparent',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)'
        }
      }
    };

    Object.entries(builtinThemes).forEach(([id, theme]) => {
      this._themes.set(id, theme);
    });
  }

  static getTheme(themeId) {
    return this._themes.get(themeId) || this._themes.get('default');
  }

  static getAllThemes() {
    return Array.from(this._themes.values());
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };