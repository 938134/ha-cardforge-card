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
    font-size: 0.9em;
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
    font-size: 1em;
  }

  /* ===== 选择器网格增强样式 ===== */
  .selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: var(--cf-spacing-md);
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--cf-radius-lg);
    padding: var(--cf-spacing-lg);
    border: 1px solid rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    position: relative;
  }

  /* 深色模式选择器网格 */
  @media (prefers-color-scheme: dark) {
    .selector-grid {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
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
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: var(--cf-spacing-sm);
    max-height: 260px;
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
    min-height: 56px;
    height: 64px;
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
    font-size: 1.2em;
    margin-bottom: 2px;
    line-height: 1;
  }

  .plugin-item-name {
    font-size: 0.65em;
    font-weight: 500;
    line-height: 1.1;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ===== 智能输入组件样式 - 增强版 ===== */
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

  /* 输入类型指示器 */
  .input-type-badge {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(var(--cf-rgb-primary), 0.1);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.7em;
    pointer-events: none;
    z-index: 2;
  }

  /* 不同类型输入框的视觉提示 */
  .smart-input-field-container.entity {
    border-left: 3px solid var(--cf-success-color);
  }

  .smart-input-field-container.jinja {
    border-left: 3px solid var(--cf-warning-color);
  }

  .smart-input-field-container.text {
    border-left: 3px solid var(--cf-primary-color);
  }

  /* 深色模式输入框 */
  @media (prefers-color-scheme: dark) {
    .smart-input-field {
      --mdc-text-field-fill-color: var(--cf-dark-surface);
      --mdc-text-field-ink-color: var(--cf-dark-text);
      --mdc-text-field-label-ink-color: var(--cf-dark-text-secondary);
    }
  }

  .smart-input-entity-button,
  .smart-input-template-button {
    background: var(--cf-primary-color);
    color: white;
    border: none;
    border-radius: var(--cf-radius-sm);
    padding: 0 var(--cf-spacing-sm);
    height: 40px;
    min-width: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em;
    transition: all var(--cf-transition-fast);
  }

  .smart-input-template-button {
    background: var(--cf-warning-color);
  }

  .smart-input-entity-button:hover {
    background: var(--cf-accent-color);
    transform: translateY(-1px);
  }

  .smart-input-template-button:hover {
    background: #e65100;
    transform: translateY(-1px);
  }

  /* 值预览 */
  .value-preview {
    margin-top: var(--cf-spacing-xs);
    padding: var(--cf-spacing-sm);
    background: rgba(var(--cf-rgb-primary), 0.05);
    border-radius: var(--cf-radius-sm);
    font-size: 0.8em;
    display: flex;
    gap: var(--cf-spacing-sm);
    align-items: center;
    border: 1px solid rgba(var(--cf-rgb-primary), 0.1);
  }

  .preview-label {
    color: var(--cf-text-secondary);
    font-weight: 500;
    font-size: 0.75em;
    flex-shrink: 0;
  }

  .preview-value {
    color: var(--cf-text-primary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85em;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 深色模式预览 */
  @media (prefers-color-scheme: dark) {
    .value-preview {
      background: rgba(var(--cf-rgb-primary), 0.1);
      border-color: rgba(var(--cf-rgb-primary), 0.2);
    }
  }

  /* 智能方向下拉框 */
  .smart-input-dropdown {
    position: absolute;
    left: 0;
    right: 0;
    background: var(--cf-surface);
    border: 1px solid var(--cf-border);
    border-radius: var(--cf-radius-md);
    box-shadow: var(--cf-shadow-lg);
    z-index: 1000;
    max-height: min(450px, calc(100vh - 200px)); /* 增加高度以容纳模板 */
    min-height: 120px;
    overflow-y: auto;
    width: 100%;
  }

  /* 向下展开 */
  .smart-input-dropdown.dropdown-down {
    top: 100%;
    margin-top: var(--cf-spacing-xs);
    bottom: auto;
  }

  /* 向上展开 */
  .smart-input-dropdown.dropdown-up {
    bottom: 100%;
    margin-bottom: var(--cf-spacing-xs);
    top: auto;
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
    font-size: 0.85em;
    background: rgba(var(--cf-rgb-primary), 0.05);
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .smart-input-picker-header small {
    font-weight: normal;
    opacity: 0.7;
    font-size: 0.75em;
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

  /* 修复：搜索框宽度100% */
  .smart-input-search-box ha-textfield {
    width: 100% !important;
    --mdc-text-field-fill-color: var(--cf-surface);
  }

  /* 深色模式搜索框 */
  @media (prefers-color-scheme: dark) {
    .smart-input-search-box {
      border-bottom-color: var(--cf-dark-border);
      background: var(--cf-dark-surface);
    }
    
    .smart-input-search-box ha-textfield {
      --mdc-text-field-fill-color: var(--cf-dark-surface);
      --mdc-text-field-ink-color: var(--cf-dark-text);
      --mdc-text-field-label-ink-color: var(--cf-dark-text-secondary);
    }
  }

  .smart-input-entity-list {
    max-height: 200px;
    overflow-y: auto;
    border-bottom: 1px solid var(--cf-border);
  }

  .smart-input-entity-item {
    padding: var(--cf-spacing-sm) var(--cf-spacing-md);
    cursor: pointer;
    border-bottom: 1px solid rgba(var(--cf-border), 0.5);
    font-size: 0.8em;
    transition: all var(--cf-transition-fast);
    min-height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .smart-input-entity-item:last-child {
    border-bottom: none;
  }

  .smart-input-entity-name {
    font-weight: 500;
    flex: 1;
  }

  .smart-input-entity-id {
    font-size: 0.75em;
    color: var(--cf-text-secondary);
    font-family: monospace;
    margin-right: var(--cf-spacing-sm);
  }

  .smart-input-entity-state {
    font-size: 0.75em;
    color: var(--cf-success-color);
    font-weight: 500;
  }

  /* 深色模式实体项 */
  @media (prefers-color-scheme: dark) {
    .smart-input-entity-item {
      border-bottom-color: rgba(var(--cf-dark-border), 0.5);
      color: var(--cf-dark-text);
    }
    
    .smart-input-entity-item:hover {
      background: rgba(var(--cf-rgb-primary), 0.15);
    }

    .smart-input-entity-id {
      color: var(--cf-dark-text-secondary);
    }
  }

  .smart-input-entity-item:hover {
    background: rgba(var(--cf-rgb-primary), 0.08);
  }

  /* 模板示例区域 */
  .smart-input-templates {
    padding: var(--cf-spacing-md);
  }

  .templates-header {
    font-weight: 600;
    font-size: 0.85em;
    margin-bottom: var(--cf-spacing-sm);
    color: var(--cf-text-primary);
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-xs);
  }

  .templates-header::before {
    content: '🔧';
    font-size: 0.9em;
  }

  .templates-list {
    display: flex;
    flex-direction: column;
    gap: var(--cf-spacing-xs);
  }

  .template-item {
    padding: var(--cf-spacing-sm);
    border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
    border-radius: var(--cf-radius-sm);
    cursor: pointer;
    transition: all var(--cf-transition-fast);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .template-item:hover {
    background: rgba(var(--cf-rgb-primary), 0.08);
    border-color: var(--cf-primary-color);
    transform: translateY(-1px);
  }

  .template-item code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.75em;
    color: var(--cf-primary-color);
    background: rgba(var(--cf-rgb-primary), 0.1);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .template-item span {
    font-size: 0.7em;
    color: var(--cf-text-secondary);
  }

  /* 深色模式模板 */
  @media (prefers-color-scheme: dark) {
    .templates-header {
      color: var(--cf-dark-text);
    }

    .template-item {
      border-color: rgba(var(--cf-rgb-primary), 0.3);
    }

    .template-item:hover {
      background: rgba(var(--cf-rgb-primary), 0.15);
    }

    .template-item code {
      color: var(--cf-warning-color);
      background: rgba(var(--cf-rgb-warning), 0.1);
    }

    .template-item span {
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
      max-height: min(350px, calc(100vh - 150px));
      min-height: 100px;
    }
    
    .smart-input-entity-item {
      padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
      min-height: 36px;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    .smart-input-entity-state {
      align-self: flex-end;
      margin-top: -20px;
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

    .smart-input-wrapper {
      flex-wrap: wrap;
    }

    .smart-input-field-container {
      order: 1;
      width: 100%;
      margin-bottom: var(--cf-spacing-sm);
    }

    .smart-input-entity-button,
    .smart-input-template-button {
      order: 2;
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