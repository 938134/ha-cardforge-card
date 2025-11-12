// src/core/shared-styles.js
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
  
  .config-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
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
  
  /* ha-select 样式 */
  .entity-picker-container ha-select,
  ha-select {
    width: 100%;
    --mdc-theme-primary: var(--primary-color);
    --mdc-menu-min-width: 200px;
  }
  
  /* ha-combo-box 样式 */
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
  
  /* 预览区域样式 */
  .preview-container {
    margin: 20px 0;
    padding: 20px;
    background: var(--card-background-color);
    border-radius: 12px;
    border: 1px solid var(--divider-color);
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .preview-content {
    width: 100%;
    text-align: center;
  }
  
  .preview-header {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--primary-text-color);
    font-size: 0.9em;
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

  /* 操作按钮区域 */
  .card-actions {
    margin-top: 24px;
    text-align: right;
    border-top: 1px solid var(--divider-color);
    padding-top: 16px;
  }

  /* 加载状态 */
  .loading-container {
    padding: 40px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  
  .loading-text {
    margin-top: 8px;
  }

  /* 错误状态 */
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

  /* 编辑器容器 */
  .editor-container {
    padding: 16px;
  }

  /* 响应式设计 */
  @media (max-width: 480px) {
    .editor-container {
      padding: 12px;
    }
    
    .preview-container {
      padding: 16px;
      margin: 16px 0;
    }
    
    .config-row {
      margin-bottom: 12px;
    }
    
    .entity-row {
      grid-template-columns: 1fr;
      gap: 8px;
      padding: 8px;
    }
    
    .entity-label {
      font-size: 0.85em;
    }
  }

  /* 卡片通用样式 */
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

  /* 工具类样式 */
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
`;