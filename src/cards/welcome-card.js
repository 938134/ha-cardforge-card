// src/cards/welcome-card.js
import { BaseCard } from '../core/base-card.js';

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
          entity: '',
          content: DAILY_QUOTES[0] // 默认第一条名言
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
    
    // 创建配置的深拷贝，避免修改原始配置
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    
    // 更新每日一言内容
    const now = new Date();
    const dailyQuote = this._getDailyQuote(now);
    dynamicConfig.blocks.daily_quote.content = dailyQuote;
    
    const dynamicContent = this._generateDynamicContent(dynamicConfig, hass);
    const blockContent = super.render(dynamicConfig, hass, entities);
    
    // 合并动态内容和块内容
    return {
      template: this._renderTemplate(dynamicContent, blockContent.template),
      styles: blockContent.styles + this._renderDynamicStyles()
    };
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

  _renderTemplate(dynamicContent, blockTemplate) {
    // 从块模板中提取每日一言内容
    const quoteMatch = blockTemplate.match(/<div class="cardforge-block[^>]*>([\s\S]*?)<\/div><\/div><\/div>/);
    const quoteContent = quoteMatch ? quoteMatch[1] : '';
    
    return `
      <div class="cardforge-card ${CARD_CONFIG.id}">
        <div class="cardforge-area area-content">
          <div class="welcome-display">
            ${dynamicContent}
            ${quoteContent ? `<div class="welcome-quote">${quoteContent}</div>` : ''}
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
        gap: 12px;
        min-height: 140px;
        text-align: center;
        color: var(--cf-primary-color);
        font-family: 'Segoe UI', 'Roboto', 'PingFang SC', sans-serif;
      }
      
      .welcome-greeting {
        font-size: 1.5em;
        font-weight: 400;
        line-height: 1.3;
        margin: 0;
      }
      
      .welcome-time {
        font-size: 2.5em;
        font-weight: 300;
        line-height: 1.2;
        margin: 0;
        letter-spacing: 1px;
      }
      
      .welcome-quote {
        font-size: 1em;
        font-weight: 300;
        line-height: 1.5;
        margin: 0;
        max-width: 90%;
        opacity: 0.9;
        font-style: italic;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .welcome-display {
          min-height: 120px;
          gap: 8px;
        }
        
        .welcome-greeting {
          font-size: 1.3em;
        }
        
        .welcome-time {
          font-size: 2em;
        }
        
        .welcome-quote {
          font-size: 0.9em;
        }
      }
    `;
  }

  _escapeHtml(text) {
    if (!text) return '';
    return text
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