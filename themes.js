export class ThemeManager {
  static init() {
    this.themes = {
      'default': {
        name: '默认主题',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color, #ffffff)',
          '--cardforge-text-color': 'var(--primary-text-color, #000000)',
          '--cardforge-primary-color': 'var(--primary-color, #03a9f4)',
          '--cardforge-secondary-color': 'var(--secondary-text-color, #737373)',
          '--cardforge-header-bg': 'var(--primary-color, #03a9f4)',
          '--cardforge-header-text': '#ffffff',
          '--cardforge-footer-bg': 'rgba(0, 0, 0, 0.03)',
          '--cardforge-border-radius': '12px',
          '--cardforge-shadow': '0 2px 4px rgba(0,0,0,0.1)'
        }
      },
      'dark': {
        name: '深色主题',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color, #1e1e1e)',
          '--cardforge-text-color': 'var(--primary-text-color, #ffffff)',
          '--cardforge-primary-color': 'var(--primary-color, #bb86fc)',
          '--cardforge-secondary-color': 'var(--secondary-text-color, #b0b0b0)',
          '--cardforge-header-bg': 'var(--primary-color, #bb86fc)',
          '--cardforge-header-text': '#000000',
          '--cardforge-footer-bg': 'rgba(255, 255, 255, 0.05)',
          '--cardforge-border-radius': '12px',
          '--cardforge-shadow': '0 2px 8px rgba(0,0,0,0.3)'
        }
      },
      'material': {
        name: '材质设计',
        variables: {
          '--cardforge-bg-color': '#fafafa',
          '--cardforge-text-color': '#212121',
          '--cardforge-primary-color': '#6200ee',
          '--cardforge-secondary-color': '#757575',
          '--cardforge-header-bg': 'linear-gradient(135deg, #6200ee, #3700b3)',
          '--cardforge-header-text': '#ffffff',
          '--cardforge-footer-bg': 'rgba(98, 0, 238, 0.08)',
          '--cardforge-border-radius': '8px',
          '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)'
        }
      },
      'minimal': {
        name: '极简风格',
        variables: {
          '--cardforge-bg-color': 'transparent',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)',
          '--cardforge-secondary-color': 'var(--secondary-text-color)',
          '--cardforge-header-bg': 'transparent',
          '--cardforge-header-text': 'var(--primary-text-color)',
          '--cardforge-footer-bg': 'transparent',
          '--cardforge-border-radius': '0px',
          '--cardforge-shadow': 'none'
        }
      }
    };
  }

  static getTheme(themeName) {
    return this.themes[themeName] || this.themes['default'];
  }

  static getAllThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name
    }));
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
    
    let css = ':host {\\n';
    Object.keys(theme.variables).forEach(variable => {
      css += `  ${variable}: ${theme.variables[variable]};\\n`;
    });
    css += '}';
    
    style.textContent = css;
    root.appendChild(style);
  }

  static createCustomTheme(customVariables) {
    return {
      name: '自定义主题',
      variables: {
        ...this.themes['default'].variables,
        ...customVariables
      }
    };
  }
}
