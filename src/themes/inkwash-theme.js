// themes/inkwash-theme.js - 修复版
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '手工宣纸质感，温暖书卷气息',
  icon: '🖌️',
  
  styles: `
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
      );
      
      /* 宣纸纹理 */
      background-image: 
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.008) 1px,
          rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.008) 2px,
          transparent 2px,
          transparent 4px
        ),
        repeating-linear-gradient(
          135deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.006) 1px,
          rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.006) 1.5px,
          transparent 1.5px,
          transparent 3px
        );
      
      background-blend-mode: multiply;
      background-size: 8px 8px, 6px 6px;
      
      /* 宣纸边框 */
      border: 0.8px solid rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.12);
      box-shadow: 
        inset 0 0 40px rgba(255, 255, 255, 0.7),
        0 1px 2px rgba(0, 0, 0, 0.03),
        0 0 0 0.5px rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.05);
      border-radius: var(--cf-radius-lg);
      overflow: hidden;
    }
    
    /* 深色模式 */
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
        );
        border-color: rgba(255, 255, 255, 0.09);
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
        rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.008) 1px,
        rgba(var(--cf-text-primary-rgb, 0, 0, 0), 0.008) 2px,
        transparent 2px,
        transparent 8px
      )
    `
  }
};