// src/styles/state-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const stateStyles = css`
  /* 空状态和加载状态 */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--secondary-text-color);
  }
  
  .empty-icon {
    font-size: 3em;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--primary-text-color);
  }
  
  .empty-description {
    font-size: 0.9em;
    line-height: 1.4;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .loading-container {
    padding: 40px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  
  .loading-text {
    margin-top: 8px;
  }
  
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
`;