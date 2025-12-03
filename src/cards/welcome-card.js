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
      defaultIcon: 'mdi:format-quote-close',
      area: 'content',
      required: false,
      description: '关联一个文本传感器实体显示每日名言'
    }
  },
  
  layout: {
    areas: [
      { id: 'header', label: '问候区', maxBlocks: 1 },
      { id: 'content', label: '名言区', maxBlocks: 1 }
    ]
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
      Object.values(blocks).forEach(block => {
        if (block.presetKey === 'daily_quote' || 
            block.name?.includes('每日一言') || 
            block.name?.includes('名言')) {
          quoteBlock = block;
        }
      });
      
      let quoteContent = '';
      
      if (quoteBlock?.entity && data.hass?.states?.[quoteBlock.entity]) {
        // 从实体获取名言
        const entity = data.hass.states[quoteBlock.entity];
        quoteContent = entity.state;
      } else {
        // 使用默认名言
        quoteContent = getDefaultQuote(now);
      }
      
      if (quoteContent) {
        quoteHtml = `
          <div class="quote-section">
            <div class="quote-divider"></div>
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
        "走自己的路，让别人说去吧。",
        "生命不止，奋斗不息。",
        "今天能做的事，绝不拖到明天。",
        "静以修身，俭以养德。",
        "天生我材必有用。",
        "勿以恶小而为之，勿以善小而不为。",
        "学而不思则罔，思而不学则殆。",
        "千里之行，始于足下。",
        "己所不欲，勿施于人。",
        "知之为知之，不知为不知，是知也。",
        "天行健，君子以自强不息。",
        "君子坦荡荡，小人长戚戚。",
        "三人行，必有我师焉。",
        "温故而知新，可以为师矣。",
        "工欲善其事，必先利其器。",
        "敏而好学，不耻下问。",
        "学而时习之，不亦说乎？",
        "知之者不如好之者，好之者不如乐之者。",
        "逝者如斯夫，不舍昼夜。",
        "志当存高远。",
        "业精于勤，荒于嬉；行成于思，毁于随。"
      ];
      
      return quotes[dayOfYear % quotes.length];
    }
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    const accentColor = theme['--cf-accent-color'] || '#ff4081';
    
    return `
      .welcome-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 160px;
        padding: 20px;
        text-align: center;
      }
      
      .greeting {
        font-size: 1.6em;
        font-weight: 400;
        color: var(--cf-text-primary);
        margin-bottom: 12px;
        line-height: 1.3;
      }
      
      .time {
        font-size: 2.8em;
        font-weight: 300;
        color: ${primaryColor};
        letter-spacing: 1px;
        margin-bottom: 16px;
        font-family: 'Segoe UI', 'Roboto', sans-serif;
      }
      
      .quote-section {
        margin-top: 8px;
        max-width: 90%;
        width: 100%;
      }
      
      .quote-divider {
        width: 60px;
        height: 1px;
        background: var(--cf-border);
        margin: 0 auto 16px auto;
        opacity: 0.6;
      }
      
      .quote-content {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        line-height: 1.6;
        font-style: italic;
        padding: 0 10px;
        font-family: 'Georgia', 'Times New Roman', serif;
      }
      
      /* 块模式样式 */
      .welcome-card .card-area {
        width: 100%;
      }
      
      .welcome-card .area-header {
        display: none; /* 隐藏区域标题 */
      }
      
      .welcome-card .area-content .block-base {
        background: transparent;
        border: none;
        padding: 0;
        min-height: auto;
        justify-content: center;
      }
      
      .welcome-card .area-content .block-icon {
        display: none; /* 隐藏图标 */
      }
      
      .welcome-card .area-content .block-name {
        display: none; /* 隐藏块名称 */
      }
      
      .welcome-card .area-content .block-value {
        font-size: 1.1em;
        font-weight: 400;
        color: var(--cf-text-secondary);
        font-style: italic;
        line-height: 1.6;
        text-align: center;
        font-family: 'Georgia', 'Times New Roman', serif;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .welcome-card {
          padding: 16px;
          min-height: 140px;
        }
        
        .greeting {
          font-size: 1.4em;
          margin-bottom: 10px;
        }
        
        .time {
          font-size: 2.2em;
          margin-bottom: 14px;
        }
        
        .quote-content {
          font-size: 1em;
        }
      }
      
      @container cardforge-container (max-width: 350px) {
        .welcome-card {
          padding: 12px;
          min-height: 120px;
        }
        
        .greeting {
          font-size: 1.2em;
        }
        
        .time {
          font-size: 1.8em;
        }
        
        .quote-divider {
          margin-bottom: 12px;
        }
        
        .quote-content {
          font-size: 0.95em;
          line-height: 1.5;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .welcome-card {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%);
        }
        
        .time {
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
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
