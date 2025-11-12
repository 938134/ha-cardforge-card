// src/core/shared-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const sharedStyles = css`
  .config-header {
    margin-bottom: 16px;
    font-size: 1em;
    font-weight: 600;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .entity-row {
    display: grid;
    grid-template-columns: 120px 1fr auto;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--card-background-color);
    border-radius: 8px;
  }
  
  .entity-label {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
  }
  
  .entity-picker-container {
    min-width: 200px;
    width: 100%;
  }
  
  .entity-picker-container ha-entity-picker {
    width: 100%;
    --mdc-text-field-fill-color: var(--card-background-color);
    --mdc-text-field-label-ink-color: var(--secondary-text-color);
    --mdc-text-field-ink-color: var(--primary-text-color);
  }
  
  /* 原生选择器样式 - 与 ha-select 保持一致 */
  .native-entity-picker {
    width: 100%;
  }
  
  .entity-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background-color: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 0.9em;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
  }
  
  .entity-select:hover {
    border-color: var(--primary-color);
  }
  
  .entity-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.1);
  }
  
  .entity-select option {
    background-color: var(--card-background-color);
    color: var(--primary-text-color);
    padding: 8px;
  }
  
  .required-star {
    color: var(--error-color);
    margin-left: 4px;
  }
  
  .config-hint {
    color: var(--secondary-text-color);
    font-size: 0.85em;
    margin-top: 16px;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--secondary-text-color);
  }
  
  .plugin-theme-info {
    margin-bottom: 16px;
  }
  
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
  
  .search-header {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    align-items: center;
  }
  
  /* 搜索输入框样式 */
  .search-header ha-textfield {
    --mdc-text-field-fill-color: var(--card-background-color);
    --mdc-text-field-label-ink-color: var(--secondary-text-color);
    --mdc-text-field-ink-color: var(--primary-text-color);
    --mdc-text-field-outlined-idle-border-color: var(--divider-color);
    --mdc-text-field-outlined-hover-border-color: var(--primary-color);
  }
  
  /* 分类选择器样式 */
  .search-header ha-select {
    --mdc-menu-min-width: 120px;
    --mdc-theme-primary: var(--primary-color);
  }
  
  .search-header ha-select::part(select) {
    background-color: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    color: var(--primary-text-color);
  }
  
  .plugin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .plugin-card {
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    position: relative;
  }
  
  .plugin-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .plugin-card.selected {
    border-color: var(--primary-color);
  }
  
  .plugin-content {
    padding: 16px;
    text-align: center;
    position: relative;
  }
  
  .featured-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: var(--accent-color);
    color: white;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.7em;
    font-weight: 500;
  }
  
  .plugin-category {
    position: absolute;
    top: 8px;
    right: 8px;
    background: var(--primary-color);
    color: white;
    border-radius: 8px;
    padding: 2px 8px;
    font-size: 0.7em;
    font-weight: 500;
  }
  
  .plugin-icon {
    font-size: 2.5em;
    margin: 12px 0;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .plugin-name {
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 0.95em;
    color: var(--primary-text-color);
    line-height: 1.2;
  }
  
  .plugin-description {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    line-height: 1.3;
    height: 36px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 8px;
  }
  
  .plugin-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75em;
    color: var(--disabled-text-color);
  }
`;
