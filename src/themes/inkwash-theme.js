// themes/inkwash-theme.js - 使用设计系统重构版
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '手工宣纸质感，温暖书卷气息',
  icon: '🖌️',
  
  // 水墨主题变量
  variables: {
    '--paper-base-color': 'color-mix(in srgb, var(--cf-neutral-50), color-mix(in srgb, var(--cf-warning-color), transparent 92%) 12%)',
    '--paper-texture-opacity': '0.008',
    '--paper-border-opacity': '0.12',
    '--paper-shadow-opacity': '0.05',
    '--paper-font-family': "'ZCOOL XiaoWei', 'Noto Serif SC', var(--cf-font-family-base, serif)"
  },
  
  // 深色模式变量
  darkVariables: {
    '--paper-base-color': 'color-mix(in srgb, var(--cf-background), color-mix(in srgb, var(--cf-neutral-100), transparent 85%) 18%)',
    '--paper-border-opacity': '0.09',
    '--paper-texture-opacity': '0.006'
  },
  
  styles: `
    .cardforge-container {
      /* 宣纸底色 */
      background-color: var(--paper-base-color);
      
      /* 宣纸纹理 */
      background-image: 
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb), var(--paper-texture-opacity)) 1px,
          rgba(var(--cf-text-primary-rgb), var(--paper-texture-opacity)) 2px,
          transparent 2px,
          transparent 8px
        ),
        repeating-linear-gradient(
          135deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb), calc(var(--paper-texture-opacity) * 0.75)) 1px,
          rgba(var(--cf-text-primary-rgb), calc(var(--paper-texture-opacity) * 0.75)) 1.5px,
          transparent 1.5px,
          transparent 6px
        );
      
      background-blend-mode: multiply;
      background-size: 8px 8px, 6px 6px;
      
      /* 中式字体 */
      font-family: var(--paper-font-family);
      
      /* 宣纸边框 */
      border: 0.8px solid rgba(var(--cf-text-primary-rgb), var(--paper-border-opacity));
      
      /* 水墨阴影效果 */
      box-shadow: 
        inset 0 0 40px rgba(255, 255, 255, 0.7),
        0 1px 2px rgba(0, 0, 0, 0.03),
        0 0 0 0.5px rgba(var(--cf-text-primary-rgb), var(--paper-shadow-opacity));
      
      /* 水墨笔触效果 */
      position: relative;
      overflow: hidden;
    }
    
    /* 水墨晕染效果 */
    .cardforge-container::after {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(var(--cf-primary-color-rgb), 0.1) 0%, transparent 70%);
      border-radius: 50%;
      z-index: 1;
    }
    
    .cardforge-container::before {
      content: '';
      position: absolute;
      bottom: -30px;
      left: -30px;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(var(--cf-accent-color-rgb), 0.05) 0%, transparent 70%);
      border-radius: 50%;
      z-index: 1;
    }
    
    /* 内容区域 */
    .card-wrapper {
      position: relative;
      z-index: 2;
    }
    
    /* 标题样式 */
    .card-title {
      font-weight: var(--cf-font-weight-bold);
      color: var(--cf-text-primary);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
      letter-spacing: 1px;
    }
    
    /* 子标题样式 */
    .card-subtitle {
      font-weight: var(--cf-font-weight-medium);
      color: var(--cf-text-secondary);
      letter-spacing: 0.5px;
    }
    
    /* 强调文字 */
    .card-emphasis {
      color: var(--cf-warning-color);
      font-style: italic;
      text-shadow: 1px 1px 3px rgba(var(--cf-warning-color-rgb), 0.2);
    }
    
    /* 引用文字 */
    .card-caption {
      font-size: var(--cf-font-size-sm);
      color: var(--cf-text-tertiary);
      font-style: italic;
      border-left: 3px solid rgba(var(--cf-warning-color-rgb), 0.3);
      padding-left: var(--cf-spacing-sm);
      margin-top: var(--cf-spacing-md);
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 768px) {
      .cardforge-container::after,
      .cardforge-container::before {
        display: none; /* 小屏隐藏装饰效果 */
      }
      
      .card-title {
        letter-spacing: 0.5px;
      }
    }
    
    /* 悬停效果 */
    .cardforge-container:hover {
      box-shadow: 
        inset 0 0 40px rgba(255, 255, 255, 0.8),
        0 2px 8px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(var(--cf-text-primary-rgb), 0.1);
      transform: translateY(-1px);
      transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
    }
  `,
  
  preview: {
    background: `
      color-mix(in srgb, var(--cf-neutral-50), 
        color-mix(in srgb, var(--cf-warning-color), transparent 92%) 12%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 1px,
        rgba(var(--cf-text-primary-rgb), 0.008) 1px,
        rgba(var(--cf-text-primary-rgb), 0.008) 2px,
        transparent 2px,
        transparent 8px
      )
    `,
    fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
    border: '0.8px solid rgba(var(--cf-text-primary-rgb), 0.12)',
    boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.7), 0 1px 2px rgba(0, 0, 0, 0.03)'
  }
};