// 水墨主题 - 极简意境版
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '中式极简美学，留白与意境',
  icon: '🖌️',
  
  styles: `
    .cardforge-container {
      /* 第一层：宣纸基底 - 纯净暖白 */
      background-color: var(--cf-neutral-50);
      
      /* 极细边框 - 模拟宣纸边缘 */
      border: 0.5px solid rgba(var(--cf-text-primary-rgb), 0.1);
      
      /* 中式排版字体 */
      font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', var(--cf-font-family-base, serif);
      
      /* 极简阴影，仅作层次区分 */
      box-shadow: var(--cf-shadow-sm);
      
      position: relative;
      overflow: hidden;
    }
    
    /* 第二层：右上角淡墨点 - 偶然滴落的意境 */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: var(--cf-spacing-sm);
      right: var(--cf-spacing-sm);
      width: 40px;
      height: 40px;
      
      /* 单色墨点，无复杂渐变 */
      background: rgba(var(--cf-text-primary-rgb), 0.03);
      
      /* 不规则圆形，模拟自然晕染 */
      border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
      
      pointer-events: none;
      z-index: 0;
      
      /* 悬停时几乎消失 */
      transition: opacity var(--cf-transition-duration-normal) var(--cf-easing-standard);
    }
    
    /* 悬停时墨点更淡，不干扰交互 */
    .cardforge-container:hover::before {
      opacity: 0.5;
    }
    
    /* 第三层：右下角微型朱印 - 完成标记 */
    .cardforge-container::after {
      content: '墨';
      position: absolute;
      bottom: var(--cf-spacing-xs);
      right: var(--cf-spacing-xs);
      font-size: 11px;
      font-family: 'ZCOOL XiaoWei', cursive;
      color: rgba(var(--cf-accent-color-rgb), 0.12);
      
      /* 轻微倾斜，自然钤印感 */
      transform: rotate(-8deg);
      
      z-index: 0;
      font-weight: bold;
      
      /* 印文压痕效果 */
      text-shadow: 
        0.3px 0.3px 0 rgba(255, 255, 255, 0.8),
        -0.3px -0.3px 0 rgba(0, 0, 0, 0.05);
      
      /* 响应式适配基础 */
      transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
    }
    
    /* 卡片内容区域 - 绝对干净 */
    .cardforge-container > * {
      position: relative;
      z-index: 1;
    }
    
    /* 标题文字优化 - 保持清晰 */
    .cardforge-container .greeting,
    .cardforge-container .clock-time,
    .cardforge-container .poetry-title,
    .cardforge-container .week-number {
      font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', var(--cf-font-family-base, serif);
      font-weight: var(--cf-font-weight-bold);
      letter-spacing: 0.2px;
      color: var(--cf-text-primary);
    }
    
    /* 块样式优化 - 保持宣纸统一性 */
    .cardforge-container .area-header {
      background: rgba(var(--cf-primary-color-rgb), 0.05);
      border-left: 2px solid rgba(var(--cf-primary-color-rgb), 0.2);
      border-radius: var(--cf-radius-sm);
    }
    
    .cardforge-container .area-content {
      background: rgba(255, 255, 255, 0.95);
      border: 0.5px solid rgba(var(--cf-text-primary-rgb), 0.08);
      border-radius: var(--cf-radius-sm);
    }
    
    .cardforge-container .area-footer {
      background: rgba(var(--cf-accent-color-rgb), 0.03);
      border-top: 0.5px solid rgba(var(--cf-text-primary-rgb), 0.06);
      border-radius: var(--cf-radius-sm);
      font-size: var(--cf-font-size-sm);
    }
    
    .cardforge-container .block-icon {
      background: rgba(var(--cf-primary-color-rgb), 0.07);
      color: var(--cf-primary-color);
      border: 0.5px solid rgba(var(--cf-primary-color-rgb), 0.12);
    }
    
    /* 深色模式 - 更克制的呈现 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background-color: color-mix(in srgb, var(--cf-background), white 3%);
        border-color: rgba(255, 255, 255, 0.08);
      }
      
      .cardforge-container::before {
        background: rgba(255, 255, 255, 0.02);
      }
      
      .cardforge-container::after {
        color: rgba(var(--cf-accent-color-rgb), 0.15);
        text-shadow: 
          0.3px 0.3px 0 rgba(0, 0, 0, 0.3),
          -0.3px -0.3px 0 rgba(255, 255, 255, 0.05);
      }
      
      .cardforge-container .area-content {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.06);
      }
      
      .cardforge-container .block-icon {
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        border-color: rgba(var(--cf-primary-color-rgb), 0.15);
      }
    }
    
    /* 响应式简化策略 */
    
    /* 平板端：缩小装饰 */
    @container cardforge-container (max-width: 768px) {
      .cardforge-container::before {
        width: 30px;
        height: 30px;
        top: var(--cf-spacing-xs);
        right: var(--cf-spacing-xs);
        opacity: 0.8;
      }
      
      .cardforge-container::after {
        font-size: 10px;
        bottom: var(--cf-spacing-xs);
        right: var(--cf-spacing-xs);
      }
    }
    
    /* 手机端：移除墨点，仅保留印章 */
    @container cardforge-container (max-width: 480px) {
      .cardforge-container::before {
        display: none;
      }
      
      .cardforge-container::after {
        font-size: 9px;
        opacity: 0.9;
        transform: rotate(-5deg);
      }
      
      /* 手机端块样式更紧凑 */
      .cardforge-container .area-header,
      .cardforge-container .area-content,
      .cardforge-container .area-footer {
        padding: var(--cf-spacing-sm);
      }
    }
    
    /* 超小屏：最小化一切 */
    @container cardforge-container (max-width: 360px) {
      .cardforge-container::after {
        font-size: 8px;
        bottom: 2px;
        right: 2px;
        opacity: 0.7;
      }
    }
    
    /* 高对比度模式：完全简化 */
    @media (prefers-contrast: high) {
      .cardforge-container::before,
      .cardforge-container::after {
        display: none;
      }
      
      .cardforge-container {
        background-color: var(--cf-background);
        border: 1px solid var(--cf-border);
      }
    }
    
    /* 性能优化：减少不必要的重绘 */
    .cardforge-container {
      will-change: transform;
      contain: layout style;
    }
    
    /* 打印样式：隐藏装饰 */
    @media print {
      .cardforge-container::before,
      .cardforge-container::after {
        display: none;
      }
      
      .cardforge-container {
        background-color: white !important;
        border: 1px solid #ccc !important;
        box-shadow: none !important;
      }
    }
  `,
  
  preview: {
    // 预览同样极简
    background: 'var(--cf-neutral-50)',
    color: 'var(--cf-text-primary)',
    border: '0.5px solid rgba(var(--cf-text-primary-rgb), 0.1)',
    boxShadow: 'var(--cf-shadow-sm)',
    
    // 预览中的微型元素
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ctext x='18' y='22' font-family='ZCOOL XiaoWei' font-size='9' fill='rgba(var(--cf-accent-color-rgb),0.12)' text-anchor='end'%3E墨%3C/text%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '95% 95%'
  }
};