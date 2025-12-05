// 渐变主题 - 直接使用设计系统变量
export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  styles: `
    .cardforge-container {
      /* 使用设计系统的主色和强调色创建渐变 */
      background: linear-gradient(135deg, 
        rgba(var(--cf-primary-color-rgb, 102, 126, 234), 0.8) 0%, 
        rgba(118, 75, 162, 0.7) 25%, 
        rgba(240, 147, 251, 0.6) 50%, 
        rgba(245, 87, 108, 0.7) 75%, 
        rgba(255, 154, 158, 0.8) 100%);
      
      background-size: 400% 400%;
      animation: gradient-shift 15s ease infinite;
      border: 1px solid rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.25);
      backdrop-filter: blur(5px);
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* 深色模式优化 - 使用更深的渐变 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          rgba(79, 70, 229, 0.9) 0%, 
          rgba(124, 58, 237, 0.8) 25%, 
          rgba(219, 39, 119, 0.7) 50%, 
          rgba(234, 88, 12, 0.8) 75%, 
          rgba(245, 158, 11, 0.9) 100%);
      }
    }
  `,
  
  preview: {
    // 预览使用渐变色
    background: 'linear-gradient(135deg, rgba(var(--cf-primary-color-rgb, 102, 126, 234), 0.8) 0%, rgba(118, 75, 162, 0.7) 25%, rgba(240, 147, 251, 0.6) 50%, rgba(245, 87, 108, 0.7) 75%, rgba(255, 154, 158, 0.8) 100%)',
    color: 'var(--cf-text-inverse, #ffffff)',
    border: '1px solid rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.25)',
    borderColor: 'rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.25)',
    boxShadow: '0 4px 15px rgba(var(--cf-primary-color-rgb, 102, 126, 234), 0.3)'
  }
};
