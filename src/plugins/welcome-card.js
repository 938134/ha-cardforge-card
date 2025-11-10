// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class WelcomeCardPlugin extends BasePlugin {
  getPluginInfo() {
    return {
      name: '欢迎卡片',
      description: '个性化欢迎信息卡片',
      icon: '👋',
      category: 'info'
    };
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }

  getTemplate(config, hass, entities) {
    const { greeting, user, time, randomMessage } = this.getSystemData(hass, config);
    
    return `
      <div class="cardforge-card welcome-card">
        <div class="welcome-content">
          <div class="greeting">${greeting}，${user}！</div>
          <div class="time">${time}</div>
          <div class="message">${randomMessage}</div>
        </div>
        <div class="decoration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .welcome-card {
        ${this._flexCenter()}
        ${this._responsiveHeight('160px', '140px')}
        ${this._responsivePadding('24px', '20px')}
        position: relative;
        overflow: hidden;
      }
      
      .welcome-content {
        position: relative;
        z-index: 2;
        ${this._textCenter()}
      }
      
      .greeting {
        ${this._responsiveFontSize('1.4em', '1.2em')}
        font-weight: 600;
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
      
      /* 动画效果 */
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
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
    `;
  }
}