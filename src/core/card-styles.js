// core/card-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

/**
 * 深色模式适配
 */
export const darkModeStyles = css`
  @media (prefers-color-scheme: dark) {
    /* 基础卡片容器 */
    .card-base {
      background: var(--cf-surface);
      color: var(--cf-text-primary);
    }
    
    /* 强调文本 */
    .text-emphasis {
      text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.4);
    }
    
    /* 进度条背景 */
    .progress-bg {
      background: rgba(255, 255, 255, 0.05);
    }
    
    /* 边框 */
    .border-base {
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    /* 图标 */
    .icon-base {
      color: var(--cf-text-secondary);
    }
    
    /* 容器阴影 */
    .shadow-base {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    /* 半透明白色背景 */
    .bg-transparent-light {
      background: rgba(255, 255, 255, 0.05);
    }
    
    /* 主题色背景 */
    .bg-primary-transparent {
      background: rgba(var(--cf-primary-color-rgb), 0.1);
    }
    
    /* 强调色背景 */
    .bg-accent-transparent {
      background: rgba(var(--cf-accent-color-rgb), 0.08);
    }
  }
`;

/**
 * 响应式设计 - 平板尺寸
 */
export const tabletResponsiveStyles = css`
  @container cardforge-container (max-width: 768px) {
    /* 基础容器 */
    .responsive-container {
      padding: var(--cf-spacing-lg);
      gap: var(--cf-spacing-md);
    }
    
    /* 标题文本 */
    .responsive-title {
      font-size: var(--cf-font-size-2xl);
    }
    
    /* 副标题 */
    .responsive-subtitle {
      font-size: var(--cf-font-size-lg);
    }
    
    /* 内容文本 */
    .responsive-text {
      font-size: var(--cf-font-size-base);
    }
    
    /* 小文本 */
    .responsive-caption {
      font-size: var(--cf-font-size-sm);
    }
    
    /* 布局 */
    .responsive-grid-2col {
      grid-template-columns: repeat(2, 1fr);
    }
    
    /* 间距 */
    .responsive-gap-md {
      gap: var(--cf-spacing-sm);
    }
    
    /* 最小高度 */
    .responsive-min-height {
      min-height: 140px;
    }
  }
`;

/**
 * 响应式设计 - 手机尺寸
 */
export const mobileResponsiveStyles = css`
  @container cardforge-container (max-width: 480px) {
    /* 基础容器 */
    .responsive-container {
      padding: var(--cf-spacing-md);
      gap: var(--cf-spacing-sm);
    }
    
    /* 标题文本 */
    .responsive-title {
      font-size: var(--cf-font-size-xl);
    }
    
    /* 副标题 */
    .responsive-subtitle {
      font-size: var(--cf-font-size-md);
    }
    
    /* 内容文本 */
    .responsive-text {
      font-size: var(--cf-font-size-sm);
    }
    
    /* 小文本 */
    .responsive-caption {
      font-size: var(--cf-font-size-xs);
    }
    
    /* 布局 */
    .responsive-grid-1col {
      grid-template-columns: 1fr;
    }
    
    .responsive-column-layout {
      flex-direction: column;
      align-items: stretch;
    }
    
    /* 间距 */
    .responsive-gap-sm {
      gap: var(--cf-spacing-xs);
    }
    
    /* 最小高度 */
    .responsive-min-height {
      min-height: 120px;
    }
  }
`;

/**
 * 响应式设计 - 小手机尺寸
 */
export const smallMobileResponsiveStyles = css`
  @container cardforge-container (max-width: 360px) {
    /* 基础容器 */
    .responsive-container {
      padding: var(--cf-spacing-sm);
      gap: var(--cf-spacing-xs);
    }
    
    /* 标题文本 */
    .responsive-title {
      font-size: var(--cf-font-size-lg);
    }
    
    /* 副标题 */
    .responsive-subtitle {
      font-size: var(--cf-font-size-sm);
    }
    
    /* 最小高度 */
    .responsive-min-height {
      min-height: 100px;
    }
  }
`;

/**
 * 通用卡片样式
 */
export const commonCardStyles = css`
  .card-base {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 160px;
    padding: var(--cf-spacing-2xl);
    font-family: var(--cf-font-family-base);
    transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
  }
  
  /* 文本样式 */
  .text-title {
    font-size: var(--cf-font-size-3xl);
    font-weight: var(--cf-font-weight-bold);
    color: var(--cf-text-primary);
    line-height: var(--cf-line-height-tight);
  }
  
  .text-subtitle {
    font-size: var(--cf-font-size-xl);
    font-weight: var(--cf-font-weight-medium);
    color: var(--cf-text-secondary);
    line-height: var(--cf-line-height-normal);
  }
  
  .text-caption {
    font-size: var(--cf-font-size-lg);
    color: var(--cf-text-tertiary);
    line-height: var(--cf-line-height-normal);
  }
  
  .text-emphasis {
    color: var(--cf-primary-color);
    font-weight: var(--cf-font-weight-bold);
  }
  
  /* 布局样式 */
  .layout-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .layout-flex {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cf-spacing-md);
    justify-content: center;
  }
  
  .layout-grid {
    display: grid;
    gap: var(--cf-spacing-md);
  }
  
  /* 空状态 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--cf-text-tertiary);
    padding: var(--cf-spacing-3xl);
  }
  
  .empty-icon {
    font-size: 3em;
    margin-bottom: var(--cf-spacing-md);
    opacity: 0.4;
  }
  
  .empty-text {
    font-size: var(--cf-font-size-xl);
    font-weight: var(--cf-font-weight-medium);
  }
  
  /* 边框和阴影 */
  .border-base {
    border: 1px solid var(--cf-border);
  }
  
  .shadow-base {
    box-shadow: var(--cf-shadow-md);
  }
  
  .rounded-base {
    border-radius: var(--cf-radius-lg);
  }
`;

/**
 * 创建完整的卡片样式
 */
export const createCardStyles = (customStyles = '') => {
  return css`
    ${commonCardStyles}
    ${darkModeStyles}
    ${tabletResponsiveStyles}
    ${mobileResponsiveStyles}
    ${smallMobileResponsiveStyles}
    ${customStyles}
  `;
};

/**
 * 响应式工具类 - 用于模板中动态添加类名
 */
export const responsiveClasses = {
  // 容器类
  container: 'responsive-container',
  minHeight: 'responsive-min-height',
  
  // 文本类
  title: 'responsive-title',
  subtitle: 'responsive-subtitle',
  text: 'responsive-text',
  caption: 'responsive-caption',
  
  // 布局类
  grid2col: 'responsive-grid-2col',
  grid1col: 'responsive-grid-1col',
  columnLayout: 'responsive-column-layout',
  
  // 间距类
  gapMd: 'responsive-gap-md',
  gapSm: 'responsive-gap-sm',
};

/**
 * 深色模式工具类
 */
export const darkModeClasses = {
  base: 'card-base',
  emphasis: 'text-emphasis',
  progressBg: 'progress-bg',
  border: 'border-base',
  icon: 'icon-base',
  shadow: 'shadow-base',
  bgLight: 'bg-transparent-light',
  bgPrimary: 'bg-primary-transparent',
  bgAccent: 'bg-accent-transparent',
};