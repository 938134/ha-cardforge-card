import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const editorStyles = css`
  /* ===== 编辑器容器样式 ===== */
  .editor-container {
    background: var(--cf-background);
    border-radius: var(--cf-radius-lg);
    border: 1px solid var(--cf-border);
    box-shadow: 
      0 2px 6px rgba(0, 0, 0, 0.1), /* 减小阴影 */
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    overflow: visible; /* 改为visible允许下拉框溢出 */
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
        0 2px 8px rgba(0, 0, 0, 0.4), /* 减小阴影 */
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
    font-size: 0.9em; /* 减小字体 */
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
    font-size: 1em; /* 减小图标 */
  }

  /* ===== 选择器网格增强样式 ===== */
  .selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr)); /* 改为64px */
    gap: var(--cf-spacing-md);
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--cf-radius-lg);
    padding: var(--cf-spacing-lg);
    border: 1px solid rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(6px); /* 减小模糊 */
    -webkit-backdrop-filter: blur(6px);
    position: relative;
  }

  /* 深色模式选择器网格 */
  @media (prefers-color-scheme: dark) {
    .selector-grid {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px); /* 减小模糊 */
      -webkit-backdrop-filter: blur(8px);
    }
  }

  .selector-grid::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid rgba(var(--cf-rgb-primary), 0.05);
    border-radius: var(--cf-radius-lg);
    pointer-events: none;
  }

  /* ===== 插件选择器样式 ===== */
  .plugin-selector {
    width: 100%;
  }

  .search-box {
    margin-bottom: var(--cf-spacing-sm);
  }

  .plugin-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr)); /* 改为64px */
    gap: var(--cf-spacing-sm);
    max-height: 260px; /* 调整最大高度 */
    overflow-y: auto;
  }

  .plugin-item {
    padding: var(--cf-spacing-sm);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    cursor: pointer;
    text-align: center;
    transition: all var(--cf-transition-normal);
    background: var(--cf-surface);
    min-height: 56px; /* 减小最小高度 */
    height: 64px; /* 固定高度64px */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* 深色模式插件项 */
  @media (prefers-color-scheme: dark) {
    .plugin-item {
      background: var(--cf-dark-surface);
      border-color: var(--cf-dark-border);
    }
  }

  .plugin-item:hover {
    border-color: var(--cf-primary-color);
    transform: translateY(-1px);
  }

  .plugin-item.selected {
    border-color: var(--cf-primary-color);
    background: var(--cf-primary-color);
    color: white;
  }

  .plugin-item-icon {
    font-size: 1.2em; /* 减小图标 */
    margin-bottom: 2px; /* 减小间距 */
    line-height: 1;
  }

  .plugin-item-name {
    font-size: 0.65em; /* 减小字体 */
    font-weight: 500;
    line-height: 1.1;  /* 减小行高 */
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ===== 智能输入组件样式 - 修复下拉框显示问题 ===== */
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

  .smart-input-field {
    flex: 1;
    --mdc-text-field-fill-color: var(--cf-surface);
  }

  /* 深色模式输入框 */
  @media (prefers-color-scheme: dark) {
    .smart-input-field {
      --mdc-text-field-fill-color: var(--cf-dark-surface);
      --mdc-text-field-ink-color: var(--cf-dark-text);
      --mdc-text-field-label-ink-color: var(--cf-dark-text-secondary);
    }
  }

  .smart-input-entity-button {
    background: var(--cf-primary-color);
    color: white;
    border: none;
    border-radius: var(--cf-radius-sm);
    padding: 0 var(--cf-spacing-md);
    height: 40px; /* 减小高度 */
    min-width: 40px; /* 减小宽度 */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em; /* 减小字体 */
    transition: all var(--cf-transition-fast);
  }

  .smart-input-entity-button:hover {
    background: var(--cf-accent-color);
    transform: translateY(-1px);
  }

  /* 修复：下拉框位置和显示问题 */
  .smart-input-dropdown {
    position: fixed; /* 改为fixed定位 */
    top: auto; /* 取消top */
    bottom: auto; /* 取消bottom */
    left: 0;
    right: 0;
    background: var(--cf-surface);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    box-shadow: var(--cf-shadow-lg);
    z-index: 10000; /* 大幅提高z-index */
    margin-top: var(--cf-spacing-xs);
    max-height: min(300px, calc(100vh - 200px)); /* 动态最大高度 */
    min-height: 120px;
    overflow-y: auto;
    width: 100%;
  }

  /* 深色模式下拉框 */
  @media (prefers-color-scheme: dark) {
    .smart-input-dropdown {
      background: var(--cf-dark-surface);
      border-color: var(--cf-dark-border);
      box-shadow: var(--cf-dark-shadow-lg);
    }
  }

  .smart-input-picker-header {
    padding: var(--cf-spacing-md);
    border-bottom: 1px solid var(--cf-border);
    font-weight: 600;
    font-size: 0.85em; /* 调整字体 */
    background: rgba(var(--cf-rgb-primary), 0.05);
    position: sticky;
    top: 0;
    z-index: 5;
  }

  /* 深色模式下拉标题 */
  @media (prefers-color-scheme: dark) {
    .smart-input-picker-header {
      background: rgba(var(--cf-rgb-primary), 0.1);
      border-bottom-color: var(--cf-dark-border);
      color: var(--cf-dark-text);
    }
  }

  .smart-input-search-box {
    padding: var(--cf-spacing-sm) var(--cf-spacing-md);
    position: sticky;
    top: 0;
    background: inherit;
    z-index: 10;
    border-bottom: 1px solid var(--cf-border);
  }

  /* 深色模式搜索框 */
  @media (prefers-color-scheme: dark) {
    .smart-input-search-box {
      border-bottom-color: var(--cf-dark-border);
      background: var(--cf-dark-surface);
    }
  }

  .smart-input-entity-list {
    max-height: 200px; /* 调整高度 */
    overflow-y: auto;
  }

  .smart-input-entity-item {
    padding: var(--cf-spacing-sm) var(--cf-spacing-md); /* 调整内边距 */
    cursor: pointer;
    border-bottom: 1px solid var(--cf-border);
    font-size: 0.8em; /* 调整字体 */
    transition: all var(--cf-transition-fast);
    min-height: 40px; /* 减小最小高度 */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* 深色模式实体项 */
  @media (prefers-color-scheme: dark) {
    .smart-input-entity-item {
      border-bottom-color: var(--cf-dark-border);
      color: var(--cf-dark-text);
    }
    
    .smart-input-entity-item:hover {
      background: rgba(var(--cf-rgb-primary), 0.15);
    }
  }

  .smart-input-entity-item:hover {
    background: rgba(var(--cf-rgb-primary), 0.08);
  }

  .smart-input-entity-item:last-child {
    border-bottom: none;
  }

  .smart-input-entity-name {
    font-weight: 500;
    margin-bottom: 2px; /* 减小间距 */
    font-size: 0.85em; /* 调整字体 */
  }

  .smart-input-entity-id {
    font-size: 0.75em; /* 调整字体 */
    color: var(--cf-text-secondary);
    font-family: monospace;
  }

  /* 深色模式实体ID */
  @media (prefers-color-scheme: dark) {
    .smart-input-entity-id {
      color: var(--cf-dark-text-secondary);
    }
  }

  /* ===== 操作按钮区域 ===== */
  .action-buttons {
    display: flex;
    gap: var(--cf-spacing-md);
    justify-content: flex-end;
    margin-top: var(--cf-spacing-lg);
  }

  /* ===== 响应式优化 ===== */
  @media (max-width: 600px) {
    .editor-section {
      padding: var(--cf-spacing-md);
    }
    
    .selector-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--cf-spacing-sm);
      padding: var(--cf-spacing-md);
    }
    
    .plugin-list {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--cf-spacing-xs);
    }
    
    .plugin-item {
      height: 56px;
      min-height: 56px;
      padding: var(--cf-spacing-xs);
    }
    
    .plugin-item-icon {
      font-size: 1.1em;
    }
    
    .plugin-item-name {
      font-size: 0.6em;
    }
    
    /* 移动端下拉框优化 */
    .smart-input-dropdown {
      max-height: min(250px, calc(100vh - 150px));
      min-height: 100px;
    }
    
    .smart-input-entity-item {
      padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
      min-height: 36px;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: var(--cf-spacing-sm);
    }
    
    .action-buttons mwc-button {
      width: 100%;
    }
  }

  @media (max-width: 400px) {
    .selector-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .plugin-list {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .plugin-item {
      height: 52px;
      min-height: 52px;
    }
  }

  @media (max-width: 320px) {
    .selector-grid {
      grid-template-columns: 1fr;
    }
    
    .plugin-list {
      grid-template-columns: 1fr;
    }
    
    .plugin-item {
      height: 48px;
      min-height: 48px;
    }
    
    .plugin-item-icon {
      font-size: 1em;
    }
    
    .plugin-item-name {
      font-size: 0.55em;
    }
  }
`;