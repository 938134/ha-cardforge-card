// themes/gradient-theme.js - 优化版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，现代设计风格',
  icon: '🌈',
  
  styles: css`
    /* 渐变主题 - 卡片容器 */
    .cardforge-container {
      /* 现代渐变背景 */
      background: 
        linear-gradient(
          135deg,
          rgba(var(--cf-primary-color-rgb), 0.9) 0%,
          rgba(var(--cf-primary-color-rgb), 0.7) 25%,
          rgba(var(--cf-accent-color-rgb), 0.7) 50%,
          rgba(var(--cf-error-color-rgb), 0.9) 100%
        ),
        radial-gradient(
          circle at 20% 80%,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 50%
        ) !important;
      
      /* 现代边框效果 */
      border: none !important;
      position: relative !important;
      overflow: hidden !important;
      box-shadow: 
        0 8px 32px rgba(var(--cf-primary-color-rgb), 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1) !important;
      
      /* 添加微妙的发光效果 */
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: 
          radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 70% 70%,
            rgba(var(--cf-accent-color-rgb), 0.1) 0%,
            transparent 50%
          );
        z-index: 0;
        pointer-events: none;
      }
      
      /* 确保内容在渐变层之上 */
      & > * {
        position: relative;
        z-index: 1;
      }
    }
    
    /* 渐变主题 - 文字颜色（优化对比度） */
    .cardforge-container .card-title {
      color: white !important;
      text-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(255, 255, 255, 0.2) !important;
      font-weight: var(--cf-font-weight-bold);
      background: linear-gradient(135deg, white, rgba(255, 255, 255, 0.8));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(255, 255, 255, 0.95) !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
      font-weight: var(--cf-font-weight-medium);
    }
    
    .cardforge-container .card-caption {
      color: rgba(255, 255, 255, 0.85) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }
    
    .cardforge-container .card-emphasis {
      color: white !important;
      font-weight: var(--cf-font-weight-bold);
      text-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.4),
        0 0 15px rgba(255, 255, 255, 0.3) !important;
    }
    
    /* 诗词卡片特定优化 */
    .cardforge-container .poetry-line {
      color: rgba(255, 255, 255, 0.95) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }
    
    .cardforge-container .translation-content {
      color: rgba(255, 255, 255, 0.9) !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border-left: 3px solid rgba(255, 255, 255, 0.3) !important;
    }
    
    .cardforge-container .translation-label {
      color: white !important;
      background: rgba(255, 255, 255, 0.2) !important;
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: 
          linear-gradient(
            135deg,
            rgba(var(--cf-primary-color-rgb), 0.8) 0%,
            rgba(var(--cf-primary-color-rgb), 0.6) 25%,
            rgba(var(--cf-accent-color-rgb), 0.6) 50%,
            rgba(var(--cf-warning-color-rgb), 0.8) 100%
          ) !important;
        box-shadow: 
          0 8px 32px rgba(var(--cf-primary-color-rgb), 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2) !important;
      }
      
      .cardforge-container::before {
        background: 
          radial-gradient(
            circle at 20% 20%,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 60%
          ),
          radial-gradient(
            circle at 80% 80%,
            rgba(var(--cf-accent-color-rgb), 0.08) 0%,
            transparent 60%
          );
      }
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        box-shadow: 
          0 4px 16px rgba(var(--cf-primary-color-rgb), 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      }
    }
  `,
  
  preview: {
    background: `linear-gradient(135deg, 
      rgba(var(--cf-primary-color-rgb), 0.9), 
      rgba(var(--cf-accent-color-rgb), 0.7), 
      rgba(var(--cf-error-color-rgb), 0.9)
    )`,
    border: 'none',
    boxShadow: '0 8px 32px rgba(var(--cf-primary-color-rgb), 0.2)'
  }
};
