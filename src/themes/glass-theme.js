// src/themes/glass-theme.js
export class GlassTheme {
  constructor(config = {}) {
    this.config = config;
  }

  static themeName = '毛玻璃';
  static themeDescription = '半透明磨砂玻璃效果';

  apply(element) {
    return `
      .cardforge-card {
        position: relative;
        background: linear-gradient(135deg, 
          rgba(var(--rgb-primary-background-color), 0.25) 0%, 
          rgba(var(--rgb-primary-background-color), 0.15) 50%,
          rgba(var(--rgb-primary-background-color), 0.1) 100%);
        backdrop-filter: blur(25px) saturate(180%);
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
        color: var(--primary-text-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .cardforge-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
        transition: left 0.6s ease;
      }
      
      .cardforge-card:hover::before {
        left: 100%;
      }
      
      .cardforge-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
    `;
  }

  static getThemeConfig() {
    return {
      useGradient: false,
      gradientType: 'diagonal',
      supportsAnimations: true,
      blurIntensity: 25
    };
  }
}