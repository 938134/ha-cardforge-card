// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '智能欢迎',
    version: '2.0.0',
    description: '个性化欢迎信息，支持每日一言',
    category: 'information',
    icon: '👋',
    author: 'CardForge',
    
    config_schema: {
      // 布局配置
      layout_style: {
        type: 'select',
        label: '布局风格',
        options: ['modern', 'minimal', 'classic', 'creative'],
        default: 'modern',
        description: '选择欢迎卡片的布局风格'
      },
      
      show_user: {
        type: 'boolean',
        label: '显示用户',
        default: true,
        description: '显示用户信息'
      },
      
      show_quote: {
        type: 'boolean',
        label: '显示每日一言',
        default: true,
        description: '显示每日励志名言'
      },
      
      // 个性化配置
      custom_greeting: {
        type: 'select',
        label: '问候语风格',
        options: ['friendly', 'formal', 'casual', 'inspirational'],
        default: 'friendly',
        description: '选择问候语风格'
      },
      
      show_time_info: {
        type: 'boolean',
        label: '显示时间信息',
        default: true,
        description: '显示当前时间和日期'
      },
      
      // 动画效果
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true,
        description: '启用欢迎动画效果'
      }
    },
    
    entity_requirements: [
      {
        key: 'daily_quote',
        description: '每日一言实体',
        required: false,
        suggested: 'sensor.daily_quote'
      }
    ]
  };

  // 名言库
  _getQuotes() {
    return [
      { text: "知识就是力量", author: "弗朗西斯·培根" },
      { text: "读万卷书，行万里路", author: "刘彝" },
      { text: "三人行，必有我师焉", author: "孔子" },
      { text: "学而不思则罔，思而不学则殆", author: "孔子" },
      { text: "知之者不如好之者，好之者不如乐之者", author: "孔子" },
      { text: "天行健，君子以自强不息", author: "《周易》" },
      { text: "千里之行，始于足下", author: "老子" },
      { text: "精诚所至，金石为开", author: "王充" },
      { text: "有志者事竟成", author: "《后汉书》" },
      { text: "不积跬步，无以至千里", author: "荀子" },
      { text: "生活就像一盒巧克力，你永远不知道下一颗是什么味道", author: "《阿甘正传》" },
      { text: "人生没有彩排，每一天都是现场直播", author: "佚名" },
      { text: "活在当下，珍惜眼前", author: "佚名" },
      { text: "简单就是美", author: "佚名" },
      { text: "快乐不是因为拥有的多，而是计较的少", author: "佚名" },
      { text: "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成", author: "佚名" },
      { text: "失败是成功之母", author: "俗语" },
      { text: "机会总是留给有准备的人", author: "路易斯·巴斯德" },
      { text: "坚持就是胜利", author: "俗语" },
      { text: "细节决定成败", author: "汪中求" }
    ];
  }

  // 获取随机名言
  _getRandomQuote() {
    const quotes = this._getQuotes();
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % quotes.length;
    
    return quotes[index];
  }

  // 获取个性化问候语
  _getGreeting(systemData, style = 'friendly') {
    const hour = new Date().getHours();
    const greetings = {
      friendly: {
        morning: `早上好，${systemData.user}！🌞`,
        afternoon: `下午好，${systemData.user}！☀️`,
        evening: `晚上好，${systemData.user}！🌙`,
        night: `夜深了，${systemData.user}，注意休息哦 🌟`
      },
      formal: {
        morning: `早安，${systemData.user}`,
        afternoon: `午安，${systemData.user}`,
        evening: `晚上好，${systemData.user}`,
        night: `晚安，${systemData.user}`
      },
      casual: {
        morning: `嘿 ${systemData.user}！新的一天开始啦 🎉`,
        afternoon: `嗨 ${systemData.user}！今天过得怎么样？ 😊`,
        evening: `晚上好 ${systemData.user}！放松一下吧 🛋️`,
        night: `还没睡呢 ${systemData.user}？早点休息 💤`
      },
      inspirational: {
        morning: `新的一天，新的开始！加油，${systemData.user}！🚀`,
        afternoon: `把握当下，${systemData.user}！今天也要全力以赴！💪`,
        evening: `今天辛苦了，${systemData.user}！明天会更好！✨`,
        night: `感谢今天的努力，${systemData.user}！好好休息 🌙`
      }
    };

    const styleGreetings = greetings[style] || greetings.friendly;
    
    if (hour < 6) return styleGreetings.night;
    if (hour < 12) return styleGreetings.morning;
    if (hour < 18) return styleGreetings.afternoon;
    if (hour < 22) return styleGreetings.evening;
    return styleGreetings.night;
  }

  // 渲染现代布局
  _renderModernLayout(systemData, config, entities) {
    const greeting = this._getGreeting(systemData, config.custom_greeting);
    const quote = this._getRandomQuote();
    const showQuote = config.show_quote !== false;
    const showTime = config.show_time_info !== false;
    const showUser = config.show_user !== false;
    const enableAnimations = config.enable_animations !== false;

    // 获取实体数据
    const dailyQuote = this._getCardValue(this.hass, entities, 'daily_quote', quote.text);

    return `
      <div class="welcome-modern ${enableAnimations ? 'with-animations' : ''}">
        <!-- 顶部信息栏 -->
        ${showTime ? `
          <div class="time-section">
            <div class="current-time">${systemData.time}</div>
            <div class="current-date">${systemData.date}</div>
          </div>
        ` : ''}
        
        <!-- 主要内容 -->
        <div class="main-content">
          ${showUser ? `
            <div class="user-section">
              <div class="user-avatar">${systemData.user.charAt(0)}</div>
              <div class="user-info">
                <div class="user-name">${systemData.user}</div>
                <div class="user-greeting">${systemData.greeting}</div>
              </div>
            </div>
          ` : ''}
          
          <div class="greeting-section">
            <h1 class="greeting-text">${greeting}</h1>
          </div>
        </div>
        
        <!-- 每日一言 -->
        ${showQuote ? `
          <div class="quote-section">
            <div class="quote-content">
              <div class="quote-text">"${dailyQuote}"</div>
              <div class="quote-author">— ${quote.author}</div>
            </div>
          </div>
        ` : ''}
        
        <!-- 装饰元素 -->
        <div class="decoration-elements">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
      </div>
    `;
  }

  // 渲染简约布局
  _renderMinimalLayout(systemData, config, entities) {
    const greeting = this._getGreeting(systemData, config.custom_greeting);
    const quote = this._getRandomQuote();
    const showQuote = config.show_quote !== false;
    const showUser = config.show_user !== false;
    const dailyQuote = this._getCardValue(this.hass, entities, 'daily_quote', quote.text);

    return `
      <div class="welcome-minimal">
        <div class="minimal-content">
          ${showUser ? `
            <div class="minimal-user">
              <span class="user-badge">${systemData.user}</span>
            </div>
          ` : ''}
          <div class="minimal-greeting">${greeting}</div>
          ${showQuote ? `
            <div class="minimal-quote">
              <div class="minimal-quote-text">${dailyQuote}</div>
            </div>
          ` : ''}
          <div class="minimal-time">${systemData.time}</div>
        </div>
      </div>
    `;
  }

  // 渲染经典布局
  _renderClassicLayout(systemData, config, entities) {
    const greeting = this._getGreeting(systemData, config.custom_greeting);
    const quote = this._getRandomQuote();
    const showQuote = config.show_quote !== false;
    const showUser = config.show_user !== false;
    const dailyQuote = this._getCardValue(this.hass, entities, 'daily_quote', quote.text);

    return `
      <div class="welcome-classic">
        <div class="classic-header">
          <h1>欢迎回家</h1>
          <div class="classic-time">${systemData.time} • ${systemData.date}</div>
        </div>
        
        <div class="classic-content">
          ${showUser ? `
            <div class="classic-user">
              <div class="classic-user-avatar">${systemData.user.charAt(0)}</div>
              <div class="classic-user-name">${systemData.user}</div>
            </div>
          ` : ''}
          
          <div class="classic-greeting">${greeting}</div>
          
          ${showQuote ? `
            <div class="classic-quote">
              <div class="classic-quote-icon">💭</div>
              <div class="classic-quote-content">
                <div class="classic-quote-text">${dailyQuote}</div>
                <div class="classic-quote-author">— ${quote.author}</div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 渲染创意布局
  _renderCreativeLayout(systemData, config, entities) {
    const greeting = this._getGreeting(systemData, config.custom_greeting);
    const quote = this._getRandomQuote();
    const showQuote = config.show_quote !== false;
    const showUser = config.show_user !== false;
    const dailyQuote = this._getCardValue(this.hass, entities, 'daily_quote', quote.text);
    const enableAnimations = config.enable_animations !== false;

    return `
      <div class="welcome-creative ${enableAnimations ? 'with-animations' : ''}">
        <div class="creative-background">
          <div class="floating-element element-1">✨</div>
          <div class="floating-element element-2">🌟</div>
          <div class="floating-element element-3">💫</div>
        </div>
        
        <div class="creative-content">
          ${showUser ? `
            <div class="creative-user">
              <div class="creative-avatar">${systemData.user.charAt(0)}</div>
              <div class="creative-user-info">
                <div class="creative-username">${systemData.user}</div>
                <div class="creative-user-greeting">${systemData.greeting}</div>
              </div>
            </div>
          ` : ''}
          
          <div class="creative-greeting">
            <span class="greeting-words">${greeting}</span>
          </div>
          
          <div class="creative-info">
            <div class="creative-time">
              <span class="time-main">${systemData.time}</span>
              <span class="time-date">${systemData.date}</span>
            </div>
          </div>
          
          ${showQuote ? `
            <div class="creative-quote">
              <div class="quote-bubble">
                <div class="bubble-text">${dailyQuote}</div>
                <div class="bubble-author">— ${quote.author}</div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getTemplate(config, hass, entities) {
    this.hass = hass; // 保存 hass 引用用于获取实体数据
    const systemData = this.getSystemData(hass, config);
    const layoutStyle = config.layout_style || 'modern';

    let layoutHTML = '';
    
    switch (layoutStyle) {
      case 'minimal':
        layoutHTML = this._renderMinimalLayout(systemData, config, entities);
        break;
      case 'classic':
        layoutHTML = this._renderClassicLayout(systemData, config, entities);
        break;
      case 'creative':
        layoutHTML = this._renderCreativeLayout(systemData, config, entities);
        break;
      default:
        layoutHTML = this._renderModernLayout(systemData, config, entities);
    }

    return `
      <div class="cardforge-responsive-container welcome-card layout-${layoutStyle}">
        <div class="cardforge-content-grid">
          ${layoutHTML}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const layoutStyle = config.layout_style || 'modern';
    const enableAnimations = config.enable_animations !== false;

    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card {
        padding: var(--cf-spacing-lg);
        position: relative;
        overflow: hidden;
        min-height: 200px;
      }
      
      /* ===== 现代布局样式 ===== */
      .welcome-modern {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--cf-spacing-lg);
        position: relative;
        z-index: 2;
      }
      
      .time-section {
        text-align: right;
        opacity: 0.8;
      }
      
      .current-time {
        font-size: 1.8em;
        font-weight: 300;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
      }
      
      .current-date {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }
      
      .main-content {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        flex: 1;
      }
      
      .user-section {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        flex-shrink: 0;
      }
      
      .user-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5em;
        font-weight: 600;
        color: white;
        box-shadow: var(--cf-shadow-md);
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .user-name {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .user-greeting {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .greeting-section {
        flex: 1;
      }
      
      .greeting-text {
        font-size: 2.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0;
        line-height: 1.2;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .quote-section {
        background: rgba(var(--cf-rgb-primary), 0.08);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
        border-left: 4px solid var(--cf-primary-color);
      }
      
      .quote-text {
        font-size: 1.1em;
        font-style: italic;
        color: var(--cf-text-primary);
        line-height: 1.5;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .quote-author {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        text-align: right;
        font-weight: 500;
      }
      
      .decoration-elements {
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
        background: rgba(var(--cf-rgb-primary), 0.1);
      }
      
      .circle-1 {
        width: 120px;
        height: 120px;
        top: -40px;
        right: -40px;
      }
      
      .circle-2 {
        width: 80px;
        height: 80px;
        bottom: 20px;
        left: 10%;
      }
      
      .circle-3 {
        width: 60px;
        height: 60px;
        bottom: 60px;
        right: 30%;
      }
      
      /* ===== 简约布局样式 ===== */
      .welcome-minimal {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
      }
      
      .minimal-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }
      
      .minimal-user {
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .user-badge {
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: var(--cf-spacing-xs) var(--cf-spacing-md);
        border-radius: var(--cf-radius-md);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
      }
      
      .minimal-greeting {
        font-size: 2.5em;
        font-weight: 300;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }
      
      .minimal-quote {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        font-style: italic;
        max-width: 400px;
        line-height: 1.4;
      }
      
      .minimal-time {
        font-size: 1.8em;
        font-weight: 200;
        color: var(--cf-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      
      /* ===== 经典布局样式 ===== */
      .welcome-classic {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--cf-spacing-xl);
      }
      
      .classic-header {
        text-align: center;
        border-bottom: 2px solid var(--cf-border);
        padding-bottom: var(--cf-spacing-lg);
      }
      
      .classic-header h1 {
        font-size: 2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-sm) 0;
      }
      
      .classic-time {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      
      .classic-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--cf-spacing-xl);
      }
      
      .classic-user {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .classic-user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        font-weight: 600;
        color: white;
      }
      
      .classic-user-name {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .classic-greeting {
        font-size: 2em;
        font-weight: 500;
        color: var(--cf-text-primary);
        text-align: center;
        line-height: 1.3;
      }
      
      .classic-quote {
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
        max-width: 500px;
        margin: 0 auto;
      }
      
      .classic-quote-icon {
        font-size: 2em;
        flex-shrink: 0;
        margin-top: var(--cf-spacing-xs);
      }
      
      .classic-quote-content {
        flex: 1;
      }
      
      .classic-quote-text {
        font-size: 1.1em;
        font-style: italic;
        color: var(--cf-text-primary);
        line-height: 1.5;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .classic-quote-author {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        text-align: right;
        font-weight: 500;
      }
      
      /* ===== 创意布局样式 ===== */
      .welcome-creative {
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .creative-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: hidden;
      }
      
      .floating-element {
        position: absolute;
        font-size: 1.5em;
        opacity: 0.3;
      }
      
      .element-1 { top: 20%; left: 10%; animation: float 6s ease-in-out infinite; }
      .element-2 { top: 60%; right: 15%; animation: float 8s ease-in-out infinite 2s; }
      .element-3 { bottom: 30%; left: 20%; animation: float 7s ease-in-out infinite 1s; }
      
      .creative-content {
        text-align: center;
        position: relative;
        z-index: 2;
        width: 100%;
      }
      
      .creative-user {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .creative-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        font-weight: 600;
        color: white;
        box-shadow: var(--cf-shadow-md);
      }
      
      .creative-user-info {
        text-align: left;
      }
      
      .creative-username {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .creative-user-greeting {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .creative-greeting {
        margin-bottom: var(--cf-spacing-xl);
      }
      
      .greeting-words {
        font-size: 2.8em;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        background-size: 300% 300%;
        animation: gradientShift 8s ease infinite;
      }
      
      .creative-info {
        margin-bottom: var(--cf-spacing-xl);
      }
      
      .creative-time {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .time-main {
        font-size: 2em;
        font-weight: 300;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
      }
      
      .time-date {
        font-size: 1em;
        color: var(--cf-text-secondary);
      }
      
      .creative-quote {
        max-width: 400px;
        margin: 0 auto;
      }
      
      .quote-bubble {
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
        backdrop-filter: blur(10px);
      }
      
      .bubble-text {
        font-size: 1.1em;
        font-style: italic;
        color: var(--cf-text-primary);
        line-height: 1.5;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .bubble-author {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        font-weight: 500;
      }
      
      /* ===== 动画定义 ===== */
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .with-animations .greeting-text {
        animation: gentle-pulse 3s ease-in-out infinite;
      }
      
      .with-animations .quote-section {
        animation: slideInUp 0.6s ease-out;
      }
      
      @keyframes gentle-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      
      @keyframes slideInUp {
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
      @media (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-md);
          min-height: 180px;
        }
        
        .greeting-text {
          font-size: 1.8em;
        }
        
        .main-content {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-md);
        }
        
        .user-avatar {
          width: 50px;
          height: 50px;
          font-size: 1.2em;
        }
        
        .minimal-greeting {
          font-size: 2em;
        }
        
        .classic-greeting {
          font-size: 1.6em;
        }
        
        .greeting-words {
          font-size: 2.2em;
        }
        
        .creative-time .time-main {
          font-size: 1.6em;
        }
      }
      
      @media (max-width: 400px) {
        .greeting-text {
          font-size: 1.5em;
        }
        
        .minimal-greeting {
          font-size: 1.6em;
        }
        
        .classic-greeting {
          font-size: 1.3em;
        }
        
        .greeting-words {
          font-size: 1.8em;
        }
        
        .current-time {
          font-size: 1.5em;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .quote-section,
        .quote-bubble {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .decoration-circle {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .user-badge {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;