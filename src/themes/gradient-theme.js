// src/themes/gradient-theme.js
export class GradientTheme {
  constructor(config = {}) {
    this.config = config;
    this.gradientColors = this._getGradientColors();
  }

  static themeName = '随机渐变';
  static themeDescription = '动态彩色渐变背景';

  _getGradientColors() {
    const gradients = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140']
    ];
    
    const now = new Date();
    const seed = now.getHours() * 60 + now.getMinutes();
    return gradients[seed % gradients.length];
  }

  apply(element) {
    const [color1, color2] = this.gradientColors;
    
    return `
      .cardforge-card {
        background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
        background-size: 200% 200%;
        animation: gradientShift 8s ease infinite;
        color: white;
        border: none;
      }
      
      .cardforge-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
      }
    `;
  }

  static getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      supportsAnimations: true,
      isDynamic: true
    };
  }
}