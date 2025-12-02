// src/cards/welcome.js

// 每日一言库
const DAILY_QUOTES = [
  "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
  "成功的秘诀在于对目标的执着追求。",
  "每一天都是新的开始，把握当下，创造美好。",
  "微笑面对生活，生活也会对你微笑。",
  "坚持不是看到希望才坚持，而是坚持了才看到希望。",
  "梦想不会发光，发光的是追梦的你。",
  "简单的生活，就是最奢华的生活。",
  "心若向阳，无畏悲伤。",
  "时间是最好的老师，但遗憾的是，它最后把所有的学生都杀死了。",
  "活在当下，珍惜眼前。"
];

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
    }
  },
  
  template: (config, data, context) => {
    const now = new Date();
    const hour = now.getHours();
    const userName = data.hass?.user?.name || '朋友';
    
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
      const quote = getDailyQuote(now);
      quoteHtml = `
        <div class="quote-section">
          <div class="quote-divider"></div>
          <div class="quote-content">${escapeHtml(quote)}</div>
        </div>
      `;
    }
    
    return `
      <div class="welcome-card">
        <div class="welcome-content">
          ${greeting ? `<div class="greeting">${escapeHtml(greeting)}</div>` : ''}
          ${timeStr ? `<div class="time">${timeStr}</div>` : ''}
          ${quoteHtml}
        </div>
      </div>
    `;
    
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    
    function getDailyQuote(date) {
      const dateStr = date.toDateString();
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash = hash & hash;
      }
      const index = Math.abs(hash) % DAILY_QUOTES.length;
      return DAILY_QUOTES[index];
    }
  },
  
  styles: (config, theme) => {
    return `
      .welcome-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 140px;
        padding: 20px;
      }
      
      .welcome-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        text-align: center;
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
