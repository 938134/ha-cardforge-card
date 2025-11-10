// src/core/theme-manager.js
class ThemeManager {
  static _themes = new Map();
  static _currentTheme = 'default';
  static _customThemes = new Map();
  static _systemThemes = new Map();

  static init() {
    this._registerBuiltinThemes();
    this._loadSystemThemes();
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
          '--cardforge-shadow': 'var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1))',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
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
          '--cardforge-shadow': '0 4px 8px rgba(0,0,0,0.3)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #bb86fc, #03dac6)'
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
          '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #6200ee, #03dac6)'
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
          '--cardforge-padding': '12px',
          '--cardforge-shadow': 'none',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
        }
      },
      'modern': {
        id: 'modern',
        name: '现代风格',
        icon: '💎',
        description: '现代时尚的设计风格',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': 'rgba(255, 255, 255, 0.9)',
          '--cardforge-text-color': '#2c3e50',
          '--cardforge-primary-color': '#3498db',
          '--cardforge-accent-color': '#9b59b6',
          '--cardforge-border-radius': '16px',
          '--cardforge-padding': '20px',
          '--cardforge-shadow': '0 8px 32px rgba(0,0,0,0.1)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #667eea, #764ba2)'
        }
      }
    };

    Object.entries(builtinThemes).forEach(([id, theme]) => {
      this._themes.set(id, theme);
    });
  }

  static _loadSystemThemes() {
    // 检测并加载 Home Assistant 系统主题
    if (window.themes && window.themes.themes) {
      Object.entries(window.themes.themes).forEach(([themeName, themeConfig]) => {
        if (themeConfig && typeof themeConfig === 'object') {
          const systemTheme = {
            id: `system-${themeName}`,
            name: `系统: ${themeName}`,
            icon: '🏠',
            description: `Home Assistant 系统主题: ${themeName}`,
            type: 'system',
            variables: this._convertSystemTheme(themeConfig)
          };
          this._systemThemes.set(systemTheme.id, systemTheme);
          this._themes.set(systemTheme.id, systemTheme);
        }
      });
    }
  }

  static _convertSystemTheme(systemTheme) {
    // 将系统主题转换为卡片工坊主题变量
    return {
      '--cardforge-bg-color': systemTheme['card-background-color'] || 'var(--card-background-color)',
      '--cardforge-text-color': systemTheme['primary-text-color'] || 'var(--primary-text-color)',
      '--cardforge-primary-color': systemTheme['primary-color'] || 'var(--primary-color)',
      '--cardforge-accent-color': systemTheme['accent-color'] || 'var(--accent-color)',
      '--cardforge-border-radius': systemTheme['ha-card-border-radius'] || 'var(--ha-card-border-radius, 12px)',
      '--cardforge-padding': '16px',
      '--cardforge-shadow': systemTheme['ha-card-box-shadow'] || 'var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1))',
      '--cardforge-welcome-bg': `linear-gradient(135deg, ${systemTheme['primary-color'] || 'var(--primary-color)'}, ${systemTheme['accent-color'] || 'var(--accent-color)'})`
    };
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

  static getBuiltinThemes() {
    return Array.from(this._themes.values()).filter(theme => theme.type === 'builtin');
  }

  static getSystemThemes() {
    return Array.from(this._systemThemes.values());
  }

  static getCustomThemes() {
    return Array.from(this._customThemes.values());
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
    
    let css = `
      .cardforge-card {
        background: var(--cardforge-bg-color);
        color: var(--cardforge-text-color);
        border-radius: var(--cardforge-border-radius);
        padding: var(--cardforge-padding);
        box-shadow: var(--cardforge-shadow);
      }
      
      .cardforge-welcome {
        background: var(--cardforge-welcome-bg) !important;
        color: white;
      }
      
      .cardforge-primary {
        color: var(--cardforge-primary-color);
      }
      
      .cardforge-accent {
        color: var(--cardforge-accent-color);
      }
    `;
    
    // 添加主题特定的样式覆盖
    css += this._getThemeOverrides(theme.id);
    
    style.textContent = css;
    root.appendChild(style);
  }

  static _getThemeOverrides(themeId) {
    const overrides = {
      'dark': `
        .cardforge-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `,
      'material': `
        .cardforge-card {
          transition: all 0.3s ease;
        }
        .cardforge-card:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }
      `,
      'minimal': `
        .cardforge-card {
          border: none;
        }
      `,
      'modern': `
        .cardforge-card {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `,
      'default': ''
    };
    
    return overrides[themeId] || '';
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

  // 工具方法
  static getThemeVariables(themeId = null) {
    const theme = this.getTheme(themeId || this._currentTheme);
    return theme ? theme.variables : {};
  }

  static exportTheme(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return null;
    
    return {
      ...theme,
      exported: new Date().toISOString()
    };
  }

  static importTheme(themeData) {
    if (!themeData.id || !themeData.variables) {
      throw new Error('无效的主题数据');
    }
    
    const themeId = themeData.id.startsWith('custom-') ? themeData.id : `custom-${themeData.id}`;
    
    const theme = {
      id: themeId,
      name: themeData.name || '导入的主题',
      icon: themeData.icon || '📥',
      description: themeData.description || '从外部导入的主题',
      type: 'custom',
      variables: themeData.variables,
      imported: new Date().toISOString()
    };
    
    this._customThemes.set(themeId, theme);
    this._themes.set(themeId, theme);
    this._saveCustomThemes();
    
    return themeId;
  }

  // 刷新系统主题（当HA主题变化时调用）
  static refreshSystemThemes() {
    // 清除现有系统主题
    this._systemThemes.forEach((theme, id) => {
      this._themes.delete(id);
    });
    this._systemThemes.clear();
    
    // 重新加载系统主题
    this._loadSystemThemes();
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };