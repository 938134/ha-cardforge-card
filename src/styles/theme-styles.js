// src/styles/theme-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const themeStyles = css`
  /* ===== 主题系统 ===== */
  .theme-auto {
    background: var(--card-background-color);
    color: var(--primary-text-color);
  }
  
  .theme-glass {
    background: linear-gradient(135deg, 
      rgba(var(--rgb-primary-background-color), 0.25) 0%, 
      rgba(var(--rgb-primary-background-color), 0.15) 50%,
      rgba(var(--rgb-primary-background-color), 0.1) 100%);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
    color: var(--primary-text-color);
  }
  
  .theme-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-size: 200% 200%;
    animation: gradientShift 8s ease infinite;
    color: white;
  }
  
  .theme-neon {
    background: #1a1a1a;
    color: #00ff88;
    border: 1px solid #00ff88;
    animation: neonPulse 2s ease-in-out infinite;
  }
  
  /* ===== 主题动画 ===== */
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
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
`;
