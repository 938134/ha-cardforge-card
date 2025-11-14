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
  
  /* ===== 操作按钮 ===== */
  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }
  
  /* ===== 智能输入组件样式 ===== */
  .smart-input-container {
    position: relative;
    width: 100%;
  }
  
  .smart-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  
  .smart-input-field {
    flex: 1;
    --mdc-text-field-fill-color: var(--card-background-color);
  }
  
  .entity-button {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0 12px;
    height: 56px;
    min-width: 56px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1em;
    transition: all 0.2s ease;
  }
  
  .entity-button:hover {
    background: var(--accent-color);
  }
  
  .entity-picker-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 4px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .picker-header {
    padding: 12px;
    border-bottom: 1px solid var(--divider-color);
    font-weight: 600;
    font-size: 0.9em;
  }
  
  .picker-search-box {
    padding: 8px 12px;
  }
  
  .entity-list {
    max-height: 150px;
    overflow-y: auto;
  }
  
  .entity-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.85em;
  }
  
  .entity-item:hover {
    background: rgba(var(--rgb-primary-color), 0.1);
  }
  
  .entity-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .entity-id {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    font-family: monospace;
  }
  
  .smart-input-hint {
    margin-top: 4px;
    font-size: 0.8em;
    color: var(--secondary-text-color);
    line-height: 1.3;
  }
  
  /* ===== 插件选择器样式 ===== */
  .plugin-selector {
    width: 100%;
  }
  
  .plugin-search-box {
    margin-bottom: 12px;
  }
  
  .plugin-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .plugin-item {
    padding: 12px 8px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
  }
  
  .plugin-item:hover {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.05);
  }
  
  .plugin-item.selected {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }
  
  .plugin-item-icon {
    font-size: 1.5em;
    margin-bottom: 4px;
  }
  
  .plugin-item-name {
    font-size: 0.85em;
    font-weight: 500;
  }
  
  .plugin-item-description {
    font-size: 0.75em;
    opacity: 0.7;
    margin-top: 2px;
  }
  
  .plugin-selector-empty {
    text-align: center;
    padding: 20px;
    color: var(--secondary-text-color);
  }
  
  /* ===== 主题选择器样式 ===== */
  .theme-selector {
    width: 100%;
  }
  
  .theme-selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 8px;
  }
  
  .theme-selector-card {
    padding: 16px 12px;
    border: 2px solid var(--divider-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }
  
  .theme-selector-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }
  
  .theme-selector-card.selected {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.05);
  }
  
  .theme-preview-box {
    width: 100%;
    height: 60px;
    border-radius: 6px;
    margin-bottom: 8px;
    border: 1px solid var(--divider-color);
    transition: all 0.3s ease;
  }
  
  .theme-selector-card.selected .theme-preview-box {
    transform: scale(1.05);
  }
  
  .theme-selector-name {
    font-size: 0.85em;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .theme-selector-description {
    font-size: 0.75em;
    color: var(--secondary-text-color);
  }
  
  /* 主题预览样式 */
  .theme-auto-preview {
    background: var(--card-background-color);
  }
  
  .theme-glass-preview {
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
  }
  
  .theme-gradient-preview {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .theme-neon-preview {
    background: #1a1a1a;
    border: 1px solid #00ff88;
    box-shadow: 0 0 8px #00ff88;
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