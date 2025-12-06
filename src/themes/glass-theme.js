// themes/glass-theme.js - 使用设计系统重构版
export const theme = {
  id: 'glass',
  name: '毛玻璃',
  description: '半透明磨砂玻璃效果',
  icon: '🔮',
  
  // 毛玻璃变量
  variables: {
    '--glass-opacity-light': '0.1',
    '--glass-opacity-dark': '0.05',
    '--glass-blur-amount': '20px',
    '--glass-saturation': '180%',
    '--glass-border-opacity-light': '0.2',
    '--glass-border-opacity-dark': '0.15'
  },
  
  // 深色模式变量
  darkVariables: {
    '--glass-opacity-light': '0.08',
    '--glass-opacity-dark': '0.03',
    '--glass-border-opacity-light': '0.15',
    '--glass-border-opacity-dark': '0.1'
  },
  
  styles: `
    .cardforge-container {
      /* 毛玻璃背景 */
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, var(--glass-opacity-light)) 0%, 
        rgba(255, 255, 255, var(--glass-opacity-dark)) 100%);
      
      /* 毛玻璃效果 */
      backdrop-filter: blur(var(--glass-blur-amount)) saturate(var(--glass-saturation));
      -webkit-backdrop-filter: blur(var(--glass-blur-amount)) saturate(var(--glass-saturation));
      
      /* 玻璃边框 */
      border: 1px solid rgba(255, 255, 255, var(--glass-border-opacity-light));
      
      /* 玻璃阴影 */
      box-shadow: var(--cf-shadow-md);
      
      /* 边缘发光效果 */
      position: relative;
      overflow: hidden;
    }
    
    /* 毛玻璃边缘高光 */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.3);
      z-index: 1;
    }
    
    /* 内容区域优化 */
    .card-content {
      position: relative;
      z-index: 2;
    }
    
    .card-title, .card-subtitle, .card-caption {
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    /* 响应式调整毛玻璃效果 */
    @container cardforge-container (max-width: 768px) {
      :host {
        --glass-blur-amount: 15px;
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      :host {
        --glass-blur-amount: 12px;
      }
    }
    
    /* 性能优化：在动画时减少模糊 */
    .cardforge-container:active {
      backdrop-filter: blur(10px) saturate(160%);
      -webkit-backdrop-filter: blur(10px) saturate(160%);
      transition: backdrop-filter var(--cf-transition-duration-fast) var(--cf-easing-standard),
                  -webkit-backdrop-filter var(--cf-transition-duration-fast) var(--cf-easing-standard);
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'var(--cf-shadow-md)'
  }
};