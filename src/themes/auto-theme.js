// 自动主题 - 极简版（已完美使用变量）
export const theme = {
  id: 'auto',
  name: '自动',
  description: '跟随系统主题，无额外样式',
  icon: '⚙️',
  
  // 注意：没有styles，完全依赖design-system.js的默认变量
  
  styles: `
    /* 自动主题不需要额外样式，完全依赖设计系统变量 */
    .cardforge-container {
      background: var(--cf-background);
      transition: background-color var(--cf-transition-duration-normal) var(--cf-easing-standard), 
                  color var(--cf-transition-duration-normal) var(--cf-easing-standard);
    }
  `,
  
  preview: {
    background: 'var(--cf-background)',
    color: 'var(--cf-text-primary)',
    border: 'none',
    boxShadow: 'none',
    
    '@media (prefers-color-scheme: dark)': {
      background: 'var(--cf-background)',
      color: 'var(--cf-text-primary)'
    }
  }
};
