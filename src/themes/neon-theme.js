// src/themes/neon-theme.js
export default {
  id: 'neon',
  name: '霓虹光影',
  description: '赛博朋克风格的霓虹灯效果',
  icon: '💡',
  category: 'effect',

  getStyles(config = {}) {
    const glowColor = config.glowColor || '#00ff88';
    const intensity = config.glowIntensity || 1.0;
    const speed = config.animationSpeed || 2;

    return `
      background: #1a1a1a;
      color: ${glowColor};
      border: 1px solid ${glowColor};
      box-shadow: 
        0 0 ${8 * intensity}px ${glowColor},
        inset 0 0 ${15 * intensity}px ${glowColor}1a;
      animation: neonPulse ${speed}s ease-in-out infinite;
      
      @keyframes neonPulse {
        0%, 100% {
          box-shadow: 
            0 0 8px ${glowColor},
            inset 0 0 15px rgba(0, 255, 136, 0.1);
        }
        50% {
          box-shadow: 
            0 0 20px ${glowColor},
            0 0 35px rgba(0, 255, 136, 0.3),
            inset 0 0 25px rgba(0, 255, 136, 0.2);
        }
      }
    `;
  },

  applyTheme(element, config = {}) {
    if (config.useMultipleColors) {
      element.classList.add('multicolor');
    } else {
      element.classList.remove('multicolor');
    }
  },

  getConfigSchema() {
    return {
      glowColor: {
        type: 'string',
        label: '霓虹颜色',
        default: '#00ff88'
      },
      glowIntensity: {
        type: 'number',
        label: '发光强度',
        min: 0.5,
        max: 2,
        step: 0.1,
        default: 1.0
      },
      animationSpeed: {
        type: 'number',
        label: '动画速度',
        min: 1,
        max: 5,
        default: 2
      },
      useMultipleColors: {
        type: 'boolean',
        label: '多色效果',
        default: false
      }
    };
  }
};