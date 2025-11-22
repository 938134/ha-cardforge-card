// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    const userName = safeConfig.show_user ? this._getUserName(hass) : '';
    const greeting = safeConfig.show_greeting ? this._getTimeBasedGreeting() : '';
    const periodMessage = safeConfig.show_greeting ? this._getTimePeriodMessage() : '';

    const contentBlocks = this.processEntities(entities, safeConfig, hass);
    
    let customContent = '';
    if (contentBlocks.mode === 'free' && contentBlocks.blocks.length > 0) {
      customContent = this._renderCustomBlocks(contentBlocks.blocks);
    }

    const quoteContent = safeConfig.show_quote ? this._getQuoteContent(safeConfig, hass, entities) : '';

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
        
        ${customContent}
        
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

  _getQuoteContent(config, hass, entities) {
    const quoteEntity = config.quote_entity;
    
    if (quoteEntity && hass?.states?.[quoteEntity]) {
      const entityState = hass.states[quoteEntity];
      return entityState.state || this._getRandomQuote();
    }
    
    return this._getRandomQuote();
  }

  _getRandomQuote() {
    const quotes = [
      "每一天都是新的开始，把握好当下。",
      "生活就像一杯茶，不会苦一辈子，但总会苦一阵子。",
      "成功的秘诀在于对目标的执着追求。",
      "微笑面对生活，生活也会对你微笑。",
      "今天是你余生中最年轻的一天，好好珍惜。",
      "行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。",
      "不要等待机会，而要创造机会。",
      "人生没有彩排，每一天都是现场直播。",
      "坚持就是胜利，放弃才是失败。",
      "梦想不会逃跑，会逃跑的永远都是自己。"
    ];
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  _renderCustomBlocks(blocks) {
    const blockElements = blocks.map(block => {
      if (block.type === 'text') {
        return `<div class="cardforge-text-medium">${this._renderSafeHTML(block.content)}</div>`;
      } else if (block.realTimeData) {
        return `<div class="cf-flex cf-flex-between">
          <span>${this._getBlockTypeName(block.type)}</span>
          <span class="cf-status-on">${block.realTimeData.state}</span>
        </div>`;
      } else {
        return `<div class="cardforge-text-small">${this._getBlockTypeName(block.type)}: ${block.content}</div>`;
      }
    });

    return `
      <div class="cf-flex cf-flex-column cf-gap-sm cf-mt-md">
        ${blockElements.join('')}
      </div>
    `;
  }

  _getBlockTypeName(type) {
    const names = { text: '文本', sensor: '传感器', weather: '天气', switch: '开关' };
    return names[type] || '内容';
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
  layout_type: 'free',
  allow_custom_entities: true,
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
    },
    quote_entity: {
      type: 'string',
      label: '语录实体',
      default: '',
      description: '留空则使用内置语录，填写实体ID则显示实体状态'
    }
  }
};

export { WelcomeCard as default, WelcomeCard };
export const manifest = WelcomeCard.manifest;