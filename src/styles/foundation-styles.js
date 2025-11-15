import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const foundationStyles = css`
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
    --cf-rgb-text: 33, 33, 33;
    
    /* 间距系统 */
    --cf-spacing-xs: 4px;
    --cf-spacing-sm: 8px;
    --cf-spacing-md: 12px;
    --cf-spacing-lg: 16px;
    --cf-spacing-xl: 20px;
    --cf-spacing-xxl: 24px;
    
    /* 圆角系统 */
    --cf-radius-sm: 4px;
    --cf-radius-md: 8px;
    --cf-radius-lg: 12px;
    --cf-radius-xl: 16px;
    
    /* 阴影系统 */
    --cf-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --cf-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
    --cf-shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.2);
    --cf-shadow-xl: 0 12px 35px rgba(0, 0, 0, 0.25);
    
    /* 动画系统 */
    --cf-transition-fast: 0.15s ease;
    --cf-transition-normal: 0.3s ease;
    --cf-transition-slow: 0.5s ease;
    --cf-ease-out: cubic-bezier(0.4, 0, 0.2, 1);
    --cf-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ===== 深色主题优化 ===== */
  @media (prefers-color-scheme: dark) {
    :host {
      --cf-rgb-background: 30, 30, 30;
      --cf-rgb-text: 255, 255, 255;
      
      /* 深色主题阴影优化 */
      --cf-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
      --cf-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
      --cf-shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.5);
      --cf-shadow-xl: 0 12px 35px rgba(0, 0, 0, 0.6);
    }
  }

  /* 显式深色主题类 */
  .cf-theme-dark {
    --cf-rgb-background: 30, 30, 30;
    --cf-rgb-text: 255, 255, 255;
    --cf-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --cf-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
    --cf-shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.5);
  }

  /* ===== 布局系统 ===== */
  .cf-grid {
    display: grid;
    gap: var(--cf-spacing-md);
  }
  
  .cf-grid-auto {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); /* 改为80px最小宽度 */
  }
  
  .cf-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .cf-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .cf-grid-4 { grid-template-columns: repeat(4, 1fr); }
  
  .cf-flex { display: flex; }
  .cf-flex-column { flex-direction: column; }
  .cf-flex-center { 
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cf-flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cf-flex-start {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .cf-flex-end {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  
  /* ===== 间距工具类 ===== */
  .cf-gap-xs { gap: var(--cf-spacing-xs); }
  .cf-gap-sm { gap: var(--cf-spacing-sm); }
  .cf-gap-md { gap: var(--cf-spacing-md); }
  .cf-gap-lg { gap: var(--cf-spacing-lg); }
  .cf-gap-xl { gap: var(--cf-spacing-xl); }
  
  .cf-p-xs { padding: var(--cf-spacing-xs); }
  .cf-p-sm { padding: var(--cf-spacing-sm); }
  .cf-p-md { padding: var(--cf-spacing-md); }
  .cf-p-lg { padding: var(--cf-spacing-lg); }
  .cf-p-xl { padding: var(--cf-spacing-xl); }
  
  .cf-m-xs { margin: var(--cf-spacing-xs); }
  .cf-m-sm { margin: var(--cf-spacing-sm); }
  .cf-m-md { margin: var(--cf-spacing-md); }
  .cf-m-lg { margin: var(--cf-spacing-lg); }
  .cf-m-xl { margin: var(--cf-spacing-xl); }

  /* ===== 文本工具类 ===== */
  .cf-text-xs { font-size: 0.75em; }
  .cf-text-sm { font-size: 0.85em; }
  .cf-text-md { font-size: 1em; }
  .cf-text-lg { font-size: 1.2em; }
  .cf-text-xl { font-size: 1.4em; }
  
  .cf-text-center { text-align: center; }
  .cf-text-left { text-align: left; }
  .cf-text-right { text-align: right; }
  
  .cf-font-normal { font-weight: 400; }
  .cf-font-medium { font-weight: 500; }
  .cf-font-semibold { font-weight: 600; }
  .cf-font-bold { font-weight: 700; }

  /* ===== 组件样式系统 ===== */
  .cf-card {
    background: var(--cf-surface);
    border-radius: var(--cf-radius-lg);
    border: 1px solid var(--cf-border);
    box-shadow: var(--cf-shadow-sm);
    transition: all var(--cf-transition-normal);
    position: relative;
    overflow: hidden;
  }
  
  .cf-card:hover {
    box-shadow: var(--cf-shadow-md);
    transform: translateY(-2px);
  }
  
  .cf-card.selected {
    border-color: var(--cf-primary-color);
    box-shadow: 
      var(--cf-shadow-md),
      0 0 0 1px var(--cf-primary-color);
  }

  /* 选择器卡片专用 - 调整为80x80尺寸 */
  .cf-selector-card {
    padding: var(--cf-spacing-md);
    text-align: center;
    cursor: pointer;
    min-height: 80px; /* 固定高度80px */
    min-width: 80px;  /* 固定宽度80px */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
  }

  /* 深色主题卡片优化 */
  @media (prefers-color-scheme: dark) {
    .cf-selector-card {
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .cf-selector-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(var(--cf-rgb-primary), 0.05),
      transparent
    );
    transition: left 0.6s ease;
  }
  
  .cf-selector-card:hover::before {
    left: 100%;
  }
  
  .cf-selector-card:hover {
    border-color: var(--cf-primary-color);
    transform: translateY(-3px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .cf-selector-card.selected {
    border-color: var(--cf-primary-color);
    background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
    color: white;
    box-shadow: 
      0 8px 25px rgba(var(--cf-rgb-primary), 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
  
  .cf-selector-icon {
    font-size: 1.6em; /* 调整为适合80x80尺寸 */
    margin-bottom: var(--cf-spacing-xs);
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  .cf-selector-card.selected .cf-selector-icon {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  .cf-selector-name {
    font-size: 0.75em; /* 稍小以适应新尺寸 */
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.2px;
  }

  /* 输入组件样式 */
  .cf-input-container {
    position: relative;
    width: 100%;
  }
  
  .cf-input-wrapper {
    display: flex;
    align-items: center;
    gap: var(--cf-spacing-sm);
    width: 100%;
  }
  
  .cf-input-field {
    flex: 1;
  }
  
  .cf-input-button {
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
  
  .cf-input-button:hover {
    background: var(--cf-accent-color);
    transform: translateY(-1px);
  }

  /* 状态样式 */
  .cf-status-on { color: var(--cf-success-color); }
  .cf-status-off { color: var(--cf-text-secondary); }
  .cf-status-unavailable { 
    color: var(--cf-error-color); 
    opacity: 0.5; 
  }
  
  .cf-error { color: var(--cf-error-color); }
  .cf-warning { color: var(--cf-warning-color); }
  .cf-success { color: var(--cf-success-color); }

  /* 交互样式 */
  .cf-interactive { 
    cursor: pointer; 
    transition: all var(--cf-transition-fast); 
  }
  
  .cf-interactive:hover { 
    opacity: 0.8; 
    transform: translateY(-1px);
  }
  
  .cf-interactive:active { 
    transform: scale(0.98); 
  }

  /* ===== 响应式系统 ===== */
  @media (max-width: 600px) {
    .cf-grid-auto {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .cf-selector-card {
      min-height: 70px;    /* 平板端稍小 */
      min-width: 70px;
      padding: var(--cf-spacing-sm);
    }
    
    .cf-selector-icon {
      font-size: 1.4em;
    }
    
    .cf-selector-name {
      font-size: 0.7em;
    }
  }
  
  @media (max-width: 400px) {
    .cf-grid-auto {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .cf-selector-card {
      min-height: 65px;    /* 手机端更小 */
      min-width: 65px;
    }
  }
  
  @media (max-width: 320px) {
    .cf-grid-auto {
      grid-template-columns: 1fr;
    }
    
    .cf-selector-card {
      min-height: 60px;    /* 小屏手机最小 */
      min-width: auto;     /* 单列时宽度自适应 */
      padding: var(--cf-spacing-sm);
    }
    
    .cf-selector-icon {
      font-size: 1.3em;
    }
    
    .cf-selector-name {
      font-size: 0.65em;
    }
  }

  /* ===== 动画系统 ===== */
  @keyframes cf-fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes cf-slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes cf-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .cf-animate-fadeIn { animation: cf-fadeIn 0.3s var(--cf-ease-out); }
  .cf-animate-slideIn { animation: cf-slideIn 0.3s var(--cf-ease-out); }
  .cf-animate-pulse { animation: cf-pulse 2s infinite; }
`;