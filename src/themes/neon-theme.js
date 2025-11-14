// src/themes/neon-theme.js
export const NeonTheme = {
  id: 'neon',
  name: '霓虹光影',
  description: '霓虹灯效果',
  getStyles: () => `
    .theme-neon {
      background: #1a1a1a;
      color: #00ff88;
      border: 1px solid #00ff88;
      animation: neonPulse 2s ease-in-out infinite;
    }
    
    @keyframes neonPulse {
      0%, 100% {
        box-shadow: 
          0 0 8px #00ff88,
          inset 0 0 15px rgba(0, 255, 136, 0.1);
      }
      50% {
        box-shadow: 
          0 0 20px #00ff88,
          0 0 35px rgba(0, 255, 136, 0.3),
          inset 0 0 25px rgba(0, 255, 136, 0.2);
      }
    }
  `
};
