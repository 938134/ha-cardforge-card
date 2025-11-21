// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  getTemplate(config, hass, entities) {
    const userName = this._getUserName(hass);
    const greeting = this._getTimeBasedGreeting();
    const periodMessage = this._getTimePeriodMessage();

    const contentBlocks = this.processEntities(entities, config, hass);
    
    let customContent = '';
    if (contentBlocks.mode === 'free' && contentBlocks.blocks.length > 0) {
      customContent = this._renderCustomBlocks(contentBlocks.blocks);
    }

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-md">
        <div class="cardforge-text-large">${greeting}，${userName}！</div>
        <div class="cardforge-text-medium">${periodMessage}</div>
        ${customContent}
        ${config.show_quote ? this._renderDailyQuote() : ''}
      </div>
      
      ${this._renderCardFooter(config, entities)}
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
    if (hour >= 5 && hour < 12) return '早上好';
    if (hour >= 12 && hour < 14) return '中午好';
    if (hour >= 14 && hour < 18) return '下午好';
    if (hour >= 18 && hour < 22) return '晚上好';
    return '你好';
  }

  _getTimePeriodMessage() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '美好的一天从早晨开始';
    if (hour >= 12 && hour < 14) return '午间时光，注意休息';
    if (hour >= 14 && hour < 18) return '下午工作效率最高';
    if (hour >= 18 && hour < 22) return '晚间放松时间';
    return '夜深了，早点休息';
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

  _renderDailyQuote() {
    const quotes = [
      "每一天都是新的开始，把握好当下。",
      "生活就像一杯茶，不会苦一辈子，但总会苦一阵子。",
      "成功的秘诀在于对目标的执着追求。",
      "微笑面对生活，生活也会对你微笑。",
      "今天是你余生中最年轻的一天，好好珍惜。"
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    return `
      <div class="cf-mt-lg cf-p-md" style="border-left: 3px solid var(--cf-primary-color); background: rgba(var(--cf-rgb-primary), 0.05);">
        <div class="cardforge-text-small" style="font-style: italic;">"${randomQuote}"</div>
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
    show_quote: {
      type: 'boolean',
      label: '显示每日语录',
      default: true
    }
  },
  capabilities: {
    supportsTitle: true,
    supportsFooter: true
  }
};

export { WelcomeCard as default, WelcomeCard };