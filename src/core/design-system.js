// 设计系统变量 - 增强版
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const designSystem = css`
  :host {
    /* ===== 基础颜色系统 ===== */
    
    /* 主题色 */
    --cf-primary-color: var(--primary-color, #03a9f4);
    --cf-primary-color-rgb: 3, 169, 244;
    --cf-accent-color: var(--accent-color, #ff4081);
    --cf-accent-color-rgb: 255, 64, 129;
    
    /* 中性色系 */
    --cf-neutral-50: #fafafa;
    --cf-neutral-100: #f5f5f5;
    --cf-neutral-200: #eeeeee;
    --cf-neutral-300: #e0e0e0;
    --cf-neutral-400: #bdbdbd;
    --cf-neutral-500: #9e9e9e;
    --cf-neutral-600: #757575;
    --cf-neutral-700: #616161;
    --cf-neutral-800: #424242;
    --cf-neutral-900: #212121;
    
    /* 功能色 */
    --cf-success-color: #4caf50;
    --cf-warning-color: #ff9800;
    --cf-error-color: #f44336;
    --cf-info-color: #2196f3;
    
    /* ===== 语义颜色 ===== */
    
    /* 背景色 */
    --cf-background: var(--card-background-color, #ffffff);
    --cf-surface: var(--card-background-color, #ffffff);
    --cf-surface-elevated: var(--paper-card-background-color, #ffffff);
    
    /* 文本色 */
    --cf-text-primary: var(--primary-text-color, #212121);
    --cf-text-secondary: var(--secondary-text-color, #757575);
    --cf-text-tertiary: var(--disabled-text-color, #9e9e9e);
    --cf-text-inverse: #ffffff;
    
    /* 边框色 */
    --cf-border: var(--divider-color, #e0e0e0);
    --cf-border-light: rgba(0, 0, 0, 0.12);
    --cf-border-dark: rgba(0, 0, 0, 0.24);
    
    /* ===== 状态颜色 ===== */
    --cf-hover-color: rgba(var(--cf-primary-color-rgb), 0.08);
    --cf-active-color: rgba(var(--cf-primary-color-rgb), 0.16);
    --cf-focus-color: rgba(var(--cf-primary-color-rgb), 0.24);
    --cf-disabled-color: rgba(0, 0, 0, 0.12);
    
    /* ===== 间距系统 ===== */
    --cf-spacing-xs: 4px;
    --cf-spacing-sm: 8px;
    --cf-spacing-md: 12px;
    --cf-spacing-lg: 16px;
    --cf-spacing-xl: 20px;
    --cf-spacing-2xl: 24px;
    --cf-spacing-3xl: 32px;
    --cf-spacing-4xl: 40px;
    
    /* ===== 圆角系统 ===== */
    --cf-radius-xs: 2px;
    --cf-radius-sm: 4px;
    --cf-radius-md: 8px;
    --cf-radius-lg: 12px;
    --cf-radius-xl: 16px;
    --cf-radius-pill: 999px;
    
    /* ===== 阴影系统 ===== */
    --cf-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --cf-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --cf-shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
    --cf-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
    --cf-shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    
    /* ===== 动画系统 ===== */
    --cf-transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --cf-transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --cf-transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* ===== 层级系统 ===== */
    --cf-z-index-dropdown: 1000;
    --cf-z-index-sticky: 1020;
    --cf-z-index-fixed: 1030;
    --cf-z-index-modal-backdrop: 1040;
    --cf-z-index-modal: 1050;
    --cf-z-index-popover: 1060;
    --cf-z-index-tooltip: 1070;
    
    /* ===== 排版系统 ===== */
    --cf-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --cf-font-family-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --cf-font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    
    --cf-font-size-xs: 0.75rem;
    --cf-font-size-sm: 0.875rem;
    --cf-font-size-base: 1rem;
    --cf-font-size-lg: 1.125rem;
    --cf-font-size-xl: 1.25rem;
    --cf-font-size-2xl: 1.5rem;
    --cf-font-size-3xl: 1.875rem;
    --cf-font-size-4xl: 2.25rem;
    
    --cf-font-weight-light: 300;
    --cf-font-weight-normal: 400;
    --cf-font-weight-medium: 500;
    --cf-font-weight-semibold: 600;
    --cf-font-weight-bold: 700;
    
    --cf-line-height-tight: 1.25;
    --cf-line-height-normal: 1.5;
    --cf-line-height-relaxed: 1.75;
    
    /* ===== 容器查询 ===== */
    .cardforge-container {
      container-type: inline-size;
      container-name: cardforge-container;
    }
  }
  
  /* ===== 深色模式适配 ===== */
  @media (prefers-color-scheme: dark) {
    :host {
      /* 更新语义颜色 */
      --cf-background: #1a1a1a;
      --cf-surface: #2d2d2d;
      --cf-surface-elevated: #3d3d3d;
      
      --cf-text-primary: #e0e0e0;
      --cf-text-secondary: #a0a0a0;
      --cf-text-tertiary: #707070;
      
      --cf-border: #404040;
      --cf-border-light: rgba(255, 255, 255, 0.12);
      --cf-border-dark: rgba(255, 255, 255, 0.24);
      
      --cf-hover-color: rgba(255, 255, 255, 0.08);
      --cf-active-color: rgba(255, 255, 255, 0.16);
      --cf-focus-color: rgba(255, 255, 255, 0.24);
      --cf-disabled-color: rgba(255, 255, 255, 0.12);
    }
  }
  
  /* ===== 辅助类 ===== */
  .text-primary { color: var(--cf-text-primary); }
  .text-secondary { color: var(--cf-text-secondary); }
  .text-tertiary { color: var(--cf-text-tertiary); }
  .text-inverse { color: var(--cf-text-inverse); }
  
  .bg-surface { background: var(--cf-surface); }
  .bg-elevated { background: var(--cf-surface-elevated); }
  
  .border-light { border-color: var(--cf-border-light); }
  .border-dark { border-color: var(--cf-border-dark); }
  
  .shadow-sm { box-shadow: var(--cf-shadow-sm); }
  .shadow-md { box-shadow: var(--cf-shadow-md); }
  .shadow-lg { box-shadow: var(--cf-shadow-lg); }
  
  .rounded-sm { border-radius: var(--cf-radius-sm); }
  .rounded-md { border-radius: var(--cf-radius-md); }
  .rounded-lg { border-radius: var(--cf-radius-lg); }
  
  .transition-fast { transition: all var(--cf-transition-fast); }
  .transition-normal { transition: all var(--cf-transition-normal); }
`;