// src/styles/card-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const cardStyles = css`
  /* 卡片容器样式 */
  .cardforge-container {
    position: relative;
    min-height: 80px;
  }
  
  /* 错误状态样式 */
  .error-container {
    padding: 20px;
    text-align: center;
    color: var(--error-color);
  }
  
  .error-icon {
    font-size: 2em;
    margin-bottom: 8px;
  }
  
  .error-title {
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .error-message {
    font-size: 0.9em;
    opacity: 0.8;
  }
  
  /* 加载状态样式 */
  .loading-container {
    padding: 40px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  
  .loading-text {
    margin-top: 8px;
  }
  
  /* 卡片通用样式 */
  .cardforge-card {
    position: relative;
    font-family: var(--paper-font-common-nowrap_-_font-family);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: default;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .cardforge-interactive { 
    cursor: pointer; 
    transition: all 0.2s ease; 
  }
  
  .cardforge-interactive:hover { 
    opacity: 0.8; 
  }
  
  .cardforge-interactive:active { 
    transform: scale(0.98); 
  }
  
  .cardforge-status-on { 
    color: var(--success-color); 
  }
  
  .cardforge-status-off { 
    color: var(--disabled-color); 
  }
  
  .cardforge-status-unavailable { 
    color: var(--error-color); 
    opacity: 0.5; 
  }
  
  /* 卡片悬停效果 */
  .cardforge-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  /* 响应式优化 */
  @media (max-width: 480px) {
    .cardforge-container {
      min-height: 60px;
    }
    
    .error-container {
      padding: 16px;
    }
    
    .loading-container {
      padding: 30px;
    }
    
    .error-icon {
      font-size: 1.5em;
    }
  }
  
  @media (max-width: 360px) {
    .error-container {
      padding: 12px;
    }
    
    .loading-container {
      padding: 20px;
    }
  }
`;