// 毛玻璃主题 - 直接使用设计系统变量
export const theme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  
  styles: `
    .cardforge-container {
      /* 使用设计系统的背景和边框变量 */
      background: linear-gradient(135deg, 
        rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.1) 0%, 
        rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.05) 100%);
      
      /* 使用设计系统的毛玻璃效果变量 */
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.2);
      position: relative;
      overflow: hidden;
    }
    
    /* 玻璃折射效果 */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.2) 0%,
        transparent 20%,
        transparent 80%,
        rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.1) 100%
      );
      pointer-events: none;
      z-index: 1;
    }
    
    /* 深色模式适配 - 使用设计系统的深色变量 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.08) 0%, 
          rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.03) 100%);
        border: 1px solid rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.15);
      }
    }
  `,
  
  preview: {
    // 预览也使用设计系统变量
    background: `
      linear-gradient(135deg, 
        rgba(var(--cf-primary-color-rgb, 124, 58, 237), 0.6) 0%, 
        rgba(var(--cf-accent-color-rgb, 236, 72, 153), 0.4) 50%, 
        rgba(239, 68, 68, 0.3) 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")
    `,
    color: 'var(--cf-text-primary, #ffffff)',
    border: '1px solid rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.3)',
    borderColor: 'rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.3)',
    boxShadow: `
      0 0 0 1px rgba(var(--cf-primary-color-rgb, 255, 255, 255), 0.1) inset,
      0 4px 20px rgba(0, 0, 0, 0.1)
    `,
    backgroundBlendMode: 'overlay'
  }
};
