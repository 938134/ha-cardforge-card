// 欢迎卡片
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
    const hour = now.getHours();
    const userName = config.greetingName || data.hass?.user?.name || '朋友';
    
    // 问候语
    let greeting = '';
    if (hour >= 5 && hour < 12) greeting = '早上好';
    else if (hour >= 12 && hour < 14) greeting = '中午好';
    else if (hour >= 14 && hour < 18) greeting = '下午好';
    else if (hour >= 18 && hour < 22) greeting = '晚上好';
    else greeting = '你好';
    
    greeting += `，${userName}！`;
    
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
    const blocks = config.blocks || {};
    
    let quoteContent = '';
    Object.values(blocks).forEach(block => {
      if (block.presetKey === 'daily_quote' && block.entity && data.hass?.states?.[block.entity]) {
        quoteContent = data.hass.states[block.entity].state;
      }
    });
    
    if (!quoteContent) {
      quoteContent = getDefaultQuote(now);
    }
    
    if (quoteContent) {
      quoteHtml = `
        <div class="quote-container">
          <div class="quote-content">${escapeHtml(quoteContent)}</div>
        </div>
      `;
    }
    
    return `
      <div class="welcome-card">
        <div class="greeting">${escapeHtml(greeting)}</div>
        <div class="time">${timeStr}</div>
        ${quoteHtml}
      </div>
    `;
    
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    
    function getDefaultQuote(date) {
      const quotes = [
        "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
        "成功的秘诀在于对目标的坚持。",
        "时间就像海绵里的水，只要愿挤，总还是有的。"
      ];
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
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
      }
      
      .time {
        font-size: 3.5em;
        font-weight: 700;
        color: ${primaryColor};
        letter-spacing: 1px;
        line-height: 1.2;
        margin-bottom: 24px;
      }
      
      .quote-container {
        width: 100%;
        max-width: 500px;
        margin-top: 8px;
      }
      
      .quote-content {
        font-size: 1.2em;
        color: var(--cf-text-secondary);
        line-height: 1.6;
        font-style: italic;
      }
    `;
  }
};
