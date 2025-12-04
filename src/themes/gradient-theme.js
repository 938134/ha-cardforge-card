// 渐变主题 - 时尚配色版
export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  variables: {
    '--cf-primary-color': '#ffffff',
    '--cf-accent-color': '#ffffff',
    '--cf-text-primary': '#ffffff',
    '--cf-text-secondary': 'rgba(255, 255, 255, 0.9)',
    '--cf-border': 'rgba(255, 255, 255, 0.25)'
  },
  
  styles: `
    .cardforge-container {
      background: linear-gradient(135deg, 
        #667eea 0%, 
        #764ba2 25%, 
        #f093fb 50%, 
        #f5576c 75%, 
        #ff9a9e 100%);
      background-size: 400% 400%;
      animation: gradient-shift 15s ease infinite;
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(5px);
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          #4f46e5 0%, 
          #7c3aed 25%, 
          #db2777 50%, 
          #ea580c 75%, 
          #f59e0b 100%);
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ff9a9e 100%)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  }
};