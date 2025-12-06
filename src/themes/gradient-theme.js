// 渐变主题 - 使用设计系统变量
export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  styles: `
    .cardforge-container {
      /* 使用设计系统的主题色作为渐变色 */
      background: linear-gradient(135deg, 
        var(--cf-primary-color) 0%, 
        color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 25%) 25%,
        var(--cf-accent-color) 50%, 
        color-mix(in srgb, var(--cf-accent-color), var(--cf-error-color) 25%) 75%, 
        var(--cf-error-color) 100%);
      
      background-size: 400% 400%;
      animation: gradient-shift 15s ease infinite;
      
      /* 使用设计系统的边框变量 */
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(5px);
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* 渐变主题下的文字增强 */
    .cardforge-container .greeting,
    .cardforge-container .clock-time,
    .cardforge-container .poetry-title,
    .cardforge-container .week-number {
      color: var(--cf-text-inverse);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* 渐变主题下的块样式优化 */
    .cardforge-container .area-header {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      border-left: 3px solid rgba(255, 255, 255, 0.6);
      color: var(--cf-text-inverse);
    }
    
    .cardforge-container .area-content {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(6px);
      color: var(--cf-text-inverse);
    }
    
    .cardforge-container .area-footer {
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(4px);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--cf-text-inverse);
    }
    
    .cardforge-container .block-icon {
      background: rgba(255, 255, 255, 0.2);
      color: var(--cf-text-inverse);
    }
    
    .cardforge-container .block-name {
      color: rgba(255, 255, 255, 0.9);
    }
    
    .cardforge-container .block-value {
      color: var(--cf-text-inverse);
      font-weight: var(--cf-font-weight-bold);
    }
    
    /* 深色模式优化 - 使用更暗的渐变 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          color-mix(in srgb, var(--cf-primary-color), black 30%) 0%, 
          color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 25%) 25%,
          color-mix(in srgb, var(--cf-accent-color), black 20%) 50%, 
          color-mix(in srgb, var(--cf-accent-color), var(--cf-warning-color) 25%) 75%, 
          color-mix(in srgb, var(--cf-warning-color), black 20%) 100%);
      }
      
      .cardforge-container .area-header {
        background: rgba(0, 0, 0, 0.2);
      }
      
      .cardforge-container .area-content {
        background: rgba(0, 0, 0, 0.15);
      }
      
      .cardforge-container .block-icon {
        background: rgba(0, 0, 0, 0.25);
      }
    }
    
    /* 响应式优化 */
    @container cardforge-container (max-width: 600px) {
      .cardforge-container {
        animation-duration: 20s;
        backdrop-filter: blur(3px);
      }
    }
    
    @container cardforge-container (max-width: 400px) {
      .cardforge-container {
        animation: none;
        background-size: 200% 200%;
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-primary-color) 0%, var(--cf-accent-color) 50%, var(--cf-error-color) 100%)',
    color: 'var(--cf-text-inverse)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 4px 15px rgba(var(--cf-primary-color-rgb), 0.3)'
  }
};
