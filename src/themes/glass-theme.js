// themes/glass-theme.js - 修复版（使用 CSSResult）
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  
  styles: css`
    /* 毛玻璃主题 - 卡片容器 */
    .cardforge-container {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 100%) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: var(--cf-shadow-md) !important;
    }
    
    /* 毛玻璃主题 - 文字颜色 */
    .cardforge-container .card-title {
      color: rgba(0, 0, 0, 0.85) !important;
      font-weight: var(--cf-font-weight-bold);
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(0, 0, 0, 0.65) !important;
    }
    
    .cardforge-container .card-caption {
      color: rgba(0, 0, 0, 0.45) !important;
    }
    
    .cardforge-container .card-emphasis {
      color: var(--cf-primary-color) !important;
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.08) 0%, 
          rgba(255, 255, 255, 0.03) 100%) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
      }
      
      .cardforge-container .card-title {
        color: rgba(255, 255, 255, 0.95) !important;
      }
      
      .cardforge-container .card-subtitle {
        color: rgba(255, 255, 255, 0.75) !important;
      }
      
      .cardforge-container .card-caption {
        color: rgba(255, 255, 255, 0.55) !important;
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'var(--cf-shadow-md)'
  }
};