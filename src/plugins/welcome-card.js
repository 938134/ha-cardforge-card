// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class WelcomeCardPlugin extends BasePlugin {
  getPluginInfo() {
    return {
      name: '欢迎卡片',
      description: '个性化欢迎信息，支持自定义欢迎词',
      icon: '👋',
      category: 'info',
      supportsGradient: true
    };
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['#ff6b6b', '#ffa726']
    };
  }

  getEntityRequirements() {
    return [
      {
        key: 'welcomeText',
        description: '欢迎词实体 (可选)',
        domains: ['input_text', 'sensor'],
        required: false
      },
      {
        key: 'userName',
        description: '用户名实体 (可选)', 
        domains: ['input_text', 'person'],
        required: false
      }
    ];
  }

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    // 优先使用实体数据，回退到系统数据
    const welcomeText = entities.welcomeText?.state || systemData.greeting;
    const userName = entities.userName?.state || systemData.user;
    const showRandomMessage = !entities.welcomeText; // 如果有自定义欢迎词，就不显示随机消息
    
    return `
      <div class="cardforge-card welcome-card">
        <div class="welcome-content">
          <div class="greeting-section">
            <div class="greeting">${welcomeText}，</div>
            <div class="username">${userName}！</div>
          </div>
          <div class="time">${systemData.time}</div>
          ${showRandomMessage ? `
            <div class="message">
              <span class="emoji">${systemData.randomEmoji}</span>
              <span class="text">${systemData.randomMessage}</span>
            </div>
          ` : ''}
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
        width: 100%;
      }
      
      .greeting-section {
        ${this._flexCenter()}
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      
      .welcome-card .greeting {
        ${this._responsiveFontSize('1.4em', '1.2em')}
        font-weight: 600;
        opacity: 0.95;
      }
      
      .welcome-card .username {
        ${this._responsiveFontSize('1.4em', '1.2em')}
        font-weight: 700;
        color: inherit;
      }
      
      .welcome-card .time {
        ${this._responsiveFontSize('2.2em', '1.8em')}
        font-weight: 300;
        letter-spacing: 1px;
        margin-bottom: 12px;
        opacity: 0.9;
      }
      
      .welcome-card .message {
        ${this._flexCenter()}
        gap: 8px;
        justify-content: center;
        ${this._responsiveFontSize('0.95em', '0.85em')}
        opacity: 0.8;
        font-style: italic;
      }
      
      .welcome-card .emoji {
        font-size: 1.2em;
      }
      
      /* 装饰元素 */
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
        background: rgba(255,255,255,0.1);
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
        50% { transform: translateY(-8px); }
      }
      
      /* 深色主题适配 */
      .cardforge-card[data-theme="dark"] .circle {
        background: rgba(255,255,255,0.05);
      }
      
      .cardforge-card[data-theme="minimal"] .circle {
        display: none;
      }
    `;
  }
}