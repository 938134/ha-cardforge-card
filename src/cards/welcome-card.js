// src/cards/welcome-card.js - 完全简化版
import { 
  getGreetingByHour, 
  formatTime, 
  getDisplayName,
  escapeHtml,
  getDefaultQuote, 
  getEntityState, 
  getEntityIcon 
} from '../core/card-tools.js';
import { createCardStyles, responsiveClasses, darkModeClasses } from '../core/card-styles.js';

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
      
      Object.values(blocks).forEach(block => {
        if (block.presetKey === 'daily_quote') {
          if (block.icon) quoteIcon = block.icon;
          
          if (block.entity) {
            hasEntity = true;
            quoteContent = getEntityState(data.hass, block.entity, getDefaultQuote(now));
            const entityIcon = getEntityIcon(data.hass, block.entity, quoteIcon);
            if (entityIcon !== 'mdi:cube') quoteIcon = entityIcon;
          }
        }
      });
      
      if (!hasEntity) quoteContent = getDefaultQuote(now);
      
      if (quoteContent) {
        quoteHtml = `
          <div class="quote-container ${hasEntity ? 'has-entity' : ''} ${darkModeClasses.bgPrimary} ${responsiveClasses.gapMd}">
            <div class="quote-icon ${darkModeClasses.icon}">
              <ha-icon icon="${quoteIcon}"></ha-icon>
            </div>
            <div class="quote-content text-caption ${responsiveClasses.text}">${escapeHtml(quoteContent)}</div>
          </div>
        `;
      }
    }
    
    return `
      <div class="welcome-card card-base ${darkModeClasses.base} ${responsiveClasses.container} ${responsiveClasses.minHeight}">
        <div class="card-content layout-center">
          <div class="greeting text-title ${responsiveClasses.title}">${escapeHtml(greeting + '，' + userName + '！')}</div>
          <div class="time text-emphasis ${darkModeClasses.emphasis}">${timeStr}</div>
          ${quoteHtml}
        </div>
      </div>
    `;
  },
  
  styles: (config, theme) => {
    const customStyles = `
      .welcome-card {
        min-height: 200px;
      }
      
      .greeting {
        margin-bottom: var(--cf-spacing-md);
      }
      
      .time {
        font-size: 3.5em;
        letter-spacing: 1px;
        margin-bottom: var(--cf-spacing-xl);
      }
      
      .quote-container {
        width: 100%;
        max-width: 500px;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-left: 3px solid var(--cf-accent-color);
        border-radius: var(--cf-radius-lg);
        display: flex;
        align-items: center;
        box-shadow: var(--cf-shadow-sm);
        margin-top: var(--cf-spacing-md);
      }
      
      .quote-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: transparent;
        font-size: 1.5em;
        transition: all var(--cf-transition-duration-fast);
      }
      
      .has-entity .quote-icon {
        color: var(--cf-accent-color);
      }
      
      .quote-content {
        flex: 1;
        font-size: 1.1em;
        font-style: italic;
        font-weight: var(--cf-font-weight-light);
        word-break: break-word;
        text-align: left;
        margin: 0;
      }
      
      .quote-container:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .quote-container:hover .quote-icon {
        transform: scale(1.05);
        color: var(--cf-primary-color);
      }
      
      /* 特定响应式 */
      @container cardforge-container (max-width: 480px) {
        .time {
          font-size: 2.5em;
          margin-bottom: var(--cf-spacing-md);
        }
        
        .quote-container {
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
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .time {
          font-size: 2.2em;
          margin-bottom: var(--cf-spacing-sm);
        }
        
        .quote-container {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
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
    
    return createCardStyles(customStyles);
  }
};