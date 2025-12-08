// themes/auto-theme.js - 修复版（使用 CSSResult）
import { css } from 'lit';

export const theme = {
  id: 'auto',
  name: '自动',
  description: '跟随系统主题，无额外样式',
  icon: '⚙️',
  
  styles: css`
    /* 自动主题 - 仅使用设计系统变量，无额外样式 */
    .cardforge-container {
      background: var(--cf-background) !important;
      border: 1px solid var(--cf-border) !important;
      border-radius: var(--cf-radius-md) !important;
    }
    
    /* 使用设计系统的文字颜色变量 */
    .cardforge-container .card-title {
      color: var(--cf-text-primary) !important;
      font-weight: var(--cf-font-weight-bold);
    }
    
    .cardforge-container .card-subtitle {
      color: var(--cf-text-secondary) !important;
      font-weight: var(--cf-font-weight-medium);
    }
    
    .cardforge-container .card-caption {
      color: var(--cf-text-tertiary) !important;
    }
    
    .cardforge-container .card-emphasis {
      color: var(--cf-primary-color) !important;
      font-weight: var(--cf-font-weight-semibold);
    }
  `,
  
  preview: {
    background: 'var(--cf-background)',
    border: '1px solid var(--cf-border)'
  }
};