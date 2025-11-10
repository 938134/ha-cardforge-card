// src/core/theme-manager.js
class ThemeManager {
  static _themes = new Map();
  static _currentTheme = 'default';
  static _customThemes = new Map();

  static init() {
    this._registerBuiltinThemes();
    this._loadCustomThemes();
    this._loadCurrentTheme();
  }

  static _registerBuiltinThemes() {
    const builtinThemes = {
      'default': {
        id: 'default',
        name: '默认主题',
        icon: '🎨',
        description: '使用 Home Assistant 默认主题',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color)',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)',
          '--cardforge-accent-color': 'var(--accent-color)',
          '--cardforge-border-radius': 'var(--ha-card-border-radius, 12px)',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': 'var(--ha-card-box-shadow, none)'
        }
      },
      'dark': {
        id: 'dark',
        name: '深色主题',
        icon: '🌙',
        description: '适合暗色模式的深色主题',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': '#1e1e1e',
          '--cardforge-text-color': '#ffffff',
          '--cardforge-primary-color': '#bb86fc',
          '--cardforge-accent-color': '#03dac6',
          '--cardforge-border-radius': '12px',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': '0 2px 4px rgba(0,0,0,0.3)'
        }
      },
      'material': {
        id: 'material',
        name: '材质设计',
        icon: '⚡',
        description: 'Google Material Design 风格',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': '#fafafa',
          '--cardforge-text-color': '#212121',
          '--cardforge-primary-color': '#6200ee',
          '--cardforge-accent-color': '#03dac6',
          '--cardforge-border-radius': '8px',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)'
        }
      },
      'minimal': {
        id: 'minimal',
        name: '极简风格',
        icon: '📱',
        description: '简洁的极简主义设计',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': 'transparent',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)',
          '--cardforge-accent-color': 'var(--accent-color)',
          '--cardforge-border-radius': '0px',
          '--cardforge-padding': '8px',
          '--cardforge-shadow': 'none'
        }
      }
    };

    Object.entries(builtinThemes).forEach(([id, theme]) => {
      this._themes.set(id, theme);
    });
  }

  static _loadCustomThemes() {
    try {
      const stored = localStorage.getItem('cardforge-custom-themes');
      if (stored) {
        const customThemes = JSON.parse(stored);
        customThemes.forEach(theme => {
          this._customThemes.set(theme.id, theme);
          this._themes.set(theme.id, { ...theme, type: 'custom' });
        });
      }
    } catch (error) {
      console.warn('加载自定义主题失败:', error);
    }
  }

  static _loadCurrentTheme() {
    try {
      const saved = localStorage.getItem('cardforge-current-theme');
      if (saved && this._themes.has(saved)) {
        this._currentTheme = saved;
      }
    } catch (error) {
      console.warn('加载当前主题失败:', error);
    }
  }

  static _saveCustomThemes() {
    try {
      const customThemes = Array.from(this._customThemes.values());
      localStorage.setItem('cardforge-custom-themes', JSON.stringify(customThemes));
    } catch (error) {
      console.warn('保存自定义主题失败:', error);
    }
  }

  // 公共 API
  static getAllThemes() {
    return Array.from(this._themes.values());
  }

  static getTheme(themeId) {
    return this._themes.get(themeId) || this._themes.get('default');
  }

  static getCurrentTheme() {
    return this.getTheme(this._currentTheme);
  }

  static setCurrentTheme(themeId) {
    if (this._themes.has(themeId)) {
      this._currentTheme = themeId;
      localStorage.setItem('cardforge-current-theme', themeId);
      return true;
    }
    return false;
  }

  static applyTheme(element, themeId = null) {
    const theme = this.getTheme(themeId || this._currentTheme);
    if (!theme) return false;

    const root = element.shadowRoot || element;
    this._removeExistingTheme(root);
    this._injectThemeStyles(root, theme);
    
    return true;
  }

  static _removeExistingTheme(root) {
    const existing = root.querySelector('style[data-cardforge-theme]');
    if (existing) existing.remove();
  }

  static _injectThemeStyles(root, theme) {
    const style = document.createElement('style');
    style.setAttribute('data-cardforge-theme', theme.id);
    
    let css = `.cardforge-card {\n`;
    Object.entries(theme.variables).forEach(([varName, value]) => {
      css += `  ${varName}: ${value};\n`;
    });
    css += `}\n`;
    
    style.textContent = css;
    root.appendChild(style);
  }

  // 自定义主题管理
  static createCustomTheme(themeData) {
    const themeId = `custom-${Date.now()}`;
    const theme = {
      id: themeId,
      name: themeData.name || '自定义主题',
      icon: themeData.icon || '🎨',
      description: themeData.description || '用户自定义主题',
      type: 'custom',
      variables: {
        ...this.getTheme('default').variables,
        ...themeData.variables
      },
      created: new Date().toISOString()
    };

    this._customThemes.set(themeId, theme);
    this._themes.set(themeId, theme);
    this._saveCustomThemes();
    
    return themeId;
  }

  static updateCustomTheme(themeId, themeData) {
    if (this._customThemes.has(themeId)) {
      const theme = this._customThemes.get(themeId);
      const updatedTheme = {
        ...theme,
        ...themeData,
        updated: new Date().toISOString()
      };
      
      this._customThemes.set(themeId, updatedTheme);
      this._themes.set(themeId, updatedTheme);
      this._saveCustomThemes();
      return true;
    }
    return false;
  }

  static deleteCustomTheme(themeId) {
    if (this._customThemes.has(themeId)) {
      if (this._currentTheme === themeId) {
        this.setCurrentTheme('default');
      }
      this._customThemes.delete(themeId);
      this._themes.delete(themeId);
      this._saveCustomThemes();
      return true;
    }
    return false;
  }

  // 获取主题变量
  static getThemeVariables(themeId = null) {
    const theme = this.getTheme(themeId || this._currentTheme);
    return theme ? theme.variables : {};
  }

  // 导出主题
  static exportTheme(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return null;
    
    return {
      ...theme,
      exported: new Date().toISOString()
    };
  }

  // 导入主题
  static importTheme(themeData) {
    if (!themeData.id || !themeData.variables) {
      return false;
    }
    
    const themeId = themeData.id.startsWith('custom-') ? themeData.id : `custom-${themeData.id}`;
    
    const theme = {
      id: themeId,
      name: themeData.name || '导入主题',
      icon: themeData.icon || '📥',
      description: themeData.description || '导入的自定义主题',
      type: 'custom',
      variables: themeData.variables,
      imported: new Date().toISOString()
    };
    
    this._customThemes.set(themeId, theme);
    this._themes.set(themeId, theme);
    this._saveCustomThemes();
    
    return themeId;
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };
