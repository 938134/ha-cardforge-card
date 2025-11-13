// src/themes/base-theme.js
export class BaseTheme {
  constructor(config = {}) {
    this.config = config;
  }

  static themeName = '跟随系统';
  static themeDescription = '使用系统默认的主题样式';

  apply(element) {
    return `
      .cardforge-card {
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border-radius: var(--ha-card-border-radius, 12px);
        position: relative;
        overflow: hidden;
        border: 1px solid var(--divider-color, #e0e0e0);
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
      isSystemDefault: true
    };
  }
}