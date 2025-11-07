// 主题系统
export class ThemeManager {
  static themes = {
    'default': {
      name: '默认主题',
      description: '使用 Home Assistant 默认主题',
      variables: {
        '--cardforge-bg-color': 'var(--card-background-color)',
        '--cardforge-text-color': 'var(--primary-text-color)',
        '--cardforge-primary-color': 'var(--primary-color)',
        '--cardforge-border-radius': 'var(--ha-card-border-radius, 12px)',
        '--cardforge-shadow': 'var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1))'
      }
    },
    'dark': {
      name: '深色主题',
      description: '适合暗色模式的深色主题',
      variables: {
        '--cardforge-bg-color': '#1e1e1e',
        '--cardforge-text-color': '#ffffff',
        '--cardforge-primary-color': '#bb86fc',
        '--cardforge-border-radius': '12px',
        '--cardforge-shadow': '0 2px 8px rgba(0,0,0,0.3)'
      }
    },
    'material': {
      name: '材质设计',
      description: 'Google Material Design 风格',
      variables: {
        '--cardforge-bg-color': '#fafafa',
        '--cardforge-text-color': '#212121',
        '--cardforge-primary-color': '#6200ee',
        '--cardforge-border-radius': '8px',
        '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)'
      }
    }
  };

  static getAllThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name,
      description: this.themes[key].description
    }));
  }

  static getTheme(themeName) {
    return this.themes[themeName] || this.themes['default'];
  }

  static applyTheme(element, themeName) {
    const theme = this.getTheme(themeName);
    const root = element.shadowRoot || element;
    
    // 移除旧的主题样式
    const oldStyle = root.querySelector('style[data-theme]');
    if (oldStyle) {
      oldStyle.remove();
    }

    // 创建新的主题样式
    const style = document.createElement('style');
    style.setAttribute('data-theme', themeName);
    
    let css = `.cardforge-themed {\\n`;
    Object.entries(theme.variables).forEach(([variable, value]) => {
      css += `  ${variable}: ${value};\\n`;
    });
    css += `}`;
    
    style.textContent = css;
    root.appendChild(style);

    // 添加主题类名
    if (element.classList) {
      element.classList.add('cardforge-themed');
    }
  }
}

window.ThemeManager = ThemeManager;