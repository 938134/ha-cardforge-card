// src/core/design-system.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const designSystem = css`
  /* ===== CSS 变量系统 ===== */
  :host {
    /* 颜色系统 */
    --cf-primary-color: var(--primary-color, #03a9f4);
    --cf-accent-color: var(--accent-color, #ff4081);
    --cf-background: var(--card-background-color, #ffffff);
    --cf-surface: var(--card-background-color, #ffffff);
    --cf-border: var(--divider-color, #e0e0e0);
    --cf-text-primary: var(--primary-text-color, #212121);
    --cf-text-secondary: var(--secondary-text-color, #757575);
    --cf-error-color: var(--error-color, #f44336);
    --cf-warning-color: var(--warning-color, #ff9800);
    --cf-success-color: var(--success-color, #4caf50);
    
    /* RGB 颜色（用于透明度） */
    --cf-rgb-primary: 3, 169, 244;
    --cf-rgb-accent: 255, 64, 129;
    --cf-rgb-background: 255, 255, 255;
    --cf-rgb-surface: 255, 255, 255;
    
    /* 深色模式颜色 */
    --cf-dark-background: #1a1a1a;
    --cf-dark-surface: #2d2d2d;
    --cf-dark-border: #404040;
    --cf-dark-text: #e0e0e0;
    --cf-dark-text-secondary: #a0a0a0;
    
    /* 间距系统 */
    --cf-spacing-xs: 4px;
    --cf-spacing-sm: 8px;
    --cf-spacing-md: 12px;
    --cf-spacing-lg: 16px;
    --cf-spacing-xl: 20px;
    
    /* 圆角系统 */
    --cf-radius-sm: 4px;
    --cf-radius-md: 8px;
    --cf-radius-lg: 12px;
    --cf-radius-xl: 16px;
    
    /* 阴影系统 */
    --cf-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --cf-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
    --cf-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
    
    /* 动画系统 */
    --cf-transition-fast: 0.15s ease;
    --cf-transition-normal: 0.25s ease;
    --cf-transition-slow: 0.4s ease;

    /* 卡片容器默认样式 */
    --cardforge-container-padding: var(--cf-spacing-lg);
    --cardforge-container-min-height: 80px;
  }

  /* ===== 深色模式适配 ===== */
  @media (prefers-color-scheme: dark) {
    :host {
      --cf-background: var(--cf-dark-background);
      --cf-surface: var(--cf-dark-surface);
      --cf-border: var(--cf-dark-border);
      --cf-text-primary: var(--cf-dark-text);
      --cf-text-secondary: var(--cf-dark-text-secondary);
    }
  }

  /* ===== 统一卡片容器样式 ===== */
  .cardforge-card-container {
    display: flex;
    flex-direction: column;
    min-height: var(--cardforge-container-min-height);
    height: auto;
    padding: var(--cardforge-container-padding);
    container-type: inline-size;
    container-name: cardforge-container;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  .cardforge-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--cf-spacing-md);
  }

  /* ===== 布局工具类 ===== */
  .cf-grid { display: grid; gap: var(--cf-spacing-md); }
  .cf-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .cf-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .cf-grid-4 { grid-template-columns: repeat(4, 1fr); }
  
  .cf-flex { display: flex; }
  .cf-flex-column { flex-direction: column; }
  .cf-flex-center { align-items: center; justify-content: center; }
  .cf-flex-between { align-items: center; justify-content: space-between; }
  
  /* ===== 间距工具类 ===== */
  .cf-gap-sm { gap: var(--cf-spacing-sm); }
  .cf-gap-md { gap: var(--cf-spacing-md); }
  .cf-gap-lg { gap: var(--cf-spacing-lg); }
  
  .cf-p-sm { padding: var(--cf-spacing-sm); }
  .cf-p-md { padding: var(--cf-spacing-md); }
  .cf-p-lg { padding: var(--cf-spacing-lg); }
  
  .cf-m-sm { margin: var(--cf-spacing-sm); }
  .cf-m-md { margin: var(--cf-spacing-md); }
  .cf-m-lg { margin: var(--cf-spacing-lg); }

  /* ===== 文本工具类 ===== */
  .cf-text-sm { font-size: 0.85em; }
  .cf-text-md { font-size: 1em; }
  .cf-text-lg { font-size: 1.2em; }
  .cf-text-xl { font-size: 1.5em; }
  
  .cf-text-center { text-align: center; }
  .cf-text-left { text-align: left; }
  .cf-text-right { text-align: right; }
  
  .cf-font-medium { font-weight: 500; }
  .cf-font-semibold { font-weight: 600; }
  .cf-font-bold { font-weight: 700; }

  /* ===== 统一文本样式系统 ===== */
  .cardforge-title {
    font-size: 1.4em;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
    color: var(--cf-text-primary);
  }

  .cardforge-subtitle {
    font-size: 1em;
    opacity: 0.8;
    margin: 0;
    color: var(--cf-text-secondary);
  }

  .cardforge-text-large {
    font-size: 2.5em;
    font-weight: 300;
    line-height: 1;
    margin: 0;
    color: var(--cf-text-primary);
  }

  .cardforge-text-medium {
    font-size: 1.2em;
    line-height: 1.4;
    margin: 0;
    color: var(--cf-text-primary);
  }

  .cardforge-text-small {
    font-size: 0.9em;
    opacity: 0.7;
    margin: 0;
    color: var(--cf-text-secondary);
  }

  /* ===== 状态样式 ===== */
  .cf-status-on { color: var(--cf-success-color); }
  .cf-status-off { color: var(--cf-text-secondary); }
  .cf-status-unavailable { color: var(--cf-error-color); opacity: 0.5; }
  
  .cf-error { color: var(--cf-error-color); }
  .cf-warning { color: var(--cf-warning-color); }
  .cf-success { color: var(--cf-success-color); }

  /* ===== 动画系统 ===== */
  @keyframes cf-fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .cf-animate-fadeIn { animation: cf-fadeIn 0.25s ease; }
  .cardforge-animate-fadeIn { animation: cf-fadeIn 0.6s ease; }

  /* ===== 响应式容器查询 ===== */
  @container cardforge-container (max-width: 400px) {
    .cardforge-card-container {
      padding: var(--cf-spacing-md);
    }
    
    .cardforge-text-large {
      font-size: 2em;
    }
    
    .cf-grid-2,
    .cf-grid-3,
    .cf-grid-4 {
      grid-template-columns: 1fr;
    }
  }

  /* ===== 布局组件样式 ===== */
  .cardforge-section {
    margin-bottom: var(--cf-spacing-lg);
  }

  .cardforge-section-title {
    margin-bottom: var(--cf-spacing-md);
    font-weight: 600;
    opacity: 0.9;
  }

  .cardforge-footer {
    margin-top: var(--cf-spacing-lg);
    padding-top: var(--cf-spacing-md);
    border-top: 1px solid var(--cf-border);
  }

  /* ===== 错误和加载状态 ===== */
  .cardforge-error-container,
  .cardforge-loading-container,
  .cardforge-empty-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-md);
    min-height: 80px;
    text-align: center;
  }

  .cardforge-loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--cf-border);
    border-top: 2px solid var(--cf-primary-color);
    border-radius: 50%;
    animation: cardforge-spin 1s linear infinite;
  }

  @keyframes cardforge-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ===== 布局配置样式 ===== */
  .layout-config {
    display: flex;
    flex-direction: column;
    gap: var(--cf-spacing-md);
  }

  .config-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: var(--cf-spacing-md);
    align-items: center;
  }

  .config-label {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--cf-text-primary);
  }

  @media (max-width: 768px) {
    .config-row {
      grid-template-columns: 1fr;
      gap: var(--cf-spacing-sm);
    }
  }

  /* ===== 表单元素样式 ===== */
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--cf-spacing-sm);
  }

  .form-label {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--cf-text-primary);
    margin-bottom: var(--cf-spacing-xs);
  }

  .form-actions {
    display: flex;
    gap: var(--cf-spacing-sm);
    justify-content: flex-end;
    margin-top: var(--cf-spacing-md);
    padding-top: var(--cf-spacing-md);
    border-top: 1px solid var(--cf-border);
  }

  /* ===== 按钮样式 ===== */
  .cf-button {
    padding: var(--cf-spacing-sm) var(--cf-spacing-lg);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-sm);
    background: var(--cf-surface);
    color: var(--cf-text-primary);
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 500;
    transition: all var(--cf-transition-fast);
    min-width: 100px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-sm);
  }

  .cf-button.primary {
    background: var(--cf-primary-color);
    color: white;
    border-color: var(--cf-primary-color);
  }

  .cf-button:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  .cf-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* ===== 卡片样式 ===== */
  .cf-card {
    background: var(--cf-surface);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    padding: var(--cf-spacing-lg);
    transition: all var(--cf-transition-fast);
  }

  .cf-card:hover {
    border-color: var(--cf-primary-color);
    box-shadow: var(--cf-shadow-sm);
  }

  .cf-card.selected {
    border-color: var(--cf-primary-color);
    background: rgba(var(--cf-rgb-primary), 0.05);
  }

  /* ===== 列表样式 ===== */
  .cf-list {
    display: flex;
    flex-direction: column;
    gap: var(--cf-spacing-sm);
  }

  .cf-list-item {
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-md);
    padding: var(--cf-spacing-md);
    background: var(--cf-surface);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    transition: all var(--cf-transition-fast);
    cursor: pointer;
  }

  .cf-list-item:hover {
    border-color: var(--cf-primary-color);
    transform: translateY(-1px);
  }

  .cf-list-item.selected {
    border-color: var(--cf-primary-color);
    background: rgba(var(--cf-rgb-primary), 0.05);
  }

  /* ===== 图标样式 ===== */
  .cf-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cf-icon-small {
    width: 16px;
    height: 16px;
  }

  .cf-icon-large {
    width: 32px;
    height: 32px;
  }

  /* ===== 进度条样式 ===== */
  .cf-progress {
    height: 6px;
    background: var(--cf-border);
    border-radius: 3px;
    overflow: hidden;
  }

  .cf-progress-fill {
    height: 100%;
    background: var(--cf-primary-color);
    transition: width 0.3s ease;
    border-radius: 3px;
  }

  /* ===== 徽章样式 ===== */
  .cf-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    background: var(--cf-primary-color);
    color: white;
    border-radius: var(--cf-radius-sm);
    font-size: 0.7em;
    font-weight: 600;
    line-height: 1;
  }

  .cf-badge.success {
    background: var(--cf-success-color);
  }

  .cf-badge.warning {
    background: var(--cf-warning-color);
  }

  .cf-badge.error {
    background: var(--cf-error-color);
  }

  /* ===== 分隔线样式 ===== */
  .cf-divider {
    height: 1px;
    background: var(--cf-border);
    margin: var(--cf-spacing-md) 0;
    border: none;
  }

  .cf-divider-vertical {
    width: 1px;
    height: auto;
    margin: 0 var(--cf-spacing-md);
  }

  /* ===== 工具提示样式 ===== */
  .cf-tooltip {
    position: relative;
  }

  .cf-tooltip:hover::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--cf-dark-background);
    color: var(--cf-dark-text);
    padding: var(--cf-spacing-sm) var(--cf-spacing-md);
    border-radius: var(--cf-radius-sm);
    font-size: 0.8em;
    white-space: nowrap;
    z-index: 1000;
    margin-bottom: 4px;
  }

  /* ===== 空状态样式 ===== */
  .cf-empty-state {
    text-align: center;
    padding: var(--cf-spacing-xl);
    color: var(--cf-text-secondary);
  }

  .cf-empty-icon {
    font-size: 3em;
    opacity: 0.5;
    margin-bottom: var(--cf-spacing-md);
  }

  /* ===== 加载状态样式 ===== */
  .cf-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cf-spacing-md);
    padding: var(--cf-spacing-xl);
  }

  .cf-loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--cf-border);
    border-top: 2px solid var(--cf-primary-color);
    border-radius: 50%;
    animation: cf-spin 1s linear infinite;
  }

  @keyframes cf-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ===== 网格系统 ===== */
  .cf-grid-system {
    display: grid;
    gap: var(--cf-spacing-md);
  }

  .cf-grid-1 { grid-template-columns: 1fr; }
  .cf-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .cf-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .cf-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .cf-grid-auto { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }

  @container cardforge-container (max-width: 600px) {
    .cf-grid-2,
    .cf-grid-3,
    .cf-grid-4 {
      grid-template-columns: 1fr;
    }
  }

  /* ===== 滚动条样式 ===== */
  .cf-scrollable {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--cf-border) transparent;
  }

  .cf-scrollable::-webkit-scrollbar {
    width: 6px;
  }

  .cf-scrollable::-webkit-scrollbar-track {
    background: transparent;
  }

  .cf-scrollable::-webkit-scrollbar-thumb {
    background: var(--cf-border);
    border-radius: 3px;
  }

  .cf-scrollable::-webkit-scrollbar-thumb:hover {
    background: var(--cf-text-secondary);
  }
`;