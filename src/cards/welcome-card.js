// src/cards/welcome-card.js
import { BaseCard } from '../core/base-card.js';

class WelcomeCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: 'welcome-card',
      theme: 'auto',
      areas: {
        content: {
          layout: 'single',
          blocks: ['welcome_message']
        }
      },
      blocks: {
        welcome_message: {
          type: 'text',
          title: '',
          content: '欢迎回家！',
          style: 'text-align: center; font-size: 1.5em; font-weight: 600;'
        }
      }
    };
  }

  getManifest() {
    return WelcomeCard.manifest;
  }

  // 重写渲染方法，添加动态欢迎语
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    // 创建配置的深拷贝，避免修改原始配置
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    
    // 动态生成欢迎语
    const welcomeMessage = this._generateWelcomeMessage(hass);
    dynamicConfig.blocks.welcome_message.content = welcomeMessage;
    
    return super.render(dynamicConfig, hass, entities);
  }

  _generateWelcomeMessage(hass) {
    const hour = new Date().getHours();
    let greeting = '你好';
    
    if (hour >= 5 && hour < 12) {
      greeting = '早上好';
    } else if (hour >= 12 && hour < 14) {
      greeting = '中午好';
    } else if (hour >= 14 && hour < 18) {
      greeting = '下午好';
    } else if (hour >= 18 && hour < 22) {
      greeting = '晚上好';
    }
    
    const userName = hass?.user?.name || '朋友';
    return `${greeting}，${userName}！`;
  }

  static styles(config) {
    return `
      .welcome-card .cardforge-area {
        padding: var(--cf-spacing-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 120px;
      }
      
      .welcome-card .block-content {
        text-align: center;
      }
      
      @container cardforge-container (max-width: 400px) {
        .welcome-card .cardforge-area {
          padding: var(--cf-spacing-lg);
          min-height: 100px;
        }
      }
    `;
  }
}

WelcomeCard.manifest = {
  id: 'welcome-card',
  name: '欢迎卡片',
  description: '个性化欢迎信息，根据时间动态问候',
  icon: '👋',
  category: '信息',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    show_user: {
      type: 'boolean',
      label: '显示用户名称',
      default: true
    },
    use_time_based: {
      type: 'boolean',
      label: '根据时间问候',
      default: true
    }
  },
  styles: WelcomeCard.styles
};

export { WelcomeCard as default, WelcomeCard };
export const manifest = WelcomeCard.manifest;