// 水墨主题 - 使用设计系统变量
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '中国风水墨画效果，书香韵味',
  icon: '🖌️',
  
  styles: `
    .cardforge-container {
      /* 宣纸底色渐变 - 使用设计系统的中性色 */
      background: 
        linear-gradient(135deg, 
          var(--cf-neutral-50) 0%, 
          color-mix(in srgb, var(--cf-neutral-50), var(--cf-neutral-100) 50%) 50%, 
          color-mix(in srgb, var(--cf-neutral-50), var(--cf-neutral-200) 20%) 100%),
        
        /* 水墨晕染效果 - 使用设计系统的文字颜色 */
        radial-gradient(circle at 20% 30%, rgba(var(--cf-text-primary-rgb), 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(var(--cf-text-primary-rgb), 0.03) 0%, transparent 50%);
      
      /* 使用设计系统的边框变量 */
      border: 1px solid rgba(var(--cf-text-primary-rgb), 0.3);
      font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', 'Noto Serif SC', 'SimSun', var(--cf-font-family-base, serif);
      
      /* 使用设计系统的阴影变量 */
      box-shadow: 
        0 2px 12px rgba(var(--cf-text-primary-rgb), 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      
      position: relative;
      background-blend-mode: multiply;
    }
    
    /* 毛边效果 */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb), 0.05) 1px,
          rgba(var(--cf-text-primary-rgb), 0.05) 2px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb), 0.05) 1px,
          rgba(var(--cf-text-primary-rgb), 0.05) 2px
        );
      pointer-events: none;
      border-radius: inherit;
      z-index: 1;
      opacity: 0.3;
    }
    
    /* 印章水印效果 */
    .cardforge-container::after {
      content: '墨';
      position: absolute;
      bottom: var(--cf-spacing-sm);
      right: var(--cf-spacing-sm);
      font-size: 24px;
      font-family: 'ZCOOL XiaoWei', cursive;
      color: rgba(var(--cf-accent-color-rgb), 0.15);
      transform: rotate(-15deg);
      z-index: 0;
    }
    
    /* 水墨主题下的文字样式 */
    .cardforge-container .greeting,
    .cardforge-container .clock-time,
    .cardforge-container .poetry-title,
    .cardforge-container .week-number {
      font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', var(--cf-font-family-base, serif);
      font-weight: var(--cf-font-weight-bold);
      text-shadow: 1px 1px 2px rgba(var(--cf-text-primary-rgb), 0.1);
      letter-spacing: 0.5px;
    }
    
    /* 水墨主题下的块样式 */
    .cardforge-container .area-header {
      background: rgba(var(--cf-primary-color-rgb), 0.08);
      border-left: 3px solid var(--cf-primary-color);
      border-radius: var(--cf-radius-sm);
      font-family: 'ZCOOL XiaoWei', var(--cf-font-family-base, serif);
    }
    
    .cardforge-container .area-content {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(var(--cf-text-primary-rgb), 0.1);
      border-radius: var(--cf-radius-md);
      box-shadow: 0 1px 3px rgba(var(--cf-text-primary-rgb), 0.05);
    }
    
    .cardforge-container .area-footer {
      background: rgba(var(--cf-accent-color-rgb), 0.05);
      border-top: 1px solid rgba(var(--cf-text-primary-rgb), 0.1);
      border-radius: var(--cf-radius-sm);
      font-family: 'ZCOOL XiaoWei', var(--cf-font-family-base, serif);
      font-size: var(--cf-font-size-sm);
    }
    
    .cardforge-container .block-icon {
      background: rgba(var(--cf-primary-color-rgb), 0.1);
      color: var(--cf-primary-color);
      font-family: 'Material Icons';
      border-radius: var(--cf-radius-sm);
    }
    
    .cardforge-container .block-name {
      color: color-mix(in srgb, var(--cf-text-secondary), var(--cf-primary-color) 20%);
      font-weight: var(--cf-font-weight-medium);
    }
    
    .cardforge-container .block-value {
      color: var(--cf-text-primary);
      font-weight: var(--cf-font-weight-bold);
    }
    
    /* 链接样式 */
    .cardforge-container a {
      color: color-mix(in srgb, var(--cf-primary-color), var(--cf-info-color) 50%);
      text-decoration: none;
      border-bottom: 1px dashed rgba(var(--cf-info-color-rgb), 0.3);
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    }
    
    .cardforge-container a:hover {
      color: var(--cf-accent-color);
      border-bottom-color: rgba(var(--cf-accent-color-rgb), 0.5);
    }
    
    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: 
          linear-gradient(135deg, 
            color-mix(in srgb, var(--cf-background), var(--cf-neutral-800) 80%) 0%, 
            color-mix(in srgb, var(--cf-background), var(--cf-neutral-800) 60%) 50%, 
            color-mix(in srgb, var(--cf-background), var(--cf-neutral-700) 40%) 100%),
          radial-gradient(circle at 20% 30%, rgba(232, 225, 209, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(232, 225, 209, 0.03) 0%, transparent 50%);
        
        border: 1px solid rgba(232, 225, 209, 0.3);
      }
      
      .cardforge-container::after {
        color: rgba(var(--cf-accent-color-rgb), 0.2);
      }
      
      .cardforge-container .area-content {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
      }
      
      .cardforge-container .block-icon {
        background: rgba(var(--cf-primary-color-rgb), 0.2);
        color: var(--cf-text-tertiary);
      }
      
      .cardforge-container a {
        color: color-mix(in srgb, var(--cf-primary-color), var(--cf-info-color) 70%);
        border-bottom-color: rgba(var(--cf-info-color-rgb), 0.4);
      }
    }
    
    /* 响应式设计 */
    @container cardforge-container (max-width: 600px) {
      .cardforge-container::after {
        font-size: 18px;
        bottom: var(--cf-spacing-xs);
        right: var(--cf-spacing-xs);
      }
      
      .cardforge-container .area-header,
      .cardforge-container .area-footer {
        font-size: var(--cf-font-size-xs);
      }
    }
    
    @container cardforge-container (max-width: 400px) {
      .cardforge-container {
        font-size: var(--cf-font-size-sm);
      }
      
      .cardforge-container::after {
        display: none; /* 在小屏幕上隐藏印章 */
      }
      
      .cardforge-container::before {
        opacity: 0.2; /* 减少毛边效果强度 */
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-neutral-50) 0%, color-mix(in srgb, var(--cf-neutral-50), var(--cf-neutral-100) 50%) 50%, color-mix(in srgb, var(--cf-neutral-50), var(--cf-neutral-200) 20%) 100%)',
    color: 'var(--cf-text-primary)',
    border: '1px solid rgba(var(--cf-text-primary-rgb), 0.3)',
    boxShadow: '0 2px 8px rgba(var(--cf-text-primary-rgb), 0.15)',
    
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ctext x='24' y='32' font-family='ZCOOL XiaoWei' font-size='24' fill='rgba(var(--cf-accent-color-rgb),0.15)' text-anchor='middle'%3E墨%3C/text%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
};
