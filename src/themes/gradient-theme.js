// themes/gradient-theme.js - 优化版（使用设计系统变量）
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  styles: css`
    /* 渐变主题 - 卡片容器 */
    .cardforge-container {
      background: linear-gradient(
        135deg, 
        var(--cf-primary-color) 0%, 
        var(--cf-accent-color) 100%
      ) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
    }
    
    /* 渐变主题 - 通用文本样式 */
    .cardforge-container {
      color: white !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(
          135deg, 
          color-mix(in srgb, var(--cf-primary-color), #000 30%) 0%, 
          color-mix(in srgb, var(--cf-accent-color), #000 30%) 100%
        ) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }
    }
    
    /* 响应式优化 */
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color))',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  }
};
