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

    /* 卡片容器默认样式 */
    --cardforge-container-padding: var(--cf-spacing-lg);
    --cardforge-container-min-height: 80px;
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

  /* ===== 统一卡片容器样式 ===== */
  .cardforge-card {
    display: flex;
    flex-direction: column;
    min-height: var(--cardforge-container-min-height);
    height: auto;
    padding: var(--cardforge-container-padding);
    container-type: inline-size;
    container-name: cardforge-container;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  /* ===== 区域样式 ===== */
  .cardforge-area {
    margin-bottom: var(--cf-spacing-md);
  }

  .cardforge-area:last-child {
    margin-bottom: 0;
  }

  .area-header {
    margin-bottom: var(--cf-spacing-lg);
  }

  .area-content {
    flex: 1;
  }

  .area-footer {
    margin-top: var(--cf-spacing-lg);
    padding-top: var(--cf-spacing-md);
    border-top: 1px solid var(--cf-border);
  }

  /* ===== 智能自动布局系统 ===== */
  .layout-container {
    width: 100%;
  }

  .layout-single {
    display: flex;
    flex-direction: column;
    gap: var(--cf-spacing-md);
  }

  .layout-grid-2x2 {
    display: grid;
    grid-template: repeat(2, 1fr) / repeat(2, 1fr);
    gap: var(--cf-spacing-md);
  }

  .layout-grid-3x3 {
    display: grid;
    grid-template: repeat(3, 1fr) / repeat(3, 1fr);
    gap: var(--cf-spacing-md);
  }

  /* ===== 块样式 ===== */
  .cardforge-block {
    background: var(--cf-surface);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    padding: var(--cf-spacing-md);
    transition: all var(--cf-transition-fast);
  }

  .cardforge-block:hover {
    border-color: var(--cf-primary-color);
  }

  .block-title {
    font-size: 0.9em;
    font-weight: 500;
    color: var(--cf-text-primary);
    margin-bottom: var(--cf-spacing-sm);
  }

  .block-content {
    font-size: 1em;
    color: var(--cf-text-primary);
    line-height: 1.4;
  }

  /* ===== 响应式容器查询 ===== */
  @container cardforge-container (max-width: 400px) {
    .cardforge-card {
      padding: var(--cf-spacing-md);
    }
    
    /* 移动端自动转为单列布局 */
    .layout-grid-2x2,
    .layout-grid-3x3 {
      grid-template: 1fr / 1fr !important;
    }
    
    .cardforge-block {
      padding: var(--cf-spacing-sm);
    }
  }

  /* ===== 工具类 ===== */
  .cf-flex { display: flex; }
  .cf-flex-column { flex-direction: column; }
  .cf-flex-center { align-items: center; justify-content: center; }
  .cf-flex-between { align-items: center; justify-content: space-between; }
  
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

  .cf-error { color: var(--cf-error-color); }
  .cf-warning { color: var(--cf-warning-color); }
  .cf-success { color: var(--cf-success-color); }

  .cf-text-secondary { color: var(--cf-text-secondary); }
`;