// src/themes/gradient-theme.js
export default {
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
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
  },

  applyTheme(element, config = {}) {
    if (config.useRandomGradients) {
      const gradient = this.getRandomGradient();
      if (gradient) {
        element.style.background = gradient;
      }
    }
  }
};
