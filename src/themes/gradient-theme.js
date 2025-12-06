// themes/gradient-theme.js - 简化无动画版
export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  styles: `
    /* 渐变主题 - 卡片容器 */
    .cardforge-container {
      background: linear-gradient(135deg, 
        var(--cf-primary-color) 0%, 
        color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 25%) 25%,
        var(--cf-accent-color) 50%, 
        color-mix(in srgb, var(--cf-accent-color), var(--cf-error-color) 25%) 75%, 
        var(--cf-error-color) 100%);
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
    
    /* 渐变主题 - 文字颜色（白色文字，在渐变背景上更清晰） */
    .card-title {
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      font-weight: var(--cf-font-weight-bold);
    }
    
    .card-subtitle {
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .card-caption {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .card-emphasis {
      color: white;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          color-mix(in srgb, var(--cf-primary-color), black 30%) 0%, 
          color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 25%) 25%,
          color-mix(in srgb, var(--cf-accent-color), black 20%) 50%, 
          color-mix(in srgb, var(--cf-accent-color), var(--cf-warning-color) 25%) 75%, 
          color-mix(in srgb, var(--cf-warning-color), black 20%) 100%);
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color), var(--cf-error-color))',
    border: '1px solid rgba(255, 255, 255, 0.25)'
  }
};