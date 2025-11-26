// src/themes/glass-theme.js
export default {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',

  getStyles(config = {}) {
    const blur = config.blurIntensity || 20;
    const opacity = config.opacity || 0.8;

    return `
      background: linear-gradient(135deg, 
        rgba(var(--rgb-primary-background-color), ${opacity * 0.3}) 0%, 
        rgba(var(--rgb-primary-background-color), ${opacity * 0.2}) 50%,
        rgba(var(--rgb-primary-background-color), ${opacity * 0.15}) 100%);
      backdrop-filter: blur(${blur}px) saturate(180%);
      -webkit-backdrop-filter: blur(${blur}px) saturate(180%);
      border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
      color: var(--primary-text-color);
    `;
  }
};
