// themes/inkwash-theme.js - 修复版
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '手工宣纸质感，温暖书卷气息',
  icon: '🖌️',
  
  styles: `
    /* 水墨主题 - 卡片容器 */
    .cardforge-container {
      /* 宣纸底色 */
      background-color: color-mix(
        in srgb,
        var(--cf-neutral-50),
        color-mix(
          in srgb,
          var(--cf-warning-color),
          transparent 92%
        ) 12%
      ) !important;
      
      /* 宣纸纹理 */
      background-image: 
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb), 0.008) 1px,
          rgba(var(--cf-text-primary-rgb), 0.008) 2px,
          transparent 2px,
          transparent 8px
        ) !important;
      
      background-blend-mode: multiply !important;
      background-size: 8px 8px !important;
      
      /* 宣纸边框 */
      border: 0.8px solid rgba(var(--cf-text-primary-rgb), 0.12) !important;
      box-shadow: 
        inset 0 0 40px rgba(255, 255, 255, 0.7),
        0 1px 2px rgba(0, 0, 0, 0.03) !important;
      
      /* 中式字体 */
      font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', var(--cf-font-family-base, serif) !important;
    }
    
    /* 水墨主题 - 文字颜色 */
    .cardforge-container .card-title {
      color: rgba(var(--cf-text-primary-rgb), 0.9) !important;
      font-weight: var(--cf-font-weight-bold);
      letter-spacing: 1px;
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(var(--cf-text-primary-rgb), 0.7) !important;
      font-weight: var(--cf-font-weight-medium);
      letter-spacing: 0.5px;
    }
    
    .cardforge-container .card-caption {
      color: rgba(var(--cf-text-primary-rgb), 0.5) !important;
      font-style: italic;
      border-left: 3px solid rgba(var(--cf-warning-color-rgb), 0.3);
      padding-left: var(--cf-spacing-sm);
    }
    
    .cardforge-container .card-emphasis {
      color: var(--cf-warning-color) !important;
      font-style: italic;
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background-color: color-mix(
          in srgb,
          var(--cf-background),
          color-mix(
            in srgb,
            var(--cf-neutral-100),
            transparent 85%
          ) 18%
        ) !important;
        border-color: rgba(255, 255, 255, 0.09) !important;
      }
      
      .cardforge-container .card-title {
        color: rgba(255, 255, 255, 0.9) !important;
      }
      
      .cardforge-container .card-subtitle {
        color: rgba(255, 255, 255, 0.7) !important;
      }
      
      .cardforge-container .card-caption {
        color: rgba(255, 255, 255, 0.5) !important;
      }
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
    border: '0.8px solid rgba(var(--cf-text-primary-rgb), 0.12)'
  }
};