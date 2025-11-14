// src/styles/layout-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const layoutStyles = css`
  /* ===== 编辑器布局 ===== */
  .editor-container {
    padding: var(--cardforge-spacing-md);
  }
  
  .editor-section {
    background: var(--card-background-color);
    border-radius: var(--cardforge-radius-lg);
    padding: var(--cardforge-spacing-lg);
    margin-bottom: var(--cardforge-spacing-lg);
    border: 1px solid var(--divider-color);
  }
  
  .editor-section-title {
    display: flex;
    align-items: center;
    gap: var(--cardforge-spacing-sm);
    margin-bottom: var(--cardforge-spacing-md);
    font-weight: 600;
    color: var(--primary-text-color);
    font-size: 1.1em;
  }
  
  .editor-section-content {
    display: flex;
    flex-direction: column;
    gap: var(--cardforge-spacing-md);
  }
  
  /* ===== 卡片布局 ===== */
  .cardforge-card {
    position: relative;
    border-radius: var(--ha-card-border-radius, 12px);
    overflow: hidden;
    transition: all var(--cardforge-duration-normal) ease;
  }
  
  .cardforge-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  /* ===== 表单布局 ===== */
  .form-row {
    margin-bottom: var(--cardforge-spacing-md);
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--cardforge-spacing-sm);
    margin-top: var(--cardforge-spacing-lg);
    padding-top: var(--cardforge-spacing-md);
    border-top: 1px solid var(--divider-color);
  }
`;
