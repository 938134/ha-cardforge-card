// themes/neon-theme.js - 修复版（使用 CSSResult）
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'neon',
  name: '霓虹',
  description: '霓虹灯光效果，赛博朋克风格',
  icon: '💡',
  
  styles: css`
    /* 霓虹主题 - 卡片容器 */
    .cardforge-container {
      /* 霓虹渐变背景 */
      background: 
        radial-gradient(circle at 20% 30%, rgba(var(--cf-primary-color-rgb), 0.1) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(var(--cf-accent-color-rgb), 0.1) 0%, transparent 40%),
        var(--cf-background) !important;
      
      /* 霓虹发光边框 */
      border: 1px solid rgba(var(--cf-primary-color-rgb), 0.4) !important;
      box-shadow: 
        0 0 30px rgba(var(--cf-primary-color-rgb), 0.3),
        0 0 60px rgba(var(--cf-accent-color-rgb), 0.2),
        inset 0 0 30px rgba(var(--cf-primary-color-rgb), 0.1) !important;
    }
    
    /* 霓虹主题 - 文字颜色 */
    .cardforge-container .card-title {
      color: var(--cf-primary-color) !important;
      text-shadow: 0 0 10px rgba(var(--cf-primary-color-rgb), 0.5);
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(var(--cf-primary-color-rgb), 0.8) !important;
    }
    
    .cardforge-container .card-caption {
      color: rgba(var(--cf-accent-color-rgb), 0.7) !important;
    }
    
    .cardforge-container .card-emphasis {
      color: var(--cf-accent-color) !important;
      text-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.4);
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        box-shadow: 
          0 0 40px rgba(var(--cf-primary-color-rgb), 0.4),
          0 0 80px rgba(var(--cf-accent-color-rgb), 0.3),
          inset 0 0 40px rgba(var(--cf-primary-color-rgb), 0.15) !important;
      }
      
      .cardforge-container .card-title {
        text-shadow: 0 0 15px rgba(var(--cf-primary-color-rgb), 0.6);
      }
    }
  `,
  
  preview: {
    background: `
      radial-gradient(circle at 30% 30%, rgba(var(--cf-primary-color-rgb), 0.3) 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(var(--cf-accent-color-rgb), 0.2) 0%, transparent 60%),
      var(--cf-background)
    `,
    border: '1px solid rgba(var(--cf-primary-color-rgb), 0.4)'
  }
};