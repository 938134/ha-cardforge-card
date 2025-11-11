// src/core/theme-manager.js
class ThemeManager {
  static _themes = new Map();
  static _currentTheme = 'default';

  static init() {
    this._registerThemes();
  }

  static _registerThemes() {
    // 基础主题
    const baseThemes = {
      'default': {
        id: 'default',
        name: '默认主题',
        colors: {
          primary: 'var(--primary-color, #03a9f4)',
          accent: 'var(--accent-color, #ff9800)',
          background: 'var(--card-background-color, #ffffff)',
          text: 'var(--primary-text-color, #212121)',
          textSecondary: 'var(--secondary-text-color, #727272)',
          success: 'var(--success-color, #4caf50)',
          warning: 'var(--warning-color, #ff9800)',
          error: 'var(--error-color, #f44336)'
        },
        styles: `
          .cardforge-theme-default {
            --cf-primary: var(--primary-color, #03a9f4);
            --cf-accent: var(--accent-color, #ff9800);
            --cf-bg: var(--card-background-color, #ffffff);
            --cf-text: var(--primary-text-color, #212121);
            --cf-text-secondary: var(--secondary-text-color, #727272);
            --cf-success: var(--success-color, #4caf50);
            --cf-warning: var(--warning-color, #ff9800);
            --cf-error: var(--error-color, #f44336);
          }
        `
      },
      'dark': {
        id: 'dark',
        name: '深色主题',
        colors: {
          primary: '#4fc3f7',
          accent: '#ffb74d',
          background: '#1e1e1e',
          text: '#ffffff',
          textSecondary: '#b0b0b0',
          success: '#81c784',
          warning: '#ffb74d',
          error: '#e57373'
        },
        styles: `
          .cardforge-theme-dark {
            --cf-primary: #4fc3f7;
            --cf-accent: #ffb74d;
            --cf-bg: #1e1e1e;
            --cf-text: #ffffff;
            --cf-text-secondary: #b0b0b0;
            --cf-success: #81c784;
            --cf-warning: #ffb74d;
            --cf-error: #e57373;
            background: #1e1e1e;
            color: #ffffff;
          }
        `
      },
      'material': {
        id: 'material',
        name: '材质设计',
        colors: {
          primary: '#2196f3',
          accent: '#ff4081',
          background: '#ffffff',
          text: '#212121',
          textSecondary: '#757575',
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336'
        },
        styles: `
          .cardforge-theme-material {
            --cf-primary: #2196f3;
            --cf-accent: #ff4081;
            --cf-bg: #ffffff;
            --cf-text: #212121;
            --cf-text-secondary: #757575;
            --cf-success: #4caf50;
            --cf-warning: #ff9800;
            --cf-error: #f44336;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
        `
      },
      'gradient-blue': {
        id: 'gradient-blue',
        name: '蓝色渐变',
        colors: {
          primary: '#667eea',
          accent: '#764ba2',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          text: '#ffffff',
          textSecondary: 'rgba(255,255,255,0.8)',
          success: '#a8e6cf',
          warning: '#ffd93d',
          error: '#ff8b94'
        },
        styles: `
          .cardforge-theme-gradient-blue {
            --cf-primary: #667eea;
            --cf-accent: #764ba2;
            --cf-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --cf-text: #ffffff;
            --cf-text-secondary: rgba(255,255,255,0.8);
            --cf-success: #a8e6cf;
            --cf-warning: #ffd93d;
            --cf-error: #ff8b94;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
          }
        `
      },
      'gradient-sunset': {
        id: 'gradient-sunset',
        name: '日落渐变',
        colors: {
          primary: '#ff6b6b',
          accent: '#ffa726',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
          text: '#ffffff',
          textSecondary: 'rgba(255,255,255,0.9)',
          success: '#a8e6cf',
          warning: '#ffd93d',
          error: '#ff8b94'
        },
        styles: `
          .cardforge-theme-gradient-sunset {
            --cf-primary: #ff6b6b;
            --cf-accent: #ffa726;
            --cf-bg: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
            --cf-text: #ffffff;
            --cf-text-secondary: rgba(255,255,255,0.9);
            --cf-success: #a8e6cf;
            --cf-warning: #ffd93d;
            --cf-error: #ff8b94;
            background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
            color: #ffffff;
          }
        `
      },
      'gradient-ocean': {
        id: 'gradient-ocean',
        name: '海洋渐变',
        colors: {
          primary: '#4facfe',
          accent: '#00f2fe',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          text: '#ffffff',
          textSecondary: 'rgba(255,255,255,0.9)',
          success: '#a8e6cf',
          warning: '#ffd93d',
          error: '#ff8b94'
        },
        styles: `
          .cardforge-theme-gradient-ocean {
            --cf-primary: #4facfe;
            --cf-accent: #00f2fe;
            --cf-bg: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --cf-text: #ffffff;
            --cf-text-secondary: rgba(255,255,255,0.9);
            --cf-success: #a8e6cf;
            --cf-warning: #ffd93d;
            --cf-error: #ff8b94;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #ffffff;
          }
        `
      }
    };

    Object.entries(baseThemes).forEach(([id, theme]) => {
      this._themes.set(id, theme);
    });
  }

  static getTheme(themeId) {
    return this._themes.get(themeId) || this._themes.get('default');
  }

  static getAllThemes() {
    return Array.from(this._themes.values());
  }

  static getThemesByType(type) {
    return this.getAllThemes().filter(theme => {
      if (type === 'gradient') return theme.id.startsWith('gradient-');
      if (type === 'solid') return !theme.id.startsWith('gradient-');
      return true;
    });
  }

  static applyTheme(element, themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return false;

    // 移除旧主题类
    Array.from(this._themes.keys()).forEach(id => {
      element.classList.remove(`cardforge-theme-${id}`);
    });

    // 添加新主题类
    element.classList.add(`cardforge-theme-${themeId}`);
    
    // 注入主题样式
    this._injectThemeStyles(theme);
    
    this._currentTheme = themeId;
    return true;
  }

  static _injectThemeStyles(theme) {
    const styleId = 'cardforge-theme-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = theme.styles;
  }

  static getCurrentTheme() {
    return this._currentTheme;
  }

  // 为主题系统添加工具方法
  static createGradient(colors, type = 'diagonal') {
    const gradientTypes = {
      'diagonal': `linear-gradient(135deg, ${colors.join(', ')})`,
      'horizontal': `linear-gradient(90deg, ${colors.join(', ')})`,
      'vertical': `linear-gradient(180deg, ${colors.join(', ')})`,
      'radial': `radial-gradient(circle, ${colors.join(', ')})`
    };
    
    return gradientTypes[type] || gradientTypes.diagonal;
  }

  // 检查是否为渐变主题
  static isGradientTheme(themeId) {
    return themeId.startsWith('gradient-');
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };