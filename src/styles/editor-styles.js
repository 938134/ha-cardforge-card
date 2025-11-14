// src/styles/editor-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const editorStyles = css`
  /* ===== 编辑器布局 ===== */
  .editor-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .editor-section {
    background: var(--card-background-color);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 16px;
    border: 1px solid var(--divider-color);
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-weight: 600;
    color: var(--primary-text-color);
  }
  
  .section-icon {
    font-size: 1.2em;
  }
  
  /* ===== 插件选择区域 ===== */
  .plugin-selector-section {
    background: linear-gradient(135deg, var(--primary-color) -20%, var(--card-background-color) 120%);
  }
  
  .plugin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  
  .plugin-card {
    padding: 16px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .plugin-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
  }
  
  .plugin-card.selected {
    background: var(--primary-color);
    color: white;
  }
  
  .plugin-icon {
    font-size: 2em;
    margin-bottom: 8px;
  }
  
  .plugin-name {
    font-size: 0.9em;
    font-weight: 500;
  }
  
  /* ===== 主题选择区域 ===== */
  .theme-selector-section {
    background: var(--card-background-color);
  }
  
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  
  .theme-card {
    padding: 16px;
    border-radius: 8px;
    border: 2px solid var(--divider-color);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }
  
  .theme-card:hover {
    border-color: var(--primary-color);
  }
  
  .theme-card.selected {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.05);
  }
  
  .theme-preview {
    width: 100%;
    height: 60px;
    border-radius: 6px;
    margin-bottom: 8px;
    border: 1px solid var(--divider-color);
  }
  
  .theme-name {
    font-size: 0.85em;
    font-weight: 500;
  }
  
  /* ===== 数据源配置区域 ===== */
  .datasource-section {
    background: var(--card-background-color);
  }
  
  .datasource-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .datasource-item {
    padding: 16px;
    border-radius: 8px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
    border: 1px solid var(--divider-color);
  }
  
  .datasource-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .datasource-icon {
    font-size: 1.1em;
  }
  
  .datasource-title {
    font-weight: 500;
    color: var(--primary-text-color);
  }
  
  .datasource-required {
    color: var(--error-color);
    font-size: 0.8em;
  }
  
  .datasource-description {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-bottom: 12px;
    line-height: 1.4;
  }
  
  /* ===== 预览区域 ===== */
  .preview-section {
    background: var(--card-background-color);
  }
  
  .preview-container {
    padding: 20px;
    border-radius: 8px;
    background: var(--secondary-background-color);
    border: 1px solid var(--divider-color);
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .preview-placeholder {
    color: var(--secondary-text-color);
    text-align: center;
  }
  
  /* ===== 操作按钮 ===== */
  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }
  
  /* ===== 响应式优化 ===== */
  @media (max-width: 600px) {
    .editor-layout {
      gap: 12px;
    }
    
    .editor-section {
      padding: 12px;
    }
    
    .plugin-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 8px;
    }
    
    .theme-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .action-buttons mwc-button {
      width: 100%;
    }
  }
  
  @media (max-width: 400px) {
    .plugin-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .theme-grid {
      grid-template-columns: 1fr;
    }
  }
`;