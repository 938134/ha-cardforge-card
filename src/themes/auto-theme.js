// src/themes/auto-theme.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const autoTheme = css`
  .theme-auto {
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color);
  }
  
  .theme-auto:hover {
    background: var(--card-background-color);
  }
  
  /* 自动主题下的交互元素 */
  .theme-auto .cardforge-interactive:hover {
    background: rgba(var(--rgb-primary-color), 0.1);
  }
  
  .theme-auto .cardforge-status-on {
    color: var(--success-color);
  }
  
  .theme-auto .cardforge-status-off {
    color: var(--disabled-color);
  }
  
  .theme-auto .cardforge-status-unavailable {
    color: var(--error-color);
  }
`;
