// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '个性化欢迎信息',
    category: '信息',
    icon: '👋',
    entityRequirements: [
      {
        key: 'user',
        description: '用户实体',
        required: false
      },
      {
        key: 'greeting', 
        description: '问候语',
        required: false
      }
    ]
  };

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    const userName = this._getCardValue(hass, entities, 'user', systemData.user);
    const greeting = this._getCardValue(hass, entities, 'greeting', systemData.greeting);
    
    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-md">
            <div class="cardforge-content-large">${greeting}，${userName}！</div>
            <div class="cardforge-content-body">${systemData.time}</div>
            <div class="cardforge-content-small">${systemData.date} ${systemData.weekday}</div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config);
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;