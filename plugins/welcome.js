// plugins/welcome.js
class WelcomePlugin {
  constructor() {
    this.name = 'welcome';
    this.displayName = '欢迎卡片';
    this.icon = '👋';
    this.category = 'info';
  }

  getTemplate(config, entities) {
    const userName = this._getUserName();
    const currentTime = this._getFormattedTime();
    const greeting = this._getGreeting();

    return `
      <div class="cardforge-card welcome">
        <div class="welcome-content">
          <div class="greeting">${greeting}，${userName}！</div>
          <div class="time">${currentTime}</div>
          <div class="message">${this._getMessage()}</div>
        </div>
        <div class="decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
      </div>
    `;
  }

  _getUserName() {
    // 在实际使用中可以从 hass.user 获取
    return '家人';
  }

  _getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  _getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  }

  _getMessage() {
    const messages = [
      '祝您今天愉快！',
      '一切准备就绪！',
      '家，因你而温暖',
      '美好的一天开始了',
      '放松心情，享受生活'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getStyles(config) {
    return `
      .welcome {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .welcome-content {
        position: relative;
        z-index: 2;
        text-align: center;
        padding: 20px;
      }
      
      .greeting {
        font-size: 1.3em;
        font-weight: 500;
        margin-bottom: 8px;
        opacity: 0.95;
      }
      
      .time {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 8px;
        letter-spacing: 1px;
      }
      
      .message {
        font-size: 0.9em;
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
      .welcome:hover .circle-1 {
        animation: float 3s ease-in-out infinite;
      }
      
      .welcome:hover .circle-2 {
        animation: float 3s ease-in-out infinite 0.5s;
      }
      
      .welcome:hover .circle-3 {
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
      
      /* 响应式设计 */
      @media (max-width: 480px) {
        .welcome {
          height: 120px;
        }
        
        .greeting {
          font-size: 1.1em;
        }
        
        .time {
          font-size: 2em;
        }
        
        .message {
          font-size: 0.8em;
        }
      }
      
      /* 深色主题适配 */
      .cardforge-card[data-theme="dark"] .welcome {
        background: linear-gradient(135deg, #bb86fc, #03dac6);
      }
      
      /* 材质主题适配 */
      .cardforge-card[data-theme="material"] .welcome {
        background: linear-gradient(135deg, #6200ee, #03dac6);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    `;
  }

  getEntityRequirements() {
    return {
      required: [],
      optional: []
    };
  }
}