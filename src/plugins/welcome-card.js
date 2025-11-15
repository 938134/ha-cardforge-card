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

  // 获取紧凑的星期显示
  _getCompactWeekday(weekday) {
    const weekMap = {
      '星期一': '周一', '星期二': '周二', '星期三': '周三',
      '星期四': '周四', '星期五': '周五', '星期六': '周六', '星期日': '周日'
    };
    return weekMap[weekday] || weekday;
  }

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    // 使用系统默认的用户名和问候语
    const userName = systemData.user;
    const greeting = systemData.greeting;
    const compactWeekday = this._getCompactWeekday(systemData.weekday);
    
    // 获取每日一言，优先使用实体数据，没有则使用随机一言
    const dailyMessage = this._getCardValue(hass, entities, 'daily_message', this._getRandomDailyMessage());

    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn welcome-card stacked-layout">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-md">
            <!-- 欢迎信息卡片 -->
            <div class="welcome-card-top cardforge-flex-column cardforge-flex-center cardforge-gap-sm">
              <div class="welcome-icon">👋</div>
              <div class="welcome-greeting">${greeting}，${userName}！</div>
              <div class="welcome-time-info cardforge-flex-row cardforge-flex-center cardforge-gap-md">
                <div class="welcome-time">${systemData.time}</div>
                <div class="welcome-weekday">${compactWeekday}</div>
              </div>
              <div class="welcome-date">${systemData.date}</div>
            </div>

            <!-- 分隔线 -->
            <div class="card-divider"></div>

            <!-- 每日一言卡片 -->
            <div class="daily-message-card cardforge-flex-row cardforge-flex-center cardforge-gap-sm">
              <div class="message-icon">💭</div>
              <div class="message-content cardforge-flex-column cardforge-gap-xs">
                <div class="message-text">${this._renderSafeHTML(dailyMessage)}</div>
                <div class="message-label">每日一言</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card.stacked-layout {
        text-align: center;
      }
      
      .welcome-card-top {
        padding: var(--cf-spacing-md) 0;
      }
      
      .welcome-icon {
        font-size: 2.5em;
        opacity: 0.9;
        animation: icon-float 3s ease-in-out infinite;
      }
      
      .welcome-greeting {
        ${this._cfTextSize('lg')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('text')}
        line-height: 1.2;
        margin: 0;
      }
      
      .welcome-time-info {
        margin: var(--cf-spacing-xs) 0;
      }
      
      .welcome-time {
        ${this._cfTextSize('md')}
        ${this._cfColor('text')}
        font-variant-numeric: tabular-nums;
        font-weight: 600;
      }
      
      .welcome-weekday {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text-secondary')}
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
      }
      
      .welcome-date {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text-secondary')}
        margin: 0;
      }
      
      .card-divider {
        height: 1px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          var(--cf-border) 20%, 
          var(--cf-border) 80%, 
          transparent 100%);
        margin: var(--cf-spacing-sm) 0;
      }
      
      .daily-message-card {
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.1);
        text-align: left;
        transition: all var(--cf-transition-normal);
      }
      
      .daily-message-card:hover {
        background: rgba(var(--cf-rgb-primary), 0.08);
        transform: translateY(-1px);
      }
      
      .message-icon {
        font-size: 1.8em;
        opacity: 0.8;
        flex-shrink: 0;
      }
      
      .message-content {
        flex: 1;
      }
      
      .message-text {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text')}
        line-height: 1.4;
        font-style: italic;
        margin: 0;
      }
      
      .message-label {
        ${this._cfTextSize('xs')}
        ${this._cfColor('text-secondary')}
        font-weight: 500;
        margin: 0;
      }
      
      /* 动画效果 */
      @keyframes icon-float {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-3px) rotate(5deg);
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .daily-message-card {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .welcome-weekday {
          background: rgba(255, 255, 255, 0.1);
        }
      }
      
      /* 主题特殊样式 */
      .theme-glass .daily-message-card {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      
      .theme-gradient .daily-message-card {
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .theme-neon .daily-message-card {
        background: rgba(0, 255, 136, 0.08);
        border: 1px solid rgba(0, 255, 136, 0.2);
        box-shadow: 0 0 8px rgba(0, 255, 136, 0.1);
      }
      
      .theme-ink-wash .daily-message-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .welcome-card-top {
          padding: var(--cf-spacing-sm) 0;
        }
        
        .welcome-icon {
          font-size: 2em;
        }
        
        .welcome-greeting {
          ${this._cfTextSize('md')}
        }
        
        .welcome-time {
          ${this._cfTextSize('sm')}
        }
        
        .welcome-weekday {
          ${this._cfTextSize('xs')}
          padding: 1px 6px;
        }
        
        .welcome-date {
          ${this._cfTextSize('xs')}
        }
        
        .daily-message-card {
          padding: var(--cf-spacing-sm);
        }
        
        .message-icon {
          font-size: 1.5em;
        }
        
        .message-text {
          ${this._cfTextSize('xs')}
          line-height: 1.3;
        }
        
        .message-label {
          ${this._cfTextSize('xxs')}
        }
        
        .card-divider {
          margin: var(--cf-spacing-xs) 0;
        }
      }
      
      @media (max-width: 400px) {
        .welcome-card {
          ${this._cfPadding('md')}
        }
        
        .welcome-time-info {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        
        .daily-message-card {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;