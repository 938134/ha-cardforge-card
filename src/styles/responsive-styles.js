// src/styles/responsive-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const responsiveStyles = css`
  /* ===== 响应式设计系统 ===== */
  
  /* 桌面端优化 (768px+) */
  @media (min-width: 768px) {
    .editor-container {
      padding: var(--cardforge-spacing-lg);
    }
    
    .config-section {
      padding: var(--cardforge-spacing-xl);
    }
    
    .smart-input-container {
      margin-bottom: var(--cardforge-spacing-lg);
    }
  }
  
  /* 平板端优化 (480px - 767px) */
  @media (max-width: 767px) and (min-width: 481px) {
    .editor-container {
      padding: var(--cardforge-spacing-md);
    }
    
    .config-section {
      padding: var(--cardforge-spacing-lg);
    }
  }
  
  /* 移动端优化 (480px以下) */
  @media (max-width: 480px) {
    .editor-container {
      padding: var(--cardforge-spacing-sm);
    }
    
    .config-section {
      padding: var(--cardforge-spacing-md);
      margin-bottom: var(--cardforge-spacing-md);
    }
    
    .smart-input-wrapper {
      flex-direction: column;
    }
    
    .input-icon {
      border-right: none;
      border-bottom: 1px solid var(--divider-color);
      padding: var(--cardforge-spacing-sm);
    }
    
    .input-dropdown-button {
      padding: var(--cardforge-spacing-sm);
      border-top: 1px solid var(--divider-color);
    }
  }
  
  /* 超小屏幕优化 (360px以下) */
  @media (max-width: 360px) {
    .editor-container {
      padding: var(--cardforge-spacing-xs);
    }
    
    .config-section {
      padding: var(--cardforge-spacing-sm);
      border-radius: var(--cardforge-radius-md);
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
  
  /* 打印样式 */
  @media print {
    .cardforge-card {
      box-shadow: none !important;
      border: 1px solid #ccc !important;
    }
    
    .editor-container {
      padding: 0 !important;
    }
  }
`;
