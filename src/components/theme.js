// 主题系统
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
        '--cardforge-padding': '16px',
        '--cardforge-gap': '8px'
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
        '--cardforge-padding': '16px',
        '--cardforge-gap': '8px'
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
        '--cardforge-padding': '16px',
        '--cardforge-gap': '12px'
      }
    },
    'minimal': {
      id: 'minimal',
      name: '极简风格',
      icon: '📄',
      description: '简洁无边框的设计',
      variables: {
        '--cardforge-bg-color': 'transparent',
        '--cardforge-text-color': 'var(--primary-text-color)',
        '--cardforge-primary-color': 'var(--primary-color)',
        '--cardforge-secondary-color': 'var(--secondary-text-color)',
        '--cardforge-border-radius': '0px',
        '--cardforge-shadow': 'none',
        '--cardforge-padding': '8px',
        '--cardforge-gap': '4px'
      }
    },
    'glass': {
      id: 'glass',
      name: '玻璃拟态',
      icon: '🔮',
      description: '毛玻璃效果设计',
      variables: {
        '--cardforge-bg-color': 'rgba(255, 255, 255, 0.1)',
        '--cardforge-text-color': '#ffffff',
        '--cardforge-primary-color': '#bb86fc',
        '--cardforge-secondary-color': 'rgba(255, 255, 255, 0.7)',
        '--cardforge-border-radius': '16px',
        '--cardforge-shadow': '0 8px 32px rgba(0,0,0,0.1)',
        '--cardforge-padding': '20px',
        '--cardforge-gap': '12px',
        'backdrop-filter': 'blur(10px)',
        'border': '1px solid rgba(255, 255, 255, 0.2)'
      }
    }
  };

  static getAllThemes() {
    return Object.values(this.themes).map(theme => ({
      id: theme.id,
      name: theme.name,
      icon: theme.icon,
      description: theme.description
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
    
    let css = `.cardforge-themed, :host {
  /* 主题变量 */
`;
    
    Object.entries(theme.variables).forEach(([variable, value]) => {
      css += `  ${variable}: ${value};\n`;
    });
    
    css += `}

/* 应用主题到卡片元素 */
.cardforge-themed .cardforge-card {
  background: var(--cardforge-bg-color);
  color: var(--cardforge-text-color);
  border-radius: var(--cardforge-border-radius);
  box-shadow: var(--cardforge-shadow);
  padding: var(--cardforge-padding);
  gap: var(--cardforge-gap);
}

.cardforge-themed .cardforge-primary {
  color: var(--cardforge-primary-color);
}

.cardforge-themed .cardforge-secondary {
  color: var(--cardforge-secondary-color);
}

/* 玻璃拟态特殊处理 */
${themeName === 'glass' ? `
.cardforge-themed .cardforge-card {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
` : ''}
`;
    
    style.textContent = css;
    root.appendChild(style);

    // 添加主题类名
    if (element.classList) {
      element.classList.add('cardforge-themed');
    }
  }

  static createCustomTheme(customConfig) {
    const themeId = `custom-${Date.now()}`;
    this.themes[themeId] = {
      id: themeId,
      name: customConfig.name || '自定义主题',
      icon: '🎨',
      description: customConfig.description || '用户自定义主题',
      variables: {
        '--cardforge-bg-color': customConfig.backgroundColor || '#ffffff',
        '--cardforge-text-color': customConfig.textColor || '#212121',
        '--cardforge-primary-color': customConfig.primaryColor || '#2196F3',
        '--cardforge-secondary-color': customConfig.secondaryColor || '#666666',
        '--cardforge-border-radius': customConfig.borderRadius || '12px',
        '--cardforge-shadow': customConfig.shadow || '0 2px 4px rgba(0,0,0,0.1)',
        '--cardforge-padding': customConfig.padding || '16px',
        '--cardforge-gap': customConfig.gap || '8px',
        ...customConfig.customVariables
      }
    };
    return themeId;
  }

  static updateCustomTheme(themeId, updates) {
    if (this.themes[themeId] && themeId.startsWith('custom-')) {
      this.themes[themeId] = { ...this.themes[themeId], ...updates };
      return true;
    }
    return false;
  }

  static deleteCustomTheme(themeId) {
    if (themeId.startsWith('custom-') && this.themes[themeId]) {
      delete this.themes[themeId];
      return true;
    }
    return false;
  }

  // 获取主题的CSS变量，用于预览
  static getThemeCSS(themeName) {
    const theme = this.getTheme(themeName);
    let css = ':root {\n';
    Object.entries(theme.variables).forEach(([variable, value]) => {
      css += `  ${variable}: ${value};\n`;
    });
    css += '}';
    return css;
  }

  // 验证颜色值
  static isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  // 颜色格式转换
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

window.ThemeManager = ThemeManager;