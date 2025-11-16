// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '2.0.0',
    description: '现代简约风格的欢迎卡片，显示时间、问候语和每日一言',
    category: 'information',
    icon: '👋',
    author: 'CardForge Team',
    
    config_schema: {
      // 布局配置
      layout_style: {
        type: 'select',
        label: '布局风格',
        options: ['modern', 'classic', 'minimal'],
        default: 'modern',
        description: '选择卡片的整体布局风格'
      },
      
      show_time: {
        type: 'boolean',
        label: '显示时间',
        default: true,
        description: '显示当前时间'
      },
      
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: true,
        description: '显示当前日期'
      },
      
      show_weekday: {
        type: 'boolean',
        label: '显示星期',
        default: true,
        description: '显示当前星期'
      },
      
      show_greeting: {
        type: 'boolean',
        label: '显示问候语',
        default: true,
        description: '显示个性化问候语'
      },
      
      // 内容配置
      greeting_style: {
        type: 'select',
        label: '问候语风格',
        options: ['friendly', 'formal', 'casual'],
        default: 'friendly',
        description: '选择问候语的语气风格'
      },
      
      // 每日一言配置
      daily_message_source: {
        type: 'select',
        label: '每日一言来源',
        options: ['entity', 'builtin', 'custom'],
        default: 'builtin',
        description: '选择每日一言的数据来源'
      },
      
      auto_refresh_message: {
        type: 'boolean',
        label: '自动刷新一言',
        default: false,
        description: '每天自动更换内置每日一言'
      },
      
      custom_message: {
        type: 'string',
        label: '自定义一言',
        default: '',
        description: '输入自定义的每日一言内容',
        required: false
      },
      
      // 样式配置
      text_alignment: {
        type: 'select',
        label: '文字对齐',
        options: ['left', 'center', 'right'],
        default: 'center',
        description: '文字内容对齐方式'
      },
      
      icon_size: {
        type: 'select',
        label: '图标大小',
        options: ['small', 'medium', 'large'],
        default: 'medium',
        description: '图标显示大小'
      },
      
      // 动画配置
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true,
        description: '启用微妙的动画效果'
      },
      
      animation_style: {
        type: 'select',
        label: '动画风格',
        options: ['fade', 'slide', 'bounce'],
        default: 'fade',
        description: '选择动画效果风格'
      }
    },
    
    entity_requirements: [
      {
        key: 'daily_message',
        description: '每日一言实体',
        required: false,
        type: 'string'
      },
      {
        key: 'user_name',
        description: '用户名称',
        required: false,
        type: 'string'
      }
    ]
  };

  // 内置每日一言库
  _getBuiltinMessages() {
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
      "相信自己，你能行！",
      "保持热爱，奔赴山海。",
      "简单的事情重复做，你就是专家。",
      "重复的事情用心做，你就是赢家。",
      "生活不是等待风暴过去，而是学会在雨中跳舞。",
      "最好的总会在最不经意的时候出现。"
    ];
  }

  // 获取问候语
  _getGreeting(hour, style = 'friendly') {
    const greetings = {
      friendly: {
        morning: '早上好',
        noon: '中午好', 
        afternoon: '下午好',
        evening: '晚上好',
        night: '夜深了'
      },
      formal: {
        morning: '早安',
        noon: '午安',
        afternoon: '下午好',
        evening: '晚上好',
        night: '晚安'
      },
      casual: {
        morning: '嗨，早啊',
        noon: '午饭吃了吗',
        afternoon: '下午好呀',
        evening: '晚上好',
        night: '还没睡呀'
      }
    };

    const styleGreetings = greetings[style] || greetings.friendly;
    
    if (hour < 6) return styleGreetings.night;
    else if (hour < 9) return styleGreetings.morning;
    else if (hour < 12) return styleGreetings.morning;
    else if (hour < 14) return styleGreetings.noon;
    else if (hour < 18) return styleGreetings.afternoon;
    else if (hour < 22) return styleGreetings.evening;
    else return styleGreetings.night;
  }

  // 获取每日一言
  _getDailyMessage(config, hass, entities) {
    const source = config.daily_message_source || 'builtin';
    
    switch (source) {
      case 'entity':
        return this._getCardValue(hass, entities, 'daily_message', this._getRandomBuiltinMessage());
      
      case 'custom':
        return config.custom_message || this._getRandomBuiltinMessage();
      
      case 'builtid':
      default:
        return this._getRandomBuiltinMessage();
    }
  }

  // 获取随机内置一言
  _getRandomBuiltinMessage() {
    const messages = this._getBuiltinMessages();
    // 基于日期的随机数，确保每天显示相同的一言（除非启用自动刷新）
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const randomIndex = seed % messages.length;
    return messages[randomIndex];
  }

  // 获取用户名称
  _getUserName(hass, entities) {
    return this._getCardValue(hass, entities, 'user_name', hass?.user?.name || '家人');
  }

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    const now = new Date();
    const hour = now.getHours();
    
    // 获取配置值
    const layoutStyle = config.layout_style || 'modern';
    const showTime = config.show_time !== false;
    const showDate = config.show_date !== false;
    const showWeekday = config.show_weekday !== false;
    const showGreeting = config.show_greeting !== false;
    const greetingStyle = config.greeting_style || 'friendly';
    const textAlignment = config.text_alignment || 'center';
    const iconSize = config.icon_size || 'medium';
    const enableAnimations = config.enable_animations !== false;
    const animationStyle = config.animation_style || 'fade';

    // 获取动态内容
    const greeting = this._getGreeting(hour, greetingStyle);
    const userName = this._getUserName(hass, entities);
    const dailyMessage = this._getDailyMessage(config, hass, entities);

    return `
      <div class="cardforge-responsive-container welcome-card layout-${layoutStyle} text-${textAlignment} ${enableAnimations ? `animate-${animationStyle}` : ''}">
        <div class="cardforge-content-grid">
          <div class="welcome-content">
            <!-- 时间日期区域 -->
            ${showTime || showDate || showWeekday ? `
              <div class="time-section">
                ${showTime ? `
                  <div class="time-display icon-${iconSize}">
                    <span class="time-icon">🕒</span>
                    <span class="time-value">${systemData.time}</span>
                  </div>
                ` : ''}
                
                ${showDate || showWeekday ? `
                  <div class="date-info">
                    ${showDate ? `<span class="date">${systemData.date_short}</span>` : ''}
                    ${showDate && showWeekday ? '<span class="separator">·</span>' : ''}
                    ${showWeekday ? `<span class="weekday">${systemData.weekday}</span>` : ''}
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <!-- 问候语区域 -->
            ${showGreeting ? `
              <div class="greeting-section">
                <div class="greeting-content icon-${iconSize}">
                  <span class="greeting-icon">👋</span>
                  <div class="greeting-text">
                    <span class="greeting">${greeting}</span>
                    <span class="username">，${userName}！</span>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- 每日一言区域 -->
            ${dailyMessage ? `
              <div class="daily-message-section">
                <div class="message-content icon-${iconSize}">
                  <span class="message-icon">💭</span>
                  <div class="message-text">${this._renderSafeHTML(dailyMessage)}</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const layoutStyle = config.layout_style || 'modern';
    const textAlignment = config.text_alignment || 'center';
    const iconSize = config.icon_size || 'medium';
    const enableAnimations = config.enable_animations !== false;
    const animationStyle = config.animation_style || 'fade';

    // 图标大小映射
    const iconSizes = {
      small: '1.5em',
      medium: '2em',
      large: '2.5em'
    };

    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card {
        padding: var(--cf-spacing-xl);
        min-height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .welcome-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }
      
      /* 文字对齐 */
      .text-left {
        text-align: left;
        align-items: flex-start;
      }
      
      .text-center {
        text-align: center;
        align-items: center;
      }
      
      .text-right {
        text-align: right;
        align-items: flex-end;
      }
      
      /* 时间区域 */
      .time-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .time-display {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-size: 1.8em;
        font-weight: 300;
        color: var(--cf-text-primary);
      }
      
      .time-icon {
        font-size: ${iconSizes[iconSize]};
        opacity: 0.9;
      }
      
      .time-value {
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.5px;
      }
      
      .date-info {
        display: flex;
        gap: var(--cf-spacing-sm);
        align-items: center;
        font-size: 1em;
        color: var(--cf-text-secondary);
      }
      
      .separator {
        opacity: 0.6;
      }
      
      .date, .weekday {
        font-weight: 500;
      }
      
      /* 问候语区域 */
      .greeting-section {
        margin: var(--cf-spacing-sm) 0;
      }
      
      .greeting-content {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
      }
      
      .greeting-icon {
        font-size: ${iconSizes[iconSize]};
        flex-shrink: 0;
      }
      
      .greeting-text {
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
      
      /* 每日一言区域 */
      .daily-message-section {
        margin-top: var(--cf-spacing-md);
      }
      
      .message-content {
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
        max-width: 400px;
      }
      
      .message-icon {
        font-size: ${iconSizes[iconSize]};
        margin-top: 2px;
        flex-shrink: 0;
        opacity: 0.8;
      }
      
      .message-text {
        font-size: 0.95em;
        line-height: 1.5;
        color: var(--cf-text-secondary);
        font-style: italic;
        flex: 1;
      }
      
      /* 布局变体 */
      .layout-modern .welcome-content {
        gap: var(--cf-spacing-xl);
      }
      
      .layout-classic .time-display {
        font-size: 2.2em;
      }
      
      .layout-classic .greeting-text {
        font-size: 1.6em;
      }
      
      .layout-minimal .welcome-content {
        gap: var(--cf-spacing-md);
      }
      
      .layout-minimal .time-display {
        font-size: 1.6em;
      }
      
      .layout-minimal .greeting-text {
        font-size: 1.2em;
      }
      
      .layout-minimal .message-text {
        font-size: 0.9em;
      }
      
      /* 动画效果 */
      .animate-fade .time-section {
        animation: welcome-fade-in 0.6s ease-out;
      }
      
      .animate-fade .greeting-section {
        animation: welcome-fade-in 0.6s ease-out 0.2s both;
      }
      
      .animate-fade .daily-message-section {
        animation: welcome-fade-in 0.6s ease-out 0.4s both;
      }
      
      .animate-slide .time-section {
        animation: welcome-slide-up 0.6s ease-out;
      }
      
      .animate-slide .greeting-section {
        animation: welcome-slide-up 0.6s ease-out 0.2s both;
      }
      
      .animate-slide .daily-message-section {
        animation: welcome-slide-up 0.6s ease-out 0.4s both;
      }
      
      .animate-bounce .time-icon,
      .animate-bounce .greeting-icon,
      .animate-bounce .message-icon {
        animation: welcome-bounce 2s ease-in-out infinite;
      }
      
      @keyframes welcome-fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes welcome-slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes welcome-bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
          min-height: 120px;
        }
        
        .welcome-content {
          gap: var(--cf-spacing-md);
        }
        
        .time-display {
          font-size: 1.5em;
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        
        .greeting-text {
          font-size: 1.2em;
        }
        
        .message-content {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
        }
        
        .layout-classic .time-display {
          font-size: 1.8em;
        }
        
        .layout-classic .greeting-text {
          font-size: 1.4em;
        }
      }
      
      @media (max-width: 400px) {
        .welcome-card {
          padding: var(--cf-spacing-md);
        }
        
        .time-display {
          font-size: 1.3em;
        }
        
        .greeting-content,
        .message-content {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
        }
        
        .greeting-text {
          font-size: 1.1em;
        }
        
        .message-text {
          font-size: 0.85em;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .welcome-card {
          background: linear-gradient(135deg, var(--card-background-color) 0%, rgba(255, 255, 255, 0.03) 100%);
        }
      }
      
      /* 主题适配 */
      .theme-glass .welcome-card {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .theme-gradient .welcome-card {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
        color: white;
      }
      
      .theme-gradient .date-info,
      .theme-gradient .message-text {
        color: rgba(255, 255, 255, 0.9);
      }
      
      .theme-neon .username {
        color: #00ff88;
        text-shadow: 0 0 10px #00ff88;
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;