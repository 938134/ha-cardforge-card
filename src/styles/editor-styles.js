// src/styles/editor-styles.js - 优化布局和容器样式
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

// 动态主题预览样式生成器
export const generateThemePreviewStyles = (themes) => {
  let styles = '';
  
  themes.forEach(theme => {
    const preview = theme.preview || {
      background: `linear-gradient(135deg, hsl(${theme.id.length * 50 % 360}, 70%, 50%) 0%, hsl(${(theme.id.length * 50 + 30) % 360}, 70%, 40%) 100%)`,
      color: '#ffffff',
      border: 'none'
    };
    
    styles += `
      .theme-preview-${theme.id} {
        background: ${preview.background} !important;
        color: ${preview.color} !important;
        border: ${preview.border || '1px solid var(--divider-color)'} !important;
        ${preview.boxShadow ? `box-shadow: ${preview.boxShadow} !important;` : ''}
      }
    `;
  });
  
  return styles;
};

export const editorStyles = css`
  /* ===== 编辑器容器样式 ===== */
  .editor-container {
    background: var(--card-background-color);
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .editor-layout {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  
  .editor-section {
    background: var(--card-background-color);
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color);
  }
  
  .editor-section:last-child {
    border-bottom: none;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 600;
    color: var(--primary-text-color);
    font-size: 0.95em;
  }
  
  .section-icon {
    font-size: 1.1em;
  }
  
  /* ===== 紧凑的选择器网格布局 ===== */
  .selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
  }
  
  .selector-card {
    padding: 12px 8px;
    border-radius: 6px;
    border: 1px solid var(--divider-color);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    background: var(--card-background-color);
    min-height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .selector-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .selector-card.selected {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }
  
  .selector-icon {
    font-size: 1.6em;
    margin-bottom: 6px;
    line-height: 1;
  }
  
  .selector-name {
    font-size: 0.8em;
    font-weight: 500;
    line-height: 1.2;
  }
  
  .theme-preview {
    width: 100%;
    height: 50px;
    border-radius: 4px;
    margin-bottom: 6px;
    border: 1px solid var(--divider-color);
    transition: all 0.2s ease;
  }
  
  .selector-card.selected .theme-preview {
    transform: scale(1.02);
    border-color: white;
  }
  
  /* ===== 动态主题预览样式占位符 ===== */
  
  /* ===== 插件选择器样式 ===== */
  .plugin-selector {
    width: 100%;
  }
  
  .search-box {
    margin-bottom: 8px;
  }
  
  .plugin-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 6px;
    max-height: 180px;
    overflow-y: auto;
  }
  
  .plugin-item {
    padding: 10px 6px;
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    background: var(--card-background-color);
    min-height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .plugin-item:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
  
  .plugin-item.selected {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }
  
  .plugin-item-icon {
    font-size: 1.4em;
    margin-bottom: 4px;
    line-height: 1;
  }
  
  .plugin-item-name {
    font-size: 0.75em;
    font-weight: 500;
    line-height: 1.2;
  }
  
  /* ===== 主题选择器样式 ===== */
  .theme-selector {
    width: 100%;
  }
  
  .theme-selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
  }
  
  .theme-selector-card {
    padding: 12px 8px;
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    background: var(--card-background-color);
    min-height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .theme-selector-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
  
  .theme-selector-card.selected {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }
  
  .theme-selector-preview {
    width: 100%;
    height: 50px;
    border-radius: 4px;
    margin-bottom: 6px;
    border: 1px solid var(--divider-color);
    transition: all 0.2s ease;
  }
  
  .theme-selector-card.selected .theme-selector-preview {
    transform: scale(1.02);
    border-color: white;
  }
  
  .theme-selector-name {
    font-size: 0.8em;
    font-weight: 500;
    line-height: 1.2;
  }
  
  /* ===== 智能输入组件样式 ===== */
  .smart-input-container {
    position: relative;
    width: 100%;
  }
  
  .smart-input-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
  }
  
  .smart-input-field {
    flex: 1;
    --mdc-text-field-fill-color: var(--card-background-color);
  }
  
  .smart-input-entity-button {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0 10px;
    height: 48px;
    min-width: 48px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    transition: all 0.2s ease;
  }
  
  .smart-input-entity-button:hover {
    background: var(--accent-color);
  }
  
  .smart-input-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 4px;
    max-height: 180px;
    overflow-y: auto;
  }
  
  .smart-input-picker-header {
    padding: 10px;
    border-bottom: 1px solid var(--divider-color);
    font-weight: 600;
    font-size: 0.85em;
  }
  
  .smart-input-search-box {
    padding: 6px 10px;
  }
  
  .smart-input-entity-list {
    max-height: 140px;
    overflow-y: auto;
  }
  
  .smart-input-entity-item {
    padding: 6px 10px;
    cursor: pointer;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.8em;
  }
  
  .smart-input-entity-item:hover {
    background: rgba(var(--rgb-primary-color), 0.1);
  }
  
  .smart-input-entity-name {
    font-weight: 500;
    margin-bottom: 2px;
    font-size: 0.85em;
  }
  
  .smart-input-entity-id {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    font-family: monospace;
  }
  
  /* ===== 实体选择器样式 ===== */
  .entity-picker-container {
    position: relative;
  }
  
  .entity-picker-wrapper {
    display: flex;
    gap: 6px;
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
    padding: 0 10px;
    height: 48px;
    min-width: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85em;
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
    width: 280px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 4px;
    max-height: 260px;
    overflow-y: auto;
  }
  
  .entity-picker-header {
    padding: 10px;
    border-bottom: 1px solid var(--divider-color);
    font-weight: 600;
    font-size: 0.85em;
  }
  
  .entity-picker-search-box {
    padding: 6px 10px;
  }
  
  .entity-picker-list {
    max-height: 180px;
    overflow-y: auto;
  }
  
  .entity-picker-item {
    padding: 6px 10px;
    cursor: pointer;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.8em;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .entity-picker-item:hover {
    background: rgba(var(--rgb-primary-color), 0.1);
  }
  
  .entity-picker-name {
    font-weight: 500;
    font-size: 0.85em;
  }
  
  .entity-picker-id {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    font-family: monospace;
  }
  
  .entity-picker-state {
    font-size: 0.75em;
    color: var(--primary-color);
    margin-left: 6px;
  }
  
  .entity-picker-hint {
    margin-top: 4px;
    font-size: 0.75em;
    color: var(--secondary-text-color);
    line-height: 1.2;
    min-height: 1em;
  }
  
  .entity-picker-hint-content {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* ===== 操作按钮 ===== */
  .action-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 16px;
  }
  
  /* ===== 响应式优化 ===== */
  @media (max-width: 600px) {
    .editor-section {
      padding: 10px 12px;
    }
    
    .selector-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 6px;
    }
    
    .selector-card {
      padding: 10px 6px;
      min-height: 60px;
    }
    
    .selector-icon {
      font-size: 1.4em;
      margin-bottom: 4px;
    }
    
    .selector-name {
      font-size: 0.75em;
    }
    
    .theme-preview {
      height: 40px;
      margin-bottom: 4px;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 8px;
    }
    
    .action-buttons mwc-button {
      width: 100%;
    }
    
    .entity-picker-dropdown {
      width: 100%;
      right: auto;
      left: 0;
    }
    
    .plugin-list {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 4px;
    }
    
    .plugin-item {
      padding: 8px 4px;
      min-height: 50px;
    }
    
    .plugin-item-icon {
      font-size: 1.2em;
    }
    
    .plugin-item-name {
      font-size: 0.7em;
    }
  }
  
  @media (max-width: 400px) {
    .selector-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .plugin-list {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .theme-selector-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 320px) {
    .selector-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .plugin-list {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .theme-selector-grid {
      grid-template-columns: 1fr;
    }
  }
`;