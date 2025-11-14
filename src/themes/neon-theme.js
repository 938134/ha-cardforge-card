// src/themes/neon-theme.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const neonTheme = css`
  @keyframes neonPulse {
    0%, 100% {
      box-shadow: 
        0 0 8px #00ff88,
        inset 0 0 15px rgba(0, 255, 136, 0.1);
    }
    50% {
      box-shadow: 
        0 0 20px #00ff88,
        0 0 35px rgba(0, 255, 136, 0.3),
        inset 0 0 25px rgba(0, 255, 136, 0.2);
    }
  }
  
  .theme-neon {
    background: #1a1a1a;
    color: #00ff88;
    border: 1px solid #00ff88;
    animation: neonPulse 2s ease-in-out infinite;
  }
  
  .theme-neon:hover {
    animation-duration: 1s;
    box-shadow: 
      0 0 15px #00ff88,
      0 0 30px rgba(0, 255, 136, 0.4),
      inset 0 0 20px rgba(0, 255, 136, 0.2);
  }
  
  /* 霓虹主题变体 */
  .theme-neon.variant-1 {
    color: #ff6b6b;
    border-color: #ff6b6b;
  }
  
  .theme-neon.variant-2 {
    color: #4ecdc4;
    border-color: #4ecdc4;
  }
  
  .theme-neon.variant-3 {
    color: #ffd93d;
    border-color: #ffd93d;
  }
  
  .theme-neon.variant-4 {
    color: #6c5ce7;
    border-color: #6c5ce7;
  }
  
  /* 霓虹主题下的交互元素 */
  .theme-neon .cardforge-interactive:hover {
    background: rgba(0, 255, 136, 0.1);
  }
  
  .theme-neon .cardforge-status-on {
    color: #00ff88;
  }
  
  .theme-neon .cardforge-status-off {
    color: #666;
  }
  
  .theme-neon .cardforge-status-unavailable {
    color: #ff4444;
  }
  
  /* 霓虹主题装饰元素 */
  .theme-neon .circle {
    background: rgba(0, 255, 136, 0.1);
  }
`;
