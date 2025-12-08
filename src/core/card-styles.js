// core/card-styles.js - 完全使用 Lit 框架
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

/**
 * 基础卡片样式 - 所有卡片共享
 */
export const cardBaseStyles = css`
  /* === 基础卡片容器 === */
  .cardforge-container {
    height: 100%;
    min-height: 140px;
    font-family: var(--cf-font-family-base);
    transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* === 卡片内容包装器 - 用于居中内容 === */
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

  /* === 通用卡片内容区域 === */
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

  /* === 通用标题样式 === */
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

  /* === 通用空状态 === */
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

  /* === 通用垂直间距工具 === */
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

  /* === 深色模式适配（通用）=== */
  @media (prefers-color-scheme: dark) {
    .cardforge-container {
      background: var(--cf-surface);
      color: var(--cf-text-primary);
    }

    .card-emphasis {
      text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.4);
    }
  }

  /* === 响应式设计（通用）=== */
  
  /* 平板设备 */
  @container cardforge-container (max-width: 768px) {
    .cardforge-container {
      min-height: 120px;
    }
    
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
  }

  /* 手机设备 */
  @container cardforge-container (max-width: 480px) {
    .cardforge-container {
      min-height: 100px;
    }
    
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
  }

  /* 小屏手机 */
  @container cardforge-container (max-width: 360px) {
    .cardforge-container {
      min-height: 90px;
    }
    
    .card-content {
      padding: var(--cf-spacing-sm);
    }
    
    .card-empty {
      padding: var(--cf-spacing-lg);
    }
  }
`;

/**
 * 布局工具样式
 */
export const layoutStyles = css`
  /* 居中布局 */
  .layout-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
  }

  /* 流式布局 */
  .layout-flow {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cf-spacing-md);
    justify-content: center;
    width: 100%;
  }

  /* 网格布局 */
  .layout-grid {
    display: grid;
    gap: var(--cf-spacing-md);
    width: 100%;
  }

  /* 水平布局 */
  .layout-horizontal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-md);
    width: 100%;
  }

  /* 垂直布局 */
  .layout-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-md);
    width: 100%;
  }

  /* 两端对齐布局 */
  .layout-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  /* 响应式布局调整 */
  @container cardforge-container (max-width: 768px) {
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

/**
 * 生成卡片样式 - 组合通用样式和自定义样式
 * @param {CSSResult} customStyles - 卡片特有的自定义样式
 * @returns {CSSResult} 完整的样式字符串
 */
export function createCardStyles(customStyles) {
  // 合并样式
  const mergedStyles = [
    cardBaseStyles,
    layoutStyles,
    customStyles || css``
  ];
  
  // 将所有样式合并为一个 CSSResult
  return mergedStyles.reduce((result, style) => {
    if (style && style.cssText) {
      return css([result, style]);
    }
    return result;
  }, css``);
}