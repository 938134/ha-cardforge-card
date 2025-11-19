// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '2.0.0',
    description: '个性化欢迎卡片，突出用户问候和每日一言',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['温馨问候', '励志名言', '诗意人生', '哲学思考', '成功激励', '心灵鸡汤'],
        default: '温馨问候'
      },
      show_daily_quote: {
        type: 'boolean',
        label: '显示每日一言',
        default: true
      },
      quote_position: {
        type: 'select',
        label: '名言位置',
        options: ['底部居中', '右侧悬浮', '左侧装饰', '背景水印'],
        default: '底部居中'
      },
      animation_style: {
        type: 'select',
        label: '问候语动画',
        options: ['打字机效果', '逐字显现', '淡入浮现', '滑动进入', '弹跳出现'],
        default: '打字机效果'
      }
    },
    
    entity_requirements: {
      welcome_message: {
        name: '欢迎消息',
        description: '个性化欢迎消息或每日一言',
        type: 'text', 
        required: false,
        default: '',
        example: 'sensor.daily_quote 或 直接输入文本'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const userName = this._getUserName(hass);
    const welcomeMessage = this._getWelcomeMessage(hass, entities);
    const timeData = this._getTimeData();
    const cardStyle = config.card_style || '温馨问候';
    
    const content = this._renderCardContent(cardStyle, userName, welcomeMessage, timeData, config);
    return this._renderCardContainer(content, `welcome-card style-${this._getStyleClass(cardStyle)} quote-${this._getQuotePositionClass(config.quote_position)} animation-${this._getAnimationClass(config.animation_style)}`, config);
  }

  _getTimeData() {
    const now = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    return {
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      weekday: weekdays[now.getDay()],
      greeting: this._getTimeBasedGreeting(),
      period: this._getTimePeriod()
    };
  }

  _getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '早上好';
    } else if (hour >= 12 && hour < 14) {
      return '中午好';
    } else if (hour >= 14 && hour < 18) {
      return '下午好';
    } else if (hour >= 18 && hour < 22) {
      return '晚上好';
    } else {
      return '夜深了';
    }
  }

  _getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '清晨';
    if (hour >= 12 && hour < 14) return '午间';
    if (hour >= 14 && hour < 18) return '下午';
    if (hour >= 18 && hour < 22) return '傍晚';
    return '深夜';
  }

  _renderCardContent(style, userName, welcomeMessage, timeData, config) {
    const styleClass = this._getStyleClass(style);
    
    const renderers = {
      'warm': () => this._renderWarmStyle(userName, welcomeMessage, timeData, config),
      'inspire': () => this._renderInspireStyle(userName, welcomeMessage, timeData, config),
      'poetic': () => this._renderPoeticStyle(userName, welcomeMessage, timeData, config),
      'philosophy': () => this._renderPhilosophyStyle(userName, welcomeMessage, timeData, config),
      'success': () => this._renderSuccessStyle(userName, welcomeMessage, timeData, config),
      'comfort': () => this._renderComfortStyle(userName, welcomeMessage, timeData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['warm']();
  }

  /* ===== 温馨问候风格 ===== */
  _renderWarmStyle(userName, welcomeMessage, timeData, config) {
    return `
      <div class="warm-layout">
        <div class="warm-greeting">
          <div class="greeting-main">${timeData.greeting}，</div>
          <div class="user-name">${userName}</div>
        </div>
        <div class="time-info">
          <div class="current-time">${timeData.time}</div>
          <div class="date-week">
            <span class="date">${timeData.date}</span>
            <span class="weekday">${timeData.weekday}</span>
          </div>
        </div>
        ${config.show_daily_quote && welcomeMessage ? `
          <div class="warm-quote">
            <div class="quote-icon">💝</div>
            <div class="quote-text">${welcomeMessage}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 励志名言风格 ===== */
  _renderInspireStyle(userName, welcomeMessage, timeData, config) {
    return `
      <div class="inspire-layout">
        <div class="inspire-header">
          <div class="greeting-section">
            <div class="greeting-main">${timeData.greeting}，${userName}</div>
            <div class="time-display">${timeData.time}</div>
          </div>
        </div>
        ${config.show_daily_quote && welcomeMessage ? `
          <div class="inspire-quote">
            <div class="quote-content">
              <div class="quote-mark">❝</div>
              <div class="quote-text">${welcomeMessage}</div>
              <div class="quote-mark">❞</div>
            </div>
          </div>
        ` : ''}
        <div class="inspire-footer">
          <div class="date-info">${timeData.date} · ${timeData.weekday}</div>
        </div>
      </div>
    `;
  }

  /* ===== 诗意人生风格 ===== */
  _renderPoeticStyle(userName, welcomeMessage, timeData, config) {
    return `
      <div class="poetic-layout">
        <div class="poetic-background"></div>
        <div class="poetic-content">
          <div class="poetic-greeting">
            <div class="greeting-line">${timeData.greeting}，${userName}</div>
            <div class="time-poetic">${timeData.time}</div>
          </div>
          ${config.show_daily_quote && welcomeMessage ? `
            <div class="poetic-quote">
              <div class="quote-scroll">
                <div class="quote-text">${welcomeMessage}</div>
              </div>
            </div>
          ` : ''}
          <div class="poetic-footer">
            <div class="date-poetic">${timeData.date}</div>
            <div class="weekday-poetic">${timeData.weekday}</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 哲学思考风格 ===== */
  _renderPhilosophyStyle(userName, welcomeMessage, timeData, config) {
    return `
      <div class="philosophy-layout">
        <div class="philosophy-header">
          <div class="greeting-philosophy">
            <span class="greeting-text">${timeData.greeting}</span>
            <span class="user-philosophy">${userName}</span>
          </div>
          <div class="time-philosophy">${timeData.time}</div>
        </div>
        ${config.show_daily_quote && welcomeMessage ? `
          <div class="philosophy-quote">
            <div class="quote-wisdom">
              <div class="wisdom-icon">🧠</div>
              <div class="quote-text">${welcomeMessage}</div>
            </div>
          </div>
        ` : ''}
        <div class="philosophy-footer">
          <div class="date-philosophy">${timeData.date}</div>
          <div class="weekday-philosophy">${timeData.weekday}</div>
        </div>
      </div>
    `;
  }

  /* ===== 成功激励风格 ===== */
  _renderSuccessStyle(userName, welcomeMessage, timeData, config) {
    return `
      <div class="success-layout">
        <div class="success-greeting">
          <div class="greeting-energetic">${timeData.greeting}！</div>
          <div class="user-energetic">${userName}</div>
        </div>
        <div class="success-time">${timeData.time}</div>
        ${config.show_daily_quote && welcomeMessage ? `
          <div class="success-quote">
            <div class="quote-energetic">
              <div class="energy-icon">⚡</div>
              <div class="quote-text">${welcomeMessage}</div>
            </div>
          </div>
        ` : ''}
        <div class="success-info">
          <div class="date-success">${timeData.date}</div>
          <div class="weekday-success">${timeData.weekday}</div>
        </div>
      </div>
    `;
  }

  /* ===== 心灵鸡汤风格 ===== */
  _renderComfortStyle(userName, welcomeMessage, timeData, config) {
    return `
      <div class="comfort-layout">
        <div class="comfort-greeting">
          <div class="greeting-comfort">${timeData.greeting}，亲爱的${userName}</div>
          <div class="time-comfort">${timeData.time}</div>
        </div>
        ${config.show_daily_quote && welcomeMessage ? `
          <div class="comfort-quote">
            <div class="quote-comfort">
              <div class="comfort-icon">🌼</div>
              <div class="quote-text">${welcomeMessage}</div>
            </div>
          </div>
        ` : ''}
        <div class="comfort-footer">
          <div class="date-comfort">${timeData.date}</div>
          <div class="weekday-comfort">${timeData.weekday}</div>
        </div>
        <div class="comfort-decoration"></div>
      </div>
    `;
  }

  _getWelcomeMessage(hass, entities) {
    if (!entities || !entities.welcome_message) {
      return this._getDefaultWelcomeMessage();
    }
    
    const welcomeMessage = entities.welcome_message.state || '';
    
    if (welcomeMessage.includes('.') && hass?.states?.[welcomeMessage]) {
      const entity = hass.states[welcomeMessage];
      return entity.state || this._getDefaultWelcomeMessage();
    }
    
    return welcomeMessage || this._getDefaultWelcomeMessage();
  }

  _getDefaultWelcomeMessage() {
    const quotes = {
      'warm': [
        '愿今天的你被温柔以待，每一刻都充满阳光和希望。',
        '简单的生活，温暖的时光，就是最美的风景。',
        '心怀善意，眼中有光，今天也是美好的一天。'
      ],
      'inspire': [
        '每一天都是新的开始，勇敢追逐你的梦想！',
        '成功的路上并不拥挤，因为坚持的人不多。',
        '保持热爱，奔赴山海，忠于自己，热爱生活。'
      ],
      'poetic': [
        '生活不是等待风暴过去，而是学会在雨中翩翩起舞。',
        '心怀浪漫宇宙，也珍惜人间日常。',
        '愿你眼中有光，心中有爱，一路春暖花开。'
      ],
      'philosophy': [
        '人生的意义不在于拥有什么，而在于成为什么。',
        '简单是复杂的最终形式，智慧是经验的结晶。',
        '真正的富有，是内心的丰盈和灵魂的充实。'
      ],
      'success': [
        '行动是成功的阶梯，行动越多，登得越高！',
        '今天的努力，是明天的实力，是未来的底气！',
        '不要等待机会，而要创造机会，把握每一个当下！'
      ],
      'comfort': [
        '累了就休息一下，但不要放弃，美好的事物值得等待。',
        '你并不孤单，世界上总有人在关心着你。',
        '给自己一个微笑，今天也会是美好的一天。'
      ]
    };
    
    const style = this._getStyleClass(this.config?.card_style || '温馨问候');
    const styleQuotes = quotes[style] || quotes['warm'];
    return styleQuotes[Math.floor(Math.random() * styleQuotes.length)];
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '温馨问候': 'warm',
      '励志名言': 'inspire', 
      '诗意人生': 'poetic',
      '哲学思考': 'philosophy',
      '成功激励': 'success',
      '心灵鸡汤': 'comfort'
    };
    return styleMap[styleName] || 'warm';
  }

  _getQuotePositionClass(position) {
    const positionMap = {
      '底部居中': 'bottom',
      '右侧悬浮': 'right',
      '左侧装饰': 'left',
      '背景水印': 'background'
    };
    return positionMap[position] || 'bottom';
  }

  _getAnimationClass(animation) {
    const animationMap = {
      '打字机效果': 'typewriter',
      '逐字显现': 'charReveal',
      '淡入浮现': 'fadeIn',
      '滑动进入': 'slideIn',
      '弹跳出现': 'bounceIn'
    };
    return animationMap[animation] || 'typewriter';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '温馨问候';
    const styleClass = this._getStyleClass(cardStyle);
    
    // 使用增强的基类样式
    const baseStyles = this.getEnhancedBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .welcome-card {
        position: relative;
        overflow: hidden;
      }

      /* ===== 温馨问候样式 ===== */
      .style-warm {
        background: linear-gradient(135deg, var(--cf-primary-color) 0%, var(--cf-accent-color) 100%);
        color: white;
        border: 1px solid rgba(255,255,255,0.2);
      }

      .warm-layout {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-xl);
        height: 100%;
        text-align: center;
      }

      .warm-greeting {
        display: flex;
        align-items: baseline;
        gap: var(--cf-spacing-sm);
        flex-wrap: wrap;
        justify-content: center;
      }

      .greeting-main {
        font-size: 2.2em;
        font-weight: 500;
        opacity: 0.9;
      }

      .user-name {
        font-size: 2.5em;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      }

      .time-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .current-time {
        font-size: 2.8em;
        font-weight: 300;
        letter-spacing: 1px;
      }

      .date-week {
        display: flex;
        gap: var(--cf-spacing-lg);
        font-size: 1.1em;
        opacity: 0.8;
      }

      .warm-quote {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
        border: 1px solid rgba(255, 255, 255, 0.3);
        max-width: 500px;
        margin-top: var(--cf-spacing-lg);
      }

      .quote-icon {
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .quote-text {
        font-size: 1.1em;
        line-height: 1.5;
        font-style: italic;
      }

      /* ===== 励志名言样式 ===== */
      .style-inspire {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        color: #ecf0f1;
        border: 1px solid #34495e;
      }

      .inspire-layout {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        padding: var(--cf-spacing-xl);
      }

      .inspire-header {
        text-align: center;
      }

      .greeting-section {
        margin-bottom: var(--cf-spacing-lg);
      }

      .greeting-main {
        font-size: 2.5em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        text-shadow: 2px 2px 8px rgba(0,0,0,0.2);
      }

      .time-display {
        font-size: 1.8em;
        opacity: 0.9;
        font-weight: 300;
      }

      .inspire-quote {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-xl);
      }

      .quote-content {
        text-align: center;
        max-width: 600px;
      }

      .quote-mark {
        font-size: 3em;
        opacity: 0.5;
        line-height: 0.5;
      }

      .quote-text {
        font-size: 1.4em;
        line-height: 1.6;
        font-weight: 500;
        margin: var(--cf-spacing-md) 0;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }

      .inspire-footer {
        text-align: center;
        opacity: 0.8;
      }

      /* ===== 诗意人生样式 ===== */
      .style-poetic {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: 'STKaiti', 'KaiTi', 'SimSun', serif;
        border: 1px solid #764ba2;
      }

      .poetic-layout {
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .poetic-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
      }

      .poetic-content {
        position: relative;
        z-index: 2;
        text-align: center;
        width: 90%;
      }

      .poetic-greeting {
        margin-bottom: var(--cf-spacing-xl);
      }

      .greeting-line {
        font-size: 2.2em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }

      .time-poetic {
        font-size: 1.8em;
        opacity: 0.9;
      }

      .poetic-quote {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: var(--cf-spacing-lg);
        margin: var(--cf-spacing-xl) 0;
        position: relative;
      }

      .quote-scroll {
        position: relative;
      }

      .quote-scroll::before,
      .quote-scroll::after {
        content: '"';
        font-size: 2em;
        color: rgba(255, 255, 255, 0.5);
        position: absolute;
      }

      .quote-scroll::before {
        top: -10px;
        left: -5px;
      }

      .quote-scroll::after {
        bottom: -10px;
        right: -5px;
      }

      .quote-text {
        font-size: 1.2em;
        line-height: 1.6;
        font-style: italic;
      }

      .poetic-footer {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-lg);
        opacity: 0.8;
        font-size: 0.9em;
      }

      /* ===== 动画效果 ===== */
      .animation-typewriter .greeting-main,
      .animation-typewriter .user-name {
        overflow: hidden;
        border-right: 2px solid;
        white-space: nowrap;
        animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
      }

      .animation-charReveal .greeting-main,
      .animation-charReveal .user-name {
        animation: charReveal 2s ease-in-out;
      }

      .animation-fadeIn .greeting-main,
      .animation-fadeIn .user-name {
        animation: fadeInUp 1.5s ease-out;
      }

      .animation-slideIn .greeting-main,
      .animation-slideIn .user-name {
        animation: slideInFromLeft 1s ease-out;
      }

      .animation-bounceIn .greeting-main,
      .animation-bounceIn .user-name {
        animation: bounceIn 1s ease-out;
      }

      @keyframes typing {
        from { width: 0 }
        to { width: 100% }
      }

      @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: currentColor; }
      }

      @keyframes charReveal {
        0% { 
          opacity: 0;
          transform: translateY(20px);
        }
        100% { 
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInFromLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* 响应式优化 */
      @container cardforge-container (max-width: 400px) {
        .greeting-main {
          font-size: 1.8em;
        }
        
        .user-name {
          font-size: 2em;
        }
        
        .current-time {
          font-size: 2.2em;
        }
        
        .warm-greeting,
        .date-week {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        
        .quote-text {
          font-size: 1em;
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;