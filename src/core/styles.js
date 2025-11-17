// src/core/styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const foundationStyles = css`
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
    --cf-spacing-sm: 6px;
    --cf-spacing-md: 8px;
    --cf-spacing-lg: 12px;
    --cf-spacing-xl: 16px;
    --cf-spacing-xxl: 20px;
    
    /* 圆角系统 */
    --cf-radius-sm: 4px;
    --cf-radius-md: 6px;
    --cf-radius-lg: 8px;
    --cf-radius-xl: 12px;
    
    /* 阴影系统 */
    --cf-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --cf-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
    --cf-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
    --cf-shadow-xl: 0 6px 24px rgba(0, 0, 0, 0.2);
    
    /* 深色模式阴影 */
    --cf-dark-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --cf-dark-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.4);
    --cf-dark-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.5);
    
    /* 动画系统 */
    --cf-transition-fast: 0.15s ease;
    --cf-transition-normal: 0.25s ease;
    --cf-transition-slow: 0.4s ease;
    --cf-ease-out: cubic-bezier(0.4, 0, 0.2, 1);
    --cf-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ===== 深色模式适配 ===== */
  @media (prefers-color-scheme: dark) {
    :host {
      --cf-background: var(--cf-dark-background);
      --cf-surface: var(--cf-dark-surface);
      --cf-border: var(--cf-dark-border);
      --cf-text-primary: var(--cf-dark-text);
      --cf-text-secondary: var(--cf-dark-text-secondary);
      --cf-rgb-background: 26, 26, 26;
      --cf-rgb-surface: 45, 45, 45;
      
      /* 深色模式阴影 */
      --cf-shadow-sm: var(--cf-dark-shadow-sm);
      --cf-shadow-md: var(--cf-dark-shadow-md);
      --cf-shadow-lg: var(--cf-dark-shadow-lg);
    }
  }

  /* Home Assistant 深色模式强制适配 */
  .cf-dark-mode {
    --cf-background: var(--cf-dark-background) !important;
    --cf-surface: var(--cf-dark-surface) !important;
    --cf-border: var(--cf-dark-border) !important;
    --cf-text-primary: var(--cf-dark-text) !important;
    --cf-text-secondary: var(--cf-dark-text-secondary) !important;
    --cf-rgb-background: 26, 26, 26 !important;
    --cf-rgb-surface: 45, 45, 45 !important;
    --cf-shadow-sm: var(--cf-dark-shadow-sm) !important;
    --cf-shadow-md: var(--cf-dark-shadow-md) !important;
    --cf-shadow-lg: var(--cf-dark-shadow-lg) !important;
  }

  /* ===== 布局工具类 ===== */
  .cf-grid { display: grid; gap: var(--cf-spacing-md); }
  .cf-grid-auto { grid-template-columns: repeat(auto-fit, minmax(64px, 1fr)); }
  .cf-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .cf-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .cf-grid-4 { grid-template-columns: repeat(4, 1fr); }
  
  .cf-flex { display: flex; }
  .cf-flex-column { flex-direction: column; }
  .cf-flex-center { display: flex; align-items: center; justify-content: center; }
  .cf-flex-between { display: flex; align-items: center; justify-content: space-between; }
  .cf-flex-start { display: flex; align-items: center; justify-content: flex-start; }
  .cf-flex-end { display: flex; align-items: center; justify-content: flex-end; }
  
  /* ===== 间距工具类 ===== */
  .cf-gap-xs { gap: var(--cf-spacing-xs); }
  .cf-gap-sm { gap: var(--cf-spacing-sm); }
  .cf-gap-md { gap: var(--cf-spacing-md); }
  .cf-gap-lg { gap: var(--cf-spacing-lg); }
  .cf-gap-xl { gap: var(--cf-spacing-xl); }
  
  .cf-p-xs { padding: var(--cf-spacing-xs); }
  .cf-p-sm { padding: var(--cf-spacing-sm); }
  .cf-p-md { padding: var(--cf-spacing-md); }
  .cf-p-lg { padding: var(--cf-spacing-lg); }
  .cf-p-xl { padding: var(--cf-spacing-xl); }
  
  .cf-m-xs { margin: var(--cf-spacing-xs); }
  .cf-m-sm { margin: var(--cf-spacing-sm); }
  .cf-m-md { margin: var(--cf-spacing-md); }
  .cf-m-lg { margin: var(--cf-spacing-lg); }
  .cf-m-xl { margin: var(--cf-spacing-xl); }

  /* ===== 文本工具类 ===== */
  .cf-text-xs { font-size: 0.7em; }
  .cf-text-sm { font-size: 0.75em; }
  .cf-text-md { font-size: 0.85em; }
  .cf-text-lg { font-size: 1em; }
  .cf-text-xl { font-size: 1.2em; }
  
  .cf-text-center { text-align: center; }
  .cf-text-left { text-align: left; }
  .cf-text-right { text-align: right; }
  
  .cf-font-normal { font-weight: 400; }
  .cf-font-medium { font-weight: 500; }
  .cf-font-semibold { font-weight: 600; }
  .cf-font-bold { font-weight: 700; }

  /* ===== 状态样式 ===== */
  .cf-status-on { color: var(--cf-success-color); }
  .cf-status-off { color: var(--cf-text-secondary); }
  .cf-status-unavailable { color: var(--cf-error-color); opacity: 0.5; }
  
  .cf-error { color: var(--cf-error-color); }
  .cf-warning { color: var(--cf-warning-color); }
  .cf-success { color: var(--cf-success-color); }

  /* ===== 交互样式 ===== */
  .cf-interactive { cursor: pointer; transition: all var(--cf-transition-fast); }
  .cf-interactive:hover { opacity: 0.8; transform: translateY(-1px); }
  .cf-interactive:active { transform: scale(0.98); }

  /* ===== 动画系统 ===== */
  @keyframes cf-fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes cf-slideIn {
    from { transform: translateX(-15px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes cf-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .cf-animate-fadeIn { animation: cf-fadeIn 0.25s var(--cf-ease-out); }
  .cf-animate-slideIn { animation: cf-slideIn 0.25s var(--cf-ease-out); }
  .cf-animate-pulse { animation: cf-pulse 2s infinite; }
`;
