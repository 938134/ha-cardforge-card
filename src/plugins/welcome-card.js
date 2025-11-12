// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'welcome-card',
  name: '欢迎卡片',
  version: '1.0.0',
  description: '个性化欢迎信息，支持自定义欢迎词',
  author: 'CardForge Team',
  category: 'info',
  icon: '👋',
  entityRequirements: [],
  themeSupport: true,
  gradientSupport: true
};

export default class WelcomeCardPlugin extends BasePlugin {
  constructor() {
    super();
    this._welcomeData = this.createReactiveData({
      greeting: '',
      user: '家人',
      time: '',
      message: ''
    });

    this._messages = [
      '祝您今天愉快！',
      '一切准备就绪！',
      '家，因你而温暖',
      '美好的一天开始了',
      '保持微笑，继续前行',
      '今天也是充满希望的一天'
    ];

    this._updateInterval = null;
  }

  onConfigUpdate(oldConfig, newConfig) {
    this._startWelcomeUpdates();
  }

  onHassUpdate(hass) {
    if (hass?.user?.name) {
      this._welcomeData.value.user = hass.user.name;
    }
  }

  onDestroy() {
    this._stopWelcomeUpdates();
  }

  _startWelcomeUpdates() {
    this._stopWelcomeUpdates();
    this._updateWelcomeData();
    this._updateInterval = setInterval(() => this._updateWelcomeData(), 60000); // 每分钟更新
  }

  _stopWelcomeUpdates() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }

  _updateWelcomeData() {
    const now = new Date();
    const hour = now.getHours();
    
    this._welcomeData.value = {
      greeting: this._getGreeting(hour),
      user: this._welcomeData.value.user,
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      message: this._getRandomMessage()
    };
  }

  _getGreeting(hour) {
    if (hour < 6) return '深夜好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  }

  _getRandomMessage() {
    return this._messages[Math.floor(Math.random() * this._messages.length)];
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }

  getTemplate(config, hass, entities) {
    const { greeting, user, time, message } = this._welcomeData.value;
    
    return `
      <div class="cardforge-card welcome-card">
        <div class="welcome-content">
          <div class="greeting">${greeting}，${user}！</div>
          <div class="time">${time}</div>
          <div class="message">${message}</div>
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
    return this.getBaseStyles(config) + this.css`
      .welcome-card {
        ${this.responsive(
          'height: 160px; padding: 24px;',
          'height: 140px; padding: 20px;'
        )}
        position: relative;
        overflow: hidden;
        color: white !important;
      }

      .welcome-content {
        position: relative;
        z-index: 2;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .greeting {
        ${this.responsive(
          'font-size: 1.4em; margin-bottom: 8px;',
          'font-size: 1.2em; margin-bottom: 6px;'
        )}
        font-weight: 500;
        opacity: 0.95;
        line-height: 1.3;
      }

      .time {
        ${this.responsive(
          'font-size: 2.2em; margin-bottom: 8px;',
          'font-size: 1.8em; margin-bottom: 6px;'
        )}
        font-weight: 700;
        letter-spacing: 1px;
        line-height: 1.1;
      }

      .message {
        ${this.responsive(
          'font-size: 0.95em;',
          'font-size: 0.85em;'
        )}
        opacity: 0.8;
        font-style: italic;
        line-height: 1.4;
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
        transition: all 0.5s ease;
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
      
      /* 悬停动画效果 */
      .welcome-card:hover .circle-1 {
        animation: float-1 3s ease-in-out infinite;
      }

      .welcome-card:hover .circle-2 {
        animation: float-2 3s ease-in-out infinite 0.5s;
      }

      .welcome-card:hover .circle-3 {
        animation: float-3 3s ease-in-out infinite 1s;
      }
      
      @keyframes float-1 {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-15px) rotate(10deg);
        }
      }

      @keyframes float-2 {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-10px) rotate(-5deg);
        }
      }

      @keyframes float-3 {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-8px) rotate(8deg);
        }
      }

      /* 移动端优化 */
      @media (max-width: 480px) {
        .welcome-card .decoration .circle {
          opacity: 0.7;
        }
      }
    `;
  }

  getCardSize() {
    return 3;
  }
}
