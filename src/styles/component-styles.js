// src/styles/component-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const componentStyles = css`
  /* 智能输入组件样式 */
  .smart-input-container {
    position: relative;
  }
  
  .smart-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
  }
  
  .smart-input:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.1);
  }
  
  .smart-input.entity {
    background: rgba(76, 175, 80, 0.05);
    border-color: rgba(76, 175, 80, 0.3);
  }
  
  .smart-input.jinja {
    background: rgba(255, 152, 0, 0.05);
    border-color: rgba(255, 152, 0, 0.3);
  }
  
  .smart-input.text {
    background: rgba(33, 150, 243, 0.05);
    border-color: rgba(33, 150, 243, 0.3);
  }
  
  .smart-input.empty {
    background: var(--card-background-color);
  }
  
  .input-icon {
    font-size: 1.1em;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }
  
  .smart-input ha-textfield {
    flex: 1;
    --mdc-text-field-fill-color: transparent;
    --mdc-text-field-label-ink-color: var(--secondary-text-color);
    --mdc-text-field-ink-color: var(--primary-text-color);
  }
  
  .type-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7em;
    font-weight: 600;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .type-badge.entity {
    background: rgba(76, 175, 80, 0.15);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  .type-badge.jinja {
    background: rgba(255, 152, 0, 0.15);
    color: #ef6c00;
    border: 1px solid rgba(255, 152, 0, 0.3);
  }
  
  .type-badge.text {
    background: rgba(33, 150, 243, 0.15);
    color: #1565c0;
    border: 1px solid rgba(33, 150, 243, 0.3);
  }
  
  .type-badge.empty {
    background: rgba(158, 158, 158, 0.15);
    color: #616161;
    border: 1px solid rgba(158, 158, 158, 0.3);
  }
  
  .value-preview {
    margin-top: 6px;
    padding: 6px 8px;
    background: var(--card-background-color);
    border-radius: 6px;
    font-size: 0.8em;
    display: flex;
    gap: 8px;
    align-items: center;
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
    font-size: 0.85em;
    flex: 1;
  }
  
  .input-hints {
    margin-top: 8px;
  }
  
  .hint-item {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    line-height: 1.4;
    margin-bottom: 2px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  
  .hint-item::before {
    content: '💡';
    font-size: 0.9em;
    flex-shrink: 0;
    margin-top: 1px;
  }
  
  .quick-examples {
    margin-top: 8px;
    padding: 8px;
    background: rgba(var(--rgb-primary-color), 0.05);
    border-radius: 6px;
    border: 1px solid rgba(var(--rgb-primary-color), 0.1);
  }
  
  .examples-title {
    font-size: 0.75em;
    font-weight: 600;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }
  
  .example-item {
    font-size: 0.7em;
    color: var(--secondary-text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    line-height: 1.3;
    margin-bottom: 2px;
  }

  /* ===== 实体选择器样式 ===== */
  .entity-picker-container {
    margin-bottom: 16px;
    position: relative;
  }
  
  .entity-picker-label {
    display: block;
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
    margin-bottom: 6px;
  }
  
  .entity-picker-required {
    color: var(--error-color);
    margin-left: 2px;
  }
  
  .entity-picker-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .entity-picker-field {
    flex: 1;
    --mdc-text-field-fill-color: var(--card-background-color);
  }
  
  .entity-picker-button {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0 12px;
    height: 56px;
    min-width: 60px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .entity-picker-button:hover {
    background: var(--accent-color);
  }
  
  .entity-picker-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 300px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 4px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .entity-picker-header {
    padding: 12px;
    border-bottom: 1px solid var(--divider-color);
    font-weight: 600;
    font-size: 0.9em;
  }
  
  .entity-picker-search {
    padding: 8px 12px;
  }
  
  .entity-picker-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .entity-picker-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.85em;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .entity-picker-item:hover {
    background: rgba(var(--rgb-primary-color), 0.1);
  }
  
  .entity-picker-name {
    font-weight: 500;
  }
  
  .entity-picker-id {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    font-family: monospace;
  }
  
  .entity-picker-state {
    font-size: 0.8em;
    color: var(--primary-color);
    margin-left: 8px;
  }
  
  .entity-picker-hint {
    margin-top: 4px;
    font-size: 0.8em;
    color: var(--secondary-text-color);
    line-height: 1.3;
    min-height: 1.2em;
  }
  
  .entity-picker-hint-content {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* 响应式优化 */
  @media (max-width: 480px) {
    .entity-picker-dropdown {
      width: 280px;
      right: -10px;
    }
    
    .entity-picker-wrapper {
      flex-direction: column;
      gap: 8px;
    }
    
    .entity-picker-button {
      width: 100%;
      height: 48px;
    }
  }

  @media (max-width: 360px) {
    .entity-picker-dropdown {
      width: 260px;
    }
  }
`;