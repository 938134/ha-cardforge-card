// src/themes/glass-theme.js
export const glassTheme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  category: 'effect',

  preview: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
    color: 'var(--primary-text-color)',
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)'
  },

  config: {
    blurIntensity: 20,
    opacity: 0.8,
    saturation: 180,
    borderOpacity: 0.15
  },

  getStyles(config = {}) {
    const blur = config.blurIntensity || 20;
    const opacity = config.opacity || 0.8;
    const saturation = config.saturation || 180;
    const borderOpacity = config.borderOpacity || 0.15;

    return `
      .theme-glass {
        position: relative;
        background: linear-gradient(135deg, 
          rgba(var(--rgb-primary-background-color), ${opacity * 0.3}) 0%, 
          rgba(var(--rgb-primary-background-color), ${opacity * 0.2}) 50%,
          rgba(var(--rgb-primary-background-color), ${opacity * 0.15}) 100%);
        backdrop-filter: blur(${blur}px) saturate(${saturation}%);
        -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
        border: 1px solid rgba(var(--rgb-primary-text-color), ${borderOpacity});
        color: var(--primary-text-color);
        transition: all 0.3s ease;
      }
      
      .theme-glass::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0.05) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        pointer-events: none;
        z-index: 1;
      }
      
      .theme-glass > * {
        position: relative;
        z-index: 2;
      }
      
      .theme-glass .cardforge-interactive:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .theme-glass.gradient-overlay {
        background: linear-gradient(135deg, 
          rgba(var(--rgb-primary-color), 0.2) 0%,
          rgba(var(--rgb-accent-color), 0.1) 100%),
          linear-gradient(135deg, 
          rgba(var(--rgb-primary-background-color), ${opacity * 0.3}) 0%, 
          rgba(var(--rgb-primary-background-color), ${opacity * 0.2}) 50%,
          rgba(var(--rgb-primary-background-color), ${opacity * 0.15}) 100%);
      }
      
      /* 移动端性能优化 */
      @media (max-width: 480px) {
        .theme-glass {
          backdrop-filter: blur(${Math.min(blur, 15)}px) saturate(${saturation}%);
          -webkit-backdrop-filter: blur(${Math.min(blur, 15)}px) saturate(${saturation}%);
        }
      }
    `;
  },

  applyTheme(element, config = {}) {
    // 应用毛玻璃效果配置
    if (config.useGradientOverlay) {
      element.classList.add('gradient-overlay');
    } else {
      element.classList.remove('gradient-overlay');
    }
  }
};