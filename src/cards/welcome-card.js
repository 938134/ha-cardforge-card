// src/cards/welcome.js - 添加块支持
export const card = {
  id: 'welcome',
  meta: {
    name: '欢迎',
    description: '个性化欢迎信息，显示每日一言',
    icon: '👋',
    category: '信息',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  schema: {
    showUser: {
      type: 'boolean',
      label: '显示用户',
      default: true
    },
    showGreeting: {
      type: 'boolean',
      label: '显示问候语',
      default: true
    },
    showTime: {
      type: 'boolean',
      label: '显示时间',
      default: true
    },
    showQuote: {
      type: 'boolean',
      label: '显示每日一言',
      default: true
    },
    // 添加块相关配置
    useBlocks: {
      type: 'boolean',
      label: '使用自定义块',
      default: false
    }
  },
  
  // 添加预设块配置
  blocks: {
    presets: {
      greeting_block: {
        type: 'text',
        name: '问候语',
        content: '',
        icon: 'mdi:hand-wave'
      },
      time_block: {
        type: 'text',
        name: '时间',
        content: '',
        icon: 'mdi:clock'
      },
      quote_block: {
        type: 'text',
        name: '每日一言',
        content: '',
        icon: 'mdi:format-quote-close'
      }
    }
  },
  
  template: (config, data, context) => {
    const now = new Date();
    const hour = now.getHours();
    const userName = data.hass?.user?.name || '朋友';
    
    // 检查是否使用块模式
    const useBlocks = config.useBlocks || false;
    const blocks = config.blocks || {};
    
    if (useBlocks && Object.keys(blocks).length > 0) {
      // 块模式：从块中获取内容
      return this._renderBlockMode(config, blocks, data, context);
    } else {
      // 传统模式：从配置中获取内容
      return this._renderTraditionalMode(config, now, hour, userName);
    }
  },
  
  _renderTraditionalMode(config, now, hour, userName) {
    // 问候语
    let greeting = '';
    if (config.showGreeting) {
      if (hour >= 5 && hour < 12) greeting = '早上好';
      else if (hour >= 12 && hour < 14) greeting = '中午好';
      else if (hour >= 14 && hour < 18) greeting = '下午好';
      else if (hour >= 18 && hour < 22) greeting = '晚上好';
      else greeting = '你好';
      
      if (config.showUser) {
        greeting += `，${userName}`;
      }
    } else if (config.showUser) {
      greeting = userName;
    }
    
    // 时间
    const timeStr = config.showTime ? 
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}` : '';
    
    // 每日一言
    let quoteHtml = '';
    if (config.showQuote) {
      const quote = this._getDailyQuote(now);
      quoteHtml = `
        <div class="quote-section">
          <div class="quote-divider"></div>
          <div class="quote-content">${this._escapeHtml(quote)}</div>
        </div>
      `;
    }
    
    return `
      <div class="welcome-card">
        <div class="welcome-content">
          ${greeting ? `<div class="greeting">${this._escapeHtml(greeting)}</div>` : ''}
          ${timeStr ? `<div class="time">${timeStr}</div>` : ''}
          ${quoteHtml}
        </div>
      </div>
    `;
  },
  
  _renderBlockMode(config, blocks, data, context) {
    // 使用块渲染器渲染所有块
    if (context.renderBlocks) {
      const blocksHtml = context.renderBlocks(blocks);
      return `
        <div class="welcome-card block-mode">
          <div class="welcome-content">
            ${blocksHtml}
          </div>
        </div>
      `;
    }
    
    // 如果渲染器不可用，显示空状态
    return `
      <div class="welcome-card block-mode">
        <div class="welcome-empty">
          <div class="empty-icon">👋</div>
          <div class="empty-text">欢迎卡片（块模式）</div>
        </div>
      </div>
    `;
  },
  
  _getDailyQuote(date) {
    // ... 每日一言逻辑保持不变 ...
  },
  
  _escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  
  styles: (config, theme) => {
    // ... 样式代码保持不变，添加块模式样式 ...
    return `
      .welcome-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 140px;
        padding: 20px;
      }
      
      .welcome-card.block-mode {
        padding: 16px;
      }
      
      .welcome-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        text-align: center;
        width: 100%;
      }
      
      .welcome-empty {
        text-align: center;
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1em;
      }
      
      .empty-hint {
        font-size: 0.85em;
        opacity: 0.7;
        margin-top: 8px;
      }
      
      .greeting {
        font-size: 1.4em;
        font-weight: 400;
        color: var(--cf-text-primary);
      }
      
      .time {
        font-size: 2.2em;
        font-weight: 300;
        color: var(--cf-primary-color);
        letter-spacing: 1px;
      }
      
      .quote-section {
        margin-top: 8px;
        max-width: 90%;
      }
      
      .quote-divider {
        width: 60px;
        height: 1px;
        background: var(--cf-border);
        margin: 0 auto 12px auto;
        opacity: 0.6;
      }
      
      .quote-content {
        font-size: 0.95em;
        color: var(--cf-text-secondary);
        line-height: 1.5;
        font-style: italic;
      }
      
      @container cardforge-container (max-width: 400px) {
        .welcome-card {
          padding: 16px;
        }
        
        .greeting {
          font-size: 1.2em;
        }
        
        .time {
          font-size: 1.8em;
        }
        
        .quote-content {
          font-size: 0.85em;
        }
      }
      
      /* 块模式下的特殊样式 */
      .welcome-card.block-mode .cardforge-block {
        background: transparent;
        border: none;
        padding: 8px;
        min-height: 50px;
      }
      
      .welcome-card.block-mode .block-icon {
        font-size: 1.2em;
        color: var(--cf-primary-color);
      }
      
      .welcome-card.block-mode .block-name {
        display: none;
      }
      
      .welcome-card.block-mode .block-value {
        font-size: 1.1em;
        font-weight: 400;
      }
    `;
  },
  
  layout: {
    type: 'single',
    recommendedSize: 3
  }
};

export class WelcomeCard {
  static card = card;
}