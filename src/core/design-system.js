// 设计系统变量 - 更新版
import { css } from 'https://unpkg.com/lit@3.0.0/index.js?module';

export const designSystem = css`
  :host {
    /* ===== 1. 基础设计变量 (原子) ===== */
    
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
    
    /* 语义颜色 */
    --cf-background: var(--card-background-color, #ffffff);
    --cf-surface: var(--card-background-color, #ffffff);
    --cf-surface-elevated: var(--paper-card-background-color, #ffffff);
    
    --cf-text-primary: var(--primary-text-color, #212121);
    --cf-text-secondary: var(--secondary-text-color, #757575);
    --cf-text-tertiary: var(--disabled-text-color, #9e9e9e);
    --cf-text-inverse: #ffffff;
    
    --cf-border: var(--divider-color, #e0e0e0);
    --cf-border-light: rgba(0, 0, 0, 0.12);
    --cf-border-dark: rgba(0, 0, 0, 0.24);
    
    /* 状态颜色 */
    --cf-hover-color: rgba(var(--cf-primary-color-rgb), 0.08);
    --cf-active-color: rgba(var(--cf-primary-color-rgb), 0.16);
    --cf-focus-color: rgba(var(--cf-primary-color-rgb), 0.24);
    --cf-disabled-color: rgba(0, 0, 0, 0.12);
    
    /* 间距系统 */
    --cf-spacing-xs: 4px;
    --cf-spacing-sm: 8px;
    --cf-spacing-md: 12px;
    --cf-spacing-lg: 16px;
    --cf-spacing-xl: 20px;
    --cf-spacing-2xl: 24px;
    --cf-spacing-3xl: 32px;
    --cf-spacing-4xl: 40px;
    
    /* 圆角系统 */
    --cf-radius-xs: 2px;
    --cf-radius-sm: 4px;
    --cf-radius-md: 8px;
    --cf-radius-lg: 12px;
    --cf-radius-xl: 16px;
    --cf-radius-pill: 999px;
    
    /* 阴影系统 */
    --cf-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --cf-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --cf-shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
    --cf-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
    --cf-shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    
    /* 动画系统 */
    --cf-transition-duration-fast: 150ms;
    --cf-transition-duration-normal: 250ms;
    --cf-transition-duration-slow: 400ms;
    
    --cf-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
    --cf-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
    --cf-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
    
    /* 性能提示 */
    --cf-will-change-transform: will-change transform;
    --cf-will-change-opacity: will-change transform, opacity;
    
    /* 层级系统 */
    --cf-z-index-dropdown: 1000;
    --cf-z-index-sticky: 1020;
    --cf-z-index-fixed: 1030;
    --cf-z-index-modal-backdrop: 1040;
    --cf-z-index-modal: 1050;
    --cf-z-index-popover: 1060;
    --cf-z-index-tooltip: 1070;
    
    /* 排版系统 */
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
  }
  
  /* ===== 卡片基类相关样式 ===== */
  .cardforge-container {
    container-type: inline-size;
    container-name: cardforge-container;
  }
  
  .card-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
    min-height: 0;
    position: relative;
    z-index: 1;
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    padding: var(--cf-spacing-xl);
    width: 100%;
    box-sizing: border-box;
  }
  
  .card-title {
    font-size: var(--cf-font-size-2xl);
    font-weight: var(--cf-font-weight-bold);
    color: var(--cf-text-primary);
    line-height: var(--cf-line-height-tight);
    margin-bottom: var(--cf-spacing-sm);
  }
  
  .card-subtitle {
    font-size: var(--cf-font-size-lg);
    font-weight: var(--cf-font-weight-medium);
    color: var(--cf-text-secondary);
    line-height: var(--cf-line-height-normal);
    margin-top: var(--cf-spacing-xs);
    margin-bottom: var(--cf-spacing-xs);
  }
  
  .card-caption {
    font-size: var(--cf-font-size-sm);
    color: var(--cf-text-tertiary);
    line-height: var(--cf-line-height-normal);
    margin-top: var(--cf-spacing-xs);
  }
  
  .card-emphasis {
    color: var(--cf-primary-color);
    font-weight: var(--cf-font-weight-bold);
    margin: var(--cf-spacing-sm) 0;
  }
  
  /* 通用空状态 */
  .card-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--cf-text-tertiary);
    padding: var(--cf-spacing-2xl);
    height: 100%;
    flex: 1;
  }
  
  .card-empty-icon {
    font-size: 2.5em;
    margin-bottom: var(--cf-spacing-md);
    opacity: 0.4;
  }
  
  .card-empty-text {
    font-size: var(--cf-font-size-lg);
    font-weight: var(--cf-font-weight-medium);
  }
  
  /* 通用垂直间距工具 */
  .card-spacing-sm {
    margin-top: var(--cf-spacing-sm);
    margin-bottom: var(--cf-spacing-sm);
  }
  
  .card-spacing-md {
    margin-top: var(--cf-spacing-md);
    margin-bottom: var(--cf-spacing-md);
  }
  
  .card-spacing-lg {
    margin-top: var(--cf-spacing-lg);
    margin-bottom: var(--cf-spacing-lg);
  }
  
  /* 布局工具类 */
  .layout-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
  }
  
  .layout-flow {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cf-spacing-md);
    justify-content: center;
    width: 100%;
  }
  
  .layout-grid {
    display: grid;
    gap: var(--cf-spacing-md);
    width: 100%;
  }
  
  .layout-horizontal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-md);
    width: 100%;
  }
  
  .layout-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-md);
    width: 100%;
  }
  
  .layout-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  
  /* 深色模式适配 */
  @media (prefers-color-scheme: dark) {
    :host {
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
  
  /* 响应式容器查询 */
  @container cardforge-container (max-width: 768px) {
    .card-content {
      padding: var(--cf-spacing-lg);
    }
    
    .card-title {
      font-size: var(--cf-font-size-xl);
      margin-bottom: var(--cf-spacing-xs);
    }
    
    .card-subtitle {
      font-size: var(--cf-font-size-md);
      margin-top: var(--cf-spacing-xs);
      margin-bottom: var(--cf-spacing-xs);
    }
    
    .layout-grid {
      gap: var(--cf-spacing-sm);
    }
    
    .layout-flow {
      gap: var(--cf-spacing-sm);
    }
    
    .layout-horizontal {
      gap: var(--cf-spacing-sm);
    }
    
    .layout-vertical {
      gap: var(--cf-spacing-sm);
    }
  }
  
  @container cardforge-container (max-width: 480px) {
    .card-content {
      padding: var(--cf-spacing-md);
    }
    
    .card-title {
      font-size: var(--cf-font-size-lg);
    }
    
    .card-subtitle {
      font-size: var(--cf-font-size-sm);
    }
    
    .card-caption {
      font-size: var(--cf-font-size-xs);
    }
    
    .card-empty {
      padding: var(--cf-spacing-xl);
    }
    
    .card-empty-icon {
      font-size: 2em;
    }
    
    .card-empty-text {
      font-size: var(--cf-font-size-md);
    }
    
    .layout-grid {
      gap: var(--cf-spacing-xs);
    }
    
    .layout-flow {
      gap: var(--cf-spacing-xs);
    }
    
    .layout-horizontal {
      gap: var(--cf-spacing-xs);
    }
    
    .layout-vertical {
      gap: var(--cf-spacing-xs);
    }
  }
`;
