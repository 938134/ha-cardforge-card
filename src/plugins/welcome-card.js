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
    
    // 卡片配置
    config_schema: {
      show_avatar: {
        type: 'boolean',
        label: '显示头像',
        default: true,
        group: 'appearance'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '滑动', '缩放'],
        default: '淡入',
        group: 'behavior'
      },
      text_alignment: {
        type: 'select',
        label: '文本对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '左对齐',
        group: 'layout'
      }
    },
    
    // 数据源配置
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
    }
  };

  getTemplate(config, hass, entities) {
    const userName = this._getCardValue(hass, entities, 'user_name', '朋友');
    const welcomeMsg = this._getCardValue(hass, entities, 'welcome_message', '欢迎回家！');
    const alignment = config.text_alignment || '左对齐';
    
    return `
      <div class="cardforge-responsive-container welcome-card animation-${config.animation_style || '淡入'} alignment-${this._getAlignmentClass(alignment)}">
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

  _getAlignmentClass(alignment) {
    const alignmentMap = {
      '左对齐': 'left',
      '居中': 'center', 
      '右对齐': 'right'
    };
    return alignmentMap[alignment] || 'left';
  }

  getStyles(config) {
    const alignment = config.text_alignment || '左对齐';
    
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
      .alignment-center .welcome-content {
        justify-content: center;
        text-align: center;
      }
      .alignment-right .welcome-content {
        justify-content: flex-end;
        text-align: right;
      }
      .avatar ha-icon {
        font-size: 3em;
        color: var(--cf-primary-color);
      }
      .welcome-text h2 {
        margin: 0;
        color: var(--cf-text-primary);
        font-size: 1.5em;
      }
      .message {
        margin: var(--cf-spacing-sm) 0 0 0;
        color: var(--cf-text-secondary);
        font-size: 1.1em;
      }
      .animation-淡入 .welcome-content {
        animation: fadeIn 0.5s ease-in;
      }
      .animation-滑动 .welcome-content {
        animation: slideIn 0.5s ease-out;
      }
      .animation-缩放 .welcome-content {
        animation: scaleIn 0.4s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;