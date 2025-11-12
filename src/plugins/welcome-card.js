// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'welcome-card',
  name: '欢迎卡片',
  version: '1.2.0',
  description: '个性化欢迎信息，支持自定义欢迎词和消息实体',
  author: 'CardForge Team',
  category: 'info',
  icon: '👋',
  entityRequirements: [
    {
      key: 'greeting_entity',
      description: '欢迎词实体',
      required: false
    },
    {
      key: 'message_entity',
      description: '消息实体',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class WelcomeCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    // 获取自定义欢迎词，如果实体不存在则使用系统默认
    const customGreeting = entities.greeting_entity?.state;
    const greeting = customGreeting || systemData.greeting;
    const user = systemData.user;
    const time = systemData.time;
    
    // 获取消息：使用消息实体，如果没有实体则为空
    const message = entities.message_entity?.state || '';
    
    return `
      <div class="cardforge-card welcome-card">
        <div class="welcome-content">
          <div class="greeting">${greeting}，${user}！</div>
          <div class="time">${time}</div>
          ${message ? `<div class="message">${message}</div>` : ''}
        </div>
        <div class="decoration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>
    `;
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .welcome-card {
        ${this._responsiveHeight('180px', '150px')}
        ${this._responsivePadding('24px', '20px')}
        position: relative;
        overflow: hidden;
        color: white !important;
      }
      .welcome-content {
        position: relative;
        z-index: 2;
        height: 100%;
        ${this._flexColumn()}
        justify-content: center;
      }
      .greeting {
        ${this._responsiveFontSize('1.4em', '1.2em')}
        font-weight: 500;
        margin-bottom: 8px;
        opacity: 0.95;
      }
      .time {
        ${this._responsiveFontSize('2.2em', '1.8em')}
        font-weight: bold;
        margin-bottom: 8px;
        letter-spacing: 1px;
      }
      .message {
        ${this._responsiveFontSize('0.95em', '0.85em')}
        opacity: 0.8;
        font-style: italic;
        margin-bottom: 4px;
        min-height: 1.2em;
        transition: opacity 0.3s ease;
      }
      .decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
      }
      .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
      }
      .circle-1 {
        width: 80px;
        height: 80px;
        top: -20px;
        right: -20px;
      }
      .circle-2 {
        width: 60px;
        height: 60px;
        bottom: -10px;
        left: 20px;
      }
      .circle-3 {
        width: 40px;
        height: 40px;
        bottom: 30px;
        right: 40px;
      }
      
      .welcome-card:hover .circle-1 {
        animation: float 3s ease-in-out infinite;
        background: rgba(255, 255, 255, 0.15);
      }
      .welcome-card:hover .circle-2 {
        animation: float 3s ease-in-out infinite 0.5s;
        background: rgba(255, 255, 255, 0.12);
      }
      .welcome-card:hover .circle-3 {
        animation: float 3s ease-in-out infinite 1s;
        background: rgba(255, 255, 255, 0.1);
      }
      
      /* 消息更新动画 */
      .message-update {
        animation: messageFade 0.5s ease-in-out;
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes messageFade {
        0% {
          opacity: 0;
          transform: translateY(5px);
        }
        100% {
          opacity: 0.8;
          transform: translateY(0px);
        }
      }
    `;
  }

  // 移除基类中的随机消息生成
  _getRandomMessage() {
    return ''; // 返回空字符串，不显示随机消息
  }
}