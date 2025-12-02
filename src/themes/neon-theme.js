// src/themes/neon.js

export const theme = {
  id: 'neon',
  name: '霓虹',
  description: '霓虹灯光效果',
  icon: '💡',
  
  variables: {
    '--cf-primary-color': '#00ffff',
    '--cf-accent-color': '#ff00ff',
    '--cf-background': '#1a1a2e',
    '--cf-surface': '#16213e',
    '--cf-border': 'rgba(0, 255, 255, 0.3)',
    '--cf-text-primary': '#e6e6e6',
    '--cf-text-secondary': '#a0a0a0',
    '--cf-block-bg': 'rgba(0, 255, 255, 0.1)'
  },
  
  styles: `
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3),
                0 0 40px rgba(0, 255, 255, 0.1),
                inset 0 0 20px rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
  `,
  
  preview: {
    background: '#1a1a2e',
    color: '#00ffff',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
  }
};
