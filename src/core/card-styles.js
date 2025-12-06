// core/card-styles.js - 卡片通用样式工具
// 处理通用深色模式和响应式，不针对具体卡片

/**
 * 基础卡片样式 - 所有卡片共享
 */
export const cardBaseStyles = `
  /* === 基础卡片容器 === */
  .cardforge-container {
    height: 100%;
    min-height: 120px;
    font-family: var(--cf-font-family-base);
    transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
    position: relative;
    overflow: hidden;
  }

  /* === 通用卡片内容容器 === */
  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: var(--cf-spacing-lg);
  }

  /* === 通用标题样式 === */
  .card-title {
    font-size: var(--cf-font-size-2xl);
    font-weight: var(--cf-font-weight-bold);
    color: var(--cf-text-primary);
    line-height: var(--cf-line-height-tight);
  }

  .card-subtitle {
    font-size: var(--cf-font-size-lg);
    font-weight: var(--cf-font-weight-medium);
    color: var(--cf-text-secondary);
    line-height: var(--cf-line-height-normal);
  }

  .card-caption {
    font-size: var(--cf-font-size-sm);
    color: var(--cf-text-tertiary);
    line-height: var(--cf-line-height-normal);
  }

  .card-emphasis {
    color: var(--cf-primary-color);
    font-weight: var(--cf-font-weight-bold);
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
      min-height: 100px;
    }
    
    .card-content {
      padding: var(--cf-spacing-md);
    }
    
    .card-title {
      font-size: var(--cf-font-size-xl);
    }
    
    .card-subtitle {
      font-size: var(--cf-font-size-md);
    }
  }

  /* 手机设备 */
  @container cardforge-container (max-width: 480px) {
    .cardforge-container {
      min-height: 80px;
    }
    
    .card-content {
      padding: var(--cf-spacing-sm);
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
      min-height: 70px;
    }
    
    .card-content {
      padding: var(--cf-spacing-xs);
    }
    
    .card-empty {
      padding: var(--cf-spacing-lg);
    }
  }
`;

/**
 * 布局工具样式
 */
export const layoutStyles = `
  /* 居中布局 */
  .layout-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  /* 流式布局 */
  .layout-flow {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cf-spacing-md);
    justify-content: center;
  }

  /* 网格布局 */
  .layout-grid {
    display: grid;
    gap: var(--cf-spacing-md);
  }

  /* 水平布局 */
  .layout-horizontal {
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-md);
  }

  /* 垂直布局 */
  .layout-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--cf-spacing-md);
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
 * @param {string} customStyles - 卡片特有的自定义样式
 * @returns {string} 完整的样式字符串
 */
export function createCardStyles(customStyles = '') {
  return `
    ${cardBaseStyles}
    ${layoutStyles}
    ${customStyles}
  `;
}

/**
 * 获取响应式字体大小
 * @param {string} baseSize - 基础字体大小（如 '1.8em', '3.5em'）
 * @returns {string} 响应式字体大小
 */
export function getResponsiveFontSize(baseSize) {
  // 简单响应式字体大小映射
  const sizeMap = {
    '4xl': '3xl',
    '3xl': '2xl',
    '2xl': 'xl',
    'xl': 'lg',
    'lg': 'md',
    'md': 'sm',
    'sm': 'xs',
    'xs': '0.8em'
  };
  
  const baseMatch = baseSize.match(/var\(--cf-font-size-(\w+)\)/);
  if (baseMatch && sizeMap[baseMatch[1]]) {
    return `
      font-size: var(--cf-font-size-${baseMatch[1]});
      
      @container cardforge-container (max-width: 768px) {
        font-size: var(--cf-font-size-${sizeMap[baseMatch[1]]});
      }
      
      @container cardforge-container (max-width: 480px) {
        font-size: var(--cf-font-size-${sizeMap[sizeMap[baseMatch[1]]] || 'sm'});
      }
    `;
  }
  
  return `font-size: ${baseSize};`;
}