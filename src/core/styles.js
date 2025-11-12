// src/core/styles.js
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
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    font-size: 1.5em;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  /* 增强的毛玻璃预览样式 */
  .theme-preview.auto {
    background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
    color: #333;
  }
  
  .theme-preview.glass {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.35) 0%, 
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    color: #333;
  }
  
  .theme-preview.glass::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: glassShine 3s ease-in-out infinite;
  }
  
  .theme-preview.gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    animation: gradientShift 3s ease infinite;
  }
  
  .theme-preview.neon {
    background: #1a1a1a;
    color: #00ff88;
    box-shadow: 
      0 0 8px #00ff88,
      inset 0 0 12px rgba(0, 255, 136, 0.15);
    animation: neonPulse 2s ease-in-out infinite;
  }
  
  /* 当前主题预览区域 */
  .current-theme-preview {
    margin: 20px 0;
    padding: 16px;
    background: var(--card-background-color);
    border-radius: 12px;
    border: 1px solid var(--divider-color);
  }
  
  .preview-header {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--primary-text-color);
    font-size: 0.9em;
  }
  
  .current-preview {
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .current-preview.auto {
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color);
  }
  
  .current-preview.glass {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.25) 0%, 
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.1) 100%);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    color: var(--primary-text-color);
  }
  
  .current-preview.glass::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: glassShine 4s ease-in-out infinite;
  }
  
  .current-preview.gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    background-size: 200% 200%;
    color: white;
    animation: gradientShift 4s ease infinite;
  }
  
  .current-preview.neon {
    background: #1a1a1a;
    color: #00ff88;
    border: 1px solid #00ff88;
    box-shadow: 
      0 0 15px rgba(0, 255, 136, 0.6),
      inset 0 0 25px rgba(0, 255, 136, 0.15);
    animation: neonPulse 2s ease-in-out infinite;
  }
  
  /* 动画效果 */
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes neonPulse {
    0%, 100% {
      box-shadow: 
        0 0 8px #00ff88,
        inset 0 0 15px rgba(0, 255, 136, 0.1);
    }
    50% {
      box-shadow: 
        0 0 25px #00ff88,
        0 0 40px rgba(0, 255, 136, 0.4),
        inset 0 0 30px rgba(0, 255, 136, 0.2);
    }
  }
  
  @keyframes glassShine {
    0% {
      left: -100%;
    }
    100% {
      left: 200%;
    }
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
  
  /* 紧凑插件网格样式 */
  .plugin-grid-compact {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .plugin-card-compact {
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    position: relative;
    height: 100px;
  }
  
  .plugin-card-compact:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .plugin-card-compact.selected {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.05);
  }
  
  .plugin-content-compact {
    padding: 16px 12px;
    text-align: center;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .plugin-icon-compact {
    font-size: 2em;
    margin-bottom: 8px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .plugin-info-compact {
    flex: 1;
    width: 100%;
  }
  
  .plugin-name-compact {
    font-weight: 600;
    font-size: 0.85em;
    color: var(--primary-text-color);
    line-height: 1.2;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .plugin-category-compact {
    font-size: 0.7em;
    color: var(--secondary-text-color);
    background: rgba(var(--rgb-primary-color), 0.1);
    padding: 2px 6px;
    border-radius: 8px;
    display: inline-block;
  }
  
  .featured-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    background: var(--accent-color);
    color: white;
    border-radius: 4px;
    padding: 1px 4px;
    font-size: 0.6em;
    font-weight: 500;
  }

  /* 原有插件网格样式（保留兼容性） */
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