// src/themes/gradient-theme.js
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
    gradientType: 'diagonal', // diagonal, horizontal, vertical, radial
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
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
      'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
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
    const gradientType = config.gradientType || 'diagonal';
    
    let gradient = config.customGradient;
    if (!gradient || config.useRandomGradients) {
      gradient = this.getRandomGradient();
    }

    // 根据类型调整渐变方向
    if (gradientType !== 'diagonal' && gradient.includes('135deg')) {
      const angles = {
        horizontal: '90deg',
        vertical: '180deg',
        radial: 'circle'
      };
      gradient = gradient.replace('135deg', angles[gradientType] || '135deg');
    }

    return `
      .theme-gradient {
        background: ${gradient};
        background-size: 200% 200%;
        animation: gradientShift ${speed}s ease infinite;
        color: white;
        position: relative;
        overflow: hidden;
        border: none;
      }
      
      .theme-gradient::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0) 50%,
          rgba(0, 0, 0, 0.05) 100%
        );
        pointer-events: none;
      }
      
      .theme-gradient > * {
        position: relative;
        z-index: 1;
      }
      
      .theme-gradient .cardforge-interactive:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      
      .theme-gradient .cardforge-status-on {
        color: rgba(255, 255, 255, 0.9);
      }
      
      .theme-gradient .cardforge-status-off {
        color: rgba(255, 255, 255, 0.6);
      }
      
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      /* 径向渐变特殊处理 */
      .theme-gradient[style*="radial-gradient"] {
        background-size: 150% 150%;
        animation: radialGradientShift ${speed * 1.5}s ease infinite;
      }
      
      @keyframes radialGradientShift {
        0% {
          background-position: 0% 0%;
        }
        50% {
          background-position: 100% 100%;
        }
        100% {
          background-position: 0% 0%;
        }
      }
    `;
  },

  applyTheme(element, config = {}) {
    // 动态应用渐变配置
    if (config.useRandomGradients) {
      // 每小时更换一次渐变
      const now = new Date();
      const gradientIndex = now.getHours() % this.getGradients().length;
      const gradient = this.getGradients()[gradientIndex];
      
      if (gradient) {
        element.style.background = gradient;
      }
    }
  }
};