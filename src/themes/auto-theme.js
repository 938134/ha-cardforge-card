// themes/auto-theme.js - 简化无动画版
export const theme = {
  id: 'auto',
  name: '自动',
  description: '跟随系统主题，无额外样式',
  icon: '⚙️',
  
  styles: `
    /* 自动主题 - 仅使用设计系统变量，无额外样式 */
    .cardforge-container {
      background: var(--cf-background);
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-md);
    }
    
    /* 使用设计系统的文字颜色变量 */
    .card-title {
      color: var(--cf-text-primary);
      font-weight: var(--cf-font-weight-bold);
    }
    
    .card-subtitle {
      color: var(--cf-text-secondary);
      font-weight: var(--cf-font-weight-medium);
    }
    
    .card-caption {
      color: var(--cf-text-tertiary);
    }
    
    .card-emphasis {
      color: var(--cf-primary-color);
      font-weight: var(--cf-font-weight-semibold);
    }
    
    /* 深色模式自动适配（依赖设计系统的深色变量） */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: var(--cf-background);
        border-color: var(--cf-border);
      }
      
      .card-title {
        color: var(--cf-text-primary);
      }
      
      .card-subtitle {
        color: var(--cf-text-secondary);
      }
      
      .card-caption {
        color: var(--cf-text-tertiary);
      }
    }
  `,
  
  preview: {
    background: 'var(--cf-background)',
    color: 'var(--cf-text-primary)',
    border: '1px solid var(--cf-border)',
    boxShadow: 'none'
  }
};