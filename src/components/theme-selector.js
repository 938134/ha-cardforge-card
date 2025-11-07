export class ThemeSelector {
  static themes = {
    'default': {
      name: '默认主题',
      description: '使用 Home Assistant 默认主题',
      preview: '🎨',
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
      description: '适合暗色模式的深色主题',
      preview: '🌙',
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
      description: 'Google Material Design 风格',
      preview: '⚡',
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
      description: '简洁无边框设计',
      preview: '⊞',
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
    },
    'nature': {
      name: '自然风格',
      description: '绿色自然主题',
      preview: '🌿',
      variables: {
        '--cardforge-bg-color': '#f8fff8',
        '--cardforge-text-color': '#2e7d32',
        '--cardforge-primary-color': '#4caf50',
        '--cardforge-secondary-color': '#689f38',
        '--cardforge-header-bg': 'linear-gradient(135deg, #4caf50, #2e7d32)',
        '--cardforge-header-text': '#ffffff',
        '--cardforge-footer-bg': 'rgba(76, 175, 80, 0.1)',
        '--cardforge-border-radius': '16px',
        '--cardforge-shadow': '0 4px 12px rgba(76, 175, 80, 0.2)'
      }
    }
  };

  static getAllThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name,
      description: this.themes[key].description,
      preview: this.themes[key].preview
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
    
    let css = '.card {\\n';
    Object.keys(theme.variables).forEach(variable => {
      css += `  ${variable.replace('--cardforge-', '--')}: ${theme.variables[variable]};\\n`;
    });
    css += '}';
    
    style.textContent = css;
    root.appendChild(style);
  }

  static open(currentTheme, onThemeSelect) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10003;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--card-background-color, white);
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    modal.innerHTML = this._generateThemeSelectorHTML(currentTheme);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    this._bindThemeSelectorEvents(modal, overlay, currentTheme, onThemeSelect);
  }

  static _generateThemeSelectorHTML(currentTheme) {
    const themes = this.getAllThemes();
    
    return `
      <div class="theme-selector">
        <div class="selector-header" style="padding: 20px; border-bottom: 1px solid var(--divider-color);">
          <h2 style="margin: 0 0 16px 0; color: var(--primary-color);">🎨 选择主题</h2>
          <p style="margin: 0; color: var(--secondary-text-color);">选择适合您仪表盘风格的主题</p>
        </div>
        
        <div class="themes-grid" style="flex: 1; overflow-y: auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
          ${themes.map(theme => `
            <div class="theme-card ${currentTheme === theme.id ? 'selected' : ''}" 
                 data-theme="${theme.id}"
                 style="border: 2px solid ${currentTheme === theme.id ? 'var(--primary-color)' : 'var(--divider-color)'}; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; background: var(--card-background-color);">
              <div class="theme-preview" style="font-size: 2.5em; text-align: center; margin-bottom: 12px;">${theme.preview}</div>
              <div class="theme-name" style="font-weight: bold; margin-bottom: 4px; text-align: center;">${theme.name}</div>
              <div class="theme-description" style="font-size: 0.8em; color: var(--secondary-text-color); text-align: center;">${theme.description}</div>
            </div>
          `).join('')}
        </div>

        <div class="selector-footer" style="padding: 16px; border-top: 1px solid var(--divider-color); text-align: right;">
          <button id="theme-cancel" class="secondary" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background: var(--secondary-background-color); color: var(--secondary-text-color); margin-right: 8px;">取消</button>
          <button id="theme-confirm" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background: var(--primary-color); color: white;">确认选择</button>
        </div>
      </div>

      <style>
        .theme-card:hover {
          border-color: var(--primary-color) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .theme-card.selected {
          background: rgba(var(--primary-color-rgb), 0.05) !important;
        }
      </style>
    `;
  }

  static _bindThemeSelectorEvents(modal, overlay, currentTheme, onThemeSelect) {
    let selectedTheme = currentTheme || 'default';
    
    // 主题选择
    modal.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        modal.querySelectorAll('.theme-card').forEach(c => {
          c.style.borderColor = 'var(--divider-color)';
        });
        card.style.borderColor = 'var(--primary-color)';
        selectedTheme = card.dataset.theme;
      });
    });

    // 取消按钮
    modal.querySelector('#theme-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 确认选择
    modal.querySelector('#theme-confirm').addEventListener('click', () => {
      onThemeSelect(selectedTheme);
      document.body.removeChild(overlay);
    });

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }
}
