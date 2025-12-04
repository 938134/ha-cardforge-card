import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

// 块专用样式
export const blockStyles = css`
  .cardforge-block {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
    min-height: 60px;
    transition: all 0.15s ease;
  }
  
  .cardforge-block:hover {
    background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.08);
  }
  
  .block-icon {
    font-size: 1.5em;
    color: var(--cf-text-secondary, #757575);
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.1);
  }
  
  .block-content {
    flex: 1;
    min-width: 0;
  }
  
  .block-name {
    font-size: 0.9em;
    color: var(--cf-text-secondary, #757575);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .block-value {
    font-size: 1.2em;
    font-weight: 500;
    color: var(--cf-text-primary, #212121);
    line-height: 1.3;
  }
  
  /* 区域样式 */
  .area-header {
    background: rgba(33, 150, 243, 0.08);
    border-left: 3px solid #2196f3;
  }
  
  .area-content {
    /* 默认内容区域样式 */
  }
  
  .area-footer {
    background: rgba(255, 152, 0, 0.08);
    border-top: 1px solid var(--cf-border, #e0e0e0);
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
`;
