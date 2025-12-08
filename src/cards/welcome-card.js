// cards/welcome-card.js - 欢迎卡片（类版本）
import { CardBase } from '../core/card-base.js';
import { html, unsafeHTML } from 'https://unpkg.com/lit@3.0.0/index.js?module';
import { getGreetingByHour, formatTime, getDisplayName, escapeHtml, getDefaultQuote, getEntityState, getEntityIcon } from '../core/card-tools.js';

export class WelcomeCard extends CardBase {
  static cardId = 'welcome';
  static meta = {
    name: '欢迎',
    description: '个性化欢迎信息',
    icon: '👋',
    category: '信息'
  };
  
  static schema = {
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
  };
  
  static blockType = 'preset';
  static presetBlocks = {
    daily_quote: {
      defaultName: '每日一言',
      defaultIcon: 'mdi:format-quote-close',
      required: false,
      description: '关联一个文本传感器实体显示每日名言'
    }
  };
  
  _intervalId = null;
  
  connectedCallback() {
    super.connectedCallback();
    // 每分钟更新一次时间
    this._intervalId = setInterval(() => {
      this.requestUpdate();
    }, 60 * 1000);
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
  
  renderContent() {
    const now = new Date();
    const greeting = getGreetingByHour(now);
    const userName = getDisplayName(this.hass, this.getConfigValue('greetingName', ''), '朋友');
    const timeStr = formatTime(now, this.getConfigValue('use24Hour', true));
    
    // 获取每日一言
    let quoteHtml = html``;
    if (this.getConfigValue('showQuote', true)) {
      const quoteContent = this._getQuoteContent(now);
      if (quoteContent) {
        const { content, icon, hasEntity } = quoteContent;
        quoteHtml = html`
          <div class="quote-wrapper">
            <div class="quote-container ${hasEntity ? 'has-entity' : ''}">
              <div class="quote-icon">
                <ha-icon icon="${icon}"></ha-icon>
              </div>
              <div class="quote-content">${unsafeHTML(escapeHtml(content))}</div>
            </div>
          </div>
        `;
      }
    }
    
    return html`
      <div class="welcome-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            <div class="greeting card-title">${greeting}，${userName}！</div>
            <div class="time card-emphasis">${timeStr}</div>
            ${quoteHtml}
          </div>
        </div>
      </div>
    `;
  }
  
  _getQuoteContent(now) {
    let quoteContent = '';
    let quoteIcon = 'mdi:format-quote-close';
    let hasEntity = false;
    
    const blocks = this.config.blocks || {};
    
    // 查找每日一言块
    Object.values(blocks).forEach(block => {
      if (block.presetKey === 'daily_quote') {
        if (block.icon) {
          quoteIcon = block.icon;
        }
        
        if (block.entity) {
          hasEntity = true;
          quoteContent = getEntityState(this.hass, block.entity, getDefaultQuote(now));
          
          const entityIcon = getEntityIcon(this.hass, block.entity, quoteIcon);
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
      return { content: quoteContent, icon: quoteIcon, hasEntity };
    }
    
    return null;
  }
  
  getCustomStyles() {
    return `
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
      
      .quote-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: var(--cf-spacing-md);
      }
      
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
      }
      
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
      
      @container cardforge-container (max-width: 600px) {
        .time {
          font-size: 3em;
          margin: var(--cf-spacing-md) 0;
        }
        
        .quote-container {
          max-width: 450px;
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
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
          min-height: 200px;
        }
        
        .time {
          font-size: 2.5em;
          margin: var(--cf-spacing-sm) 0;
        }
        
        .quote-container {
          max-width: 100%;
          padding: var(--cf-spacing-sm);
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
        .welcome-card {
          min-height: 180px;
        }
        
        .greeting {
          font-size: 1.3em;
        }
        
        .time {
          font-size: 2.2em;
          margin: var(--cf-spacing-xs) 0;
        }
        
        .quote-container {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
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
}

// 导出卡片类用于注册
export const CardClass = WelcomeCard;
