// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '2.0.0',
    description: '个性化欢迎卡片，显示用户信息和每日一言',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    capabilities: {
      supportsTitle: false,
      supportsContent: true,
      supportsFooter: false
    },
    
    config_schema: {
      welcome_style: {
        type: 'select',
        label: '欢迎风格',
        options: ['温馨风格', '简约风格', '商务风格', '创意风格', '动态风格', '智能风格'],
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
      enable_animations: {
        type: 'boolean',
        label: '启用动画效果',
        default: true
      }
    }
  };

  // 系统变量和工具方法
  _getSystemVariables(config, hass, entities) {
    const now = new Date();
    const hour = now.getHours();
    
    const timeGreeting = this._getTimeGreeting(hour);
    const currentUserName = hass?.user?.name || '用户';
    
    return {
      current_user_name: currentUserName,
      time_greeting: timeGreeting,
      current_time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      current_date: now.toLocaleDateString('zh-CN'),
      current_weekday: '星期' + '日一二三四五六'[now.getDay()],
      is_morning: hour >= 5 && hour < 12,
      is_afternoon: hour >= 12 && hour < 18,
      is_evening: hour >= 18 || hour < 5,
      default_greeting: `${timeGreeting}，${currentUserName}`,
      _hass: hass,
      _entities: entities
    };
  }

  _getTimeGreeting(hour) {
    if (hour >= 5 && hour < 9) return '早上好';
    if (hour >= 9 && hour < 12) return '上午好';
    if (hour >= 12 && hour < 14) return '中午好';
    if (hour >= 14 && hour < 18) return '下午好';
    return '晚上好';
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '温馨风格': 'warm',
      '简约风格': 'minimal',
      '商务风格': 'business',
      '创意风格': 'creative',
      '动态风格': 'dynamic',
      '智能风格': 'smart'
    };
    return styleMap[styleName] || 'warm';
  }

  _getCustomGreeting(entities) {
    const contentFields = Object.keys(entities || {}).filter(key => 
      !key.includes('_name') && !key.includes('_icon')
    );
    
    for (const key of contentFields) {
      const value = entities[key];
      if (value && value.trim()) {
        return this._processGreetingVariables(value);
      }
    }
    return null;
  }

  _processGreetingVariables(greeting) {
    const now = new Date();
    const hour = now.getHours();
    const timeGreeting = this._getTimeGreeting(hour);
    
    return greeting
      .replace(/{user}/g, '用户')
      .replace(/{greeting}/g, timeGreeting)
      .replace(/{time}/g, now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
      .replace(/{date}/g, now.toLocaleDateString('zh-CN'))
      .replace(/{weekday}/g, '星期' + '日一二三四五六'[now.getDay()]);
  }

  // 主模板方法
  getTemplate(config, hass, entities) {
    const systemVars = this._getSystemVariables(config, hass, entities);
    const styleClass = this._getStyleClass(config.welcome_style);
    const showAnimations = config.enable_animations !== false;
    const customGreeting = this._getCustomGreeting(entities);
    const greeting = customGreeting || systemVars.default_greeting;

    return `
      <div class="cardforge-responsive-container welcome-card style-${styleClass} ${showAnimations ? 'with-animations' : ''}">
        <div class="cardforge-content-grid">
          ${this._renderWelcomeContent(systemVars, config, greeting)}
        </div>
      </div>
    `;
  }

  _renderWelcomeContent(systemVars, config, greeting) {
    const style = config.welcome_style || '温馨风格';
    
    const renderers = {
      '温馨风格': this._renderWarmWelcome,
      '简约风格': this._renderMinimalWelcome,
      '商务风格': this._renderBusinessWelcome,
      '创意风格': this._renderCreativeWelcome,
      '动态风格': this._renderDynamicWelcome,
      '智能风格': this._renderSmartWelcome
    };
    
    const renderer = renderers[style] || this._renderWarmWelcome;
    return renderer.call(this, systemVars, config, greeting);
  }

  // 渲染方法
  _renderWarmWelcome(systemVars, config, greeting) {
    return this._renderTemplate(systemVars, config, greeting, {
      avatar: config.show_avatar,
      avatarSize: 'large',
      greetingSize: 'large',
      layout: 'horizontal'
    });
  }

  _renderMinimalWelcome(systemVars, config, greeting) {
    return this._renderTemplate(systemVars, config, greeting, {
      avatar: false,
      greetingSize: 'medium',
      layout: 'centered',
      minimal: true
    });
  }

  _renderBusinessWelcome(systemVars, config, greeting) {
    return this._renderTemplate(systemVars, config, greeting, {
      avatar: config.show_avatar,
      avatarSize: 'medium',
      greetingSize: 'medium',
      layout: 'horizontal',
      business: true
    });
  }

  _renderCreativeWelcome(systemVars, config, greeting) {
    return this._renderTemplate(systemVars, config, greeting, {
      avatar: false,
      greetingSize: 'large',
      layout: 'centered',
      creative: true
    });
  }

  _renderDynamicWelcome(systemVars, config, greeting) {
    return this._renderTemplate(systemVars, config, greeting, {
      avatar: config.show_avatar,
      avatarSize: 'medium',
      greetingSize: 'medium',
      layout: 'horizontal',
      dynamic: true
    });
  }

  _renderSmartWelcome(systemVars, config, greeting) {
    return this._renderTemplate(systemVars, config, greeting, {
      avatar: config.show_avatar,
      avatarSize: 'medium',
      greetingSize: 'medium',
      layout: 'horizontal',
      smart: true
    });
  }

  // 统一模板渲染方法
  _renderTemplate(systemVars, config, greeting, options) {
    const {
      avatar,
      avatarSize = 'medium',
      greetingSize = 'medium',
      layout = 'horizontal',
      minimal = false,
      business = false,
      creative = false,
      dynamic = false,
      smart = false
    } = options;

    const avatarClass = `avatar-${avatarSize}`;
    const greetingClass = `greeting-${greetingSize}`;
    const layoutClass = `layout-${layout}`;
    
    const styleClasses = [];
    if (minimal) styleClasses.push('minimal');
    if (business) styleClasses.push('business');
    if (creative) styleClasses.push('creative');
    if (dynamic) styleClasses.push('dynamic');
    if (smart) styleClasses.push('smart');

    return `
      <div class="welcome-template ${layoutClass} ${styleClasses.join(' ')}">
        ${avatar ? this._renderAvatar(systemVars.current_user_name, avatarClass) : ''}
        
        <div class="welcome-content">
          ${this._renderGreeting(greeting, greetingClass)}
          ${config.show_time ? this._renderTime(systemVars, layout) : ''}
        </div>
        
        ${config.show_quote ? this._renderQuote(systemVars) : ''}
      </div>
    `;
  }

  _renderAvatar(userName, sizeClass) {
    return `
      <div class="avatar-container ${sizeClass}">
        <div class="user-avatar">${userName.charAt(0)}</div>
      </div>
    `;
  }

  _renderGreeting(greeting, sizeClass) {
    return `<h1 class="greeting-text ${sizeClass}">${greeting}</h1>`;
  }

  _renderTime(systemVars, layout) {
    if (layout === 'centered') {
      return `
        <div class="time-info centered">
          <span class="current-time">${systemVars.current_time}</span>
        </div>
      `;
    }
    
    return `
      <div class="time-info">
        <span class="current-time">${systemVars.current_time}</span>
        <span class="current-date">${systemVars.current_date} ${systemVars.current_weekday}</span>
      </div>
    `;
  }

  _renderQuote(systemVars) {
    const quote = this._getDailyQuote(systemVars);
    const author = this._getQuoteAuthor(systemVars);
    
    return `
      <div class="quote-section">
        <div class="quote-text">"${quote}"</div>
        ${author ? `<div class="quote-author">—— ${author}</div>` : ''}
      </div>
    `;
  }

  // 每日一言相关
  _getDailyQuote(systemVars) {
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

  _getQuoteAuthor(systemVars) {
    const quote = this._getDailyQuote(systemVars);
    if (!quote) return '';
    
    const authorMatch = quote.match(/[——|-]\s*([^——|-]+)$/);
    return authorMatch ? authorMatch[1].trim() : '';
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

      /* 统一的模板样式 */
      .welcome-template {
        width: 100%;
      }

      .layout-horizontal {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
      }

      .layout-centered {
        text-align: center;
      }

      .avatar-container {
        flex-shrink: 0;
      }

      .avatar-large .user-avatar {
        width: 80px;
        height: 80px;
        font-size: 2em;
      }

      .avatar-medium .user-avatar {
        width: 60px;
        height: 60px;
        font-size: 1.5em;
      }

      .user-avatar {
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cf-primary-color), var(--cf-accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        box-shadow: var(--cf-shadow-lg);
      }

      .welcome-content {
        flex: 1;
      }

      .greeting-large {
        font-size: 2.5em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-md) 0;
        line-height: 1.2;
      }

      .greeting-medium {
        font-size: 2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-sm) 0;
      }

      .time-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        margin-bottom: var(--cf-spacing-lg);
      }

      .time-info.centered {
        justify-content: center;
      }

      .current-time {
        font-size: 1.8em;
        font-weight: 500;
        color: var(--cf-primary-color);
        font-variant-numeric: tabular-nums;
      }

      .current-date {
        font-size: 1.2em;
        color: var(--cf-text-secondary);
      }

      .quote-section {
        border-left: 4px solid var(--cf-accent-color);
        padding-left: var(--cf-spacing-lg);
        background: rgba(var(--cf-rgb-primary), 0.05);
        padding: var(--cf-spacing-lg);
        border-radius: 0 var(--cf-radius-lg) var(--cf-radius-lg) 0;
      }

      .quote-text {
        font-size: 1.2em;
        color: var(--cf-text-primary);
        font-style: italic;
        line-height: 1.5;
        margin-bottom: var(--cf-spacing-sm);
      }

      .quote-author {
        font-size: 1em;
        color: var(--cf-text-secondary);
        text-align: right;
      }

      /* 各风格的特殊样式 */
      .minimal .greeting-text {
        font-weight: 300;
      }

      .minimal .quote-section {
        background: none;
        border-left: none;
        padding-left: 0;
      }

      .business .quote-section {
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
      }

      .business .quote-section::before {
        content: "💼";
        font-size: 2em;
        flex-shrink: 0;
      }

      .creative .greeting-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
      }

      .creative .greeting-text::before {
        content: "${systemVars.is_morning ? '🌅' : systemVars.is_afternoon ? '☀️' : '🌙'}";
        font-size: 1.2em;
      }

      .dynamic .welcome-template {
        position: relative;
        overflow: hidden;
        border-radius: var(--cf-radius-xl);
      }

      .dynamic .welcome-template::before {
        content: "";
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
        z-index: -1;
      }

      /* 动画定义 */
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .layout-horizontal {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-lg);
        }
        
        .greeting-large {
          font-size: 2em;
        }
        
        .greeting-medium {
          font-size: 1.8em;
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;
