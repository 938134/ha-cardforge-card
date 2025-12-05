// 霓虹主题 - 完全使用设计系统变量
export const theme = {
  id: 'neon',
  name: '霓虹',
  description: '霓虹灯光效果，赛博朋克风格',
  icon: '💡',

  styles: `
    .cardforge-container {
      /* 使用设计系统的主色和强调色创建霓虹效果 */
      background: 
        radial-gradient(circle at 20% 30%, 
          rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.1) 0%, 
          transparent 40%),
        radial-gradient(circle at 80% 70%, 
          rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.1) 0%, 
          transparent 40%),
        var(--cf-background, #0a0a14);
      
      border: 1px solid rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.4);
      box-shadow: 
        0 0 30px rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.3),
        0 0 60px rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.2),
        inset 0 0 30px rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.1);
      position: relative;
      overflow: hidden;
    }
    
    /* 霓虹光晕动画 - 使用设计系统颜色 */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: 
        radial-gradient(circle, rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.15) 0%, transparent 70%),
        radial-gradient(circle, rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.1) 0%, transparent 70%);
      animation: neon-rotate 20s linear infinite;
      pointer-events: none;
      z-index: 0;
    }
    
    @keyframes neon-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* 网格线效果 - 使用设计系统主色 */
    .cardforge-container::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.05) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
      z-index: 1;
    }
    
    /* 确保内容在光晕之上 */
    .cardforge-container > * {
      position: relative;
      z-index: 2;
    }
    
    /* 深色模式优化 - 使用更强烈的发光效果 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        box-shadow: 
          0 0 40px rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.4),
          0 0 80px rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.3),
          inset 0 0 40px rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.15);
      }
      
      /* 深色模式下调整网格透明度 */
      .cardforge-container::after {
        background-image: 
          linear-gradient(rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.08) 1px, transparent 1px);
      }
    }
  `,
  
  preview: {
    // 预览完全使用设计系统变量
    background: `
      radial-gradient(circle at 30% 30%, 
        rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.3) 0%, 
        transparent 60%),
      radial-gradient(circle at 70% 70%, 
        rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.2) 0%, 
        transparent 60%),
      var(--cf-background, #0a0a14)
    `,
    color: 'var(--cf-primary-color, #00ffff)',
    border: '1px solid rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.5)',
    borderColor: 'rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.5)',
    boxShadow: `
      0 0 15px rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.6),
      0 0 30px rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.4),
      inset 0 0 10px rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.2),
      inset 0 0 20px rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.1)
    `,
    backgroundImage: `
      radial-gradient(circle at 30% 30%, 
        rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.3) 0%, 
        transparent 60%),
      radial-gradient(circle at 70% 70%, 
        rgba(var(--cf-accent-color-rgb, 255, 0, 255), 0.2) 0%, 
        transparent 60%),
      linear-gradient(rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(var(--cf-primary-color-rgb, 0, 255, 255), 0.1) 1px, transparent 1px),
      var(--cf-background, #0a0a14)
    `,
    backgroundSize: 'auto, auto, 10px 10px, 10px 10px',
    backgroundBlendMode: 'screen'
  }
};
