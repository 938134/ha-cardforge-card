// ha-cardforge-card/managers/theme.js
class ThemeManager {
  static _themes = new Map();
  static _currentTheme = 'default';

  static init() {
    this._registerThemes();
    this._loadCurrentTheme();
  }

  static _registerThemes() {
    // 默认主题
    this._themes.set('default', {
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
    });

    // 深色主题
    this._themes.set('dark', {
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
    });

    // 材质设计主题
    this._themes.set('material', {
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
    });

    // 玻璃拟态主题
    this._themes.set('glass', {
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
    });
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

  // 获取主题样式
  static getThemeStyles(themeId = null) {
    const theme = this.getTheme(themeId || this._currentTheme);
    if (!theme) return '';

    let css = `.cardforge-card {\n`;
    Object.entries(theme.variables).forEach(([varName, value]) => {
      css += `  ${varName}: ${value};\n`;
    });
    css += `}\n`;
    
    return css;
  }

  // 应用主题配置
  static applyTheme(config) {
    const themeConfigs = {
      'dark': { 
        style: 'background: #1e1e1e; color: white;' 
      },
      'material': { 
        style: 'background: #fafafa; color: #212121;' 
      },
      'glass': {
        style: 'background: rgba(255, 255, 255, 0.1); color: white; backdrop-filter: blur(10px);'
      }
    };
    return themeConfigs[config.theme] || {};
  }

  // UI 渲染方法
  static renderThemeSelector(currentTheme, onThemeChanged) {
    const themes = this.getAllThemes();
    
    return `
      <ha-select
        label="选择主题"
        .value="${currentTheme || 'default'}"
        @selected="${(e) => onThemeChanged(e.target.value)}"
      >
        ${themes.map(theme => `
          <mwc-list-item value="${theme.id}">
            <ha-icon icon="${this._getThemeIcon(theme.id)}" slot="graphic"></ha-icon>
            ${theme.name}
          </mwc-list-item>
        `).join('')}
      </ha-select>
      <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: 8px;">
        ${this.getTheme(currentTheme)?.description || ''}
      </div>
    `;
  }

  static _getThemeIcon(themeId) {
    const icons = {
      'default': 'mdi:palette-outline',
      'dark': 'mdi:weather-night',
      'material': 'mdi:material-design',
      'glass': 'mdi:crystal-ball'
    };
    return icons[themeId] || 'mdi:palette';
  }

  // 主题预览
  static getThemePreview(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return '';

    return `
      <div style="
        background: ${theme.variables['--cardforge-bg-color']};
        color: ${theme.variables['--cardforge-text-color']};
        border-radius: ${theme.variables['--cardforge-border-radius']};
        padding: 16px;
        margin: 8px 0;
        box-shadow: ${theme.variables['--cardforge-shadow']};
        ${theme.variables['--cardforge-backdrop'] ? `backdrop-filter: ${theme.variables['--cardforge-backdrop']};` : ''}
      ">
        <div style="font-weight: bold;">${theme.name}</div>
        <div style="font-size: 0.8em; opacity: 0.8;">${theme.description}</div>
      </div>
    `;
  }
}

// 初始化
ThemeManager.init();
window.ThemeManager = ThemeManager;

export { ThemeManager };