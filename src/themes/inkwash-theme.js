// themes/inkwash-theme.js - 优化版
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '手工宣纸质感，温暖书卷气息',
  icon: '🖌️',
  
  styles: css`
    /* 水墨主题 - 定义主题变量 */
    .cardforge-container {
      /* 主题变量定义 */
      --inkwash-paper-base: var(--cf-neutral-50);
      --inkwash-paper-tint: rgba(var(--cf-text-secondary-rgb), 0.06);
      --inkwash-ink-primary: color-mix(in srgb, var(--cf-text-primary), #000000 30%);
      --inkwash-ink-secondary: rgba(var(--cf-text-secondary-rgb), 0.7);
      --inkwash-border: rgba(var(--cf-text-primary-rgb), 0.1);
      --inkwash-texture-opacity: 0.02;
      
      /* 宣纸底色 - 使用变量混合 */
      background-color: color-mix(
        in srgb,
        var(--inkwash-paper-base),
        var(--inkwash-paper-tint) 15%
      ) !important;
      
      /* 宣纸纹理 - 更自然的纤维效果 */
      background-image: 
        radial-gradient(
          ellipse at 30% 30%,
          rgba(var(--cf-text-primary-rgb), var(--inkwash-texture-opacity)) 1px,
          transparent 1px
        ),
        radial-gradient(
          ellipse at 70% 70%,
          rgba(var(--cf-text-primary-rgb), calc(var(--inkwash-texture-opacity) * 0.6)) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom right,
          transparent,
          rgba(var(--cf-text-primary-rgb), 0.01) 50%,
          transparent
        ) !important;
      
      background-size: 
        50px 50px,  /* 主纹理大小 */
        80px 80px,  /* 次纹理大小 */
        100% 100%;  /* 渐变覆盖 */
      
      background-blend-mode: multiply !important;
      
      /* 宣纸边框和阴影 */
      border: 0.5px solid var(--inkwash-border) !important;
      box-shadow: 
        inset 0 0 50px rgba(255, 255, 255, 0.6),
        0 1px 3px rgba(0, 0, 0, 0.05),
        0 4px 12px rgba(0, 0, 0, 0.02) !important;
      
      /* 中式字体 - 但使用回退系统 */
      font-family: 
        var(--cf-font-family-heading, 
          var(--cf-font-family-base, 
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
        ) !important;
      letter-spacing: 0.3px;
    }
    
    /* 水墨主题 - 文字样式 */
    .cardforge-container .card-title {
      color: var(--inkwash-ink-primary) !important;
      font-weight: var(--cf-font-weight-semibold);
      letter-spacing: 0.5px;
      text-shadow: 
        0.5px 0.5px 0 rgba(255, 255, 255, 0.5),
        -0.5px -0.5px 0 rgba(0, 0, 0, 0.1);
    }
    
    .cardforge-container .card-subtitle {
      color: var(--inkwash-ink-secondary) !important;
      font-weight: var(--cf-font-weight-medium);
      letter-spacing: 0.2px;
    }
    
    .cardforge-container .card-caption {
      color: rgba(var(--cf-text-tertiary-rgb), 0.8) !important;
      font-style: italic;
      border-left: 2px solid rgba(var(--cf-text-secondary-rgb), 0.3);
      padding-left: var(--cf-spacing-sm);
      margin-top: var(--cf-spacing-xs);
    }
    
    .cardforge-container .card-emphasis {
      color: color-mix(in srgb, var(--inkwash-ink-primary), var(--cf-accent-color) 30%) !important;
      font-weight: var(--cf-font-weight-bold);
      font-style: normal;
      text-decoration: underline;
      text-decoration-color: rgba(var(--cf-accent-color-rgb), 0.3);
      text-decoration-thickness: 1.5px;
      text-underline-offset: 4px;
    }
    
    /* 诗词卡片特殊适配 */
    .cardforge-container .poetry-line {
      font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', var(--cf-font-family-base) !important;
      text-shadow: 0.3px 0.3px 0 rgba(0, 0, 0, 0.1);
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        --inkwash-paper-base: color-mix(in srgb, var(--cf-neutral-900), #111111 20%);
        --inkwash-paper-tint: rgba(255, 255, 255, 0.04);
        --inkwash-ink-primary: rgba(255, 255, 255, 0.92);
        --inkwash-ink-secondary: rgba(255, 255, 255, 0.75);
        --inkwash-border: rgba(255, 255, 255, 0.08);
        --inkwash-texture-opacity: 0.015;
        
        border-color: var(--inkwash-border) !important;
        box-shadow: 
          inset 0 0 60px rgba(0, 0, 0, 0.4),
          0 1px 4px rgba(0, 0, 0, 0.2),
          0 6px 20px rgba(0, 0, 0, 0.1) !important;
      }
      
      .cardforge-container .card-title {
        text-shadow: 
          0.5px 0.5px 0 rgba(0, 0, 0, 0.3),
          -0.5px -0.5px 0 rgba(255, 255, 255, 0.1);
      }
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 768px) {
      .cardforge-container {
        --inkwash-texture-opacity: 0.015;
        background-size: 40px 40px, 60px 60px, 100% 100% !important;
      }
    }
  `,
  
  preview: {
    background: `
      color-mix(in srgb, var(--cf-neutral-50), rgba(var(--cf-text-secondary-rgb), 0.06) 15%),
      radial-gradient(
        ellipse at 30% 30%,
        rgba(var(--cf-text-primary-rgb), 0.02) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom right,
        transparent,
        rgba(var(--cf-text-primary-rgb), 0.01) 50%,
        transparent
      )
    `,
    border: '0.5px solid rgba(var(--cf-text-primary-rgb), 0.1)'
  }
};