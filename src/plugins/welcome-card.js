// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '显示个性化欢迎信息',
    category: 'information',
    icon: '👋',
    author: 'CardForge',
    config_schema: {},
    entity_requirements: []
  };

  getTemplate(config, hass, entities) {
    return `
      <div class="cardforge-responsive-container">
        <div class="cardforge-content-grid">
          <div style="text-align: center; padding: 20px;">
            <h3>欢迎卡片</h3>
            <p>这是一个简单的欢迎卡片</p>
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