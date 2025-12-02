// src/core/design-system.js
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
    
    /* 块变量 */
    --cf-block-bg: rgba(0, 0, 0, 0.03);
    --cf-block-radius: 8px;
    --cf-block-padding: 12px;
    --cf-block-gap: 12px;
    
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
  }
  
  /* 深色模式适配 */
  @media (prefers-color-scheme: dark) {
    :host {
      --cf-background: #1a1a1a;
      --cf-surface: #2d2d2d;
      --cf-border: #404040;
      --cf-text-primary: #e0e0e0;
      --cf-text-secondary: #a0a0a0;
      --cf-block-bg: rgba(255, 255, 255, 0.05);
    }
  }
  
  /* 容器查询基础样式 */
  .cardforge-container {
    container-type: inline-size;
    container-name: cardforge-container;
  }
  
  /* 基础块样式 */
  .cardforge-block {
    display: flex;
    align-items: center;
    gap: var(--cf-block-gap);
    padding: var(--cf-block-padding);
    background: var(--cf-block-bg);
    border-radius: var(--cf-block-radius);
    min-height: 60px;
  }
  
  .block-icon {
    font-size: 1.5em;
    color: var(--cf-text-secondary);
    flex-shrink: 0;
  }
  
  .block-content {
    flex: 1;
    min-width: 0;
  }
  
  .block-name {
    font-size: 0.9em;
    color: var(--cf-text-secondary);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .block-value {
    font-size: 1.2em;
    font-weight: 500;
    color: var(--cf-text-primary);
    line-height: 1.3;
  }
  
  /* 响应式块布局 */
  @container cardforge-container (max-width: 400px) {
    .cardforge-block {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }
    
    .block-name {
      font-size: 0.8em;
      margin-bottom: 2px;
    }
    
    .block-value {
      font-size: 1em;
    }
  }
`;
