// 欢迎卡片 - 增强主题支持
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
    },
    greetingSize: {
      type: 'select',
      label: '欢迎语大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
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
    else greeting = '夜深了';
    
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
    if (config.showQuote) {
      let quoteContent = '';
      const blocks = config.blocks || {};
      
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
    }
    
    return `
      <div class="welcome-card size-${config.greetingSize}">
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
        "时间就像海绵里的水，只要愿挤，总还是有的。",
        "不忘初心，方得始终。",
        "学习如逆水行舟，不进则退。"
      ];
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      return quotes[dayOfYear % quotes.length];
    }
  },
  
  styles: (config, theme) => {
    // 使用设计系统变量
    const primaryColor = theme['--cf-primary-color'] || 'var(--cf-primary-color, #03a9f4)';
    const accentColor = theme['--cf-accent-color'] || 'var(--cf-accent-color, #ff4081)';
    const textPrimary = theme['--cf-text-primary'] || 'var(--cf-text-primary, #212121)';
    const textSecondary = theme['--cf-text-secondary'] || 'var(--cf-text-secondary, #757575)';
    const textTertiary = theme['--cf-text-tertiary'] || 'var(--cf-text-tertiary, #9e9e9e)';
    const surfaceColor = theme['--cf-surface'] || 'var(--cf-surface, #ffffff)';
    
    // 根据尺寸计算字体大小
    let greetingFontSize = '1.8em';
    let timeFontSize = '3.5em';
    let quoteFontSize = '1.2em';
    
    if (config.greetingSize === 'small') {
      greetingFontSize = '1.6em';
      timeFontSize = '3em';
      quoteFontSize = '1.1em';
    } else if (config.greetingSize === 'large') {
      greetingFontSize = '2.2em';
      timeFontSize = '4em';
      quoteFontSize = '1.4em';
    }
    
    return `
      .welcome-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 220px;
        padding: var(--cf-spacing-xl, 20px);
        text-align: center;
        font-family: var(--cf-font-family-base, inherit);
        gap: var(--cf-spacing-lg, 16px);
      }
      
      .greeting {
        font-size: ${greetingFontSize};
        font-weight: var(--cf-font-weight-medium, 500);
        color: ${textPrimary};
        line-height: var(--cf-line-height-tight, 1.25);
        margin-bottom: var(--cf-spacing-xs, 4px);
        animation: fadeInDown var(--cf-transition-slow, 0.4s) ease;
      }
      
      .time {
        font-size: ${timeFontSize};
        font-weight: var(--cf-font-weight-bold, 700);
        color: ${primaryColor};
        letter-spacing: 1px;
        line-height: var(--cf-line-height-tight, 1.25);
        margin-bottom: var(--cf-spacing-lg, 16px);
        text-shadow: 0 2px 8px rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.2);
        animation: scaleIn var(--cf-transition-slow, 0.4s) ease 0.1s both;
      }
      
      .quote-container {
        width: 100%;
        max-width: 500px;
        margin-top: var(--cf-spacing-md, 12px);
        padding: var(--cf-spacing-lg, 16px);
        background: ${surfaceColor};
        border-radius: var(--cf-radius-lg, 12px);
        border-left: 4px solid ${accentColor};
        box-shadow: var(--cf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.12));
        animation: fadeInUp var(--cf-transition-slow, 0.4s) ease 0.2s both;
      }
      
      .quote-content {
        font-size: ${quoteFontSize};
        color: ${textSecondary};
        line-height: var(--cf-line-height-relaxed, 1.75);
        font-style: italic;
        font-weight: var(--cf-font-weight-light, 300);
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .time {
          text-shadow: 0 2px 12px rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.4);
        }
        
        .quote-container {
          background: rgba(255, 255, 255, 0.05);
          border-left-color: ${accentColor};
        }
        
        .quote-content {
          color: ${textTertiary};
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .welcome-card {
          padding: var(--cf-spacing-lg, 16px);
          gap: var(--cf-spacing-md, 12px);
        }
        
        .welcome-card.size-medium .greeting {
          font-size: 1.6em;
        }
        
        .welcome-card.size-medium .time {
          font-size: 3em;
        }
        
        .welcome-card.size-large .greeting {
          font-size: 1.8em;
        }
        
        .welcome-card.size-large .time {
          font-size: 3.5em;
        }
        
        .quote-container {
          padding: var(--cf-spacing-md, 12px);
          max-width: 400px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .welcome-card {
          padding: var(--cf-spacing-md, 12px);
          min-height: 180px;
        }
        
        .welcome-card.size-medium .greeting {
          font-size: 1.4em;
        }
        
        .welcome-card.size-medium .time {
          font-size: 2.5em;
        }
        
        .welcome-card.size-large .greeting {
          font-size: 1.6em;
        }
        
        .welcome-card.size-large .time {
          font-size: 3em;
        }
        
        .welcome-card.size-small .greeting {
          font-size: 1.3em;
        }
        
        .welcome-card.size-small .time {
          font-size: 2.2em;
        }
        
        .quote-container {
          padding: var(--cf-spacing-sm, 8px) var(--cf-spacing-md, 12px);
          max-width: 320px;
        }
        
        .quote-content {
          font-size: 1em;
        }
      }
      
      /* 动画效果 */
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
  }
};