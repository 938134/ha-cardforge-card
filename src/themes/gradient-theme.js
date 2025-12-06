// themes/gradient-theme.js - 修复版
export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  styles: `
    .cardforge-container {
      background: linear-gradient(135deg, 
        var(--cf-primary-color) 0%, 
        color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 25%) 25%,
        var(--cf-accent-color) 50%, 
        color-mix(in srgb, var(--cf-accent-color), var(--cf-error-color) 25%) 75%, 
        var(--cf-error-color) 100%);
      background-size: 400% 400%;
      animation: gradient-shift 15s ease infinite;
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(5px);
      border-radius: var(--cf-radius-lg);
      overflow: hidden;
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* 深色模式 */
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