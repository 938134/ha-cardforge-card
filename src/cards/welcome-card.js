// src/cards/welcome-card.js
import { BaseCard } from '../core/base-card.js';

// 每日一言库 - 扩展更多名言
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
  "活在当下，珍惜眼前。",
  "人生没有彩排，每一天都是现场直播。",
  "不要等待机会，而要创造机会。",
  "世界上最遥远的距离，是想到和做到之间的距离。",
  "你的时间有限，不要浪费在别人的生活里。",
  "真正的发现之旅不在于寻找新风景，而在于拥有新眼光。"
];

// 统一的配置定义
const CARD_CONFIG = {
  id: 'welcome-card',
  name: '欢迎卡片',
  description: '个性化欢迎信息，根据时间动态问候，支持每日一言',
  icon: '👋',
  category: '信息',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    show_user: {
      type: 'boolean',
      label: '显示用户',
      default: true
    },
    show_greeting: {
      type: 'boolean',
      label: '显示问候语',
      default: true
    },
    show_time: {
      type: 'boolean',
      label: '显示时间',
      default: true
    },
    show_quote: {
      type: 'boolean',
      label: '显示每日一言',
      default: true
    }
  }
};

export class WelcomeCard extends BaseCard {
  getDefaultConfig() {
    // 从config_schema生成默认配置
    const defaultConfig = {};
    Object.entries(CARD_CONFIG.config_schema).forEach(([key, field]) => {
      defaultConfig[key] = field.default !== undefined ? field.default : '';
    });

    return {
      card_type: CARD_CONFIG.id,
      theme: 'auto',
      ...defaultConfig,
      areas: {
        content: {
          layout: 'single',
          blocks: ['daily_quote'] // 只保留每日一言块
        }
      },
      blocks: {
        daily_quote: {
          type: 'quote',
          area: 'content',
          entity: '', // 默认为空，不关联实体
          content: '', // 内容为空，由渲染时动态生成
          name: '每日一言'
        }
      }
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  // 重写渲染方法，添加动态内容
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    // 生成动态内容
    const dynamicContent = this._generateDynamicContent(safeConfig, hass);
    const quoteContent = this._getQuoteContent(safeConfig, hass);
    
    // 合并动态内容和块内容
    return {
      template: this._renderTemplate(dynamicContent, quoteContent, safeConfig),
      styles: this._renderDynamicStyles()
    };
  }

  _getQuoteContent(config, hass) {
    // 如果不显示每日一言，返回空字符串
    if (!config.show_quote) {
      return '';
    }
    
    const quoteBlock = config.blocks.daily_quote;
    
    // 如果关联了实体，显示实体状态值
    if (quoteBlock.entity && hass?.states?.[quoteBlock.entity]) {
      const entity = hass.states[quoteBlock.entity];
      const state = entity.state;
      // 确保状态值是字符串
      return typeof state === 'string' ? state : String(state || '');
    }
    
    // 如果没有关联实体，显示每日一言
    return this._getDailyQuote(new Date());
  }

  _generateDynamicContent(config, hass) {
    const now = new Date();
    const elements = [];
    
    // 问候语和用户名称
    if (config.show_greeting || config.show_user) {
      const greeting = this._getGreeting(now);
      const userName = this._getUserName(hass);
      
      let greetingText = '';
      if (config.show_greeting && config.show_user) {
        greetingText = `${greeting}，${userName}`;
      } else if (config.show_greeting) {
        greetingText = greeting;
      } else if (config.show_user) {
        greetingText = userName;
      }
      
      if (greetingText) {
        elements.push(`<div class="welcome-greeting">${this._escapeHtml(greetingText)}</div>`);
      }
    }
    
    // 时间显示
    if (config.show_time) {
      const timeHtml = this._formatTime(now);
      elements.push(`<div class="welcome-time">${timeHtml}</div>`);
    }
    
    return elements.join('');
  }

  _getGreeting(date) {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) {
      return '早上好';
    } else if (hour >= 12 && hour < 14) {
      return '中午好';
    } else if (hour >= 14 && hour < 18) {
      return '下午好';
    } else if (hour >= 18 && hour < 22) {
      return '晚上好';
    } else {
      return '你好';
    }
  }

