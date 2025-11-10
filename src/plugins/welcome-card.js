// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class WelcomeCardPlugin extends BasePlugin {
  constructor() {
    super();
  }

  getTemplate(config, hass, entities) {
    const hour = new Date().getHours();
    const greeting = this._getGreeting(hour);
    const message = this._getRandomMessage();
    const timeStr = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="cardforge-card cardforge-welcome">
        <div class="welcome-content">
          <div class="greeting">${greeting}</div>
          <div class="time">${timeStr}</div>
          <div class="message">${message}</div>
        </div>
        <div class="welcome-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
      </div>
    `;
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
    const messages = [
      '祝您今天愉快！',
      '一切准备就绪！',
      '家，因你而温暖',
      '美好的一天开始了',
      '放松心情，享受生活',
      '今天也是充满希望的一天',
      '享受当下的美好时光'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getStyles(config) {
    return `
      .cardforge-welcome {
        position: relative;
        overflow: hidden;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        border: none !important;
      }
      
      .welcome-content {
        position: relative;
        z-index: 2;
        text-align: center;
        padding: 20px;
      }
      
      .welcome-content .greeting {
        font-size: 1.4em;
        font-weight: bold;
        margin-bottom: 8px;
        opacity: 0.95;
      }
      
      .welcome-content .time {
        font-size: 2.2em;
        font-weight: bold;
        margin-bottom: 8px;
        letter-spacing: 1px;
      }
      
      .welcome-content .message {
        font-size: 0.9em;
        opacity: 0.9;
        font-style: italic;
      }
      
      .welcome-decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
      }
      
      .decoration-circle {
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
      .cardforge-welcome:hover .circle-1 {
        animation: welcome-float 3s ease-in-out infinite;
      }
      
      .cardforge-welcome:hover .circle-2 {
        animation: welcome-float 3s ease-in-out infinite 0.5s;
      }
      
      .cardforge-welcome:hover .circle-3 {
        animation: welcome-float 3s ease-in-out infinite 1s;
      }
      
      @keyframes welcome-float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      /* 响应式设计 */
      @media (max-width: 480px) {
        .cardforge-welcome {
          height: 140px;
        }
        
        .welcome-content .greeting {
          font-size: 1.2em;
        }
        
        .welcome-content .time {
          font-size: 1.8em;
        }
        
        .welcome-content .message {
          font-size: 0.8em;
        }
      }
    `;
  }
}