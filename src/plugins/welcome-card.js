// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'welcome-card',
  name: '欢迎卡片',
  version: '1.3.0',
  description: '个性化欢迎信息，支持灵活数据源配置',
  author: 'CardForge Team',
  category: 'info',
  icon: '👋',
  entityRequirements: [
    {
      key: 'message_source',
      description: '每日一言',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class WelcomeCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    // 使用统一数据获取方法
    const customGreeting = this._getCardValue(hass, entities, 'greeting_source');
    const greeting = customGreeting || systemData.greeting;
    const user = systemData.user;
    const time = systemData.time;
    const message = this._getCardValue(hass, entities, 'message_source', '');
    
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
        ${this._responsiveHeight('140px', '120px')} /* 降低高度 */
        ${this._responsivePadding('20px', '16px')}
        ${this._flexColumn()}
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
        ${this._responsiveFontSize('1.2em', '1em')} /* 调整字体大小 */
        font-weight: 500;
        ${this._responsiveMargin('0 0 6px', '0 0 4px')}
        opacity: 0.95;
        ${this._textShadow()}
      }
      
      .time {
        ${this._responsiveFontSize('1.8em', '1.5em')} /* 调整字体大小 */
        font-weight: bold;
        ${this._responsiveMargin('0 0 6px', '0 0 4px')}
        letter-spacing: 1px;
        ${this._textShadow()}
      }
      
      .message {
        ${this._responsiveFontSize('0.85em', '0.75em')} /* 调整字体大小 */
        opacity: 0.8;
        font-style: italic;
        ${this._responsiveMargin('0 0 2px', '0 0 1px')}
        min-height: 1.2em;
        transition: opacity 0.3s ease;
        ${this._textShadow()}
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
        ${this._borderRadius('50%')}
        background: rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
      }
      
      .circle-1 {
        width: 60px; /* 减小尺寸 */
        height: 60px;
        top: -15px;
        right: -15px;
      }
      
      .circle-2 {
        width: 45px; /* 减小尺寸 */
        height: 45px;
        bottom: -8px;
        left: 15px;
      }
      
      .circle-3 {
        width: 30px; /* 减小尺寸 */
        height: 30px;
        bottom: 20px;
        right: 30px;
      }
      
      .welcome-card:hover .circle-1 {
        animation: float 3s ease-in-out infinite;
        background: rgba(255, 255, 255, 0.12);
      }
      
      .welcome-card:hover .circle-2 {
        animation: float 3s ease-in-out infinite 0.5s;
        background: rgba(255, 255, 255, 0.1);
      }
      
      .welcome-card:hover .circle-3 {
        animation: float 3s ease-in-out infinite 1s;
        background: rgba(255, 255, 255, 0.08);
      }
      
      /* 消息更新动画 */
      .message-update {
        animation: messageFade 0.5s ease-in-out;
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
      
      /* 毛玻璃主题优化 */
      .welcome-card.glass {
        color: var(--primary-text-color) !important;
      }
      
      .welcome-card.glass .circle {
        background: rgba(var(--rgb-primary-text-color), 0.08);
      }
    `;
  }
}