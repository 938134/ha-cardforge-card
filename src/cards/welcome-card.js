// 欢迎卡片 - 简化版（基于新设计系统和工具组件）
import { 
  getGreeting, 
  formatTime, 
  escapeHtml, 
  getDisplayName,
  getPresetBlockContent,
  getRandomQuote 
} from '../core/utils.js';

export const card = {
  id: 'welcome',
  meta: {
    name: '欢迎',
    description: '个性化欢迎信息',
    icon: '👋',
    category: '信息'
  },
  
  schema: {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    greetingName: {
      type: 'text',
      label: '自定义称呼',
      placeholder: '例如：小明'
    },
    showQuote: {
      type: 'boolean',
      label: '显示每日一言',
      default: true
    }
  },
  
  blockType: 'preset',
  presetBlocks: {
    daily_quote: {
      defaultName: '每日一言',
      defaultIcon: 'mdi:format-quote-close',
      required: false,
      description: '关联一个文本传感器实体显示每日名言'
    }
  },
  
  template: (config, data) => {
    const now = new Date();
    const userName = getDisplayName(config, data.hass);
    
    // 1. 问候语
    const greeting = getGreeting(now, userName);
    
    // 2. 时间
    const timeStr = formatTime(now, config.use24Hour);
    
    // 3. 每日一言
    let quoteHtml = '';
    if (config.showQuote) {
      const quoteData = getPresetBlockContent(
        config.blocks || {}, 
        'daily_quote', 
        data.hass, 
        getRandomQuote(now)
      );
      
      if (quoteData.content) {
        quoteHtml = `
          <div class="quote-container ${quoteData.hasEntity ? 'has-entity' : ''}">
            ${quoteData.icon ? `
              <div class="quote-icon">
                <ha-icon icon="${quoteData.icon}"></ha-icon>
              </div>
            ` : ''}
            <div class="quote-content">${escapeHtml(quoteData.content)}</div>
          </div>
        `;
      }
    }
    
    return `
      <div class="welcome-card">
        <div class="greeting">${escapeHtml(greeting)}</div>
        <div class="time">${timeStr}</div>
        ${quoteHtml}
      </div>
    `;
  },
  
  styles: (config, theme) => {
    // 注意：这里不再声明JS变量，直接在CSS中使用设计系统变量
    
    return `
      /* ==================== 基础卡片布局 ==================== */
      .welcome-card {
        /* 使用设计系统的居中布局 */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: var(--cf-card-min-height, 200px);
        padding: var(--cf-spacing-xl);
        text-align: center;
        font-family: var(--cf-font-family-base);
        
        /* 关键：三个部分的垂直间距完全一致 */
        gap: var(--cf-spacing-xl);
      }
      
      /* ==================== 问候语样式 ==================== */
      .greeting {
        font-size: var(--cf-font-size-2xl);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-primary);
        line-height: var(--cf-line-height-tight);
        margin: 0;
      }
      
      /* ==================== 时间样式 ==================== */
      .time {
        font-size: var(--cf-font-size-4xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        line-height: var(--cf-line-height-tight);
        letter-spacing: 0.5px;
        margin: 0;
        
        /* 文字阴影使用设计系统的主色RGB变量 */
        text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.2);
      }
      
      /* ==================== 每日一言样式 ==================== */
      .quote-container {
        width: 100%;
        max-width: 500px;
        padding: var(--cf-spacing-md);
        background: var(--cf-surface-elevated);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-lg);
        
        /* 关键：与问候语和时间相同的水平居中 */
        display: flex;
        align-items: flex-start;
        justify-content: center;
        gap: var(--cf-spacing-md);
        
        /* 过渡效果使用设计系统变量 */
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      /* 图标样式 - 使用设计系统的块图标基础样式 */
      .quote-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        
        /* 无底色，透明背景 */
        background: transparent;
        color: var(--cf-text-secondary);
        font-size: 1.4em;
        
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      /* 关联实体时的图标颜色 */
      .quote-container.has-entity .quote-icon {
        color: var(--cf-accent-color);
      }
      
      /* 内容样式 */
      .quote-content {
        flex: 1;
        min-width: 0;
        font-size: var(--cf-font-size-lg);
        color: var(--cf-text-secondary);
        line-height: var(--cf-line-height-relaxed);
        font-style: italic;
        font-weight: var(--cf-font-weight-light);
        
        /* 文本处理 */
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        text-align: left;
        
        /* 关键：与图标垂直居中对齐 */
        display: flex;
        align-items: center;
        margin: 0;
        padding: 0;
      }
      
      /* ==================== 交互效果 ==================== */
      .quote-container:hover {
        background: var(--cf-hover-color);
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .quote-container:hover .quote-icon {
        transform: scale(1.05);
        color: var(--cf-primary-color);
      }
      
      .quote-container:hover .quote-content {
        color: var(--cf-text-primary);
      }
      
      .quote-container:active {
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }
      
      /* ==================== 深色模式适配 ==================== */
      @media (prefers-color-scheme: dark) {
        .time {
          text-shadow: 0 2px 12px rgba(var(--cf-primary-color-rgb), 0.3);
        }
        
        .quote-container {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--cf-border-dark);
        }
        
        .quote-icon {
          color: var(--cf-text-tertiary);
        }
        
        .quote-container.has-entity .quote-icon {
          color: var(--cf-accent-color);
        }
        
        .quote-content {
          color: var(--cf-text-tertiary);
        }
        
        .quote-container:hover .quote-icon {
          color: var(--cf-primary-color);
        }
        
        .quote-container:hover .quote-content {
          color: var(--cf-text-secondary);
        }
      }
      
      /* ==================== 响应式设计 ==================== */
      /* 使用设计系统的断点变量 */
      @container cardforge-container (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
          gap: var(--cf-spacing-lg);
        }
        
        .greeting {
          font-size: var(--cf-font-size-xl);
        }
        
        .time {
          font-size: var(--cf-font-size-3xl);
        }
        
        .quote-container {
          max-width: 450px;
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }
        
        .quote-icon {
          width: 36px;
          height: 36px;
          font-size: 1.2em;
        }
        
        .quote-content {
          font-size: var(--cf-font-size-md);
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .welcome-card {
          padding: var(--cf-spacing-md);
          min-height: 180px;
          gap: var(--cf-spacing-md);
        }
        
        .greeting {
          font-size: var(--cf-font-size-lg);
        }
        
        .time {
          font-size: var(--cf-font-size-2xl);
        }
        
        .quote-container {
          max-width: 100%;
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
          
          /* 小屏时改为垂直布局 */
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .quote-icon {
          width: 32px;
          height: 32px;
          font-size: 1.1em;
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .quote-content {
          font-size: var(--cf-font-size-sm);
          text-align: center;
          align-items: center;
          line-height: var(--cf-line-height-normal);
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .welcome-card {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }
        
        .greeting {
          font-size: var(--cf-font-size-md);
        }
        
        .time {
          font-size: var(--cf-font-size-xl);
        }
        
        .quote-container {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        }
        
        .quote-content {
          font-size: var(--cf-font-size-xs);
        }
      }
    `;
  }
};
