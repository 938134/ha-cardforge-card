// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '简洁的欢迎卡片，显示用户问候和每日一言',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    config_schema: {
      welcome_style: {
        type: 'select',
        label: '欢迎风格',
        options: ['简洁风格', '温馨风格', '现代风格'],
        default: '简洁风格'
      },
      
      custom_greeting: {
        type: 'string',
        label: '自定义问候语',
        default: '',
        placeholder: '例如：{greeting}，{user}！'
      },
      
      show_quote: {
        type: 'boolean',
        label: '显示每日一言',
        default: true
      },
      
      quote_entity: {
        type: 'string',
        label: '每日一言实体',
        default: '',
        placeholder: '例如：sensor.daily_quote'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const systemVars = this._getSystemVariables(config, hass, entities);
    const styleClass = this._getStyleClass(config.welcome_style);
    const greeting = this._processGreeting(config.custom_greeting, systemVars);

    return `
      <div class="cardforge-responsive-container welcome-card style-${styleClass}">
        <div class="welcome-content">
          <div class="greeting">${greeting}</div>
          ${config.show_quote ? `
            <div class="daily-quote">${this._getDailyQuote(systemVars, config)}</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '简洁风格': 'simple',
      '温馨风格': 'warm', 
      '现代风格': 'modern'
    };
    return styleMap[styleName] || 'simple';
  }

  _processGreeting(customGreeting, systemVars) {
    if (!customGreeting) {
      return `${systemVars.time_greeting}，${systemVars.current_user_name}！`;
    }
    
    return customGreeting
      .replace(/{user}/g, systemVars.current_user_name)
      .replace(/{greeting}/g, systemVars.time_greeting)
      .replace(/{location}/g, systemVars.location);
  }

  _getDailyQuote(systemVars, config) {
    if (config.quote_entity) {
      const quote = this._getCardValue(systemVars._hass, systemVars._entities, 'quote_entity', '');
      return quote || this._getDefaultQuote();
    }
    
    return this._getDefaultQuote();
  }

  _getDefaultQuote() {
    const quotes = [
      "每一天都是新的开始。",
      "保持热爱，奔赴山海。", 
      "简单的生活，就是最美好的生活。",
      "今天的努力，是明天的幸运。",
      "心怀希望，所遇皆温柔。",
      "今天也要加油哦！"
    ];
    
    const today = new Date();
    const seed = today.getDate() + today.getMonth();
    return quotes[seed % quotes.length];
  }

  getStyles(config) {
    const styleClass = this._getStyleClass(config.welcome_style);

    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card {
        padding: var(--cf-spacing-xl);
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .welcome-content {
        width: 100%;
      }

      .greeting {
        font-size: 2.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        line-height: 1.3;
      }

      .daily-quote {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        font-style: italic;
        line-height: 1.5;
        max-width: 500px;
        margin: 0 auto;
      }

      /* ===== 简洁风格 ===== */
      .style-simple .greeting {
        font-size: 2em;
        font-weight: 500;
      }

      .style-simple .daily-quote {
        font-size: 1em;
        color: var(--cf-text-secondary);
      }

      /* ===== 温馨风格 ===== */
      .style-warm .welcome-card {
        background: linear-gradient(135deg, rgba(var(--cf-rgb-primary), 0.1) 0%, rgba(var(--cf-rgb-accent), 0.05) 100%);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
      }

      .style-warm .greeting {
        color: var(--cf-primary-color);
      }

      .style-warm .daily-quote {
        color: var(--cf-text-primary);
        border-left: 3px solid var(--cf-accent-color);
        padding-left: var(--cf-spacing-md);
      }

      /* ===== 现代风格 ===== */
      .style-modern .greeting {
        font-size: 2.5em;
        font-weight: 300;
        letter-spacing: -0.5px;
      }

      .style-modern .daily-quote {
        font-size: 1.2em;
        font-weight: 400;
        color: var(--cf-text-primary);
        opacity: 0.8;
      }

      /* ===== 响应式优化 ===== */
      @media (max-width: 768px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
          min-height: 100px;
        }

        .greeting {
          font-size: 1.8em;
        }

        .style-modern .greeting {
          font-size: 2em;
        }

        .daily-quote {
          font-size: 1em;
        }
      }

      @media (max-width: 480px) {
        .greeting {
          font-size: 1.6em;
        }

        .style-modern .greeting {
          font-size: 1.8em;
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;