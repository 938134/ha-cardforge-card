// themes/gradient-theme.js - 优化版
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚动态渐变背景，流动色彩效果',
  icon: '🌈',
  
  styles: css`
    /* 渐变主题 - 卡片容器 */
    .cardforge-container {
      /* 流动渐变背景 */
      background: linear-gradient(
        135deg,
        var(--cf-primary-color) 0%,
        color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 50%) 33%,
        var(--cf-accent-color) 66%,
        color-mix(in srgb, var(--cf-accent-color), var(--cf-error-color) 50%) 100%
      ) !important;
      
      background-size: 200% 200% !important;
      animation: gradientFlow 15s ease infinite !important;
      
      /* 玻璃质感效果 */
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      backdrop-filter: blur(10px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(10px) saturate(160%) !important;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    }
    
    @keyframes gradientFlow {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
    
    /* 渐变主题 - 文字效果 */
    .cardforge-container .card-title {
      color: white !important;
      text-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(255, 255, 255, 0.2);
      font-weight: var(--cf-font-weight-bold);
      background: linear-gradient(to right, white, rgba(255, 255, 255, 0.9));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(255, 255, 255, 0.95) !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      font-weight: var(--cf-font-weight-medium);
    }
    
    .cardforge-container .card-caption {
      color: rgba(255, 255, 255, 0.8) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .cardforge-container .card-emphasis {
      color: white !important;
      text-shadow: 
        0 3px 12px rgba(0, 0, 0, 0.5),
        0 0 30px rgba(255, 255, 255, 0.3);
      font-weight: var(--cf-font-weight-bold);
      background: linear-gradient(to right, #ffdd40, #ff5e00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--cf-primary-color), #111111 20%) 0%,
          color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 40%) 33%,
          color-mix(in srgb, var(--cf-accent-color), #111111 20%) 66%,
          color-mix(in srgb, var(--cf-accent-color), var(--cf-error-color) 40%) 100%
        ) !important;
        
        border-color: rgba(255, 255, 255, 0.2) !important;
        box-shadow: 
          0 8px 40px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }
      
      .cardforge-container .card-title {
        text-shadow: 0 3px 12px rgba(0, 0, 0, 0.6);
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color), var(--cf-error-color))',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  }
};