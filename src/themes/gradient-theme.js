// src/themes/gradient-theme.js
export const GradientTheme = {
  id: 'gradient',
  name: '随机渐变',
  description: '动态渐变背景',
  getStyles: () => `
    .theme-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-size: 200% 200%;
      animation: gradientShift 8s ease infinite;
      color: white;
      border: none;
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `
};
