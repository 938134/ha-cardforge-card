// src/styles/shared-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const sharedStyles = css`
  /* ===== CSS变量定义 ===== */
  :root {
    /* 间距系统 */
    --cardforge-spacing-xs: 4px;
    --cardforge-spacing-sm: 8px;
    --cardforge-spacing-md: 16px;
    --cardforge-spacing-lg: 24px;
    --cardforge-spacing-xl: 32px;
    
    /* 圆角系统 */
    --cardforge-radius-sm: 4px;
    --cardforge-radius-md: 8px;
    --cardforge-radius-lg: 12px;
    
    /* 动画时长 */
    --cardforge-duration-fast: 0.15s;
    --cardforge-duration-normal: 0.3s;
    --cardforge-duration-slow: 0.5s;
  }

  /* ===== 基础工具类 ===== */
  .cardforge-flex { display: flex; }
  .cardforge-flex-column { display: flex; flex-direction: column; }
  .cardforge-flex-center { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .cardforge-text-center { text-align: center; }
  .cardforge-full-width { width: 100%; }
  
  /* ===== 布局工具 ===== */
  .cardforge-section {
    margin-bottom: var(--cardforge-spacing-lg);
    padding: var(--cardforge-spacing-md);
    background: var(--card-background-color);
    border-radius: var(--cardforge-radius-lg);
    border: 1px solid var(--divider-color);
  }
  
  .cardforge-section-header {
    display: flex;
    align-items: center;
    gap: var(--cardforge-spacing-sm);
    margin-bottom: var(--cardforge-spacing-md);
    font-weight: 600;
    color: var(--primary-text-color);
    font-size: 1.1em;
  }
  
  .cardforge-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--cardforge-spacing-md);
  }
  
  /* ===== 响应式工具 ===== */
  @media (max-width: 768px) {
    .cardforge-grid-2 {
      grid-template-columns: 1fr;
      gap: var(--cardforge-spacing-sm);
    }
    
    .cardforge-section {
      padding: var(--cardforge-spacing-sm);
      margin-bottom: var(--cardforge-spacing-md);
    }
  }
  
  @media (max-width: 480px) {
    :root {
      --cardforge-spacing-md: 12px;
      --cardforge-spacing-lg: 20px;
    }
  }
`;
