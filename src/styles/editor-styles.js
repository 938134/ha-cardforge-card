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
  
  /* ===== 配置行布局优化 ===== */
  .config-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  @media (min-width: 768px) {
    .config-row {
      grid-template-columns: 1fr 2fr;
      gap: 20px;
      align-items: start;
    }
    
    /* 当有智能输入组件时调整布局 */
    .config-row:has(.smart-input-container) {
      grid-template-columns: 1fr 3fr;
    }
  }
  
  .config-label {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 4px;
    padding-top: 8px;
  }
  
  .required-star {
    color: var(--error-color);
    margin-left: 4px;
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
  
  @media (min-width: 480px) {
    .smart-input-wrapper {
      gap: 12px;
    }
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
    flex-shrink: 0;
  }
  
  .entity-button:hover {
    background: var(--accent-color);
  }
  
  /* ===== 实体选择下拉列表样式 ===== */
  .entity-picker-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    margin-top: 4px;
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .entity-picker-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color);
    font-weight: 600;
    font-size: 0.9em;
    background: var(--secondary-background-color, #f5f5f5);
    color: var(--primary-text-color);
  }
  
  .entity-picker-search {
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color);
    background: var(--card-background-color);
  }
  
  .entity-picker-search ha-textfield {
    width: 100%;
    --mdc-text-field-fill-color: var(--card-background-color);
  }
  
  .entity-picker-list {
    flex: 1;
    max-height: 300px;
    overflow-y: auto;
    background: var(--card-background-color);
  }
  
  .entity-picker-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--divider-color);
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .entity-picker-item:hover {
    background: rgba(var(--rgb-primary-color), 0.08);
  }
  
  .entity-picker-item:last-child {
    border-bottom: none;
  }
  
  .entity-picker-name {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
  }
  
  .entity-picker-id {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
  
  .entity-picker-state {
    font-size: 0.8em;
    color: var(--primary-color);
    margin-top: 2px;
  }
  
  .entity-picker-empty {
    padding: 20px 16px;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
  
  /* 移除多余的提示文字 */
  /* .smart-input-hint 已被移除 */
  
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

  .theme-poetry-preview {
    background: linear-gradient(135deg, #fef7ed 0%, #f8f4e9 100%);
    border: 1px solid #e8dfca;
    position: relative;
    overflow: hidden;
  }

  .theme-poetry-preview::before {
    content: '詩';
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 12px;
    color: #8b4513;
    font-family: "SimSun", "宋体", serif;
    opacity: 0.6;
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
    
    .entity-picker-dropdown {
      position: fixed;
      top: 50%;
      left: 16px;
      right: 16px;
      transform: translateY(-50%);
      max-height: 70vh;
      z-index: 1000;
    }
    
    /* 移动端配置行布局 */
    .config-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .smart-input-wrapper {
      flex-direction: column;
      gap: 8px;
    }
    
    .entity-button {
      width: 100%;
      height: 48px;
    }
  }
  
  @media (max-width: 400px) {
    .plugin-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .theme-grid {
      grid-template-columns: 1fr;
    }
    
    .config-row {
      margin-bottom: 12px;
    }
  }
  
  /* ===== 大屏优化 ===== */
  @media (min-width: 1024px) {
    .editor-layout {
      max-width: 800px;
    }
    
    .datasource-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    /* 当只有少量配置项时保持单列 */
    .datasource-list:has(.config-row:nth-child(3)) {
      grid-template-columns: 1fr;
    }
  }
  
  /* ===== 状态提示 ===== */
  .config-hint {
    color: var(--secondary-text-color);
    font-size: 0.85em;
    margin-top: 16px;
    text-align: center;
    padding: 8px;
    background: rgba(var(--rgb-primary-color), 0.05);
    border-radius: 6px;
  }
  
  .entity-help {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    margin-top: 8px;
    line-height: 1.4;
  }
`;