// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '个性化欢迎卡片，支持自定义问候语',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    // 结构化实体需求
    entity_requirements: {
      user_name: {
        name: '用户名',
        description: '显示的用户名称',
        type: 'text',
        required: false,
        default: '朋友'
      },
      welcome_message: {
        name: '欢迎消息',
        description: '自定义欢迎消息',
        type: 'text', 
        required: false,
        default: '欢迎回家！'
      }
    },
    
    config_schema: {
      show_avatar: {
        type: 'boolean',
        label: '显示头像',
        default: true
      },
      animation: {
        type: 'boolean',
        label: '启用动画',
        default: true
      }
    }
  };

  getTemplate(config, hass, entities) {
    const userName = this._getCardValue(hass, entities, 'user_name', '朋友');
    const welcomeMsg = this._getCardValue(hass, entities, 'welcome_message', '欢迎回家！');
    
    return `
      <div class="cardforge-responsive-container welcome-card ${config.animation ? 'with-animation' : ''}">
        <div class="welcome-content">
          ${config.show_avatar ? `
            <div class="avatar">
              <ha-icon icon="mdi:account-circle"></ha-icon>
            </div>
          ` : ''}
          <div class="welcome-text">
            <h2>你好，${userName}！</h2>
            <p class="message">${welcomeMsg}</p>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      .welcome-card {
        padding: var(--cf-spacing-xl);
      }
      .welcome-content {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
      }
      .avatar ha-icon {
        font-size: 3em;
        color: var(--cf-primary-color);
      }
      .welcome-text h2 {
        margin: 0;
        color: var(--cf-text-primary);
      }
      .message {
        margin: var(--cf-spacing-sm) 0 0 0;
        color: var(--cf-text-secondary);
        font-size: 1.1em;
      }
      .with-animation .welcome-content {
        animation: fadeIn 0.5s ease-in;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;