// src/themes/neon-theme.js
export const neonTheme = {
  id: 'neon',
  name: '霓虹光影',
  description: '赛博朋克风格的霓虹灯效果',
  icon: '💡',
  category: 'effect',

  preview: {
    background: '#1a1a1a',
    color: '#00ff88',
    border: '1px solid #00ff88',
    boxShadow: '0 0 10px #00ff88'
  },

  config: {
    glowColor: '#00ff88',
    glowIntensity: 1.0,
    animationSpeed: 2,
    useMultipleColors: false
  },

  getStyles(config = {}) {
    const glowColor = config.glowColor || '#00ff88';
    const intensity = config.glowIntensity || 1.0;
    const speed = config.animationSpeed || 2;

    return `
      .theme-neon {
        background: #1a1a1a;
        color: ${glowColor};
        border: 1px solid ${glowColor};
        box-shadow: 
          0 0 ${8 * intensity}px ${glowColor},
          inset 0 0 ${15 * intensity}px ${glowColor}1a;
        animation: neonPulse ${speed}s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }
      
      .theme-neon::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: 
          radial-gradient(
            circle at center,
            ${glowColor}33 0%,
            transparent 70%
          );
        animation: neonRotate ${speed * 4}s linear infinite;
        pointer-events: none;
        z-index: 1;
      }
      
      .theme-neon > * {
        position: relative;
        z-index: 2;
      }
      
      .theme-neon .cardforge-interactive {
        background: ${glowColor}1a;
        border: 1px solid ${glowColor}4d;
        transition: all 0.3s ease;
      }
      
      .theme-neon .cardforge-interactive:hover {
        background: ${glowColor}33;
        box-shadow: 0 0 ${12 * intensity}px ${glowColor};
      }
      
      .theme-neon .cardforge-status-on {
        color: ${glowColor};
        text-shadow: 0 0 ${8 * intensity}px ${glowColor};
      }
      
      .theme-neon .cardforge-status-off {
        color: #666;
      }
      
      .theme-neon .cardforge-status-unavailable {
        color: #ff4444;
        text-shadow: 0 0 ${8 * intensity}px #ff4444;
      }
      
      @keyframes neonPulse {
        0%, 100% {
          box-shadow: 
            0 0 ${8 * intensity}px ${glowColor},
            inset 0 0 ${15 * intensity}px ${glowColor}1a;
        }
        50% {
          box-shadow: 
            0 0 ${20 * intensity}px ${glowColor},
            0 0 ${35 * intensity}px ${glowColor}4d,
            inset 0 0 ${25 * intensity}px ${glowColor}33;
        }
      }
      
      @keyframes neonRotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      
      /* 多色霓虹效果 */
      .theme-neon.multicolor {
        animation: multicolorPulse ${speed * 2}s ease-in-out infinite;
      }
      
      @keyframes multicolorPulse {
        0% {
          border-color: #00ff88;
          box-shadow: 0 0 ${8 * intensity}px #00ff88;
          color: #00ff88;
        }
        33% {
          border-color: #ff0088;
          box-shadow: 0 0 ${8 * intensity}px #ff0088;
          color: #ff0088;
        }
        66% {
          border-color: #0088ff;
          box-shadow: 0 0 ${8 * intensity}px #0088ff;
          color: #0088ff;
        }
        100% {
          border-color: #00ff88;
          box-shadow: 0 0 ${8 * intensity}px #00ff88;
          color: #00ff88;
        }
      }
      
      /* 性能优化 */
      @media (prefers-reduced-motion: reduce) {
        .theme-neon {
          animation: none;
        }
        
        .theme-neon::before {
          animation: none;
        }
      }
    `;
  },

  applyTheme(element, config = {}) {
    // 应用霓虹效果配置
    if (config.useMultipleColors) {
      element.classList.add('multicolor');
    } else {
      element.classList.remove('multicolor');
    }
  }
};