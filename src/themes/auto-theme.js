// src/themes/auto-theme.js
export default {
  id: 'auto',
  name: '跟随系统',
  description: '自动适应系统主题设置',
  icon: '⚙️',

  getStyles(config = {}) {
    return `
      background: var(--card-background-color);
      color: var(--primary-text-color);
      border-color: var(--divider-color);
    `;
  }
};
