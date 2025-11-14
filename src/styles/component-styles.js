// src/styles/component-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const componentStyles = css`
  /* ===== 智能输入框组件 ===== */
  .smart-input-container {
    position: relative;
    margin-bottom: var(--cardforge-spacing-md);
  }
  
  .smart-input-label {
    display: block;
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
    margin-bottom: var(--cardforge-spacing-sm);
  }
  
  .smart-input-wrapper {
    display: flex;
    align-items: stretch;
    border-radius: var(--cardforge-radius-md);
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    transition: all var(--cardforge-duration-fast) ease;
    overflow: hidden;
  }
  
  .smart-input-wrapper:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.1);
  }
  
  .smart-input-wrapper.entity {
    border-color: rgba(76, 175, 80, 0.6);
    background: rgba(76, 175, 80, 0.05);
  }
  
  .smart-input-wrapper.jinja {
    border-color: rgba(255, 152, 0, 0.6);
    background: rgba(255, 152, 0, 0.05);
  }
  
  .smart-input-wrapper.text {
    border-color: rgba(33, 150, 243, 0.6);
    background: rgba(33, 150, 243, 0.05);
  }
  
  .input-icon {
    display: flex;
    align-items: center;
    padding: 0 var(--cardforge-spacing-sm);
    background: rgba(0, 0, 0, 0.03);
    border-right: 1px solid var(--divider-color);
    font-size: 1.1em;
  }
  
  .smart-input-field {
    flex: 1;
    --mdc-text-field-fill-color: transparent;
    --mdc-text-field-ink-color: var(--primary-text-color);
  }
  
  .input-dropdown-button {
    background: none;
    border: none;
    padding: 0 var(--cardforge-spacing-sm);
    cursor: pointer;
    color: var(--secondary-text-color);
    transition: color var(--cardforge-duration-fast) ease;
    display: flex;
    align-items: center;
  }
  
  .input-dropdown-button:hover {
    color: var(--primary-color);
    background: rgba(0, 0, 0, 0.05);
  }
  
  /* 实时预览区域 */
  .input-preview {
    margin-top: var(--cardforge-spacing-xs);
    padding: var(--cardforge-spacing-sm);
    background: var(--secondary-background-color);
    border-radius: var(--cardforge-radius-sm);
    font-size: 0.8em;
    display: flex;
    align-items: center;
    gap: var(--cardforge-spacing-sm);
    border: 1px solid var(--divider-color);
  }
  
  .preview-label {
    color: var(--secondary-text-color);
    font-weight: 500;
    font-size: 0.75em;
  }
  
  .preview-value {
    color: var(--primary-text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    flex: 1;
  }
  
  .type-badge {
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .type-badge.entity {
    background: rgba(76, 175, 80, 0.15);
    color: #2e7d32;
  }
  
  .type-badge.jinja {
    background: rgba(255, 152, 0, 0.15);
    color: #ef6c00;
  }
  
  .type-badge.text {
    background: rgba(33, 150, 243, 0.15);
    color: #1565c0;
  }
  
  /* ===== 实体选择器 ===== */
  .entity-picker-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: var(--cardforge-radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 4px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .entity-search {
    padding: var(--cardforge-spacing-sm);
    border-bottom: 1px solid var(--divider-color);
  }
  
  .entity-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .entity-item {
    padding: var(--cardforge-spacing-sm);
    cursor: pointer;
    border-bottom: 1px solid var(--divider-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .entity-item:hover {
    background: rgba(var(--rgb-primary-color), 0.1);
  }
  
  .entity-name {
    font-weight: 500;
    font-size: 0.85em;
  }
  
  .entity-id {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    font-family: monospace;
  }
  
  .entity-state {
    font-size: 0.8em;
    color: var(--primary-color);
  }
  
  /* ===== 配置区块 ===== */
  .config-section {
    background: var(--card-background-color);
    border-radius: var(--cardforge-radius-lg);
    padding: var(--cardforge-spacing-lg);
    margin-bottom: var(--cardforge-spacing-lg);
    border: 1px solid var(--divider-color);
  }
  
  .config-section-header {
    display: flex;
    align-items: center;
    gap: var(--cardforge-spacing-sm);
    margin-bottom: var(--cardforge-spacing-md);
    font-weight: 600;
    color: var(--primary-text-color);
  }
  
  .config-hint {
    color: var(--secondary-text-color);
    font-size: 0.85em;
    margin-top: var(--cardforge-spacing-sm);
    line-height: 1.4;
  }
`;
