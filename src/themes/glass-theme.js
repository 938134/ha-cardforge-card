// 毛玻璃主题 - 使用设计系统变量
export const theme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  
  // 注意：不再定义variables对象，完全依赖design-system.js中的变量
  
  styles: `
    .cardforge-container {
      /* 使用设计系统的背景变量 */
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      
      /* 使用设计系统的边框和阴影变量 */
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--cf-shadow-md);
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
    
    /* 毛玻璃主题下的块样式增强 */
    .cardforge-container .area-header {
      background: rgba(var(--cf-primary-color-rgb), 0.15);
      backdrop-filter: blur(10px);
      border-left: 4px solid rgba(var(--cf-primary-color-rgb), 0.6);
    }
    
    .cardforge-container .area-content {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
    }
    
    .cardforge-container .area-footer {
      background: rgba(var(--cf-accent-color-rgb), 0.08);
      backdrop-filter: blur(5px);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
    }
    
    /* 块图标毛玻璃效果 */
    .cardforge-container .block-icon {
      background: rgba(var(--cf-primary-color-rgb), 0.15);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* 深色模式适配 - 使用设计系统的深色变量 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.08) 0%, 
          rgba(255, 255, 255, 0.03) 100%);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      
      .cardforge-container .area-header {
        background: rgba(var(--cf-primary-color-rgb), 0.2);
      }
      
      .cardforge-container .area-content {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .cardforge-container .block-icon {
        background: rgba(var(--cf-primary-color-rgb), 0.2);
      }
    }
    
    /* 容器查询下的优化 */
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        backdrop-filter: blur(15px) saturate(160%);
      }
      
      .cardforge-container .area-header,
      .cardforge-container .area-content,
      .cardforge-container .area-footer {
        backdrop-filter: blur(5px);
      }
    }
  `,
  
  preview: {
    // 1. 底层：模拟模糊的背景内容
    background: `
      /* 底层：模拟被模糊的深色背景 */
      linear-gradient(45deg, 
        #1a1a2e 0%, 
        #16213e 30%, 
        #0f3460 70%, 
        #533483 100%
      ),
      
      /* 中层：玻璃质感的半透明白色层 */
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.25) 0%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0.05) 100%
      ),
      
      /* 顶层：模拟噪点的磨砂纹理 */
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")
    `,
    
    // 混合模式增强玻璃感
    backgroundBlendMode: 'overlay, overlay, normal',
    
    // 2. 边框：通透的白色边框
    border: '1px solid rgba(255, 255, 255, 0.35)',
    
    // 3. 阴影：外发光模拟光晕
    boxShadow: `
      0 0 0 1px rgba(255, 255, 255, 0.2) inset,
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(100, 150, 255, 0.15)
    `,
    
    // 4. 文字：亮色确保可读性
    color: 'rgba(255, 255, 255, 0.95)',
    
    // 5. 模拟边缘光效
    position: 'relative',
    overflow: 'hidden'
    
    // 如果支持，可以添加伪元素模拟高光
    // (实际预览中可通过base64图片实现)
  }
};
