import { getGreetingByHour, formatTime, getDisplayName,escapeHtml,getDefaultQuote, getEntityState, getEntityIcon } from '../core/utilities.js';

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
    
    // 使用工具库函数
    const greeting = getGreetingByHour(now);
    const userName = getDisplayName(data.hass, config.greetingName, '朋友');
    const timeStr = formatTime(now, config.use24Hour);
    
    // 获取每日一言
    let quoteHtml = '';
    if (config.showQuote) {
      let quoteContent = '';
      let quoteIcon = 'mdi:format-quote-close';
      let hasEntity = false;
      
      const blocks = config.blocks || {};
      
      // 查找每日一言块
      Object.values(blocks).forEach(block => {
        if (block.presetKey === 'daily_quote') {
          if (block.icon) {
            quoteIcon = block.icon;
          }
          
          if (block.entity) {
            hasEntity = true;
            // 使用工具库获取实体状态
            quoteContent = getEntityState(data.hass, block.entity, getDefaultQuote(now));
            
            // 使用工具库获取实体图标
            const entityIcon = getEntityIcon(data.hass, block.entity, quoteIcon);
            if (entityIcon !== 'mdi:cube') {
              quoteIcon = entityIcon;
            }
          }
        }
      });
      
      // 如果没有关联实体，使用默认名言
      if (!hasEntity) {
        quoteContent = getDefaultQuote(now);
      }
      
      if (quoteContent) {
        quoteHtml = `
          <div class="quote-container ${hasEntity ? 'has-entity' : ''}">
            <div class="quote-icon">
              <ha-icon icon="${quoteIcon}"></ha-icon>
            </div>
            <div class="quote-content">${escapeHtml(quoteContent)}</div>
          </div>
        `;
      }
    }
    
    return `
      <div class="welcome-card">
        <div class="greeting">${escapeHtml(greeting + '，' + userName + '！')}</div>
        <div class="time">${timeStr}</div>
        ${quoteHtml}
      </div>
    `;
  },
  
  styles: (config, theme) => {
    // 直接使用设计系统变量，不使用备用值
    // 主题系统会确保这些变量有值
    return `
      .welcome-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 200px;
        padding: var(--cf-spacing-xl);
        text-align: center;
        font-family: var(--cf-font-family-base);
      }
      
      .greeting {
        font-size: 1.8em;
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-primary);
        line-height: var(--cf-line-height-tight);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .time {
        font-size: 3.5em;
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        letter-spacing: 1px;
        line-height: var(--cf-line-height-tight);
        text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.2);
        margin-bottom: var(--cf-spacing-xl);
      }
      
      /* 每日一言容器 */
      .quote-container {
        width: 100%;
        max-width: 500px;
        padding: var(--cf-spacing-md);
        background: var(--cf-surface-elevated);
        border: 1px solid var(--cf-border);
        border-left: 3px solid var(--cf-accent-color);
        border-radius: var(--cf-radius-lg);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        transition: all var(--cf-transition-duration-fast);
        box-shadow: var(--cf-shadow-sm);
        margin-top: var(--cf-spacing-md);
      }
      
      /* 图标区域 */
      .quote-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: transparent;
        color: var(--cf-text-secondary);
        font-size: 1.5em;
        transition: all var(--cf-transition-duration-fast);
      }
      
      .quote-container.has-entity .quote-icon {
        color: var(--cf-accent-color);
      }
      
      /* 内容区域 - 字体颜色调整为更清晰 */
      .quote-content {
        flex: 1;
        min-width: 0;
        font-size: 1.1em;
        color: var(--cf-text-primary);
        line-height: var(--cf-line-height-relaxed);
        font-style: italic;
        font-weight: var(--cf-font-weight-light);
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        text-align: left;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      }
      
      /* 交互效果 */
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
      
      /* 深色模式 - 完全使用设计系统变量 */
      @media (prefers-color-scheme: dark) {
        .time {
          text-shadow: 0 2px 12px rgba(var(--cf-primary-color-rgb), 0.4);
        }
        
        .quote-container {
          background: var(--cf-surface);
          border-color: var(--cf-border-dark);
        }
        
        .quote-icon {
          color: var(--cf-text-secondary);
        }
        
        .quote-container.has-entity .quote-icon {
          color: var(--cf-accent-color);
        }
        
        /* 深色模式下保持清晰的字体颜色 */
        .quote-content {
          color: var(--cf-text-secondary);
        }
        
        .quote-container:hover .quote-icon {
          color: var(--cf-primary-color);
        }
        
        .quote-container:hover .quote-content {
          color: var(--cf-text-primary);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
        }
        
        .greeting {
          font-size: 1.6em;
          margin-bottom: var(--cf-spacing-sm);
        }
        
        .time {
          font-size: 3em;
          margin-bottom: var(--cf-spacing-lg);
        }
        
        .quote-container {
          max-width: 450px;
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
          margin-top: var(--cf-spacing-sm);
        }
        
        .quote-icon {
          width: 40px;
          height: 40px;
          font-size: 1.3em;
        }
        
        .quote-content {
          font-size: 1em;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .welcome-card {
          padding: var(--cf-spacing-md);
          min-height: 180px;
        }
        
        .greeting {
          font-size: 1.4em;
          margin-bottom: var(--cf-spacing-sm);
        }
        
        .time {
          font-size: 2.5em;
          margin-bottom: var(--cf-spacing-md);
        }
        
        .quote-container {
          max-width: 100%;
          padding: var(--cf-spacing-sm);
          margin-top: var(--cf-spacing-sm);
        }
        
        .quote-icon {
          width: 36px;
          height: 36px;
          font-size: 1.2em;
        }
        
        .quote-content {
          font-size: 0.95em;
          line-height: var(--cf-line-height-normal);
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .welcome-card {
          padding: var(--cf-spacing-sm);
        }
        
        .greeting {
          font-size: 1.3em;
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .time {
          font-size: 2.2em;
          margin-bottom: var(--cf-spacing-sm);
        }
        
        .quote-container {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
          margin-top: var(--cf-spacing-xs);
        }
        
        .quote-icon {
          width: 32px;
          height: 32px;
          font-size: 1.1em;
        }
        
        .quote-content {
          font-size: 0.9em;
        }
      }
    `;
  }
};