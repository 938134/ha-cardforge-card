// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'welcome-card',
  name: '欢迎卡片',
  version: '1.1.0',
  description: '个性化欢迎信息，支持自定义欢迎词',
  author: 'CardForge Team',
  category: 'info',
  icon: '👋',
  entityRequirements: [
    {
      key: 'greeting_entity',
      description: '欢迎词实体',
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
    const randomMessage = systemData.randomMessage;
    
    return `
      <div class="cardforge-card welcome-card">
        <div class="welcome-content">
          <div class="greeting">${greeting}，${user}！</div>
          <div class="time">${time}</div>
          <div class="message">${randomMessage}</div>
          ${this._renderCustomInfo(entities)}
        </div>
        <div class="decoration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>
    `;
  }

  _renderCustomInfo(entities) {
    const hasCustomGreeting = entities.greeting_entity;
    
    if (!hasCustomGreeting) {
      return '';
    }
    
    return `<div class="custom-info">使用自定义欢迎词</div>`;
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
      }
      .custom-info {
        ${this._responsiveFontSize('0.7em', '0.65em')}
        opacity: 0.6;
        font-style: normal;
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 8px;
        display: inline-block;
        margin-top: 4px;
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
      }
      .welcome-card:hover .circle-2 {
        animation: float 3s ease-in-out infinite 0.5s;
      }
      .welcome-card:hover .circle-3 {
        animation: float 3s ease-in-out infinite 1s;
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
    `;
  }
}