// cards/welcome-card.js - 简化测试版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { getGreetingByHour, formatTime, getDisplayName, getDefaultQuote } from '../core/card-tools.js';
import { createCardStyles } from '../core/card-styles.js';

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
  
  template: (config, { hass }) => {
    const now = new Date();
    const greeting = getGreetingByHour(now);
    const userName = getDisplayName(hass, config.greetingName, '朋友');
    const timeStr = formatTime(now, config.use24Hour);
    
    // 获取每日一言
    let quoteContent = getDefaultQuote(now);
    
    return html`
      <div class="welcome-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            <div class="greeting card-title">${greeting}，${userName}！</div>
            <div class="time card-emphasis">${timeStr}</div>
            
            ${config.showQuote && quoteContent ? html`
              <div class="quote-wrapper">
                <div class="quote-container">
                  <div class="quote-content">${quoteContent}</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },
  
  styles: (config) => {
    const customStyles = css`
      .welcome-card {
        min-height: 220px;
      }
      
      .greeting {
        margin-bottom: var(--cf-spacing-md);
      }
      
      .time {
        font-size: 3.5em;
        letter-spacing: 1px;
        margin: var(--cf-spacing-lg) 0;
      }
      
      /* 每日一言包装器 */
      .quote-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: var(--cf-spacing-md);
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
        transition: all var(--cf-transition-duration-fast);
        box-shadow: var(--cf-shadow-sm);
      }
      
      /* 内容区域 */
      .quote-content {
        font-size: 1.1em;
        color: var(--cf-text-primary);
        line-height: var(--cf-line-height-relaxed);
        font-style: italic;
        font-weight: var(--cf-font-weight-light);
        word-break: break-word;
        overflow-wrap: break-word;
        text-align: center;
      }
      
      /* 交互效果 */
      .quote-container:hover {
        background: var(--cf-hover-color);
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
    `;
    
    return createCardStyles(customStyles);
  }
};
