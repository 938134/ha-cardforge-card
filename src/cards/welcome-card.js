// 欢迎卡片 - 简化版（基于新设计系统和工具组件）
import {getGreeting, formatTime, escapeHtml, getDisplayName, getPresetBlockContent, getRandomQuote } from '../core/utils.js';

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
  return `
    .welcome-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: var(--cf-card-min-height, 200px);
      padding: var(--cf-spacing-xl);
      text-align: center;
      font-family: var(--cf-font-family-base);
      gap: var(--cf-spacing-xl);
    }
    
    .greeting {
      font-size: var(--cf-font-size-2xl);
      font-weight: var(--cf-font-weight-medium);
      color: var(--cf-text-primary);
      line-height: var(--cf-line-height-tight);
      margin: 0;
    }
    
    .time {
      font-size: var(--cf-font-size-4xl);
      font-weight: var(--cf-font-weight-bold);
      color: var(--cf-primary-color);
      line-height: var(--cf-line-height-tight);
      letter-spacing: 0.5px;
      margin: 0;
      text-shadow: var(--cf-time-text-shadow, 0 2px 8px rgba(var(--cf-primary-color-rgb), 0.2));
    }
    
    .quote-container {
      width: 100%;
      max-width: 500px;
      padding: var(--cf-spacing-md);
      background: var(--cf-surface-elevated);
      border: 1px solid var(--cf-border);
      border-radius: var(--cf-radius-lg);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: var(--cf-spacing-md);
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    }
    
    .quote-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--cf-radius-md);
      background: transparent;
      color: var(--cf-text-secondary);
      font-size: 1.4em;
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    }
    
    .quote-container.has-entity .quote-icon {
      color: var(--cf-accent-color);
    }
    
    .quote-content {
      flex: 1;
      min-width: 0;
      font-size: var(--cf-font-size-lg);
      color: var(--cf-text-secondary);
      line-height: var(--cf-line-height-relaxed);
      font-style: italic;
      font-weight: var(--cf-font-weight-light);
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      text-align: left;
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
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
    
    /* 响应式设计 - 使用设计系统的断点变量 */
    @container cardforge-container (max-width: var(--cf-breakpoint-md)) {
      .welcome-card {
        padding: var(--cf-spacing-lg);
        gap: var(--cf-spacing-lg);
      }
      
      .greeting { font-size: var(--cf-font-size-xl); }
      .time { font-size: var(--cf-font-size-3xl); }
      .quote-container { max-width: 450px; }
    }
    
    @container cardforge-container (max-width: var(--cf-breakpoint-sm)) {
      .welcome-card {
        padding: var(--cf-spacing-md);
        gap: var(--cf-spacing-md);
      }
      
      .greeting { font-size: var(--cf-font-size-lg); }
      .time { font-size: var(--cf-font-size-2xl); }
      .quote-container { 
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .quote-content { 
        text-align: center;
        align-items: center;
      }
    }
  `;
}
