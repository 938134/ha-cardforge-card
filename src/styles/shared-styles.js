// src/styles/shared-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const sharedStyles = css`
  /* ===== 基础配置样式 ===== */
  .config-header {
    margin-bottom: 16px;
    font-size: 1em;
    font-weight: 600;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .config-row {
    margin-bottom: 20px;
  }
  
  /* ===== 实体标签样式 ===== */
  .entity-label {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .required-star {
    color: var(--error-color);
    margin-left: 4px;
  }
  
  .entity-help {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    margin-top: 6px;
    line-height: 1.3;
  }
  
  /* ===== 表单控件样式 ===== */
  .entity-picker-container {
    min-width: 200px;
    width: 100%;
  }
  
  .entity-picker-container ha-select,
  ha-select {
    width: 100%;
    --mdc-theme-primary: var(--primary-color);
    --mdc-menu-min-width: 200px;
  }
  
  .entity-picker-container ha-combo-box,
  ha-combo-box {
    width: 100%;
    --ha-combo-box-background: var(--card-background-color);
    --ha-combo-box-text-color: var(--primary-text-color);
    --ha-combo-box-icon-color: var(--secondary-text-color);
    --ha-combo-box-border-color: var(--divider-color);
    --ha-combo-box-border-radius: 4px;
    --ha-combo-box-hover-border-color: var(--primary-color);
    --ha-combo-box-focused-border-color: var(--primary-color);
  }
  
  /* ===== 工具类样式 ===== */
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .text-center {
    text-align: center;
  }
  
  .flex-column {
    display: flex;
    flex-direction: column;
  }
  
  .flex-row {
    display: flex;
    align-items: center;
  }
  
  .grid-center {
    display: grid;
    place-items: center;
  }
  
  /* ===== 功能支持提示 ===== */
  .feature-supported, .feature-unsupported {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 0.9em;
  }
  
  .feature-supported {
    color: var(--success-color);
  }
  
  .feature-unsupported {
    color: var(--warning-color);
  }
  
  .plugin-theme-info {
    margin-bottom: 16px;
  }
  
  .config-hint {
    color: var(--secondary-text-color);
    font-size: 0.85em;
    margin-top: 16px;
  }
`;