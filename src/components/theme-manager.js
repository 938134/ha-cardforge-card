export class ThemeManager {
  static init() {
    this.themes = {
      'default': {
        name: '默认主题',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color, #ffffff)',
          '--cardforge-text-color': 'var(--primary-text-color, #000000)',
          '--cardforge-primary-color': 'var(--primary-color, #03a9f4)',
          '--cardforge-header-bg': 'var(--primary-color, #03a9f4)',
          '--cardforge-header-text': '#ffffff'
        }
      },
      'dark': {
        name: '深色主题',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color, #1e1e1e)',
          '--cardforge-text-color': 'var(--primary-text-color, #ffffff)',
          '--cardforge-primary-color': 'var(--primary-color, #bb86fc)',
          '--cardforge-header-bg': 'var(--primary-color, #bb86fc)',
          '--cardforge-header-text': '#000000'
        }
      },
      'material': {
        name: '材质设计',
        variables: {
          '--cardforge-bg-color': '#fafafa',
          '--cardforge-text-color': '#212121',
          '--cardforge-primary-color': '#6200ee',
          '--cardforge-header-bg': 'linear-gradient(135deg, #6200ee, #3700b3)',
          '--cardforge-header-text': '#ffffff'
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
    
    const oldStyle = root.querySelector('style[data-theme]');
    if (oldStyle) {
      oldStyle.remove();
    }

    const style = document.createElement('style');
    style.setAttribute('data-theme', themeName);
    
    let css = ':host {\n';
    Object.keys(theme.variables).forEach(variable => {
      css += `  ${variable}: ${theme.variables[variable]};\n`;
    });
    css += '}';
    
    style.textContent = css;
    root.appendChild(style);
  }
}
