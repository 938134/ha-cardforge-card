// src/themes/neon-theme.js - 修复样式输出
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
      background: #1a1a1a;
      color: ${glowColor};
      border: 1px solid ${glowColor};
      box-shadow: 
        0 0 ${8 * intensity}px ${glowColor},
        inset 0 0 ${15 * intensity}px ${glowColor}1a;
      animation: neonPulse ${speed}s ease-in-out infinite;
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