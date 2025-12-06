// 自动主题 - 修复版
export const theme = {
  id: 'auto',
  name: '自动',
  description: '跟随系统主题，无额外样式',
  icon: '⚙️',
  
  styles: `
    /* 自动主题 - 使用设计系统变量 */
    .cardforge-container {
      background: var(--cf-background);
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-md);
      transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
      box-shadow: var(--cf-shadow-sm);
    }
  `,
  
  preview: {
    background: 'var(--cf-background)',
    border: '1px solid var(--cf-border)',
    boxShadow: 'var(--cf-shadow-sm)'
  }
};