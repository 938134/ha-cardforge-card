// src/themes/glass-theme.js
export default {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  category: 'effect',

  preview: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
    color: 'var(--primary-text-color)',
    border: '1px solid rgba(255,255,255,0.2)'
  },

  getStyles(config = {}) {
    const blur = config.blurIntensity || 20;
    const opacity = config.opacity || 0.8;
    const saturation = config.saturation || 180;
    const borderOpacity = config.borderOpacity || 0.15;

    return `
      background: linear-gradient(135deg, 
        rgba(var(--rgb-primary-background-color), ${opacity * 0.3}) 0%, 
        rgba(var(--rgb-primary-background-color), ${opacity * 0.2}) 50%,
        rgba(var(--rgb-primary-background-color), ${opacity * 0.15}) 100%);
      backdrop-filter: blur(${blur}px) saturate(${saturation}%);
      -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
      border: 1px solid rgba(var(--rgb-primary-text-color), ${borderOpacity});
      color: var(--primary-text-color);
    `;
  },

  applyTheme(element, config = {}) {
    if (config.useGradientOverlay) {
      element.classList.add('gradient-overlay');
    } else {
      element.classList.remove('gradient-overlay');
    }
  }
};