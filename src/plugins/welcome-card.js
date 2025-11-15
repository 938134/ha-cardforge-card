// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '个性化欢迎信息',
    category: '信息',
    icon: '👋',
    entityRequirements: [
      {
        key: 'daily_message',
        description: '每日一言',
        required: false
      }
    ]
  };

  // 默认每日一言库
  _getDailyMessages() {
    return [
      "每一天都是新的开始，加油！",
      "生活就像一杯茶，不会苦一辈子，但总会苦一阵子。",
      "成功的秘诀就是每天都比别人多努力一点。",
      "心怀希望，向阳而生。",
      "今天的努力，是明天的实力。",
      "微笑面对生活，生活也会对你微笑。",
      "坚持就是胜利，放弃才是失败。",
      "梦想不会逃跑，会逃跑的永远都是自己。",
      "每一天都是改变命运的机会。",
      "努力不一定成功，但放弃一定失败。",
      "活在当下，珍惜眼前。",
      "心若向阳，无畏悲伤。",
      "越努力，越幸运。",
      "时间不会辜负每一个努力的人。",
      "相信自己，你能行！"
    ];
  }

  // 获取随机每日一言
  _getRandomDailyMessage() {
    const messages = this._getDailyMessages();
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    // 使用系统默认的用户名和问候语
    const userName = systemData.user;
    const greeting = systemData.greeting;
    
    // 获取每日一言，优先使用实体数据，没有则使用随机一言
    const dailyMessage = this._getCardValue(hass, entities, 'daily_message', this._getRandomDailyMessage());

    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn welcome-card">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-lg">
            <!-- 主欢迎区域 -->
            <div class="welcome-main cardforge-flex-column cardforge-flex-center cardforge-gap-md">
              <div class="welcome-icon">👋</div>
              <div class="cardforge-content-large welcome-greeting">${greeting}，${userName}！</div>
              <div class="cardforge-content-body welcome-time">${systemData.time}</div>
              <div class="cardforge-content-small welcome-date">${systemData.date} ${systemData.weekday}</div>
            </div>

            <!-- 分隔线 -->
            <div class="welcome-divider"></div>

            <!-- 每日一言区域 -->
            <div class="daily-message cardforge-flex-column cardforge-flex-center cardforge-gap-sm">
              <div class="daily-message-icon">💭</div>
              <div class="cardforge-content-small daily-message-text">${this._renderSafeHTML(dailyMessage)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card {
        text-align: center;
      }
      
      .welcome-main {
        padding: var(--cf-spacing-md) 0;
      }
      
      .welcome-icon {
        font-size: 3em;
        opacity: 0.8;
        animation: welcome-bounce 2s ease-in-out infinite;
      }
      
      .welcome-greeting {
        ${this._cfTextSize('xl')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('text')}
        line-height: 1.2;
        margin: 0;
      }
      
      .welcome-time {
        ${this._cfTextSize('lg')}
        ${this._cfColor('text')}
        font-variant-numeric: tabular-nums;
        margin: 0;
      }
      
      .welcome-date {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text-secondary')}
        margin: 0;
      }
      
      .welcome-divider {
        height: 1px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          var(--cf-border) 50%, 
          transparent 100%);
        margin: var(--cf-spacing-sm) 0;
      }
      
      .daily-message {
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.1);
        margin-top: var(--cf-spacing-sm);
      }
      
      .daily-message-icon {
        font-size: 1.5em;
        opacity: 0.7;
      }
      
      .daily-message-text {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text')}
        line-height: 1.4;
        font-style: italic;
        margin: 0;
        text-align: center;
      }
      
      /* 动画效果 */
      @keyframes welcome-bounce {
        0%, 100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-5px) scale(1.05);
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .daily-message {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
      }
      
      /* 主题特殊样式 */
      .theme-glass .daily-message {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .theme-gradient .daily-message {
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      .theme-neon .daily-message {
        background: rgba(0, 255, 136, 0.1);
        border: 1px solid rgba(0, 255, 136, 0.3);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .welcome-main {
          padding: var(--cf-spacing-sm) 0;
        }
        
        .welcome-icon {
          font-size: 2.5em;
        }
        
        .welcome-greeting {
          ${this._cfTextSize('lg')}
        }
        
        .welcome-time {
          ${this._cfTextSize('md')}
        }
        
        .welcome-date {
          ${this._cfTextSize('xs')}
        }
        
        .daily-message {
          padding: var(--cf-spacing-sm);
          margin-top: var(--cf-spacing-xs);
        }
        
        .daily-message-icon {
          font-size: 1.3em;
        }
        
        .daily-message-text {
          ${this._cfTextSize('xs')}
        }
      }
      
      @media (max-width: 400px) {
        .welcome-card {
          ${this._cfPadding('md')}
        }
        
        .welcome-icon {
          font-size: 2em;
        }
        
        .welcome-greeting {
          ${this._cfTextSize('md')}
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;