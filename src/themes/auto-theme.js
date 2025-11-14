// src/themes/auto-theme.js
export const autoTheme = {
  id: 'auto',
  name: '跟随系统',
  description: '自动适应系统主题设置',
  icon: '⚙️',
  category: 'system',

  preview: {
    background: 'var(--card-background-color)',
    color: 'var(--primary-text-color)',
    border: '1px solid var(--divider-color)'
  },

  config: {
    useCustomColors: false,
    customBackground: '',
    customTextColor: ''
  },

  getStyles(config = {}) {
    return `
      .theme-auto {
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border-color: var(--divider-color);
        transition: all 0.3s ease;
      }
      
      .theme-auto .cardforge-interactive:hover {
        background: rgba(var(--rgb-primary-color), 0.05);
      }
      
      .theme-auto .cardforge-status-on {
        color: var(--success-color);
      }
      
      .theme-auto .cardforge-status-off {
        color: var(--disabled-color);
      }
    `;
  },

  applyTheme(element, config = {}) {
    // 自动主题不需要特殊处理，使用系统变量
    if (config.useCustomColors && config.customBackground) {
      element.style.setProperty('--card-background-color', config.customBackground);
    }
    if (config.useCustomColors && config.customTextColor) {
      element.style.setProperty('--primary-text-color', config.customTextColor);
    }
  }
};