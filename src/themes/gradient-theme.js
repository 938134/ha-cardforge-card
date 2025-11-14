// src/themes/gradient-theme.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const gradientTheme = css`
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .theme-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-size: 200% 200%;
    color: white;
    border: none;
    animation: gradientShift 6s ease infinite;
  }
  
  .theme-gradient:hover {
    background-size: 220% 220%;
  }
  
  /* 渐变主题变体 */
  .theme-gradient.variant-1 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  .theme-gradient.variant-2 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  .theme-gradient.variant-3 {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
  
  .theme-gradient.variant-4 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
  
  /* 渐变主题下的交互元素 */
  .theme-gradient .cardforge-interactive:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .theme-gradient .cardforge-status-on,
  .theme-gradient .cardforge-status-off,
  .theme-gradient .cardforge-status-unavailable {
    color: rgba(255, 255, 255, 0.9);
  }
  
  /* 渐变主题装饰元素 */
  .theme-gradient .circle {
    background: rgba(255, 255, 255, 0.15);
  }
`;
