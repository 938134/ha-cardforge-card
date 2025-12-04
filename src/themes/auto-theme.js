// 自动主题
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
    background: 'var(--card-background-color)',
    color: 'var(--primary-text-color)',
    border: '1px solid var(--divider-color)'
  }
};
