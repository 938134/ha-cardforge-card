// src/styles/editor-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const editorStyles = css`
  /* 编辑器布局样式 */
  .editor-container {
    padding: 16px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .editor-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  @media (min-width: 768px) {
    .editor-layout {
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    
    .plugin-config-section {
      grid-column: 1 / -1;
    }
  }
  
  /* 配置区块样式 */
  .config-section {
    background: var(--card-background-color);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid var(--divider-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--divider-color);
  }
  
  .section-icon {
    font-size: 1.2em;
    width: 24px;
    text-align: center;
  }
  
  .section-title {
    font-weight: 600;
    font-size: 1.1em;
    color: var(--primary-text-color);
    margin: 0;
  }
  
  .section-description {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-top: 4px;
    line-height: 1.4;
  }
  
  /* 基础配置区块 */
  .basic-config {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .config-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .config-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  /* 实体配置网格 */
  .entities-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (min-width: 480px) {
    .entities-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
  }
  
  /* 插件信息面板 */
  .plugin-info {
    background: rgba(var(--rgb-primary-color), 0.05);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid rgba(var(--rgb-primary-color), 0.1);
  }
  
  .plugin-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  
  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .meta-label {
    font-size: 0.75em;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .meta-value {
    font-size: 0.9em;
    color: var(--primary-text-color);
    font-weight: 500;
  }
  
  /* 功能支持标签 */
  .feature-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  
  .feature-tag {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .feature-tag.supported {
    background: rgba(76, 175, 80, 0.15);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  .feature-tag.unsupported {
    background: rgba(255, 152, 0, 0.15);
    color: #ef6c00;
    border: 1px solid rgba(255, 152, 0, 0.3);
  }
  
  /* 操作按钮区域 */
  .card-actions {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid var(--divider-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  /* 响应式优化 */
  @media (max-width: 480px) {
    .editor-container {
      padding: 12px;
    }
    
    .config-section {
      padding: 16px;
    }
    
    .section-header {
      margin-bottom: 16px;
    }
    
    .plugin-meta {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .card-actions {
      flex-direction: column;
    }
    
    .card-actions mwc-button {
      width: 100%;
    }
  }
`;