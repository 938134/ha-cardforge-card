// themes/glass-theme.js - 简化无动画版
export const theme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  
  styles: `
    /* 毛玻璃主题 - 卡片容器 */
    .cardforge-container {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--cf-shadow-md);
    }
    
    /* 毛玻璃主题 - 文字颜色 */
    .card-title {
      color: rgba(0, 0, 0, 0.85);
      font-weight: var(--cf-font-weight-bold);
    }
    
    .card-subtitle {
      color: rgba(0, 0, 0, 0.65);
    }
    
    .card-caption {
      color: rgba(0, 0, 0, 0.45);
    }
    
    .card-emphasis {
      color: var(--cf-primary-color);
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.08) 0%, 
          rgba(255, 255, 255, 0.03) 100%);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      
      .card-title {
        color: rgba(255, 255, 255, 0.95);
      }
      
      .card-subtitle {
        color: rgba(255, 255, 255, 0.75);
      }
      
      .card-caption {
        color: rgba(255, 255, 255, 0.55);
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'var(--cf-shadow-md)'
  }
};