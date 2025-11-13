// src/styles/theme-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const themeStyles = css`
  /* 主题动画定义 */
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
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
  
  @keyframes glassShine {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  /* 主题工具类 */
  .theme-auto {
    background: var(--card-background-color);
    color: var(--primary-text-color);
  }
  
  .theme-glass {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .theme-gradient {
    background-size: 200% 200%;
    animation: gradientShift 6s ease infinite;
  }
  
  .theme-neon {
    animation: neonPulse 2s ease-in-out infinite;
  }
  
  /* 主题预览组件 */
  .theme-preview {
    width: 60px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }
  
  .theme-preview:hover {
    transform: scale(1.05);
    border-color: var(--primary-color);
  }
  
  .theme-preview.active {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
  }
  
  .theme-preview.auto {
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
  }
  
  .theme-preview.glass {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      rgba(255, 255, 255, 0.1) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .theme-preview.gradient {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  .theme-preview.neon {
    background: #1a1a1a;
    border: 1px solid #00ff88;
    box-shadow: 0 0 8px #00ff88;
  }
  
  /* 主题选择器布局 */
  .theme-previews {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  
  .theme-selector {
    margin-bottom: 20px;
  }
`;