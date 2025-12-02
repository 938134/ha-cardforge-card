export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '动态渐变背景',
  icon: '🌈',
  
  variables: {
    '--cf-primary-color': '#ffffff',
    '--cf-accent-color': '#ffffff',
    '--cf-text-primary': '#ffffff',
    '--cf-text-secondary': 'rgba(255, 255, 255, 0.8)',
    '--cf-block-bg': 'rgba(255, 255, 255, 0.15)',
    '--cf-border': 'rgba(255, 255, 255, 0.2)'
  },
  
  styles: `
    .cardforge-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-size: 200% 200%;
      animation: gradient-shift 6s ease infinite;
      border: none;
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none'
  }
};
