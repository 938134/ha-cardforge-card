// src/themes/auto-theme.js
export const AutoTheme = {
  id: 'auto',
  name: '跟随系统',
  description: '自动跟随Home Assistant系统主题',
  getStyles: () => `
    .theme-auto {
      background: var(--card-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
    }
  `
};
