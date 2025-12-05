// 霓虹主题 - 使用设计系统变量
export const theme = {
  id: 'neon',
  name: '霓虹',
  description: '霓虹灯光效果，赛博朋克风格',
  icon: '💡',
  
  styles: `
    .cardforge-container {
      /* 使用设计系统的背景变量 */
      background: 
        radial-gradient(circle at 20% 30%, rgba(var(--cf-primary-color-rgb), 0.1) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(var(--cf-accent-color-rgb), 0.1) 0%, transparent 40%),
        var(--cf-background);
      
      /* 使用设计系统的边框变量 */
      border: 1px solid rgba(var(--cf-primary-color-rgb), 0.4);
      box-shadow: 
        0 0 30px rgba(var(--cf-primary-color-rgb), 0.3),
        0 0 60px rgba(var(--cf-accent-color-rgb), 0.2),
        inset 0 0 30px rgba(var(--cf-primary-color-rgb), 0.1);
      
      position: relative;
      overflow: hidden;
    }
    
    /* 霓虹光晕动画 */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: 
        radial-gradient(circle, rgba(var(--cf-primary-color-rgb), 0.15) 0%, transparent 70%),
        radial-gradient(circle, rgba(var(--cf-accent-color-rgb), 0.1) 0%, transparent 70%);
      animation: neon-rotate 20s linear infinite;
      pointer-events: none;
      z-index: 0;
    }
    
    @keyframes neon-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* 网格线效果 */
    .cardforge-container::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(rgba(var(--cf-primary-color-rgb), 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(var(--cf-primary-color-rgb), 0.05) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
      z-index: 1;
    }
    
    /* 确保内容在光晕之上 */
    .cardforge-container > * {
      position: relative;
      z-index: 2;
    }
    
    /* 霓虹主题下的块样式 */
    .cardforge-container .area-header {
      background: rgba(var(--cf-primary-color-rgb), 0.1);
      border-left: 3px solid rgba(var(--cf-primary-color-rgb), 0.8);
      box-shadow: 
        inset 0 0 10px rgba(var(--cf-primary-color-rgb), 0.2),
        0 0 15px rgba(var(--cf-primary-color-rgb), 0.3);
    }
    
    .cardforge-container .area-content {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(var(--cf-accent-color-rgb), 0.3);
      box-shadow: 
        inset 0 0 8px rgba(var(--cf-accent-color-rgb), 0.15),
        0 0 10px rgba(var(--cf-accent-color-rgb), 0.2);
    }
    
    .cardforge-container .area-footer {
      background: rgba(var(--cf-accent-color-rgb), 0.08);
      border-top: 1px solid rgba(var(--cf-accent-color-rgb), 0.4);
      box-shadow: 
        inset 0 0 5px rgba(var(--cf-accent-color-rgb), 0.1),
        0 0 8px rgba(var(--cf-accent-color-rgb), 0.15);
    }
    
    .cardforge-container .block-icon {
      background: rgba(var(--cf-primary-color-rgb), 0.2);
      color: var(--cf-primary-color);
      box-shadow: 
        0 0 8px rgba(var(--cf-primary-color-rgb), 0.4),
        inset 0 0 4px rgba(255, 255, 255, 0.1);
    }
    
    .cardforge-container .block-name {
      color: color-mix(in srgb, var(--cf-text-secondary), var(--cf-primary-color) 30%);
    }
    
    .cardforge-container .block-value {
      color: var(--cf-primary-color);
      text-shadow: 0 0 8px rgba(var(--cf-primary-color-rgb), 0.5);
    }
    
    /* 深色模式优化 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        box-shadow: 
          0 0 40px rgba(var(--cf-primary-color-rgb), 0.4),
          0 0 80px rgba(var(--cf-accent-color-rgb), 0.3),
          inset 0 0 40px rgba(var(--cf-primary-color-rgb), 0.15);
      }
      
      .cardforge-container .area-content {
        background: rgba(0, 0, 0, 0.3);
      }
      
      .cardforge-container .block-icon {
        box-shadow: 
          0 0 12px rgba(var(--cf-primary-color-rgb), 0.6),
          inset 0 0 6px rgba(255, 255, 255, 0.15);
      }
    }
    
    /* 响应式优化 */
    @container cardforge-container (max-width: 600px) {
      .cardforge-container::before {
        animation-duration: 30s;
      }
      
      .cardforge-container::after {
        background-size: 15px 15px;
      }
    }
    
    @container cardforge-container (max-width: 400px) {
      .cardforge-container {
        box-shadow: 
          0 0 20px rgba(var(--cf-primary-color-rgb), 0.3),
          0 0 40px rgba(var(--cf-accent-color-rgb), 0.2),
          inset 0 0 20px rgba(var(--cf-primary-color-rgb), 0.1);
      }
      
      .cardforge-container::before {
        animation: none;
      }
    }
  `,
  
  preview: {
    background: `
      radial-gradient(circle at 30% 30%, rgba(var(--cf-primary-color-rgb), 0.3) 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(var(--cf-accent-color-rgb), 0.2) 0%, transparent 60%),
      var(--cf-background)
    `,
    
    color: 'var(--cf-primary-color)',
    border: '1px solid rgba(var(--cf-primary-color-rgb), 0.5)',
    
    boxShadow: `
      0 0 15px rgba(var(--cf-primary-color-rgb), 0.6),
      0 0 30px rgba(var(--cf-accent-color-rgb), 0.4),
      inset 0 0 10px rgba(var(--cf-primary-color-rgb), 0.2),
      inset 0 0 20px rgba(var(--cf-accent-color-rgb), 0.1)
    `,
    
    backgroundImage: `
      radial-gradient(circle at 30% 30%, rgba(var(--cf-primary-color-rgb), 0.3) 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(var(--cf-accent-color-rgb), 0.2) 0%, transparent 60%),
      linear-gradient(rgba(var(--cf-primary-color-rgb), 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(var(--cf-primary-color-rgb), 0.1) 1px, transparent 1px),
      var(--cf-background)
    `,
    
    backgroundSize: 'auto, auto, 10px 10px, 10px 10px',
    backgroundBlendMode: 'screen'
  }
};
