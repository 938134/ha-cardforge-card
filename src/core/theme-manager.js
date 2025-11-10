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

  // 修复：添加 applyTheme 方法
  static applyTheme(element, themeId = null) {
    const theme = this.getTheme(themeId);
    if (!theme) {
      console.warn(`主题 ${themeId} 不存在`);
      return false;
    }

    try {
      // 移除现有的主题样式
      this._removeExistingTheme(element);
      
      // 注入新的主题样式
      this._injectThemeStyles(element, theme);
      
      return true;
    } catch (error) {
      console.error('应用主题失败:', error);
      return false;
    }
  }

  static _removeExistingTheme(element) {
    const root = element.shadowRoot || element;
    const existing = root.querySelector('style[data-cardforge-theme]');
    if (existing) {
      existing.remove();
    }
  }

  static _injectThemeStyles(element, theme) {
    const root = element.shadowRoot || element;
    const style = document.createElement('style');
    style.setAttribute('data-cardforge-theme', theme.id);
    
    const css = `
      .cardforge-card {
        background: ${theme.variables['--cardforge-bg-color']};
        color: ${theme.variables['--cardforge-text-color']};
      }
      .cardforge-primary {
        color: ${theme.variables['--cardforge-primary-color']} !important;
      }
    `;
    
    style.textContent = css;
    root.appendChild(style);
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };