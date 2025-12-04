// 自动主题 - 极简版
export const theme = {
  id: 'auto',
  name: '自动',
  description: '跟随系统主题，无额外样式',
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
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    @media (prefers-color-scheme: dark) {
      :host {
        --cf-background: #1a1a1a;
        --cf-surface: #2d2d2d;
        --cf-border: #404040;
        --cf-text-primary: #e0e0e0;
        --cf-text-secondary: #a0a0a0;
      }
    }
  `,
  
  preview: {
    // 最简洁的预览：纯色背景，无任何装饰
    background: '#ffffff',
    color: '#212121',
    border: 'none',
    boxShadow: 'none',
    
    // 深色模式预览
    '@media (prefers-color-scheme: dark)': {
      background: '#1a1a1a',
      color: '#e0e0e0'
    }
  }
};