  _getUserName(hass) {
    return hass?.user?.name || '朋友';
  }

  _formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  _getDailyQuote(date) {
    // 根据日期生成一个稳定的索引，确保同一天显示相同的名言
    const dateStr = date.toDateString();
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % DAILY_QUOTES.length;
    return DAILY_QUOTES[index];
  }

  _renderTemplate(dynamicContent, quoteContent, config) {
    // 只有当显示每日一言开关开启且有内容时才显示
    const showQuote = config.show_quote && quoteContent;
    
    return `
      <div class="cardforge-card ${CARD_CONFIG.id}">
        <div class="cardforge-area area-content">
          <div class="welcome-display">
            ${dynamicContent}
            ${showQuote ? `
              <div class="quote-section">
                <div class="quote-decoration">💫</div>
                <div class="welcome-quote">${this._escapeHtml(quoteContent)}</div>
                <div class="quote-source">每日一言</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _renderDynamicStyles() {
    return `
      .welcome-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        min-height: 160px;
        text-align: center;
        color: var(--primary-text-color);
        font-family: 'Segoe UI', 'Roboto', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      }
      
      .welcome-greeting {
        font-size: 1.6em;
        font-weight: 500;
        line-height: 1.3;
        margin: 0;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .welcome-time {
        font-size: 2.8em;
        font-weight: 300;
        line-height: 1.2;
        margin: 0;
        letter-spacing: 2px;
        color: var(--cf-primary-color);
        text-shadow: 0 2px 8px rgba(var(--cf-rgb-primary), 0.2);
        font-variant-numeric: tabular-nums;
      }
      
      /* 每日一言区域 - 突出显示 */
      .quote-section {
        margin-top: 8px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(var(--cf-rgb-primary), 0.08), rgba(var(--cf-rgb-accent), 0.05));
        border-radius: var(--cf-radius-lg);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.15);
        position: relative;
        max-width: 90%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      .quote-decoration {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1.5em;
        background: var(--cf-background);
        padding: 0 12px;
        z-index: 1;
      }
      
      .welcome-quote {
        font-size: 1.1em;
        font-weight: 400;
        line-height: 1.6;
        margin: 0;
        color: var(--cf-text-primary);
        text-align: center;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .quote-source {
        font-size: 0.8em;
        font-weight: 500;
        color: var(--cf-primary-color);
        margin-top: 8px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 1px;
        opacity: 0.8;
      }
      
      /* 多行文本支持 */
      .welcome-quote.multiline {
        -webkit-line-clamp: unset;
        display: block;
        overflow: visible;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .welcome-display {
          min-height: 140px;
          gap: 12px;
        }
        
        .welcome-greeting {
          font-size: 1.4em;
        }
        
        .welcome-time {
          font-size: 2.4em;
          letter-spacing: 1px;
        }
        
        .quote-section {
          padding: 16px;
          max-width: 95%;
        }
        
        .welcome-quote {
          font-size: 1em;
          line-height: 1.5;
        }
        
        .quote-decoration {
          font-size: 1.3em;
          top: -10px;
        }
      }
      
      @container cardforge-container (max-width: 320px) {
        .welcome-greeting {
          font-size: 1.2em;
        }
        
        .welcome-time {
          font-size: 2em;
        }
        
        .quote-section {
          padding: 12px;
        }
        
        .welcome-quote {
          font-size: 0.95em;
          line-height: 1.4;
        }
      }
      
      /* 动画效果 */
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
      
      .quote-section {
        animation: fadeInUp 0.6s ease-out;
      }
    `;
  }

  _escapeHtml(text) {
    if (!text) return '';
    
    // 确保text是字符串
    const safeText = typeof text === 'string' ? text : String(text);
    
    return safeText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default WelcomeCard;