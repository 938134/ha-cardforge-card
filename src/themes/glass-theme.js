// 毛玻璃主题
export const theme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  
  variables: {
    '--cf-primary-color': '#ffffff',
    '--cf-accent-color': '#ffffff',
    '--cf-background': 'rgba(255, 255, 255, 0.15)',
    '--cf-surface': 'rgba(255, 255, 255, 0.1)',
    '--cf-border': 'rgba(255, 255, 255, 0.2)',
    '--cf-text-primary': '#ffffff',
    '--cf-text-secondary': 'rgba(255, 255, 255, 0.8)'
  },
  
  styles: `
    .cardforge-container {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.2);
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
        rgba(255, 255, 255, 0.2) 0%,
        transparent 20%,
        transparent 80%,
        rgba(255, 255, 255, 0.1) 100%
      );
      pointer-events: none;
      z-index: 1;
    }
    
    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.08) 0%, 
          rgba(255, 255, 255, 0.03) 100%);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
    }
  `,
  
  preview: {
    // 关键修正：使用 base64 编码的 SVG 渐变背景模拟毛玻璃效果
    background: `linear-gradient(135deg, 
      rgba(124, 58, 237, 0.6) 0%, 
      rgba(236, 72, 153, 0.4) 50%, 
      rgba(239, 68, 68, 0.3) 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
    
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    
    // 添加模拟模糊效果的阴影
    boxShadow: `
      0 0 0 1px rgba(255, 255, 255, 0.1) inset,
      0 4px 20px rgba(0, 0, 0, 0.1)
    `,
    
    // 添加噪点纹理模拟磨砂效果
    backgroundBlendMode: 'overlay'
  }
};