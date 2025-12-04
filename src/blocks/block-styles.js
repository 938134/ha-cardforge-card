import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

// 块专用样式 - 增强版
export const blockStyles = css`
  /* 基础块样式 */
  .cardforge-block {
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-md, 12px);
    padding: var(--cf-spacing-lg, 16px);
    background: var(--cf-surface, #ffffff);
    border: 1px solid var(--cf-border, #e0e0e0);
    border-radius: var(--cf-radius-md, 8px);
    min-height: 70px;
    transition: all var(--cf-transition-fast, 0.15s) ease;
    position: relative;
    overflow: hidden;
  }
  
  .cardforge-block:hover {
    background: var(--cf-hover-color, rgba(3, 169, 244, 0.08));
    border-color: var(--cf-primary-color, #03a9f4);
    transform: translateY(-2px);
    box-shadow: var(--cf-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  }
  
  .cardforge-block:active {
    transform: translateY(-1px);
    box-shadow: var(--cf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.12));
  }
  
  /* 块图标 */
  .block-icon {
    font-size: 1.6em;
    color: var(--cf-text-secondary, #757575);
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cf-radius-md, 8px);
    background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.1);
    transition: all var(--cf-transition-fast, 0.15s) ease;
  }
  
  .cardforge-block:hover .block-icon {
    color: var(--cf-primary-color, #03a9f4);
    background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.15);
    transform: scale(1.05);
  }
  
  /* 块内容 */
  .block-content {
    flex: 1;
    min-width: 0;
  }
  
  .block-name {
    font-size: var(--cf-font-size-sm, 0.875rem);
    color: var(--cf-text-secondary, #757575);
    margin-bottom: var(--cf-spacing-xs, 4px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: var(--cf-font-weight-medium, 500);
    letter-spacing: 0.3px;
  }
  
  .block-value {
    font-size: var(--cf-font-size-xl, 1.25rem);
    font-weight: var(--cf-font-weight-bold, 700);
    color: var(--cf-text-primary, #212121);
    line-height: var(--cf-line-height-tight, 1.25);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .block-unit {
    font-size: var(--cf-font-size-sm, 0.875rem);
    color: var(--cf-text-tertiary, #9e9e9e);
    font-weight: var(--cf-font-weight-normal, 400);
    margin-left: var(--cf-spacing-xs, 4px);
  }
  
  /* 状态指示器 */
  .block-status {
    position: absolute;
    top: var(--cf-spacing-sm, 8px);
    right: var(--cf-spacing-sm, 8px);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--cf-neutral-400, #bdbdbd);
  }
  
  .block-status.online {
    background: var(--cf-success-color, #4caf50);
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
  
  .block-status.offline {
    background: var(--cf-error-color, #f44336);
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
  }
  
  .block-status.warning {
    background: var(--cf-warning-color, #ff9800);
    box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
  }
  
  /* 区域样式 */
  .area-header .cardforge-block {
    background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.08);
    border-left: 3px solid var(--cf-primary-color, #03a9f4);
    border-color: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.3);
  }
  
  .area-header .block-icon {
    color: var(--cf-primary-color, #03a9f4);
    background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.15);
  }
  
  .area-header .block-name {
    color: var(--cf-text-secondary, #757575);
  }
  
  .area-header .block-value {
    color: var(--cf-text-primary, #212121);
  }
  
  .area-footer .cardforge-block {
    background: rgba(var(--cf-accent-color-rgb, 255, 64, 129), 0.05);
    border-top: 1px solid var(--cf-border, #e0e0e0);
  }
  
  .area-footer .block-icon {
    color: var(--cf-text-tertiary, #9e9e9e);
    background: rgba(0, 0, 0, 0.05);
  }
  
  .area-footer .block-name {
    color: var(--cf-text-tertiary, #9e9e9e);
  }
  
  .area-footer .block-value {
    color: var(--cf-text-secondary, #757575);
  }
  
  /* 紧凑模式 */
  .compact .cardforge-block {
    min-height: 55px;
    padding: var(--cf-spacing-md, 12px);
    gap: var(--cf-spacing-sm, 8px);
  }
  
  .compact .block-icon {
    font-size: 1.3em;
    width: 36px;
    height: 36px;
  }
  
  .compact .block-name {
    font-size: var(--cf-font-size-xs, 0.75rem);
    margin-bottom: var(--cf-spacing-xs, 4px);
  }
  
  .compact .block-value {
    font-size: var(--cf-font-size-lg, 1.125rem);
  }
  
  .compact .block-unit {
    font-size: var(--cf-font-size-xs, 0.75rem);
  }
  
  /* 最小模式 */
  .minimal .cardforge-block {
    min-height: 45px;
    padding: var(--cf-spacing-sm, 8px);
    gap: var(--cf-spacing-sm, 8px);
    background: transparent;
    border: none;
  }
  
  .minimal .cardforge-block:hover {
    background: var(--cf-hover-color, rgba(3, 169, 244, 0.08));
    transform: none;
    box-shadow: none;
  }
  
  .minimal .block-icon {
    font-size: 1.2em;
    width: 32px;
    height: 32px;
    background: transparent;
    color: var(--cf-text-tertiary, #9e9e9e);
  }
  
  .minimal .block-name {
    font-size: var(--cf-font-size-xs, 0.75rem);
    color: var(--cf-text-tertiary, #9e9e9e);
  }
  
  .minimal .block-value {
    font-size: var(--cf-font-size-base, 1rem);
  }
  
  /* 禁用状态 */
  .cardforge-block.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  
  .cardforge-block.disabled .block-icon {
    background: var(--cf-disabled-color, rgba(0, 0, 0, 0.12));
  }
  
  /* 加载状态 */
  .cardforge-block.loading .block-value::after {
    content: '';
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-left: var(--cf-spacing-sm, 8px);
    border: 2px solid var(--cf-border, #e0e0e0);
    border-top-color: var(--cf-primary-color, #03a9f4);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    vertical-align: middle;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* 空状态 */
  .cardforge-block.empty .block-value {
    color: var(--cf-text-tertiary, #9e9e9e);
    font-style: italic;
    font-weight: var(--cf-font-weight-normal, 400);
  }
  
  /* 高亮状态 */
  .cardforge-block.highlight {
    background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.12);
    border-color: var(--cf-primary-color, #03a9f4);
    box-shadow: 0 0 0 1px var(--cf-primary-color, #03a9f4),
                0 4px 12px rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.15);
  }
  
  .cardforge-block.highlight .block-icon {
    color: var(--cf-primary-color, #03a9f4);
    background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.2);
  }
  
  /* 错误状态 */
  .cardforge-block.error {
    background: rgba(var(--cf-error-color-rgb, 244, 67, 54), 0.05);
    border-color: rgba(var(--cf-error-color-rgb, 244, 67, 54), 0.3);
  }
  
  .cardforge-block.error .block-icon {
    color: var(--cf-error-color, #f44336);
    background: rgba(var(--cf-error-color-rgb, 244, 67, 54), 0.1);
  }
  
  .cardforge-block.error .block-value {
    color: var(--cf-error-color, #f44336);
  }
  
  /* 成功状态 */
  .cardforge-block.success {
    background: rgba(var(--cf-success-color-rgb, 76, 175, 80), 0.05);
    border-color: rgba(var(--cf-success-color-rgb, 76, 175, 80), 0.3);
  }
  
  .cardforge-block.success .block-icon {
    color: var(--cf-success-color, #4caf50);
    background: rgba(var(--cf-success-color-rgb, 76, 175, 80), 0.1);
  }
  
  .cardforge-block.success .block-value {
    color: var(--cf-success-color, #4caf50);
  }
  
  /* 响应式设计 */
  @container cardforge-container (max-width: 400px) {
    .cardforge-block {
      flex-direction: column;
      text-align: center;
      gap: var(--cf-spacing-sm, 8px);
      padding: var(--cf-spacing-md, 12px);
    }
    
    .block-icon {
      margin-bottom: var(--cf-spacing-xs, 4px);
    }
    
    .block-name {
      font-size: var(--cf-font-size-xs, 0.75rem);
      margin-bottom: var(--cf-spacing-xs, 4px);
    }
    
    .block-value {
      font-size: var(--cf-font-size-lg, 1.125rem);
    }
    
    .block-content {
      width: 100%;
      text-align: center;
    }
  }
  
  /* 深色模式适配 */
  @media (prefers-color-scheme: dark) {
    .cardforge-block {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }
    
    .cardforge-block:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--cf-primary-color, #03a9f4);
    }
    
    .block-icon {
      background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.2);
    }
    
    .area-header .cardforge-block {
      background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.15);
      border-color: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.4);
    }
    
    .area-footer .cardforge-block {
      background: rgba(var(--cf-accent-color-rgb, 255, 64, 129), 0.08);
      border-top-color: rgba(255, 255, 255, 0.2);
    }
    
    .minimal .cardforge-block {
      background: transparent;
    }
    
    .minimal .block-icon {
      color: var(--cf-text-tertiary, #9e9e9e);
    }
    
    .cardforge-block.disabled .block-icon {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  /* 动画效果 */
  .cardforge-block {
    animation: blockFadeIn var(--cf-transition-normal, 0.25s) ease;
  }
  
  @keyframes blockFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;