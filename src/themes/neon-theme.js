// themes/neon-theme.js - 简化通用版
export const theme = {
  id: 'neon',
  name: '霓虹',
  description: '霓虹灯光效果，赛博朋克风格',
  icon: '💡',
  
  styles: `
    .cardforge-container {
      background: 
        radial-gradient(circle at 20% 30%, rgba(var(--cf-primary-color-rgb), 0.1) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(var(--cf-accent-color-rgb), 0.1) 0%, transparent 40%),
        var(--cf-background);
      border: 1px solid rgba(var(--cf-primary-color-rgb), 0.4);
      box-shadow: 
        0 0 30px rgba(var(--cf-primary-color-rgb), 0.3),
        0 0 60px rgba(var(--cf-accent-color-rgb), 0.2),
        inset 0 0 30px rgba(var(--cf-primary-color-rgb), 0.1);
    }
    
    /* 深色模式 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        box-shadow: 
          0 0 40px rgba(var(--cf-primary-color-rgb), 0.4),
          0 0 80px rgba(var(--cf-accent-color-rgb), 0.3),
          inset 0 0 40px rgba(var(--cf-primary-color-rgb), 0.15);
      }
    }
  `,
  
  preview: {
    background: `
      radial-gradient(circle at 30% 30%, rgba(var(--cf-primary-color-rgb), 0.3) 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(var(--cf-accent-color-rgb), 0.2) 0%, transparent 60%),
      var(--cf-background)
    `
  }
};