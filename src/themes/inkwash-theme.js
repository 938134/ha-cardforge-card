// themes/inkwash-theme.js - 优化版（使用设计系统变量）
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '手工宣纸质感，温暖书卷气息',
  icon: '🖌️',
  
  styles: css`
    /* 水墨主题 - 卡片容器 */
    .cardforge-container {
      /* 宣纸底色 - 使用设计系统变量 */
      background-color: color-mix(
        in srgb,
        var(--cf-surface),
        var(--cf-neutral-50) 40%
      ) !important;
      
      /* 轻微纹理效果 */
      background-image: 
        linear-gradient(
          rgba(0, 0, 0, 0.02) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.02) 1px,
          transparent 1px
        ) !important;
      
      background-size: 20px 20px !important;
      
      /* 宣纸边框 */
      border: 1px solid var(--cf-border) !important;
      box-shadow: 
        inset 0 0 20px rgba(255, 255, 255, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.05) !important;
    }
    
    /* 水墨主题 - 通用文本样式 */
    .cardforge-container {
      color: var(--cf-text-primary) !important;
    }
    
    /* 特殊强调色 */
    .cardforge-container .card-emphasis {
      color: color-mix(
        in srgb,
        var(--cf-primary-color),
        var(--cf-text-primary) 40%
      ) !important;
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background-color: color-mix(
          in srgb,
          var(--cf-surface),
          var(--cf-neutral-800) 40%
        ) !important;
        
        background-image: 
          linear-gradient(
            rgba(255, 255, 255, 0.01) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.01) 1px,
            transparent 1px
          ) !important;
        
        border-color: var(--cf-border-dark) !important;
        box-shadow: 
          inset 0 0 20px rgba(0, 0, 0, 0.3),
          0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
    }
    
    /* 响应式优化 */
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        background-size: 15px 15px !important;
      }
    }
  `,
  
  preview: {
    background: `
      color-mix(in srgb, var(--cf-surface), var(--cf-neutral-50) 40%),
      linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
    `,
    border: '1px solid var(--cf-border)'
  }
};
