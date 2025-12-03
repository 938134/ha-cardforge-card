// src/cards/welcome-card.js
export const card = {
  id: 'welcome',
  meta: {
    name: '欢迎',
    description: '个性化欢迎信息，显示时间与每日一言',
    icon: '👋',
    category: '信息',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  schema: {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    showGreeting: {
      type: 'boolean',
      label: '显示问候语',
      default: true
    },
    showQuote: {
      type: 'boolean',
      label: '显示每日一言',
      default: true
    },
    greetingName: {
      type: 'text',
      label: '自定义称呼',
      placeholder: '例如：小明',
      description: '如果不填，将使用Home Assistant用户名'
    }
  },
  
  // 预设块定义
  blockType: 'preset',
  presetBlocks: {
    daily_quote: {
      defaultName: '每日一言',
      defaultIcon: '💬',
      required: false,
      description: '关联一个文本传感器实体显示每日名言'
    }
  },
  
  template: (config, data, context) => {
    const now = new Date();
    const hour = now.getHours();
    const userName = config.greetingName || data.hass?.user?.name || '朋友';
    
    // 问候语
    let greeting = '';
    if (config.showGreeting) {
      if (hour >= 5 && hour < 12) greeting = '早上好';
      else if (hour >= 12 && hour < 14) greeting = '中午好';
      else if (hour >= 14 && hour < 18) greeting = '下午好';
      else if (hour >= 18 && hour < 22) greeting = '晚上好';
      else greeting = '你好';
      
      greeting += `，${userName}！`;
    }
    
    // 时间显示
    let timeStr = '';
    if (config.use24Hour) {
      timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                now.getMinutes().toString().padStart(2, '0');
    } else {
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      timeStr = hours + ':' + 
                now.getMinutes().toString().padStart(2, '0') + 
                ' ' + ampm;
    }
    
    // 获取每日一言
    let quoteHtml = '';
    if (config.showQuote) {
      const blocks = config.blocks || {};
      
      // 查找每日一言块
      let quoteBlock = null;
      let quoteContent = '';
      let quoteIcon = '💬';
      
      Object.values(blocks).forEach(block => {
        if (block.presetKey === 'daily_quote' || 
            block.name?.includes('每日一言') || 
            block.name?.includes('名言')) {
          quoteBlock = block;
        }
      });
      
      if (quoteBlock?.entity && data.hass?.states?.[quoteBlock.entity]) {
        // 从实体获取名言
        const entity = data.hass.states[quoteBlock.entity];
        quoteContent = entity.state;
        quoteIcon = quoteBlock.icon || '💬';
      } else {
        // 使用默认名言
        quoteContent = getDefaultQuote(now);
      }
      
      if (quoteContent) {
        quoteHtml = `
          <div class="quote-container">
            <div class="quote-icon">${quoteIcon}</div>
            <div class="quote-content">${escapeHtml(quoteContent)}</div>
          </div>
        `;
      }
    }
    
    return `
      <div class="welcome-card">
        ${greeting ? `<div class="greeting">${escapeHtml(greeting)}</div>` : ''}
        <div class="time">${timeStr}</div>
        ${quoteHtml}
      </div>
    `;
    
    function escapeHtml(text) {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    
    function getDefaultQuote(date) {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const quotes = [
        "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
        "成功的秘诀在于对目标的坚持。",
        "时间就像海绵里的水，只要愿挤，总还是有的。",
        "知识就是力量。",
        "走自己的路，让别人说去吧。"
      ];
      
      return quotes[dayOfYear % quotes.length];
    }
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    
    return `
      .welcome-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 200px;
        padding: 24px;
        text-align: center;
      }
      
      .greeting {
        font-size: 1.8em;
        font-weight: 400;
        color: var(--cf-text-primary);
        line-height: 1.3;
        margin-bottom: 8px;
        text-align: center;
        width: 100%;
      }
      
      .time {
        font-size: 3.5em;
        font-weight: 300;
        color: ${primaryColor};
        letter-spacing: 1px;
        font-family: 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.2;
        margin-bottom: 24px;
        text-align: center;
        width: 100%;
      }
      
      /* 名言容器 - 水平左对齐布局 */
      .quote-container {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        width: 100%;
        max-width: 500px;
        margin-top: 8px;
        text-align: left;
      }
      
      .quote-icon {
        flex-shrink: 0;
        font-size: 1.8em;
        line-height: 1;
        display: flex;
        align-items: center;
        height: 100%;
        min-height: 40px;
      }
      
      .quote-content {
        flex: 1;
        font-size: 1.4em;
        color: var(--cf-text-secondary);
        line-height: 1.6;
        font-style: italic;
        font-family: 'Georgia', 'Times New Roman', serif;
        word-break: break-word;
        text-align: left;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .welcome-card {
          padding: 20px;
          min-height: 180px;
        }
        
        .greeting {
          font-size: 1.6em;
        }
        
        .time {
          font-size: 3em;
          margin-bottom: 20px;
        }
        
        .quote-container {
          max-width: 100%;
          gap: 10px;
        }
        
        .quote-icon {
          font-size: 1.6em;
        }
        
        .quote-content {
          font-size: 1.2em;
        }
      }
      
      @container cardforge-container (max-width: 350px) {
        .welcome-card {
          padding: 16px;
          min-height: 160px;
        }
        
        .greeting {
          font-size: 1.4em;
        }
        
        .time {
          font-size: 2.5em;
          margin-bottom: 16px;
        }
        
        .quote-icon {
          font-size: 1.4em;
        }
        
        .quote-content {
          font-size: 1.1em;
          line-height: 1.5;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .time {
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .quote-content {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    `;
  }
};

export class WelcomeCard {
  static card = card;
}