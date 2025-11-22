// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    const userName = safeConfig.show_user ? this._getUserName(hass) : '';
    const greeting = safeConfig.show_greeting ? this._getTimeBasedGreeting() : '';
    const periodMessage = safeConfig.show_greeting ? this._getTimePeriodMessage() : '';
    
    // 优雅地获取语录
    const quoteContent = this._getEntityState(entities, hass, 'quote_entity') || 
                        this._getRandomQuote();

    return this._renderCardContainer(`
      ${this._renderCardHeader(safeConfig, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-md">
        ${greeting && userName ? `
          <div class="cardforge-text-large">${greeting}，${userName}！</div>
        ` : ''}
        
        ${greeting && !userName ? `
          <div class="cardforge-text-large">${greeting}！</div>
        ` : ''}
        
        ${!greeting && userName ? `
          <div class="cardforge-text-large">你好，${userName}！</div>
        ` : ''}
        
        ${periodMessage ? `<div class="cardforge-text-medium">${periodMessage}</div>` : ''}
        
        ${quoteContent ? `
          <div class="cf-mt-lg cf-p-md" style="border-left: 3px solid var(--cf-primary-color); background: rgba(var(--cf-rgb-primary), 0.05);">
            <div class="cardforge-text-small" style="font-style: italic;">"${quoteContent}"</div>
          </div>
        ` : ''}
      </div>
      
      ${this._renderCardFooter(safeConfig, entities)}
    `, 'welcome-card');
  }

  getStyles(config) {
    return this.getBaseStyles(config);
  }

  _getUserName(hass, defaultValue = '朋友') {
    if (hass?.user?.name) {
      return hass.user.name;
    }
    return defaultValue;
  }

  _getTimeBasedGreeting() {
    const hour = new Date().getHours();
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

  _getTimePeriodMessage() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '美好的一天从早晨开始';
    } else if (hour >= 12 && hour < 14) {
      return '午间时光，注意休息';
    } else if (hour >= 14 && hour < 18) {
      return '下午工作效率最高';
    } else if (hour >= 18 && hour < 22) {
      return '晚间放松时间';
    } else {
      return '夜深了，早点休息';
    }
  }

  _getRandomQuote() {
    const quotes = [
      "每一天都是新的开始，把握好当下。",
      "生活就像一杯茶，不会苦一辈子，但总会苦一阵子。",
      "成功的秘诀在于对目标的执着追求。",
      "微笑面对生活，生活也会对你微笑。",
      "今天是你余生中最年轻的一天，好好珍惜。"
    ];
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }
}

WelcomeCard.manifest = {
  id: 'welcome-card',
  name: '欢迎卡片',
  description: '个性化欢迎信息和时间问候',
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
    show_quote: {
      type: 'boolean',
      label: '显示每日语录',
      default: true
    }
  },
  entity_requirements: {
    quote_entity: {
      name: '语录实体',
      required: false
    }
  }
};

export { WelcomeCard as default, WelcomeCard };
export const manifest = WelcomeCard.manifest;