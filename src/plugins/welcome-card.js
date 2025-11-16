// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.1.0',
    description: '现代简约风格的欢迎卡片，显示时间、问候语和每日一言',
    category: 'information',
    icon: '👋',
    author: 'CardForge Team',
    
    config_schema: {
      // 布局配置
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: false,
        description: '在时间下方显示日期信息'
      },
      
      show_weekday: {
        type: 'boolean',
        label: '显示星期',
        default: false,
        description: '在时间下方显示星期信息'
      },
      
      // 样式配置
      text_emphasis: {
        type: 'select',
        label: '重点强调',
        options: ['time', 'greeting', 'message'],
        default: 'time',
        description: '选择要重点强调的内容'
      },
      
      icon_style: {
        type: 'select',
        label: '图标风格',
        options: ['minimal', 'bubble', 'gradient'],
        default: 'minimal',
        description: '选择图标的显示风格'
      },
      
      // 交互配置
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true,
        description: '启用微妙的动画效果'
      }
    },
    
    entity_requirements: [
      {
        key: 'daily_message',
        description: '每日一言',
        required: false,
        type: 'string'
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
    const dailyMessage = this._getCardValue(hass, entities, 'daily_message', this._getRandomDailyMessage());
    
    const showDate = config.show_date || false;
    const showWeekday = config.show_weekday || false;
    const textEmphasis = config.text_emphasis || 'time';
    const iconStyle = config.icon_style || 'minimal';
    const enableAnimations = config.enable_animations !== false;

    return `
      <div class="cardforge-responsive-container welcome-card layout-modern ${enableAnimations ? 'with-animations' : ''}">
        <div class="cardforge-content-grid">
          <div class="welcome-modern-layout">
            <!-- 时间区域 -->
            <div class="time-section ${textEmphasis === 'time' ? 'emphasized' : ''}">
              <div class="time-icon icon-${iconStyle}">🕒</div>
              <div class="time-display">${systemData.time}</div>
              ${(showDate || showWeekday) ? `
                <div class="time-meta">
                  ${showDate ? `<span class="date">${systemData.date_short}</span>` : ''}
                  ${showDate && showWeekday ? '<span class="meta-separator">·</span>' : ''}
                  ${showWeekday ? `<span class="weekday">${systemData.weekday_short}</span>` : ''}
                </div>
              ` : ''}
            </div>
            
            <!-- 问候区域 -->
            <div class="greeting-section ${textEmphasis === 'greeting' ? 'emphasized' : ''}">
              <div class="greeting-icon icon-${iconStyle}">👋</div>
              <div class="greeting-text">
                <div class="greeting">${systemData.greeting}</div>
                <div class="username">，${systemData.user}！</div>
              </div>
            </div>
            
            <!-- 每日一言区域 -->
            <div class="daily-message-section ${textEmphasis === 'message' ? 'emphasized' : ''}">
              <div class="message-icon icon-${iconStyle}">💭</div>
              <div class="message-text">${this._renderSafeHTML(dailyMessage)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const textEmphasis = config.text_emphasis || 'time';
    const iconStyle = config.icon_style || 'minimal';
    const enableAnimations = config.enable_animations !== false;

    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card.layout-modern {
        text-align: center;
        padding: var(--cf-spacing-xl) var(--cf-spacing-lg);
      }
      
      .welcome-modern-layout {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xl);
        align-items: center;
      }
      
      /* 时间区域样式 */
      .time-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }
      
      .time-section.emphasized {
        transform: scale(1.05);
      }
      
      .time-icon {
        font-size: 2.5em;
        margin-bottom: var(--cf-spacing-xs);
        ${enableAnimations ? 'animation: icon-pulse 2s ease-in-out infinite;' : ''}
      }
      
      .time-display {
        font-size: 2.2em;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.5px;
        color: var(--cf-text-primary);
        line-height: 1;
      }
      
      .time-meta {
        display: flex;
        gap: var(--cf-spacing-sm);
        align-items: center;
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .meta-separator {
        opacity: 0.6;
      }
      
      .date, .weekday {
        font-weight: 500;
      }
      
      /* 问候区域样式 */
      .greeting-section {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
      }
      
      .greeting-section.emphasized {
        transform: scale(1.05);
      }
      
      .greeting-icon {
        font-size: 2em;
        flex-shrink: 0;
        ${enableAnimations ? 'animation: icon-bounce 3s ease-in-out infinite;' : ''}
      }
      
      .greeting-text {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2px;
        font-size: 1.4em;
        line-height: 1.2;
      }
      
      .greeting {
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .username {
        font-weight: 600;
        color: var(--cf-primary-color);
      }
      
      /* 每日一言区域样式 */
      .daily-message-section {
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
        max-width: 320px;
        text-align: left;
      }
      
      .daily-message-section.emphasized {
        transform: scale(1.05);
      }
      
      .message-icon {
        font-size: 1.5em;
        margin-top: 2px;
        flex-shrink: 0;
        ${enableAnimations ? 'animation: icon-float 4s ease-in-out infinite;' : ''}
      }
      
      .message-text {
        font-size: 0.95em;
        line-height: 1.5;
        color: var(--cf-text-secondary);
        font-style: italic;
        flex: 1;
      }
      
      /* 图标风格 */
      .icon-minimal {
        opacity: 0.9;
      }
      
      .icon-bubble {
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 8px;
        border-radius: 50%;
        backdrop-filter: blur(10px);
      }
      
      .icon-gradient {
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      /* 动画效果 */
      @keyframes icon-pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.9;
        }
        50% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
      
      @keyframes icon-bounce {
        0%, 100% {
          transform: translateY(0) rotate(0deg);
        }
        25% {
          transform: translateY(-3px) rotate(5deg);
        }
        75% {
          transform: translateY(-1px) rotate(-3deg);
        }
      }
      
      @keyframes icon-float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-2px);
        }
      }
      
      .with-animations .time-display {
        animation: fade-in-up 0.8s ease-out;
      }
      
      .with-animations .greeting-text {
        animation: fade-in-up 0.8s ease-out 0.2s both;
      }
      
      .with-animations .daily-message-section {
        animation: fade-in-up 0.8s ease-out 0.4s both;
      }
      
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .welcome-card.layout-modern {
          padding: var(--cf-spacing-lg) var(--cf-spacing-md);
        }
        
        .welcome-modern-layout {
          gap: var(--cf-spacing-lg);
        }
        
        .time-display {
          font-size: 1.8em;
        }
        
        .time-icon {
          font-size: 2em;
        }
        
        .greeting-text {
          font-size: 1.2em;
        }
        
        .greeting-icon {
          font-size: 1.6em;
        }
        
        .message-text {
          font-size: 0.9em;
        }
        
        .message-icon {
          font-size: 1.3em;
        }
      }
      
      @media (max-width: 400px) {
        .welcome-card.layout-modern {
          padding: var(--cf-spacing-md) var(--cf-spacing-sm);
        }
        
        .time-display {
          font-size: 1.6em;
        }
        
        .greeting-text {
          font-size: 1.1em;
          flex-direction: column;
          gap: 0;
        }
        
        .daily-message-section {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .icon-bubble {
          background: rgba(255, 255, 255, 0.1);
        }
      }
      
      /* 主题适配 */
      .theme-glass .icon-bubble {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(20px);
      }
      
      .theme-gradient .icon-bubble {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .theme-neon .icon-bubble {
        background: rgba(0, 255, 136, 0.1);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;