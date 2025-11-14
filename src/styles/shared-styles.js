// src/styles/shared-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const sharedStyles = css`
  /* ===== 基础配置样式 ===== */
  .config-header {
    margin-bottom: 16px;
    font-size: 1em;
    font-weight: 600;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .config-row {
    margin-bottom: 20px;
  }
  
  .config-row.focused {
    /* 聚焦状态的额外样式可以在这里定义 */
  }
  
  /* ===== 实体标签样式 ===== */
  .entity-label {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .required-star {
    color: var(--error-color);
    margin-left: 4px;
  }
  
  .entity-help {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    margin-top: 6px;
    line-height: 1.3;
  }
  
  /* ===== 表单控件容器 ===== */
  .entity-picker-container {
    min-width: 200px;
    width: 100%;
  }
  
  /* ===== ha-select 样式 ===== */
  .entity-picker-container ha-select,
  ha-select {
    width: 100%;
    --mdc-theme-primary: var(--primary-color);
    --mdc-menu-min-width: 200px;
  }
  
  /* ===== ha-combo-box 样式 ===== */
  .entity-picker-container ha-combo-box,
  ha-combo-box {
    width: 100%;
    --ha-combo-box-background: var(--card-background-color);
    --ha-combo-box-text-color: var(--primary-text-color);
    --ha-combo-box-icon-color: var(--secondary-text-color);
    --ha-combo-box-border-color: var(--divider-color);
    --ha-combo-box-border-radius: 4px;
    --ha-combo-box-hover-border-color: var(--primary-color);
    --ha-combo-box-focused-border-color: var(--primary-color);
  }
  
  /* ===== 智能输入组件样式 ===== */
  .smart-input-container {
    position: relative;
  }
  
  .smart-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
  }
  
  .smart-input:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.1);
  }
  
  .smart-input.entity {
    background: rgba(76, 175, 80, 0.05);
    border-color: rgba(76, 175, 80, 0.3);
  }
  
  .smart-input.jinja {
    background: rgba(255, 152, 0, 0.05);
    border-color: rgba(255, 152, 0, 0.3);
  }
  
  .smart-input.text {
    background: rgba(33, 150, 243, 0.05);
    border-color: rgba(33, 150, 243, 0.3);
  }
  
  .smart-input.empty {
    background: var(--card-background-color);
  }
  
  .input-icon {
    font-size: 1.1em;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }
  
  .smart-input ha-textfield {
    flex: 1;
    --mdc-text-field-fill-color: transparent;
    --mdc-text-field-label-ink-color: var(--secondary-text-color);
    --mdc-text-field-ink-color: var(--primary-text-color);
  }
  
  .type-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7em;
    font-weight: 600;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .type-badge.entity {
    background: rgba(76, 175, 80, 0.15);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  .type-badge.jinja {
    background: rgba(255, 152, 0, 0.15);
    color: #ef6c00;
    border: 1px solid rgba(255, 152, 0, 0.3);
  }
  
  .type-badge.text {
    background: rgba(33, 150, 243, 0.15);
    color: #1565c0;
    border: 1px solid rgba(33, 150, 243, 0.3);
  }
  
  .type-badge.empty {
    background: rgba(158, 158, 158, 0.15);
    color: #616161;
    border: 1px solid rgba(158, 158, 158, 0.3);
  }
  
  .value-preview {
    margin-top: 6px;
    padding: 6px 8px;
    background: var(--card-background-color);
    border-radius: 6px;
    font-size: 0.8em;
    display: flex;
    gap: 8px;
    align-items: center;
    border: 1px solid var(--divider-color);
  }
  
  .preview-label {
    color: var(--secondary-text-color);
    font-weight: 500;
    font-size: 0.75em;
  }
  
  .preview-value {
    color: var(--primary-text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85em;
    flex: 1;
  }
  
  .input-hints {
    margin-top: 8px;
  }
  
  .hint-item {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    line-height: 1.4;
    margin-bottom: 2px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  
  .hint-item::before {
    content: '💡';
    font-size: 0.9em;
    flex-shrink: 0;
    margin-top: 1px;
  }
  
  .quick-examples {
    margin-top: 8px;
    padding: 8px;
    background: rgba(var(--rgb-primary-color), 0.05);
    border-radius: 6px;
    border: 1px solid rgba(var(--rgb-primary-color), 0.1);
  }
  
  .examples-title {
    font-size: 0.75em;
    font-weight: 600;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }
  
  .example-item {
    font-size: 0.7em;
    color: var(--secondary-text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    line-height: 1.3;
    margin-bottom: 2px;
  }
  
  /* ===== 状态显示样式 ===== */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--secondary-text-color);
  }
  
  .loading-container {
    padding: 40px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  
  .loading-text {
    margin-top: 8px;
  }
  
  .error-container {
    padding: 20px;
    text-align: center;
    color: var(--error-color);
  }
  
  .error-icon {
    font-size: 2em;
    margin-bottom: 8px;
  }
  
  .error-title {
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .error-message {
    font-size: 0.9em;
    opacity: 0.8;
  }
  
  /* ===== 操作按钮区域 ===== */
  .card-actions {
    margin-top: 24px;
    text-align: right;
    border-top: 1px solid var(--divider-color);
    padding-top: 16px;
  }
  
  /* ===== 编辑器容器 ===== */
  .editor-container {
    padding: 16px;
  }
  
  /* ===== 功能支持提示 ===== */
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
  
  .plugin-theme-info {
    margin-bottom: 16px;
  }
  
  .config-hint {
    color: var(--secondary-text-color);
    font-size: 0.85em;
    margin-top: 16px;
  }
  
  /* ===== 动画效果 ===== */
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
        0 0 20px #00ff88,
        0 0 35px rgba(0, 255, 136, 0.3),
        inset 0 0 25px rgba(0, 255, 136, 0.2);
    }
  }
  
  @keyframes glassShine {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes messageFade {
    0% {
      opacity: 0;
      transform: translateY(5px);
    }
    100% {
      opacity: 0.8;
      transform: translateY(0px);
    }
  }
  
  @keyframes sealRotate {
    0%, 100% {
      transform: rotate(15deg);
    }
    50% {
      transform: rotate(25deg);
    }
  }
  
  /* ===== 卡片通用样式 ===== */
  .cardforge-card {
    position: relative;
    font-family: var(--paper-font-common-nowrap_-_font-family);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: default;
    overflow: hidden;
  }
  
  .cardforge-interactive { 
    cursor: pointer; 
    transition: all 0.2s ease; 
  }
  
  .cardforge-interactive:hover { 
    opacity: 0.8; 
  }
  
  .cardforge-interactive:active { 
    transform: scale(0.98); 
  }
  
  .cardforge-status-on { 
    color: var(--success-color); 
  }
  
  .cardforge-status-off { 
    color: var(--disabled-color); 
  }
  
  .cardforge-status-unavailable { 
    color: var(--error-color); 
    opacity: 0.5; 
  }
  
  /* ===== 工具类样式 ===== */
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .text-center {
    text-align: center;
  }
  
  .flex-column {
    display: flex;
    flex-direction: column;
  }
  
  .flex-row {
    display: flex;
    align-items: center;
  }
  
  /* ===== 响应式设计 ===== */
  @media (max-width: 480px) {
    .editor-container {
      padding: 12px;
    }
    
    .config-row {
      margin-bottom: 16px;
    }
    
    .entity-label {
      font-size: 0.85em;
    }
    
    .smart-input {
      padding: 6px 8px;
    }
    
    .value-preview {
      font-size: 0.75em;
    }
    
    .card-actions {
      margin-top: 20px;
      padding-top: 12px;
    }
  }
  
  @media (max-width: 360px) {
    .editor-container {
      padding: 8px;
    }
    
    .smart-input {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }
    
    .type-badge {
      align-self: flex-end;
    }
  }
`;