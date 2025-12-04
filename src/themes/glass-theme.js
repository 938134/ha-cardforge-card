// 毛玻璃主题 - 更新preview样式
export const theme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  
  variables: {
    '--cf-primary-color': '#ffffff',
    '--cf-accent-color': '#ffffff',
    '--cf-background': 'rgba(255, 255, 255, 0.15)',
    '--cf-surface': 'rgba(255, 255, 255, 0.1)',
    '--cf-border': 'rgba(255, 255, 255, 0.2)',
    '--cf-text-primary': '#ffffff',
    '--cf-text-secondary': 'rgba(255, 255, 255, 0.8)'
  },
  
  styles: `
    .cardforge-container {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.6) 0%, rgba(236, 72, 153, 0.4) 50%, rgba(239, 68, 68, 0.3) 100%)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)'
  }
};