// themes/auto-theme.js - 使用设计系统重构版
export const theme = {
  id: 'auto',
  name: '自动',
  description: '跟随系统主题，无额外样式',
  icon: '⚙️',
  
  // 自动主题变量（继承设计系统）
  variables: {
    '--theme-transition-duration': 'var(--cf-transition-duration-normal)',
    '--theme-easing': 'var(--cf-easing-standard)'
  },
  
  // 深色模式变量（自动继承设计系统的深色变量）
  darkVariables: {},
  
  styles: `
    .cardforge-container {
      /* 完全使用设计系统变量 */
      background: var(--cf-background);
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-md);
      box-shadow: var(--cf-shadow-sm);
      
      /* 平滑主题切换 */
      transition: 
        background-color var(--theme-transition-duration) var(--theme-easing), 
        color var(--theme-transition-duration) var(--theme-easing),
        border-color var(--theme-transition-duration) var(--theme-easing),
        box-shadow var(--theme-transition-duration) var(--theme-easing);
      
      /* 标准布局 */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    /* 内容区域标准化 */
    .card-content {
      width: 100%;
      max-width: 100%;
      padding: var(--cf-spacing-xl);
      text-align: center;
    }
    
    /* 标题系统 */
    .card-title {
      font-size: var(--cf-font-size-2xl);
      font-weight: var(--cf-font-weight-bold);
      color: var(--cf-text-primary);
      margin-bottom: var(--cf-spacing-sm);
      line-height: var(--cf-line-height-tight);
    }
    
    .card-subtitle {
      font-size: var(--cf-font-size-lg);
      font-weight: var(--cf-font-weight-medium);
      color: var(--cf-text-secondary);
      margin-bottom: var(--cf-spacing-md);
      line-height: var(--cf-line-height-normal);
    }
    
    .card-caption {
      font-size: var(--cf-font-size-sm);
      color: var(--cf-text-tertiary);
      margin-top: var(--cf-spacing-lg);
      line-height: var(--cf-line-height-relaxed);
    }
    
    .card-emphasis {
      color: var(--cf-primary-color);
      font-weight: var(--cf-font-weight-semibold);
    }
    
    /* 交互状态 */
    .cardforge-container:hover {
      box-shadow: var(--cf-shadow-md);
      border-color: var(--cf-border-dark);
      transform: translateY(-2px);
      transition: 
        transform var(--cf-transition-duration-fast) var(--cf-easing-emphasized),
        box-shadow var(--cf-transition-duration-fast) var(--cf-easing-emphasized);
    }
    
    .cardforge-container:active {
      transform: translateY(-1px);
      box-shadow: var(--cf-shadow-sm);
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-decelerate);
    }
    
    /* 空状态样式 */
    .card-empty {
      color: var(--cf-text-tertiary);
      font-style: italic;
      padding: var(--cf-spacing-2xl);
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 768px) {
      .card-content {
        padding: var(--cf-spacing-lg);
      }
      
      .card-title {
        font-size: var(--cf-font-size-xl);
      }
      
      .card-subtitle {
        font-size: var(--cf-font-size-md);
      }
      
      .cardforge-container:hover {
        transform: translateY(-1px);
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
      
      .cardforge-container {
        box-shadow: var(--cf-shadow-xs);
      }
    }
    
    /* 辅助功能优化 */
    @media (prefers-reduced-motion: reduce) {
      .cardforge-container,
      .cardforge-container:hover,
      .cardforge-container:active {
        transition: none;
        transform: none;
      }
    }
  `,
  
  preview: {
    background: 'var(--cf-background)',
    color: 'var(--cf-text-primary)',
    border: '1px solid var(--cf-border)',
    boxShadow: 'var(--cf-shadow-sm)',
    
    // 深色模式预览
    '@media (prefers-color-scheme: dark)': {
      background: 'var(--cf-background)',
      color: 'var(--cf-text-primary)'
    }
  }
};