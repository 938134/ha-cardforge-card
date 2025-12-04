// 水墨主题
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '中国风水墨画效果',
  icon: '🎑',
  
  variables: {
    '--cf-primary-color': '#2c3e50',
    '--cf-accent-color': '#8e44ad',
    '--cf-background': '#f5f5f5',
    '--cf-surface': '#ffffff',
    '--cf-border': '#dcdcdc',
    '--cf-text-primary': '#2c3e50',
    '--cf-text-secondary': '#7f8c8d'
  },
  
  styles: `
    .cardforge-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
      font-family: 'Noto Serif SC', 'SimSun', serif;
      border: 1px solid rgba(220, 220, 220, 0.8);
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    color: '#2c3e50',
    border: '1px solid rgba(220, 220, 220, 0.8)'
  }
};
