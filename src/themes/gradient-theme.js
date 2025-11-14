// src/themes/gradient-theme.js - 修复样式输出
export const gradientTheme = {
  id: 'gradient',
  name: '随机渐变',
  description: '动态变化的渐变背景',
  icon: '🌈',
  category: 'color',

  preview: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none'
  },

  config: {
    gradientType: 'diagonal',
    animationSpeed: 6,
    useRandomGradients: true,
    customGradient: ''
  },

  getGradients() {
    return [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
  },

  getRandomGradient() {
    const gradients = this.getGradients();
    const now = new Date();
    const seed = now.getHours() * 60 + now.getMinutes();
    return gradients[seed % gradients.length];
  },

  getStyles(config = {}) {
    const speed = config.animationSpeed || 6;
    let gradient = config.customGradient;
    
    if (!gradient || config.useRandomGradients) {
      gradient = this.getRandomGradient();
    }

    return `
      background: ${gradient};
      background-size: 200% 200%;
      animation: gradientShift ${speed}s ease infinite;
      color: white;
      border: none;
    `;
  },

  applyTheme(element, config = {}) {
    // 动态应用渐变配置
    if (config.useRandomGradients) {
      const gradient = this.getRandomGradient();
      if (gradient) {
        element.style.background = gradient;
      }
    }
  }
};