// src/themes/neon-theme.js
export default {
  id: 'neon',
  name: '霓虹光影',
  description: '赛博朋克风格的霓虹灯效果',
  icon: '💡',
  category: 'effect',

  preview: {
    background: '#1a1a1a',
    color: '#00ff88',
    border: '1px solid #00ff88',
    boxShadow: '0 0 8px #00ff88'
  },

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
  }
};
