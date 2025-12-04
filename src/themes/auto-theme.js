// 自动主题 - 优化预览效果
export const theme = {
  id: 'auto',
  name: '自动',
  description: '自动适配系统主题',
  icon: '⚙️',
  
  variables: {
    '--cf-primary-color': 'var(--primary-color, #03a9f4)',
    '--cf-accent-color': 'var(--accent-color, #ff4081)',
    '--cf-background': 'var(--card-background-color, #ffffff)',
    '--cf-surface': 'var(--card-background-color, #ffffff)',
    '--cf-border': 'var(--divider-color, #e0e0e0)',
    '--cf-text-primary': 'var(--primary-text-color, #212121)',
    '--cf-text-secondary': 'var(--secondary-text-color, #757575)'
  },
  
  styles: `
    .cardforge-container {
      background: var(--cf-background);
      border: 1px solid var(--cf-border);
      transition: all 0.3s ease;
    }
    
    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      :host {
        --cf-background: #1a1a1a;
        --cf-surface: #2d2d2d;
        --cf-border: #404040;
        --cf-text-primary: #e0e0e0;
        --cf-text-secondary: #a0a0a0;
      }
    }
    
    /* 主题切换动画 */
    .cardforge-container.theme-changing {
      animation: theme-pulse 0.6s ease;
    }
    
    @keyframes theme-pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `,
  
  preview: {
    // 自动主题预览应该显示明暗对比
    background: `
      linear-gradient(135deg, 
        #ffffff 0%, 
        #f5f5f5 50%, 
        #eeeeee 100%)
    `,
    
    // 添加明暗分割线效果
    backgroundImage: `
      linear-gradient(90deg, 
        transparent 49%, 
        rgba(0, 0, 0, 0.05) 49%, 
        rgba(0, 0, 0, 0.05) 51%, 
        transparent 51%
      )
    `,
    
    color: '#212121',
    border: '1px solid #e0e0e0',
    borderColor: '#e0e0e0',
    
    // 添加明暗对比效果
    boxShadow: `
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.9)
    `,
    
    // 添加"AUTO"文字指示
    backgroundImage: `
      linear-gradient(135deg, 
        #ffffff 0%, 
        #f5f5f5 50%, 
        #eeeeee 100%),
      url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='40' y='45' font-family='Arial' font-size='10' fill='rgba(33,33,33,0.1)' text-anchor='middle'%3EAUTO%3C/text%3E%3C/svg%3E")
    `,
    
    backgroundBlendMode: 'overlay'
  }
};