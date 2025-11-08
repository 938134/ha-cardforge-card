export class ThemeManager {
  static themes = {
    'default': {
      id: 'default',
      name: '默认主题',
      icon: '🎨',
      description: '使用 Home Assistant 默认主题',
      variables: {
        '--cardforge-bg-color': 'var(--card-background-color)',
        '--cardforge-text-color': 'var(--primary-text-color)',
        '--cardforge-primary-color': 'var(--primary-color)',
        '--cardforge-secondary-color': 'var(--secondary-text-color)',
        '--cardforge-border-radius': 'var(--ha-card-border-radius, 12px)',
        '--cardforge-shadow': 'var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1))',
        '--cardforge-padding': '16px'
      }
    },
    'dark': {
      id: 'dark',
      name: '深色主题',
      icon: '🌙',
      description: '适合暗色模式的深色主题',
      variables: {
        '--cardforge-bg-color': '#1e1e1e',
        '--cardforge-text-color': '#ffffff',
        '--cardforge-primary-color': '#bb86fc',
        '--cardforge-secondary-color': '#a0a0a0',
        '--cardforge-border-radius': '12px',
        '--cardforge-shadow': '0 2px 8px rgba(0,0,0,0.3)',
        '--cardforge-padding': '16px'
      }
    },
    'material': {
      id: 'material',
      name: '材质设计',
      icon: '⚡',
      description: 'Google Material Design 风格',
      variables: {
        '--cardforge-bg-color': '#fafafa',
        '--cardforge-text-color': '#212121',
        '--cardforge-primary-color': '#6200ee',
        '--cardforge-secondary-color': '#666666',
        '--cardforge-border-radius': '8px',
        '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)',
        '--cardforge-padding': '16px'
      }
    }
  };

  static getAllThemes() {
    return Object.values(this.themes);
  }

  static getTheme(themeName) {
    return this.themes[themeName] || this.themes['default'];
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
    
    let css = `.cardforge-themed {
`;
    
    Object.entries(theme.variables).forEach(([variable, value]) => {
      css += `  ${variable}: ${value};\n`;
    });
    
    css += `}

.cardforge-themed .cardforge-card {
  background: var(--cardforge-bg-color);
  color: var(--cardforge-text-color);
  border-radius: var(--cardforge-border-radius);
  box-shadow: var(--cardforge-shadow);
  padding: var(--cardforge-padding);
}`;
    
    style.textContent = css;
    root.appendChild(style);

    if (element.classList) {
      element.classList.add('cardforge-themed');
    }
  }
}

window.ThemeManager = ThemeManager;