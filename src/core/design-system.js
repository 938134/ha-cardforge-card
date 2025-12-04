// 设计系统变量
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const designSystem = css`
  :host {
    /* 颜色变量 */
    --cf-primary-color: var(--primary-color, #03a9f4);
    --cf-accent-color: var(--accent-color, #ff4081);
    --cf-background: var(--card-background-color, #ffffff);
    --cf-surface: var(--card-background-color, #ffffff);
    --cf-border: var(--divider-color, #e0e0e0);
    --cf-text-primary: var(--primary-text-color, #212121);
    --cf-text-secondary: var(--secondary-text-color, #757575);
    
    /* 间距变量 */
    --cf-spacing-xs: 4px;
    --cf-spacing-sm: 8px;
    --cf-spacing-md: 12px;
    --cf-spacing-lg: 16px;
    --cf-spacing-xl: 20px;
    
    /* 圆角变量 */
    --cf-radius-sm: 4px;
    --cf-radius-md: 8px;
    --cf-radius-lg: 12px;
    
    /* 动画变量 */
    --cf-transition-fast: 0.15s ease;
    --cf-transition-normal: 0.25s ease;
    
    /* RGB颜色变量 */
    --cf-rgb-primary: 3, 169, 244;
    --cf-rgb-accent: 255, 64, 129;
  }
  
  /* 深色模式适配 */
  @media (prefers-color-scheme: dark) {
    :host {
      --cf-background: #1a1a1a;
      --cf-surface: #2d2d2d;
      --cf-border: #404040;
      --cf-text-primary: #e0e0e0;
      --cf-text-secondary: #a0a0a0;
    }
  }
  
  /* 容器查询 */
  .cardforge-container {
    container-type: inline-size;
    container-name: cardforge-container;
  }
`;
