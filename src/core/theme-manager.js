// src/core/theme-manager.js
export class ThemeManager {
    constructor() {
      this.themes = new Map();
      this.currentTheme = 'default';
      this._customThemes = new Map();
      this._registerBuiltinThemes();
      this._loadCurrentTheme();
    }
  
    _registerBuiltinThemes() {
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
            '--cardforge-border-radius': 'var(--ha-card-border-radius, 12px)',
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
            '--cardforge-border-radius': '12px',
            '--cardforge-shadow': '0 4px 8px rgba(0,0,0,0.3)'
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
            '--cardforge-border-radius': '8px',
            '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)'
          }
        },
        'glass': {
          id: 'glass',
          name: '玻璃拟态',
          icon: '🔮',
          description: '毛玻璃效果现代设计',
          type: 'builtin',
          variables: {
            '--cardforge-bg-color': 'rgba(255, 255, 255, 0.1)',
            '--cardforge-text-color': '#ffffff',
            '--cardforge-primary-color': '#ffffff',
            '--cardforge-border-radius': '16px',
            '--cardforge-shadow': '0 8px 32px rgba(0,0,0,0.1)',
            '--cardforge-backdrop': 'blur(10px)'
          }
        }
      };
  
      Object.entries(builtinThemes).forEach(([id, theme]) => {
        this.themes.set(id, theme);
      });
    }
  
    _loadCurrentTheme() {
      try {
        const saved = localStorage.getItem('cardforge-current-theme');
        if (saved && this.themes.has(saved)) {
          this.currentTheme = saved;
        }
      } catch (error) {
        console.warn('加载当前主题失败:', error);
      }
    }
  
    _saveCurrentTheme() {
      try {
        localStorage.setItem('cardforge-current-theme', this.currentTheme);
      } catch (error) {
        console.warn('保存当前主题失败:', error);
      }
    }
  
    // 主题管理
    registerTheme(theme) {
      this.themes.set(theme.id, theme);
    }
  
    getTheme(themeId) {
      return this.themes.get(themeId) || this.themes.get('default');
    }
  
    getCurrentTheme() {
      return this.getTheme(this.currentTheme);
    }
  
    setCurrentTheme(themeId) {
      if (this.themes.has(themeId)) {
        this.currentTheme = themeId;
        this._saveCurrentTheme();
        return true;
      }
      return false;
    }
  
    getAllThemes() {
      return Array.from(this.themes.values());
    }
  
    // 样式处理
    getThemeStyles(themeId = null) {
      const theme = this.getTheme(themeId || this.currentTheme);
      if (!theme) return '';
  
      let css = `.cardforge-card {\n`;
      Object.entries(theme.variables).forEach(([varName, value]) => {
        css += `  ${varName}: ${value};\n`;
      });
      css += `}\n`;
      
      return css;
    }
  
    applyTheme(element, themeId = null) {
      const theme = this.getTheme(themeId || this.currentTheme);
      if (!theme) return false;
  
      const root = element.shadowRoot || element;
      this._removeExistingTheme(root);
      this._injectThemeStyles(root, theme);
      
      return true;
    }
  
    _removeExistingTheme(root) {
      const existing = root.querySelector('style[data-cardforge-theme]');
      if (existing) existing.remove();
    }
  
    _injectThemeStyles(root, theme) {
      const style = document.createElement('style');
      style.setAttribute('data-cardforge-theme', theme.id);
      style.textContent = this.getThemeStyles(theme.id);
      root.appendChild(style);
    }
  
    // 自定义主题
    createCustomTheme(themeData) {
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
      this.themes.set(themeId, theme);
      this._saveCustomThemes();
      
      return themeId;
    }
  
    deleteCustomTheme(themeId) {
      if (this._customThemes.has(themeId)) {
        if (this.currentTheme === themeId) {
          this.setCurrentTheme('default');
        }
        this._customThemes.delete(themeId);
        this.themes.delete(themeId);
        this._saveCustomThemes();
        return true;
      }
      return false;
    }
  
    _saveCustomThemes() {
      try {
        const customThemes = Array.from(this._customThemes.values());
        localStorage.setItem('cardforge-custom-themes', JSON.stringify(customThemes));
      } catch (error) {
        console.warn('保存自定义主题失败:', error);
      }
    }
  
    _loadCustomThemes() {
      try {
        const stored = localStorage.getItem('cardforge-custom-themes');
        if (stored) {
          const customThemes = JSON.parse(stored);
          customThemes.forEach(theme => {
            this._customThemes.set(theme.id, theme);
            this.themes.set(theme.id, { ...theme, type: 'custom' });
          });
        }
      } catch (error) {
        console.warn('加载自定义主题失败:', error);
      }
    }
  }