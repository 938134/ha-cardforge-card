// src/core/shared-styles.js (添加主题相关样式)
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
  
  /* 统一的 ha-select 样式 */
  .entity-picker-container ha-select {
    width: 100%;
    --mdc-theme-primary: var(--primary-color);
  }
  
  .entity-picker-container ha-entity-picker {
    width: 100%;
    --mdc-text-field-fill-color: var(--card-background-color);
    --mdc-text-field-label-ink-color: var(--secondary-text-color);
    --mdc-text-field-ink-color: var(--primary-text-color);
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
  
  /* 主题网格样式 */
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .theme-card {
    cursor: pointer;
    border: 2px solid var(--divider-color);
    border-radius: 12px;
    padding: 16px;
    background: var(--card-background-color);
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .theme-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .theme-card.selected {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.05);
  }
  
  .theme-preview {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    font-size: 1.5em;
    transition: all 0.3s ease;
  }
  
  /* 主题预览样式 */
  .theme-preview.auto {
    background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
    color: #333;
  }
  
  .theme-preview.light {
    background: #ffffff;
    color: #333;
    border: 1px solid #e0e0e0;
  }
  
  .theme-preview.dark {
    background: #1e1e1e;
    color: #ffffff;
  }
  
  .theme-preview.colorful {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
    color: white;
  }
  
  .theme-info {
    flex: 1;
  }
  
  .theme-name {
    font-weight: 600;
    font-size: 0.9em;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }
  
  .theme-description {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    line-height: 1.3;
  }
  
  .selected-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    color: var(--success-color);
    font-size: 1.2em;
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
