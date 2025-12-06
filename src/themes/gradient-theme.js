// themes/gradient-theme.js - 修复版
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
        var(--cf-error-color) 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.25) !important;
      backdrop-filter: blur(5px) !important;
      -webkit-backdrop-filter: blur(5px) !important;
    }
    
    /* 渐变主题 - 文字颜色（白色文字，在渐变背景上更清晰） */
    .cardforge-container .card-title {
      color: white !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      font-weight: var(--cf-font-weight-bold);
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(255, 255, 255, 0.9) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .cardforge-container .card-caption {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    .cardforge-container .card-emphasis {
      color: white !important;
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
          color-mix(in srgb, var(--cf-warning-color), black 20%) 100%) !important;
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color), var(--cf-error-color))',
    border: '1px solid rgba(255, 255, 255, 0.25)'
  }
};