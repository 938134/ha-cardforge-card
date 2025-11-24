// src/core/design-system.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const designSystem = css`
  /* ===== CSS 变量系统 ===== */
  :host {
    /* 颜色系统 */
    --cf-primary-color: var(--primary-color, #03a9f4);
    --cf-accent-color: var(--accent-color, #ff4081);
    --cf-background: var(--card-background-color, #ffffff);
    --cf-surface: var(--card-background-color, #ffffff);
    --cf-border: var(--divider-color, #e0e0e0);
    --cf-text-primary: var(--primary-text-color, #212121);
    --cf-text-secondary: var(--secondary-text-color, #757575);
    --cf-error-color: var(--error-color, #f44336);
    --cf-warning-color: var(--warning-color, #ff9800);
    --cf-success-color: var(--success-color, #4caf50);
    
    /* RGB 颜色（用于透明度） */
    --cf-rgb-primary: 3, 169, 244;
    --cf-rgb-accent: 255, 64, 129;
    --cf-rgb-background: 255, 255, 255;
    --cf-rgb-surface: 255, 255, 255;
    
    /* 深色模式颜色 */
    --cf-dark-background: #1a1a1a;
    --cf-dark-surface: #2d2d2d;
    --cf-dark-border: #404040;
    --cf-dark-text: #e0e0e0;
    --cf-dark-text-secondary: #a0a0a0;
    
    /* 间距系统 */
    --cf-spacing-xs: 4px;
    --cf-spacing-sm: 8px;
    --cf-spacing-md: 12px;
    --cf-spacing-lg: 16px;
    --cf-spacing-xl: 20px;
    
    /* 圆角系统 */
    --cf-radius-sm: 4px;
    --cf-radius-md: 8px;
    --cf-radius-lg: 12px;
    --cf-radius-xl: 16px;
    
    /* 阴影系统 */
    --cf-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --cf-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
    --cf-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
    
    /* 动画系统 */
    --cf-transition-fast: 0.15s ease;
    --cf-transition-normal: 0.25s ease;
    --cf-transition-slow: 0.4s ease;
  }

  /* ===== 深色模式适配 ===== */
  @media (prefers-color-scheme: dark) {
    :host {
      --cf-background: var(--cf-dark-background);
      --cf-surface: var(--cf-dark-surface);
      --cf-border: var(--cf-dark-border);
      --cf-text-primary: var(--cf-dark-text);
      --cf-text-secondary: var(--cf-dark-text-secondary);
    }
  }

  /* ===== 布局工具类 ===== */
  .cf-grid { display: grid; gap: var(--cf-spacing-md); }
  .cf-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .cf-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .cf-grid-4 { grid-template-columns: repeat(4, 1fr); }
  
  .cf-flex { display: flex; }
  .cf-flex-column { flex-direction: column; }
  .cf-flex-center { align-items: center; justify-content: center; }
  .cf-flex-between { align-items: center; justify-content: space-between; }
  
  /* ===== 间距工具类 ===== */
  .cf-gap-sm { gap: var(--cf-spacing-sm); }
  .cf-gap-md { gap: var(--cf-spacing-md); }
  .cf-gap-lg { gap: var(--cf-spacing-lg); }
  
  .cf-p-sm { padding: var(--cf-spacing-sm); }
  .cf-p-md { padding: var(--cf-spacing-md); }
  .cf-p-lg { padding: var(--cf-spacing-lg); }
  .cf-p-xl { padding: var(--cf-spacing-xl); }
  
  .cf-m-sm { margin: var(--cf-spacing-sm); }
  .cf-m-md { margin: var(--cf-spacing-md); }
  .cf-m-lg { margin: var(--cf-spacing-lg); }
  .cf-mt-sm { margin-top: var(--cf-spacing-sm); }
  .cf-mt-md { margin-top: var(--cf-spacing-md); }
  .cf-mt-lg { margin-top: var(--cf-spacing-lg); }
  .cf-mb-sm { margin-bottom: var(--cf-spacing-sm); }
  .cf-mb-md { margin-bottom: var(--cf-spacing-md); }
  .cf-mb-lg { margin-bottom: var(--cf-spacing-lg); }

  /* ===== 文本工具类 ===== */
  .cf-text-xs { font-size: 0.75em; }
  .cf-text-sm { font-size: 0.85em; }
  .cf-text-md { font-size: 1em; }
  .cf-text-lg { font-size: 1.2em; }
  .cf-text-xl { font-size: 1.5em; }
  
  .cf-text-center { text-align: center; }
  .cf-text-left { text-align: left; }
  .cf-text-right { text-align: right; }
  
  .cf-font-medium { font-weight: 500; }
  .cf-font-semibold { font-weight: 600; }
  .cf-font-bold { font-weight: 700; }

  /* ===== 状态样式 ===== */
  .cf-error { color: var(--cf-error-color); }
  .cf-warning { color: var(--cf-warning-color); }
  .cf-success { color: var(--cf-success-color); }

  /* ===== 加载状态 ===== */
  .cf-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-md);
    padding: var(--cf-spacing-xl);
  }

  .cf-loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--cf-border);
    border-top: 2px solid var(--cf-primary-color);
    border-radius: 50%;
    animation: cf-spin 1s linear infinite;
  }

  @keyframes cf-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ===== 块容器样式 ===== */
  .block-container {
    container-type: inline-size;
    container-name: block-container;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  /* ===== 响应式容器查询 ===== */
  @container block-container (max-width: 400px) {
    .block-container {
      padding: var(--cf-spacing-sm);
    }
  }
`;