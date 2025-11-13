// src/themes/neon-theme.js
export class NeonTheme {
  constructor(config = {}) {
    this.config = config;
  }

  static themeName = '霓虹光影';
  static themeDescription = '赛博朋克风格的霓虹灯效果';

  apply(element) {
    return `
      .cardforge-card {
        background: #1a1a1a;
        color: #00ff88;
        border: 1px solid #00ff88;
        animation: neonPulse 2s ease-in-out infinite;
      }
      
      .cardforge-card:hover {
        animation: neonPulse 1s ease-in-out infinite;
        box-shadow: 
          0 0 15px #00ff88,
          0 0 30px rgba(0, 255, 136, 0.4),
          inset 0 0 20px rgba(0, 255, 136, 0.1);
      }
    `;
  }

  static getThemeConfig() {
    return {
      useGradient: false,
      gradientType: 'none',
      supportsAnimations: true,
      neonColor: '#00ff88'
    };
  }
}