// src/themes/glass-theme.js
export const GlassTheme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明毛玻璃效果',
  getStyles: () => `
    .theme-glass {
      background: linear-gradient(135deg, 
        rgba(var(--rgb-primary-background-color), 0.25) 0%, 
        rgba(var(--rgb-primary-background-color), 0.15) 50%,
        rgba(var(--rgb-primary-background-color), 0.1) 100%);
      backdrop-filter: blur(25px) saturate(180%);
      -webkit-backdrop-filter: blur(25px) saturate(180%);
      border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
      color: var(--primary-text-color);
    }
  `
};
