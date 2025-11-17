// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '个性化欢迎卡片，显示用户信息和每日一言',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    config_schema: {
      welcome_style: {
        type: 'select',
        label: '欢迎风格',
        options: ['温馨风格', '简约风格', '商务风格', '创意风格', '动态风格'],
        default: '温馨风格'
      },
      
      show_avatar: {
        type: 'boolean',
        label: '显示用户头像',
        default: true
      },
      
      show_quote: {
        type: 'boolean',
        label: '显示每日一言',
        default: true
      },
      
      show_time: {
        type: 'boolean',
        label: '显示当前时间',
        default: true
      },
      
      custom_greeting: {
        type: 'string',
        label: '自定义问候语',
        default: '',
        placeholder: '例如：早上好，{name}！'
      },
      
      quote_entity: {
        type: 'string',
        label: '每日一言实体',
        default: '',
        placeholder: '例如：sensor.daily_quote'
      },
      
      enable_animations: {
        type: 'boolean',
        label: '启用动画效果',
        default: true
      }
    },
    
    entity_requirements: [
      {
        key: 'user_entity',
        description: '用户实体',
        required: true
      }
    ]
  };

  // 获取欢迎数据
  _getWelcomeData(config, hass, entities) {
    const now = new Date();
    const hour = now.getHours();
    
    // 根据时间生成问候语
    let timeGreeting = '';
    if (hour >= 5 && hour < 12) {
      timeGreeting = '早上好';
    } else if (hour >= 12 && hour < 14) {
      timeGreeting = '中午好';
    } else if (hour >= 14 && hour < 18) {
      timeGreeting = '下午好';
    } else {
      timeGreeting = '晚上好';
    }
    
    // 获取用户信息
    const userEntity = entities.user_entity;
    const userName = this._getEntityValue(entities, 'user_entity_name') || 
                    this._getCardValue(hass, entities, 'user_entity', '用户');
    
    // 获取每日一言
    let dailyQuote = '';
    if (config.quote_entity) {
      dailyQuote = this._getCardValue(hass, entities, 'quote_entity', '');
    } else if (config.show_quote) {
      // 默认每日一言库
      dailyQuote = this._getDefaultQuote();
    }
    
    // 处理自定义问候语
    let greeting = config.custom_greeting || '{greeting}，{name}！';
    greeting = greeting.replace('{greeting}', timeGreeting).replace('{name}', userName);
    
    return {
      // 用户信息
      user_name: userName,
      greeting: greeting,
      time_greeting: timeGreeting,
      
      // 时间信息
      current_time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      current_date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      
      // 每日一言
      daily_quote: dailyQuote,
      quote_author: this._extractQuoteAuthor(dailyQuote),
      
      // 样式数据
      is_morning: hour >= 5 && hour < 12,
      is_afternoon: hour >= 12 && hour < 18,
      is_evening: hour >= 18 || hour < 5
    };
  }

  // 获取默认每日一言
  _getDefaultQuote() {
    const quotes = [
      "每一天都是新的开始，用心去感受生活的美好。",
      "保持热爱，奔赴山海。",
      "简单的生活，就是最美好的生活。",
      "今天的努力，是明天的幸运。",
      "心怀希望，所遇皆温柔。",
      "生活不是等待风暴过去，而是学会在雨中跳舞。",
      "每一个不起舞的日子，都是对生命的辜负。",
      "保持微笑，好运自然来。",
      "今天也要加油哦！",
      "心怀感恩，所遇皆温柔。"
    ];
    
    const today = new Date();
    const seed = today.getDate() + today.getMonth();
    return quotes[seed % quotes.length];
  }

  // 从名言中提取作者
  _extractQuoteAuthor(quote) {
    if (!quote) return '';
    
    const authorMatch = quote.match(/[——|-]\s*([^——|-]+)$/);
    if (authorMatch) {
      return authorMatch[1].trim();
    }
    
    return '';
  }

  getTemplate(config, hass, entities) {
    const welcomeData = this._getWelcomeData(config, hass, entities);
    const styleClass = this._getStyleClass(config.welcome_style);
    const showAnimations = config.enable_animations !== false;

    return `
      <div class="cardforge-responsive-container welcome-card style-${styleClass} ${showAnimations ? 'with-animations' : ''}">
        <div class="cardforge-content-grid">
          ${this._renderWelcomeContent(welcomeData, config)}
        </div>
      </div>
    `;
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '温馨风格': 'warm',
      '简约风格': 'minimal',
      '商务风格': 'business',
      '创意风格': 'creative',
      '动态风格': 'dynamic'
    };
    return styleMap[styleName] || 'warm';
  }

  _renderWelcomeContent(welcomeData, config) {
    const style = config.welcome_style || '温馨风格';
    
    switch (style) {
      case '简约风格':
        return this._renderMinimalWelcome(welcomeData, config);
      case '商务风格':
        return this._renderBusinessWelcome(welcomeData, config);
      case '创意风格':
        return this._renderCreativeWelcome(welcomeData, config);
      case '动态风格':
        return this._renderDynamicWelcome(welcomeData, config);
      default:
        return this._renderWarmWelcome(welcomeData, config);
    }
  }

  _renderWarmWelcome(welcomeData, config) {
    return `
      <div class="warm-welcome">
        ${config.show_avatar ? `
          <div class="avatar-container">
            <div class="user-avatar">${welcomeData.user_name.charAt(0)}</div>
          </div>
        ` : ''}
        
        <div class="welcome-content">
          <div class="greeting-main">
            <h1 class="greeting-text">${welcomeData.greeting}</h1>
            ${config.show_time ? `
              <div class="time-info">
                <span class="current-time">${welcomeData.current_time}</span>
                <span class="current-date">${welcomeData.current_date} ${welcomeData.weekday}</span>
              </div>
            ` : ''}
          </div>
          
          ${config.show_quote && welcomeData.daily_quote ? `
            <div class="quote-section">
              <div class="quote-text">"${welcomeData.daily_quote.replace(/[——|-].*$/, '')}"</div>
              ${welcomeData.quote_author ? `
                <div class="quote-author">—— ${welcomeData.quote_author}</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderMinimalWelcome(welcomeData, config) {
    return `
      <div class="minimal-welcome">
        <div class="minimal-greeting">
          <div class="minimal-text">${welcomeData.greeting}</div>
          ${config.show_time ? `
            <div class="minimal-time">${welcomeData.current_time}</div>
          ` : ''}
        </div>
        
        ${config.show_quote && welcomeData.daily_quote ? `
          <div class="minimal-quote">
            ${welcomeData.daily_quote}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderBusinessWelcome(welcomeData, config) {
    return `
      <div class="business-welcome">
        <div class="business-header">
          ${config.show_avatar ? `
            <div class="business-avatar">${welcomeData.user_name.charAt(0)}</div>
          ` : ''}
          <div class="business-info">
            <div class="business-greeting">${welcomeData.greeting}</div>
            ${config.show_time ? `
              <div class="business-time">${welcomeData.current_date} ${welcomeData.current_time}</div>
            ` : ''}
          </div>
        </div>
        
        ${config.show_quote && welcomeData.daily_quote ? `
          <div class="business-quote">
            <div class="quote-icon">💼</div>
            <div class="quote-content">
              <div class="quote-text">${welcomeData.daily_quote}</div>
              ${welcomeData.quote_author ? `
                <div class="quote-source">${welcomeData.quote_author}</div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderCreativeWelcome(welcomeData, config) {
    return `
      <div class="creative-welcome">
        <div class="creative-main">
          <div class="creative-greeting">
            <span class="greeting-emoji">${welcomeData.is_morning ? '🌅' : welcomeData.is_afternoon ? '☀️' : '🌙'}</span>
            <span class="greeting-text">${welcomeData.greeting}</span>
          </div>
          
          ${config.show_time ? `
            <div class="creative-time">
              <div class="time-display">${welcomeData.current_time}</div>
              <div class="date-display">${welcomeData.current_date}</div>
            </div>
          ` : ''}
        </div>
        
        ${config.show_quote && welcomeData.daily_quote ? `
          <div class="creative-quote">
            <div class="quote-decoration">❝</div>
            <div class="quote-content">${welcomeData.daily_quote}</div>
            <div class="quote-decoration">❞</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderDynamicWelcome(welcomeData, config) {
    return `
      <div class="dynamic-welcome">
        <div class="dynamic-background"></div>
        
        <div class="dynamic-content">
          ${config.show_avatar ? `
            <div class="dynamic-avatar">
              <div class="avatar-circle">${welcomeData.user_name.charAt(0)}</div>
            </div>
          ` : ''}
          
          <div class="dynamic-text">
            <h1 class="dynamic-greeting">${welcomeData.greeting}</h1>
            
            ${config.show_time ? `
              <div class="dynamic-time">
                <span class="time-now">${welcomeData.current_time}</span>
                <span class="date-now">${welcomeData.weekday}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        ${config.show_quote && welcomeData.daily_quote ? `
          <div class="dynamic-quote">
            <div class="floating-quote">${welcomeData.daily_quote}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  getStyles(config) {
    const styleClass = this._getStyleClass(config.welcome_style);
    const showAnimations = config.enable_animations !== false;

    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card {
        padding: var(--cf-spacing-xl);
        min-height: 200px;
        display: flex;
        align-items: center;
      }

      /* ===== 温馨风格 ===== */
      .warm-welcome {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
      }

      .warm-welcome .avatar-container {
        flex-shrink: 0;
      }

      .warm-welcome .user-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2em;
        font-weight: 600;
        box-shadow: var(--cf-shadow-lg);
      }

      .warm-welcome .welcome-content {
        flex: 1;
      }

      .warm-welcome .greeting-text {
        font-size: 2.5em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-md) 0;
        line-height: 1.2;
      }

      .warm-welcome .time-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        margin-bottom: var(--cf-spacing-xl);
      }

      .warm-welcome .current-time {
        font-size: 1.8em;
        font-weight: 500;
        color: var(--cf-primary-color);
      }

      .warm-welcome .current-date {
        font-size: 1.2em;
        color: var(--cf-text-secondary);
      }

      .warm-welcome .quote-section {
        border-left: 4px solid var(--cf-accent-color);
        padding-left: var(--cf-spacing-lg);
        background: rgba(var(--cf-rgb-primary), 0.05);
        padding: var(--cf-spacing-lg);
        border-radius: 0 var(--cf-radius-lg) var(--cf-radius-lg) 0;
      }

      .warm-welcome .quote-text {
        font-size: 1.2em;
        color: var(--cf-text-primary);
        font-style: italic;
        line-height: 1.5;
        margin-bottom: var(--cf-spacing-sm);
      }

      .warm-welcome .quote-author {
        font-size: 1em;
        color: var(--cf-text-secondary);
        text-align: right;
      }

      /* ===== 简约风格 ===== */
      .minimal-welcome {
        width: 100%;
        text-align: center;
      }

      .minimal-welcome .minimal-greeting {
        margin-bottom: var(--cf-spacing-xl);
      }

      .minimal-welcome .minimal-text {
        font-size: 2.2em;
        font-weight: 300;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
      }

      .minimal-welcome .minimal-time {
        font-size: 1.5em;
        color: var(--cf-text-secondary);
        font-variant-numeric: tabular-nums;
      }

      .minimal-welcome .minimal-quote {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        font-style: italic;
        line-height: 1.6;
        max-width: 600px;
        margin: 0 auto;
      }

      /* ===== 商务风格 ===== */
      .business-welcome {
        width: 100%;
      }

      .business-welcome .business-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        margin-bottom: var(--cf-spacing-xl);
        padding-bottom: var(--cf-spacing-lg);
        border-bottom: 2px solid var(--cf-border);
      }

      .business-welcome .business-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--cf-primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5em;
        font-weight: 600;
      }

      .business-welcome .business-greeting {
        font-size: 2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .business-welcome .business-time {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        font-variant-numeric: tabular-nums;
      }

      .business-welcome .business-quote {
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
        background: var(--cf-surface);
        padding: var(--cf-spacing-lg);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
      }

      .business-welcome .quote-icon {
        font-size: 2em;
        flex-shrink: 0;
      }

      .business-welcome .quote-content {
        flex: 1;
      }

      .business-welcome .quote-text {
        font-size: 1.1em;
        color: var(--cf-text-primary);
        line-height: 1.5;
        margin-bottom: var(--cf-spacing-sm);
      }

      .business-welcome .quote-source {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        text-align: right;
      }

      /* ===== 创意风格 ===== */
      .creative-welcome {
        width: 100%;
        text-align: center;
      }

      .creative-welcome .creative-main {
        margin-bottom: var(--cf-spacing-xl);
      }

      .creative-welcome .creative-greeting {
        font-size: 2.5em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
      }

      .creative-welcome .greeting-emoji {
        font-size: 1.2em;
      }

      .creative-welcome .creative-time {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-xl);
      }

      .creative-welcome .time-display {
        font-size: 2em;
        font-weight: 500;
        color: var(--cf-primary-color);
        font-variant-numeric: tabular-nums;
      }

      .creative-welcome .date-display {
        font-size: 1.3em;
        color: var(--cf-text-secondary);
      }

      .creative-welcome .creative-quote {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        max-width: 800px;
        margin: 0 auto;
      }

      .creative-welcome .quote-decoration {
        font-size: 3em;
        color: var(--cf-accent-color);
        line-height: 1;
      }

      .creative-welcome .quote-content {
        font-size: 1.2em;
        color: var(--cf-text-primary);
        font-style: italic;
        line-height: 1.6;
        flex: 1;
      }

      /* ===== 动态风格 ===== */
      .dynamic-welcome {
        width: 100%;
        position: relative;
        overflow: hidden;
        border-radius: var(--cf-radius-xl);
      }

      .dynamic-welcome .dynamic-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, 
          rgba(var(--cf-rgb-primary), 0.1) 0%, 
          rgba(var(--cf-rgb-accent), 0.1) 100%);
        animation: ${showAnimations ? 'gradientShift 8s ease infinite' : 'none'};
        background-size: 200% 200%;
      }

      .dynamic-welcome .dynamic-content {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
        margin-bottom: var(--cf-spacing-lg);
      }

      .dynamic-welcome .dynamic-avatar {
        flex-shrink: 0;
      }

      .dynamic-welcome .avatar-circle {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.8em;
        font-weight: 600;
        box-shadow: var(--cf-shadow-lg);
        animation: ${showAnimations ? 'float 3s ease-in-out infinite' : 'none'};
      }

      .dynamic-welcome .dynamic-greeting {
        font-size: 2.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-sm) 0;
        animation: ${showAnimations ? 'slideIn 0.8s ease-out' : 'none'};
      }

      .dynamic-welcome .dynamic-time {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
      }

      .dynamic-welcome .time-now {
        font-size: 1.5em;
        font-weight: 500;
        color: var(--cf-primary-color);
        font-variant-numeric: tabular-nums;
      }

      .dynamic-welcome .date-now {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
      }

      .dynamic-welcome .dynamic-quote {
        position: relative;
        z-index: 2;
      }

      .dynamic-welcome .floating-quote {
        font-size: 1.1em;
        color: var(--cf-text-primary);
        font-style: italic;
        text-align: center;
        padding: var(--cf-spacing-lg);
        background: rgba(var(--cf-rgb-background), 0.8);
        border-radius: var(--cf-radius-lg);
        backdrop-filter: blur(10px);
        animation: ${showAnimations ? 'fadeInUp 1s ease-out 0.3s both' : 'none'};
      }

      /* ===== 动画定义 ===== */
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      @keyframes slideIn {
        from { 
          opacity: 0; 
          transform: translateX(-30px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }

      @keyframes fadeInUp {
        from { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }

      /* ===== 响应式优化 ===== */
      @media (max-width: 768px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
        }

        .warm-welcome {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-lg);
        }

        .warm-welcome .time-info {
          justify-content: center;
        }

        .warm-welcome .greeting-text {
          font-size: 2em;
        }

        .creative-welcome .creative-greeting {
          font-size: 2em;
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }

        .creative-welcome .creative-time {
          flex-direction: column;
          gap: var(--cf-spacing-md);
        }

        .dynamic-welcome .dynamic-content {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-lg);
        }

        .business-welcome .business-header {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-md);
        }

        .business-welcome .business-greeting {
          font-size: 1.8em;
        }
      }

      @media (max-width: 480px) {
        .warm-welcome .greeting-text {
          font-size: 1.8em;
        }

        .creative-welcome .creative-greeting {
          font-size: 1.8em;
        }

        .creative-welcome .quote-content {
          font-size: 1.1em;
        }

        .minimal-welcome .minimal-text {
          font-size: 1.8em;
        }
      }

      /* ===== 深色模式优化 ===== */
      @media (prefers-color-scheme: dark) {
        .business-welcome .business-quote {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .dynamic-welcome .floating-quote {
          background: rgba(var(--cf-rgb-dark-background), 0.8);
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;