// src/themes/glass-theme.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const glassTheme = css`
  .theme-glass {
    position: relative;
    background: linear-gradient(135deg, 
      rgba(var(--rgb-primary-background-color), 0.25) 0%, 
      rgba(var(--rgb-primary-background-color), 0.15) 50%,
      rgba(var(--rgb-primary-background-color), 0.1) 100%);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
    color: var(--primary-text-color);
  }
  
  .theme-glass:hover {
    backdrop-filter: blur(30px) saturate(200%);
    -webkit-backdrop-filter: blur(30px) saturate(200%);
    border-color: rgba(var(--rgb-primary-text-color), 0.25);
  }
  
  /* 毛玻璃主题变体 */
  .theme-glass.variant-1 {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 100%);
  }
  
  .theme-glass.variant-2 {
    background: linear-gradient(135deg, 
      rgba(0, 0, 0, 0.3) 0%, 
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.1) 100%);
  }
  
  /* 毛玻璃主题下的交互元素 */
  .theme-glass .cardforge-interactive:hover {
    background: rgba(var(--rgb-primary-text-color), 0.1);
  }
  
  .theme-glass .cardforge-status-on {
    color: var(--success-color);
  }
  
  .theme-glass .cardforge-status-off {
    color: var(--disabled-color);
  }
  
  .theme-glass .cardforge-status-unavailable {
    color: var(--error-color);
  }
  
  /* 毛玻璃主题装饰元素 */
  .theme-glass .circle {
    background: rgba(var(--rgb-primary-text-color), 0.08);
  }
`;
