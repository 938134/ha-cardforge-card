// src/styles/editor-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const editorStyles = css`
  /* ===== 编辑器容器样式 ===== */
  .editor-container {
    background: var(--cf-background);
    border-radius: var(--cf-radius-lg);
    border: 1px solid var(--cf-border);
    box-shadow: 
      0 2px 6px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    overflow: visible;
    background-image: 
      radial-gradient(circle at 15% 50%, rgba(var(--cf-rgb-primary), 0.03) 0%, transparent 50%),
      radial-gradient(circle at 85% 30%, rgba(var(--cf-rgb-primary), 0.03) 0%, transparent 50%);
  }

  /* 深色模式编辑器优化 */
  @media (prefers-color-scheme: dark) {
    .editor-container {
      background: var(--cf-dark-background);
      border-color: var(--cf-dark-border);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.02);
      background-image: 
        radial-gradient(circle at 15% 50%, rgba(var(--cf-rgb-primary), 0.05) 0%, transparent 50%),
        radial-gradient(circle at 85% 30%, rgba(var(--cf-rgb-primary), 0.05) 0%, transparent 50%);
    }
  }

  .editor-layout {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .editor-section {
    background: var(--cf-surface);
    padding: var(--cf-spacing-lg);
    border-bottom: 1px solid var(--cf-border);
    position: relative;
  }

  /* 深色模式编辑器区块 */
  @media (prefers-color-scheme: dark) {
    .editor-section {
      background: var(--cf-dark-surface);
      border-bottom-color: var(--cf-dark-border);
    }
  }

  .editor-section:last-child {
    border-bottom: none;
  }

  .editor-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--cf-primary-color), transparent);
    opacity: 0.3;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-sm);
    margin-bottom: var(--cf-spacing-lg);
    font-weight: 600;
    color: var(--cf-text-primary);
    font-size: 1.1em;
    padding: var(--cf-spacing-sm) var(--cf-spacing-md);
    background: rgba(var(--cf-rgb-primary), 0.05);
    border-radius: var(--cf-radius-md);
    border-left: 3px solid var(--cf-primary-color);
  }

  /* 深色模式标题栏 */
  @media (prefers-color-scheme: dark) {
    .section-header {
      background: rgba(var(--cf-rgb-primary), 0.1);
      color: var(--cf-dark-text);
    }
  }

  .section-icon {
    font-size: 1.1em;
  }

  /* ===== 统一选择器网格 ===== */
  .selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--cf-spacing-md);
    width: 100%;
  }

  .selector-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--cf-spacing-md);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    cursor: pointer;
    transition: all var(--cf-transition-normal);
    background: var(--cf-surface);
    min-height: 100px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  /* 深色模式选择器项 */
  @media (prefers-color-scheme: dark) {
    .selector-item {
      background: var(--cf-dark-surface);
      border-color: var(--cf-dark-border);
    }
  }

  .selector-item:hover {
    border-color: var(--cf-primary-color);
    transform: translateY(-2px);
    box-shadow: var(--cf-shadow-md);
  }

  .selector-item.selected {
    border-color: var(--cf-primary-color);
    background: var(--cf-primary-color);
    color: white;
    transform: translateY(-1px);
  }

  .selector-icon {
    font-size: 2em;
    margin-bottom: var(--cf-spacing-sm);
    line-height: 1;
  }

  .selector-name {
    font-size: 0.9em;
    font-weight: 500;
    line-height: 1.2;
  }

  /* ===== 主题预览样式 ===== */
  .theme-preview {
    width: 100%;
    height: 60px;
    border-radius: var(--cf-radius-sm);
    margin-bottom: var(--cf-spacing-sm);
    border: 2px solid transparent;
    transition: all var(--cf-transition-fast);
  }

  .selector-item.selected .theme-preview {
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* ===== 紧凑型配置网格 ===== */
  .config-grid-compact {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--cf-spacing-md);
    width: 100%;
  }

  .config-item {
    display: flex;
    flex-direction: column;
    gap: var(--cf-spacing-sm);
    padding: var(--cf-spacing-md);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    background: var(--cf-surface);
    transition: all var(--cf-transition-fast);
  }

  .config-item:hover {
    border-color: var(--cf-primary-color);
  }

  .config-label {
    font-weight: 500;
    font-size: 0.95em;
    color: var(--cf-text-primary);
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-xs);
  }

  .required-star {
    color: var(--cf-error-color);
  }

  /* ===== 彻底修复下拉菜单超出问题 ===== */
  ha-select {
    --mdc-menu-min-width: 100%;
    --mdc-menu-max-width: 100%;
    --mdc-menu-min-height: 0;
    width: 100%;
    position: relative;
  }

  /* 强制限制下拉菜单在视口内 */
  .mdc-menu-surface {
    max-height: min(300px, 50vh) !important;
    overflow-y: auto !important;
    position: fixed !important;
    z-index: 10000 !important;
    transform-origin: top center !important;
  }

  /* 确保下拉菜单不会超出视口 */
  .mdc-menu-surface--open {
    max-height: min(300px, calc(100vh - 100px)) !important;
    top: auto !important;
    bottom: auto !important;
    left: 0 !important;
    right: 0 !important;
    margin: 0 auto !important;
  }

  /* ===== 紧凑型开关组 ===== */
  .switch-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--cf-spacing-sm);
  }

  .switch-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--cf-spacing-sm);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    background: var(--cf-surface);
    transition: all var(--cf-transition-fast);
    min-height: 52px;
  }

  .switch-item:hover {
    border-color: var(--cf-primary-color);
  }

  .switch-label {
    font-size: 0.9em;
    color: var(--cf-text-primary);
    flex: 1;
  }

  /* ===== 紧凑型单选按钮组 ===== */
  .radio-group-compact {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--cf-spacing-sm);
  }

  .radio-option-compact {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-xs);
    padding: var(--cf-spacing-sm);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    cursor: pointer;
    transition: all var(--cf-transition-fast);
    background: var(--cf-surface);
    font-size: 0.85em;
    text-align: center;
    min-height: 44px;
  }

  .radio-option-compact:hover {
    border-color: var(--cf-primary-color);
  }

  .radio-option-compact.selected {
    border-color: var(--cf-primary-color);
    background: var(--cf-primary-color);
    color: white;
  }

  /* ===== 数字输入框 ===== */
  .number-input {
    width: 100%;
  }

  /* ===== 智能输入组件样式 ===== */
  .smart-input-container {
    position: relative;
    width: 100%;
  }

  .smart-input-wrapper {
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-sm);
    width: 100%;
  }

  .smart-input-field-container {
    position: relative;
    flex: 1;
  }

  .smart-input-field {
    width: 100%;
    --mdc-text-field-fill-color: var(--cf-surface);
  }

  /* 修复下拉菜单点击关闭问题 */
  .smart-input-dropdown {
    position: absolute;
    left: 0;
    right: 0;
    background: var(--cf-surface);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    box-shadow: var(--cf-shadow-lg);
    z-index: 1001;
    max-height: min(400px, 60vh);
    overflow-y: auto;
  }

  /* 深色模式下拉框 */
  @media (prefers-color-scheme: dark) {
    .smart-input-dropdown {
      background: var(--cf-dark-surface);
      border-color: var(--cf-dark-border);
    }
  }

  .smart-input-entity-button,
  .smart-input-template-button {
    background: var(--cf-primary-color);
    color: white;
    border: none;
    border-radius: var(--cf-radius-sm);
    padding: 0 var(--cf-spacing-md);
    height: 48px;
    min-width: 48px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    transition: all var(--cf-transition-fast);
  }

  .smart-input-entity-button:hover {
    background: var(--cf-accent-color);
    transform: translateY(-1px);
  }

  /* ===== 操作按钮区域 ===== */
  .action-buttons {
    display: flex;
    gap: var(--cf-spacing-md);
    justify-content: flex-end;
    margin-top: var(--cf-spacing-lg);
  }

  /* ===== 响应式优化 ===== */
  @media (max-width: 768px) {
    .config-grid-compact {
      grid-template-columns: 1fr;
      gap: var(--cf-spacing-md);
    }
    
    .editor-section {
      padding: var(--cf-spacing-md);
    }
    
    .selector-grid {
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: var(--cf-spacing-sm);
    }
    
    .selector-item {
      min-height: 90px;
      padding: var(--cf-spacing-sm);
    }
    
    .selector-icon {
      font-size: 1.8em;
    }
    
    .selector-name {
      font-size: 0.85em;
    }
    
    .switch-group {
      grid-template-columns: 1fr;
    }
    
    .radio-group-compact {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .editor-section {
      padding: var(--cf-spacing-sm);
    }
    
    .selector-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .selector-item {
      min-height: 85px;
    }
    
    .radio-group-compact {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .action-buttons mwc-button {
      width: 100%;
    }
  }

  @media (max-width: 360px) {
    .selector-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;