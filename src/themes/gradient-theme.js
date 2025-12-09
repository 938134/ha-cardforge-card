// themes/gradient-theme.js - 重新优化（参考玻璃主题模式）
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  styles: css`
    /* 渐变主题 - 卡片容器 */
    .cardforge-container {
      /* 基础渐变背景 */
      background: linear-gradient(135deg, 
        var(--cf-primary-color) 0%, 
        color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 40%) 25%,
        var(--cf-accent-color) 50%, 
        color-mix(in srgb, var(--cf-accent-color), var(--cf-error-color) 40%) 75%, 
        var(--cf-error-color) 100%) !important;
      
      border: 1px solid rgba(255, 255, 255, 0.25) !important;
      backdrop-filter: blur(8px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(8px) saturate(160%) !important;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    }
    
    /* 确保内部ha-card透明 */
    .cardforge-container ha-card {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
    
    /* 渐变主题 - 文字颜色 */
    .cardforge-container .card-title {
      color: white !important;
      text-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        0 0 10px rgba(255, 255, 255, 0.2);
      font-weight: var(--cf-font-weight-bold);
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(255, 255, 255, 0.9) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      font-weight: var(--cf-font-weight-medium);
    }
    
    .cardforge-container .card-caption {
      color: rgba(255, 255, 255, 0.7) !important;
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
    }
    
    .cardforge-container .card-emphasis {
      color: white !important;
      text-shadow: 
        0 3px 6px rgba(0, 0, 0, 0.4),
        0 0 15px rgba(255, 255, 255, 0.3);
      font-weight: var(--cf-font-weight-bold);
    }
    
    /* 诗词卡片特殊适配 */
    .cardforge-container .poetry-line {
      color: rgba(255, 255, 255, 0.95) !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .cardforge-container .translation-container {
      background: rgba(255, 255, 255, 0.15) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    
    .cardforge-container .translation-label {
      color: rgba(255, 255, 255, 0.9) !important;
    }
    
    .cardforge-container .translation-content {
      color: rgba(255, 255, 255, 0.85) !important;
    }
    
    /* 块样式适配 */
    .cardforge-container .block-base {
      background: rgba(255, 255, 255, 0.2) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }
    
    .cardforge-container .block-icon {
      background: rgba(255, 255, 255, 0.25) !important;
      color: white !important;
    }
    
    .cardforge-container .block-name {
      color: rgba(255, 255, 255, 0.9) !important;
    }
    
    .cardforge-container .block-value {
      color: white !important;
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          color-mix(in srgb, var(--cf-primary-color), black 20%) 0%, 
          color-mix(in srgb, var(--cf-primary-color), var(--cf-accent-color) 50%) 25%,
          color-mix(in srgb, var(--cf-accent-color), black 20%) 50%, 
          color-mix(in srgb, var(--cf-accent-color), var(--cf-error-color) 50%) 75%, 
          color-mix(in srgb, var(--cf-error-color), black 20%) 100%) !important;
        
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: 
          0 8px 40px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }
      
      .cardforge-container .card-title {
        text-shadow: 
          0 3px 8px rgba(0, 0, 0, 0.5),
          0 0 20px rgba(255, 255, 255, 0.2);
      }
      
      .cardforge-container .block-base {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 768px) {
      .cardforge-container {
        backdrop-filter: blur(6px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(6px) saturate(160%) !important;
      }
      
      .cardforge-container .translation-container,
      .cardforge-container .block-base {
        backdrop-filter: blur(3px) !important;
        -webkit-backdrop-filter: blur(3px) !important;
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        backdrop-filter: blur(4px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(4px) saturate(160%) !important;
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color), var(--cf-error-color))',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  }
};