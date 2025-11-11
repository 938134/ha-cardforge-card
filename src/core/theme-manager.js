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

  static applyTheme(element, themeId = null) {
    if (!element) {
      console.warn('应用主题失败：元素不存在');
      return false;
    }

    const theme = this.getTheme(themeId);
    if (!theme) {
      console.warn(`主题 ${themeId} 不存在`);
      return false;
    }

    try {
      this._removeExistingTheme(element);
      this._injectThemeStyles(element, theme);
      return true;
    } catch (error) {
      console.error('应用主题失败:', error);
      return false;
    }
  }

  static _removeExistingTheme(element) {
    try {
      const root = element.shadowRoot || element;
      if (!root) return;
      
      const existing = root.querySelector('style[data-cardforge-theme]');
      if (existing) {
        existing.remove();
      }
    } catch (error) {
      console.warn('移除现有主题失败:', error);
    }
  }

  static _injectThemeStyles(element, theme) {
    try {
      const root = element.shadowRoot || element;
      if (!root) return;
      
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
    } catch (error) {
      console.error('注入主题样式失败:', error);
      throw error;
    }
  }

  // 安全地应用主题（在下一个动画帧）
  static safeApplyTheme(element, themeId) {
    requestAnimationFrame(() => {
      this.applyTheme(element, themeId);
    });
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };