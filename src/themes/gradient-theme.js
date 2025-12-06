// themes/gradient-theme.js - 使用设计系统重构版
export const theme = {
  id: 'gradient',
  name: '渐变',
  description: '时尚渐变背景，Material Design配色',
  icon: '🌈',
  
  // 渐变主题变量
  variables: {
    '--gradient-primary': 'var(--cf-primary-color)',
    '--gradient-accent': 'var(--cf-accent-color)',
    '--gradient-error': 'var(--cf-error-color)',
    '--gradient-warning': 'var(--cf-warning-color)',
    '--gradient-duration': '15s',
    '--gradient-border-opacity': '0.25',
    '--gradient-blur': '5px'
  },
  
  // 深色模式变量
  darkVariables: {
    '--gradient-primary': 'color-mix(in srgb, var(--cf-primary-color), black 30%)',
    '--gradient-accent': 'color-mix(in srgb, var(--cf-accent-color), black 20%)',
    '--gradient-warning': 'color-mix(in srgb, var(--cf-warning-color), black 20%)'
  },
  
  styles: `
    .cardforge-container {
      /* 动态渐变背景 */
      background: linear-gradient(135deg, 
        var(--gradient-primary) 0%, 
        color-mix(in srgb, var(--gradient-primary), var(--gradient-accent) 25%) 25%,
        var(--gradient-accent) 50%, 
        color-mix(in srgb, var(--gradient-accent), var(--gradient-error) 25%) 75%, 
        var(--gradient-error) 100%);
      
      /* 背景动画 */
      background-size: 400% 400%;
      animation: gradient-shift var(--gradient-duration) ease infinite;
      
      /* 玻璃效果叠加 */
      backdrop-filter: blur(var(--gradient-blur));
      -webkit-backdrop-filter: blur(var(--gradient-blur));
      
      /* 渐变边框 */
      border: 1px solid rgba(255, 255, 255, var(--gradient-border-opacity));
      
      /* 确保内容可读 */
      position: relative;
      overflow: hidden;
    }
    
    /* 渐变背景动画 */
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* 内容区域遮罩，提高可读性 */
    .card-wrapper::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(2px);
      z-index: 1;
    }
    
    .card-content {
      position: relative;
      z-index: 2;
    }
    
    /* 文字效果 */
    .card-title {
      background: linear-gradient(45deg, 
        var(--gradient-primary), 
        var(--gradient-accent),
        var(--gradient-error));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      background-size: 200% 100%;
      animation: text-gradient 8s ease infinite alternate;
    }
    
    @keyframes text-gradient {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    
    .card-subtitle {
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .card-caption {
      color: rgba(255, 255, 255, 0.7);
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 768px) {
      :host {
        --gradient-blur: 3px;
      }
      
      .cardforge-container {
        background-size: 300% 300%;
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        background-size: 200% 200%;
      }
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color), var(--cf-error-color))',
    animation: 'gradient-shift 15s ease infinite',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(5px)'
  }
};