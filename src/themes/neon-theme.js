// themes/neon-theme.js - 使用设计系统重构版
export const theme = {
  id: 'neon',
  name: '霓虹',
  description: '霓虹灯光效果，赛博朋克风格',
  icon: '💡',
  
  // 主题特定的CSS变量
  variables: {
    '--neon-glow-primary': 'rgba(var(--cf-primary-color-rgb), 0.4)',
    '--neon-glow-accent': 'rgba(var(--cf-accent-color-rgb), 0.3)',
    '--neon-border-opacity': '0.4',
    '--neon-shadow-intensity': '0.3',
    '--neon-inner-glow': 'rgba(var(--cf-primary-color-rgb), 0.1)'
  },
  
  // 深色模式变量
  darkVariables: {
    '--neon-glow-primary': 'rgba(var(--cf-primary-color-rgb), 0.6)',
    '--neon-glow-accent': 'rgba(var(--cf-accent-color-rgb), 0.4)',
    '--neon-border-opacity': '0.6',
    '--neon-shadow-intensity': '0.5',
    '--neon-inner-glow': 'rgba(var(--cf-primary-color-rgb), 0.15)'
  },
  
  styles: `
    .cardforge-container {
      /* 霓虹渐变背景 */
      background: 
        radial-gradient(circle at 20% 30%, rgba(var(--cf-primary-color-rgb), 0.1) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(var(--cf-accent-color-rgb), 0.1) 0%, transparent 40%),
        var(--cf-background);
      
      /* 霓虹边框 */
      border: 1px solid rgba(var(--cf-primary-color-rgb), var(--neon-border-opacity));
      
      /* 霓虹发光效果 */
      box-shadow: 
        0 0 30px var(--neon-glow-primary),
        0 0 60px var(--neon-glow-accent),
        inset 0 0 30px var(--neon-inner-glow);
      
      /* 动画效果 */
      animation: neon-pulse 4s ease-in-out infinite;
    }
    
    @keyframes neon-pulse {
      0%, 100% { 
        box-shadow: 
          0 0 30px var(--neon-glow-primary),
          0 0 60px var(--neon-glow-accent),
          inset 0 0 30px var(--neon-inner-glow);
      }
      50% { 
        box-shadow: 
          0 0 40px var(--neon-glow-primary),
          0 0 80px var(--neon-glow-accent),
          inset 0 0 40px var(--neon-inner-glow);
      }
    }
    
    /* 内容区域特殊效果 */
    .card-content {
      text-shadow: 0 0 10px rgba(var(--cf-primary-color-rgb), 0.3);
    }
    
    .card-title {
      text-shadow: 0 0 15px rgba(var(--cf-primary-color-rgb), 0.5);
    }
    
    .card-emphasis {
      text-shadow: 0 0 20px rgba(var(--cf-primary-color-rgb), 0.7);
      animation: text-glow 3s ease-in-out infinite alternate;
    }
    
    @keyframes text-glow {
      0% { text-shadow: 0 0 20px rgba(var(--cf-primary-color-rgb), 0.5); }
      100% { text-shadow: 0 0 25px rgba(var(--cf-primary-color-rgb), 0.8); }
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 768px) {
      .cardforge-container {
        box-shadow: 
          0 0 20px var(--neon-glow-primary),
          0 0 40px var(--neon-glow-accent),
          inset 0 0 20px var(--neon-inner-glow);
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        box-shadow: 
          0 0 15px var(--neon-glow-primary),
          0 0 30px var(--neon-glow-accent),
          inset 0 0 15px var(--neon-inner-glow);
      }
    }
  `,
  
  preview: {
    background: `
      radial-gradient(circle at 30% 30%, rgba(var(--cf-primary-color-rgb), 0.3) 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(var(--cf-accent-color-rgb), 0.2) 0%, transparent 60%),
      var(--cf-background)
    `,
    border: '1px solid rgba(var(--cf-primary-color-rgb), 0.4)',
    boxShadow: '0 0 20px rgba(var(--cf-primary-color-rgb), 0.3), 0 0 40px rgba(var(--cf-accent-color-rgb), 0.2)',
    animation: 'neon-pulse 4s ease-in-out infinite'
  }
};