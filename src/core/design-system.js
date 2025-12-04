// src/core/design-system.js - 完整代码
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const designSystem = css`
  :host {
    /* 颜色变量 */
    --cf-primary-color: var(--primary-color, #03a9f4);
    --cf-accent-color: var(--accent-color, #ff4081);
    --cf-background: var(--card-background-color, #ffffff);
    --cf-surface: var(--card-background-color, #ffffff);
    --cf-border: var(--divider-color, #e0e0e0);
    --cf-text-primary: var(--primary-text-color, #212121);
    --cf-text-secondary: var(--secondary-text-color, #757575);
    
    /* 块变量 */
    --cf-block-bg: rgba(0, 0, 0, 0.03);
    --cf-block-radius: 8px;
    --cf-block-padding: 12px;
    --cf-block-gap: 8px; /* 固定小间距 */
    
    /* 间距变量 */
    --cf-spacing-xs: 4px;
    --cf-spacing-sm: 8px;
    --cf-spacing-md: 12px;
    --cf-spacing-lg: 16px;
    --cf-spacing-xl: 20px;
    
    /* 圆角变量 */
    --cf-radius-sm: 4px;
    --cf-radius-md: 8px;
    --cf-radius-lg: 12px;
    
    /* 动画变量 */
    --cf-transition-fast: 0.15s ease;
    --cf-transition-normal: 0.25s ease;
    
    /* RGB颜色变量（用于rgba） */
    --cf-rgb-primary: 3, 169, 244;
    --cf-rgb-accent: 255, 64, 129;
    
    /* 区域颜色变量 */
    --cf-area-header: #2196f3;
    --cf-area-content: #4caf50;
    --cf-area-footer: #ff9800;
    --cf-area-sidebar: #9c27b0;
    
    /* 区域背景变量 */
    --cf-area-header-bg: rgba(33, 150, 243, 0.08);
    --cf-area-content-bg: rgba(76, 175, 80, 0.08);
    --cf-area-footer-bg: rgba(255, 152, 0, 0.08);
  }
  
  /* 深色模式适配 */
  @media (prefers-color-scheme: dark) {
    :host {
      --cf-background: #1a1a1a;
      --cf-surface: #2d2d2d;
      --cf-border: #404040;
      --cf-text-primary: #e0e0e0;
      --cf-text-secondary: #a0a0a0;
      --cf-block-bg: rgba(255, 255, 255, 0.05);
      
      --cf-area-header-bg: rgba(33, 150, 243, 0.15);
      --cf-area-content-bg: rgba(76, 175, 80, 0.15);
      --cf-area-footer-bg: rgba(255, 152, 0, 0.15);
    }
  }
  
  /* 容器查询基础样式 */
  .cardforge-container {
    container-type: inline-size;
    container-name: cardforge-container;
  }
  
  /* 基础块样式 */
  .cardforge-block {
    display: flex;
    align-items: center;
    gap: var(--cf-block-gap);
    padding: var(--cf-block-padding);
    background: var(--cf-block-bg);
    border-radius: var(--cf-block-radius);
    min-height: 60px;
    position: relative;
    transition: all var(--cf-transition-fast);
  }
  
  .cardforge-block:hover {
    background: rgba(var(--cf-rgb-primary), 0.08);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .block-icon {
    font-size: 1.5em;
    color: var(--cf-text-secondary);
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cf-radius-md);
    background: rgba(var(--cf-rgb-primary), 0.1);
  }
  
  .block-content {
    flex: 1;
    min-width: 0;
  }
  
  .block-name {
    font-size: 0.9em;
    color: var(--cf-text-secondary);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .block-value {
    font-size: 1.2em;
    font-weight: 500;
    color: var(--cf-text-primary);
    line-height: 1.3;
  }
  
  /* 区域基础样式 */
  .area-header {
    background: var(--cf-area-header-bg);
    border-left: 3px solid var(--cf-area-header);
  }
  
  .area-content {
    /* 默认样式，内容区域通常不需要特殊背景 */
  }
  
  .area-footer {
    background: var(--cf-area-footer-bg);
    border-top: 1px solid var(--cf-border);
  }
  
  .area-sidebar {
    background: var(--cf-area-sidebar-bg);
    border-right: 3px solid var(--cf-area-sidebar);
  }
  
  /* 紧凑模式 */
  .compact .cardforge-block {
    min-height: 50px;
    padding: 8px;
  }
  
  .compact .block-icon {
    font-size: 1.2em;
    width: 32px;
    height: 32px;
  }
  
  .compact .block-name {
    font-size: 0.8em;
    margin-bottom: 2px;
  }
  
  .compact .block-value {
    font-size: 1em;
  }
  
  /* 响应式块布局 */
  @container cardforge-container (max-width: 400px) {
    .cardforge-block {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }
    
    .block-name {
      font-size: 0.8em;
      margin-bottom: 2px;
    }
    
    .block-value {
      font-size: 1em;
    }
    
    .block-icon {
      font-size: 1.3em;
    }
  }
  
  /* 对齐方式 */
  .align-left {
    text-align: left;
  }
  
  .align-center {
    text-align: center;
  }
  
  .align-right {
    text-align: right;
  }
  
  /* 辅助类 */
  .text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .flex-start {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  
  .flex-end {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  
  /* 阴影 */
  --cf-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --cf-shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
  --cf-shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.15);
  
  /* 网格系统 */
  .grid-1 {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--cf-block-gap);
  }
  
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--cf-block-gap);
  }
  
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--cf-block-gap);
  }
  
  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--cf-block-gap);
  }
  
  /* 响应式网格 */
  @container cardforge-container (max-width: 600px) {
    .grid-3, .grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @container cardforge-container (max-width: 400px) {
    .grid-2, .grid-3, .grid-4 {
      grid-template-columns: 1fr;
    }
  }
`;
