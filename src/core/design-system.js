import { css } from 'https://unpkg.com/lit@3.1.3/index.js?module';

/**
 * 设计系统 - 纯粹的CSS变量定义
 * 不包含任何具体的样式规则
 */
export const designSystem = css`
  :host {
    /* ===== 色彩系统 ===== */
    /* 主色调 */
    --cf-primary-color: var(--primary-color, #03a9f4);
    --cf-primary-color-rgb: 3, 169, 244;
    --cf-accent-color: var(--accent-color, #ff4081);
    --cf-accent-color-rgb: 255, 64, 129;
    
    /* 中性色 */
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
    --cf-radius-circle: 50%;
    
    /* ===== 阴影系统 ===== */
    --cf-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
    --cf-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --cf-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --cf-shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
    --cf-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
    --cf-shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    --cf-shadow-outline: 0 0 0 3px rgba(var(--cf-primary-color-rgb), 0.2);
    
    /* ===== 动画系统 ===== */
    --cf-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --cf-transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --cf-transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
    --cf-transition-bounce: 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    --cf-animation-fade-in: fadeIn var(--cf-transition-normal);
    --cf-animation-slide-up: slideUp var(--cf-transition-normal);
    --cf-animation-scale: scaleIn var(--cf-transition-normal);
    
    /* ===== 排版系统 ===== */
    --cf-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                          'Helvetica Neue', Arial, sans-serif, 'Noto Sans SC';
    --cf-font-family-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                            'Helvetica Neue', Arial, sans-serif, 'Noto Sans SC';
    --cf-font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, 
                          Monaco, 'Courier New', monospace;
    --cf-font-family-serif: 'Noto Serif SC', 'Source Han Serif SC', 'STZhongsong', 
                           'SimSun', serif;
    
    --cf-font-size-xs: 0.75rem;     /* 12px */
    --cf-font-size-sm: 0.875rem;    /* 14px */
    --cf-font-size-base: 1rem;      /* 16px */
    --cf-font-size-lg: 1.125rem;    /* 18px */
    --cf-font-size-xl: 1.25rem;     /* 20px */
    --cf-font-size-2xl: 1.5rem;     /* 24px */
    --cf-font-size-3xl: 1.875rem;   /* 30px */
    --cf-font-size-4xl: 2.25rem;    /* 36px */
    --cf-font-size-5xl: 3rem;       /* 48px */
    
    --cf-font-weight-light: 300;
    --cf-font-weight-normal: 400;
    --cf-font-weight-medium: 500;
    --cf-font-weight-semibold: 600;
    --cf-font-weight-bold: 700;
    --cf-font-weight-extrabold: 800;
    
    --cf-line-height-tight: 1.25;
    --cf-line-height-normal: 1.5;
    --cf-line-height-relaxed: 1.75;
    --cf-line-height-loose: 2;
    
    --cf-letter-spacing-tight: -0.025em;
    --cf-letter-spacing-normal: 0;
    --cf-letter-spacing-wide: 0.025em;
    
    /* ===== 层级系统 ===== */
    --cf-z-index-dropdown: 1000;
    --cf-z-index-sticky: 1020;
    --cf-z-index-fixed: 1030;
    --cf-z-index-modal-backdrop: 1040;
    --cf-z-index-modal: 1050;
    --cf-z-index-popover: 1060;
    --cf-z-index-tooltip: 1070;
    
    /* ===== 布局系统 ===== */
    --cf-grid-columns: 12;
    --cf-grid-gap: var(--cf-spacing-md);
    --cf-container-max-width: 1200px;
    --cf-container-padding: var(--cf-spacing-lg);
    
    /* ===== 性能优化 ===== */
    --cf-will-change-transform: will-change transform;
    --cf-will-change-opacity: will-change transform, opacity;
    --cf-will-change-contents: will-change contents;
    
    /* ===== 深色模式变量 ===== */
    @media (prefers-color-scheme: dark) {
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
      
      --cf-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.2);
      --cf-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
      --cf-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.25);
      --cf-shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.3);
      --cf-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.4);
      --cf-shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.15);
    }
  }
  
  /* ===== 动画关键帧定义 ===== */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* ===== 工具类动画 ===== */
  .cf-animate-fade-in {
    animation: fadeIn var(--cf-transition-normal);
  }
  
  .cf-animate-slide-up {
    animation: slideUp var(--cf-transition-normal);
  }
  
  .cf-animate-scale {
    animation: scaleIn var(--cf-transition-normal);
  }
  
  .cf-animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .cf-animate-spin {
    animation: spin 1s linear infinite;
  }
`;
