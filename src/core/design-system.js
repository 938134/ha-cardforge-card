// 设计系统变量 - 包含块样式完整版
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

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
    
    /* 动画系统 - 仅保留时长和缓动函数 */
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
    
    /* ===== 2. 布局模式 (分子) ===== */
    
    /* 水平布局 - 用于标题块和页脚块 */
    --cf-layout-horizontal: {
      display: flex;
      align-items: center;
      gap: var(--cf-spacing-md);
      flex-wrap: nowrap;
      text-align: left;
      width: 100%;
    };
    
    /* 垂直布局 - 用于内容块垂直模式 */
    --cf-layout-vertical: {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--cf-spacing-sm);
      text-align: center;
      width: 100%;
    };
    
    /* ===== 3. 块组件配方 (有机体) ===== */
    
    /* 标题块配方 */
    --cf-recipe-header-block: {
      @apply --cf-layout-horizontal;
      padding: var(--cf-spacing-md);
      background: rgba(var(--cf-primary-color-rgb), 0.08);
      border-left: 3px solid var(--cf-primary-color);
      border-radius: var(--cf-radius-md);
      border: 1px solid rgba(var(--cf-primary-color-rgb), 0.3);
      min-height: 60px;
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    };
    
    /* 内容块配方 - 基础 */
    --cf-recipe-content-block: {
      padding: var(--cf-spacing-lg);
      background: var(--cf-surface);
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-md);
      min-height: 70px;
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    };
    
    /* 内容块 - 水平变体 */
    --cf-recipe-content-block-horizontal: {
      @apply --cf-layout-horizontal;
      @apply --cf-recipe-content-block;
    };
    
    /* 内容块 - 垂直变体 */
    --cf-recipe-content-block-vertical: {
      @apply --cf-layout-vertical;
      @apply --cf-recipe-content-block;
    };
    
    /* 页脚块配方 */
    --cf-recipe-footer-block: {
      @apply --cf-layout-horizontal;
      padding: var(--cf-spacing-sm);
      background: rgba(var(--cf-accent-color-rgb), 0.05);
      border-top: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-md);
      min-height: 50px;
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    };
    
    /* 块通用交互状态 */
    --cf-block-hover-state: {
      background: var(--cf-hover-color);
      border-color: var(--cf-primary-color);
      transform: translateY(-2px);
      box-shadow: var(--cf-shadow-md);
    };
    
    --cf-block-active-state: {
      transform: translateY(-1px);
      box-shadow: var(--cf-shadow-sm);
    };
    
    /* 块图标样式 */
    --cf-block-icon-base: {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--cf-radius-md);
      background: rgba(var(--cf-primary-color-rgb), 0.1);
      color: var(--cf-text-secondary);
      font-size: 1.5em;
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    };
    
    --cf-block-icon-hover: {
      color: var(--cf-primary-color);
      background: rgba(var(--cf-primary-color-rgb), 0.15);
      transform: scale(1.05);
    };
    
    /* ===== 4. 工具类 (实用程序) ===== */
    
    /* 布局工具 */
    .cf-flex-center {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cf-flex-between {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .cf-flex-column {
      display: flex;
      flex-direction: column;
    }
    
    .cf-grid-auto-fit {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--cf-spacing-md);
    }
    
    /* 间距工具 */
    .cf-mt-sm { margin-top: var(--cf-spacing-sm); }
    .cf-mt-md { margin-top: var(--cf-spacing-md); }
    .cf-mt-lg { margin-top: var(--cf-spacing-lg); }
    
    .cf-mb-sm { margin-bottom: var(--cf-spacing-sm); }
    .cf-mb-md { margin-bottom: var(--cf-spacing-md); }
    .cf-mb-lg { margin-bottom: var(--cf-spacing-lg); }
    
    .cf-p-sm { padding: var(--cf-spacing-sm); }
    .cf-p-md { padding: var(--cf-spacing-md); }
    .cf-p-lg { padding: var(--cf-spacing-lg); }
    
    /* 文本工具 */
    .cf-text-center { text-align: center; }
    .cf-text-left { text-align: left; }
    .cf-text-right { text-align: right; }
    
    .cf-text-primary { color: var(--cf-text-primary); }
    .cf-text-secondary { color: var(--cf-text-secondary); }
    .cf-text-tertiary { color: var(--cf-text-tertiary); }
    
    /* 阴影工具 */
    .cf-shadow-sm { box-shadow: var(--cf-shadow-sm); }
    .cf-shadow-md { box-shadow: var(--cf-shadow-md); }
    .cf-shadow-lg { box-shadow: var(--cf-shadow-lg); }
    
    /* 圆角工具 */
    .cf-rounded-sm { border-radius: var(--cf-radius-sm); }
    .cf-rounded-md { border-radius: var(--cf-radius-md); }
    .cf-rounded-lg { border-radius: var(--cf-radius-lg); }
    
    /* 过渡工具 */
    .cf-transition-fast {
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    }
    
    .cf-transition-normal {
      transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
    }
  }
  
  /* ===== 深色模式适配 ===== */
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
    
    /* 深色模式下的块样式调整 */
    :host {
      --cf-recipe-header-block: {
        @apply --cf-layout-horizontal;
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-primary-color-rgb), 0.12);
        border-left: 3px solid var(--cf-primary-color);
        border-color: rgba(var(--cf-primary-color-rgb), 0.4);
        border-radius: var(--cf-radius-md);
        min-height: 60px;
      };
      
      --cf-recipe-content-block: {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
      };
      
      --cf-recipe-footer-block: {
        background: rgba(var(--cf-accent-color-rgb), 0.08);
        border-top-color: rgba(255, 255, 255, 0.2);
      };
      
      --cf-block-icon-base: {
        background: rgba(var(--cf-primary-color-rgb), 0.2);
        color: var(--cf-text-tertiary);
      };
    }
  }
  
  /* ===== 容器查询 ===== */
  .cardforge-container {
    container-type: inline-size;
    container-name: cardforge-container;
  }
`;
