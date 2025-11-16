// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '显示个性化欢迎信息和每日一言',
    category: 'information',
    icon: '👋',
    author: 'CardForge',
    config_schema: {
      user_name: {
        type: 'text',
        label: '用户名',
        required: false,
        default: '',
        description: '留空将使用系统用户名'
      },
      show_datetime: {
        type: 'boolean',
        label: '显示日期时间',
        required: false,
        default: true
      },
      show_greeting: {
        type: 'boolean',
        label: '显示问候语',
        required: false,
        default: true
      },
      show_daily_quote: {
        type: 'boolean',
        label: '显示每日一言',
        required: false,
        default: true
      },
      daily_quote_source: {
        type: 'select',
        label: '名言来源',
        required: false,
        default: 'hitokoto',
        options: ['hitokoto', 'custom'],
        description: '选择名言来源'
      },
      custom_quote: {
        type: 'text',
        label: '自定义名言',
        required: false,
        default: '',
        description: '当选择自定义来源时使用'
      },
      layout_style: {
        type: 'select',
        label: '布局样式',
        required: false,
        default: 'classic',
        options: ['classic', 'modern', 'minimal']
      },
      background_image: {
        type: 'text',
        label: '背景图片',
        required: false,
        default: '',
        description: '背景图片URL（可选）'
      }
    },
    entity_requirements: [
      {
        entity: 'sensor.daily_quote',
        description: '每日一言传感器（可选）',
        optional: true
      }
    ]
  };

  // 重写配置验证方法，避免编辑器中的严格验证
  _validateConfig(config, manifest) {
    // 在编辑器环境中，跳过严格验证
    if (!config || typeof config !== 'object') {
      return true;
    }
    
    try {
      return super._validateConfig(config, manifest);
    } catch (error) {
      // 在编辑器环境中，允许配置验证失败
      console.warn('配置验证警告（编辑器环境）:', error.message);
      return true;
    }
  }

  // 重写配置默认值应用，确保参数安全
  _applyConfigDefaults(config, manifest) {
    const safeConfig = config || {};
    const safeManifest = manifest || { config_schema: {} };
    
    return super._applyConfigDefaults(safeConfig, safeManifest);
  }

  // 重写系统数据获取，处理编辑器环境
  getSystemData(hass, config) {
    const safeConfig = config || {};
    
    // 在编辑器环境中，提供模拟数据
    if (!hass) {
      const now = new Date();
      return {
        // 基础时间数据
        ...this._getBasicTimeData(now),
        // 用户数据
        user: '预览用户',
        user_id: 'preview',
        user_language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        // 问候语数据
        ...this._getGreetingData(now)
      };
    }
    
    return super.getSystemData(hass, safeConfig);
  }

  getTemplate(config, hass, entities) {
    try {
      // 确保所有参数都有安全值
      const safeConfig = config || {};
      const safeEntities = entities || {};
      
      // 应用配置默认值（跳过严格验证）
      const manifest = this.getManifest();
      const validatedConfig = this._applyConfigDefaults(safeConfig, manifest);

      // 获取系统数据
      const systemData = this.getSystemData(hass, validatedConfig);
      
      // 安全获取用户名
      const userName = validatedConfig.user_name || systemData.user || '家人';
      
      // 获取每日一言
      const dailyQuote = this._getDailyQuote(hass, safeEntities, validatedConfig);

      // 根据布局样式渲染不同模板
      const layoutStyle = validatedConfig.layout_style || 'classic';
      
      switch (layoutStyle) {
        case 'modern':
          return this._renderModernLayout(validatedConfig, systemData, userName, dailyQuote);
        case 'minimal':
          return this._renderMinimalLayout(validatedConfig, systemData, userName, dailyQuote);
        default:
          return this._renderClassicLayout(validatedConfig, systemData, userName, dailyQuote);
      }

    } catch (error) {
      console.error('欢迎卡片渲染错误:', error);
      // 返回一个简单的预览，避免编辑器崩溃
      return this._renderEditorPreview();
    }
  }

  // 编辑器预览模板
  _renderEditorPreview() {
    return `
      <div class="cardforge-responsive-container welcome-card">
        <div class="cardforge-content-grid welcome-classic">
          <div class="greeting-section">
            <div class="user-name">预览用户</div>
            <div class="greeting-text">你好！</div>
            <div class="datetime-section">
              <div>${new Date().toLocaleDateString('zh-CN')}</div>
              <div>${new Date().toLocaleTimeString('zh-CN')} 星期${'日一二三四五六'[new Date().getDay()]}</div>
            </div>
          </div>
          <div class="quote-section">
            <div class="daily-quote">"每一天都是一个新的开始。"</div>
            <div class="quote-author">—— 谚语</div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const safeConfig = config || {};
    const baseStyles = this.getBaseStyles(safeConfig);
    
    return `
      ${baseStyles}
      
      /* 欢迎卡片特定样式 */
      .welcome-card {
        position: relative;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .welcome-card.background-image {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      
      .welcome-card.background-image::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        border-radius: var(--cf-radius-lg);
        z-index: 1;
      }
      
      /* 经典布局 */
      .welcome-classic {
        text-align: center;
        gap: var(--cf-spacing-lg);
      }
      
      .welcome-classic .greeting-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .welcome-classic .user-name {
        font-size: 1.5em;
        font-weight: 600;
        color: var(--primary-color, #03a9f4);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .welcome-classic .greeting-text {
        font-size: 1.2em;
        color: var(--card-text-light);
        opacity: 0.9;
      }
      
      .welcome-classic .datetime-section {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }
      
      .welcome-classic .quote-section {
        margin-top: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--primary-color, #03a9f4);
      }
      
      .welcome-classic .daily-quote {
        font-style: italic;
        font-size: 0.95em;
        line-height: 1.5;
        color: var(--card-text-light);
      }
      
      .welcome-classic .quote-author {
        margin-top: var(--cf-spacing-xs);
        text-align: right;
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      
      /* 现代布局 */
      .welcome-modern {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--cf-spacing-lg);
        align-items: center;
        text-align: left;
      }
      
      .welcome-modern .avatar-section {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5em;
        color: white;
        font-weight: bold;
      }
      
      .welcome-modern .info-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .welcome-modern .main-greeting {
        font-size: 1.3em;
        font-weight: 600;
        color: var(--card-text-light);
      }
      
      .welcome-modern .sub-info {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }
      
      .welcome-modern .quote-section {
        grid-column: 1 / -1;
        margin-top: var(--cf-spacing-sm);
      }
      
      /* 极简布局 */
      .welcome-minimal {
        text-align: center;
        gap: var(--cf-spacing-md);
      }
      
      .welcome-minimal .greeting-text {
        font-size: 1.1em;
        font-weight: 500;
        color: var(--card-text-light);
      }
      
      .welcome-minimal .datetime-text {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        opacity: 0.7;
      }
      
      .welcome-minimal .quote-text {
        font-size: 0.9em;
        font-style: italic;
        color: var(--card-text-light);
        opacity: 0.9;
        margin-top: var(--cf-spacing-sm);
      }
      
      /* 响应式调整 */
      @container cardforge-container (max-width: 400px) {
        .welcome-modern {
          grid-template-columns: 1fr;
          text-align: center;
          gap: var(--cf-spacing-md);
        }
        
        .welcome-modern .avatar-section {
          margin: 0 auto;
        }
        
        .welcome-classic .user-name {
          font-size: 1.3em;
        }
        
        .welcome-classic .greeting-text {
          font-size: 1.1em;
        }
      }
    `;
  }

  _getDailyQuote(hass, entities, config) {
    if (!config || !config.show_daily_quote) {
      return null;
    }

    const safeEntities = entities || {};
    
    // 如果有每日一言传感器实体，优先使用
    const quoteEntity = safeEntities.daily_quote;
    if (quoteEntity && quoteEntity.state) {
      return {
        content: quoteEntity.state,
        author: quoteEntity.attributes?.author || '未知',
        source: 'sensor'
      };
    }

    // 根据配置选择名言来源
    if (config.daily_quote_source === 'custom' && config.custom_quote) {
      return {
        content: config.custom_quote,
        author: '自定义',
        source: 'custom'
      };
    }

    // 默认使用内置名言
    return this._getDefaultQuote();
  }

  _getDefaultQuote() {
    const quotes = [
      { content: "每一天都是一个新的开始。", author: "谚语" },
      { content: "生活不是等待风暴过去，而是学会在雨中跳舞。", author: "维维安·格林" },
      { content: "今天的努力，是明天的实力。", author: "谚语" },
      { content: "心怀希望，万物可爱。", author: "谚语" },
      { content: "简单的生活，就是最美的生活。", author: "谚语" }
    ];
    
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const quoteIndex = dayOfYear % quotes.length;
    
    return {
      ...quotes[quoteIndex],
      source: 'builtin'
    };
  }

  _renderClassicLayout(config, systemData, userName, dailyQuote) {
    const backgroundStyle = config.background_image ? 
      `style="background-image: url('${this._renderSafeHTML(config.background_image)}')"` : '';
    
    const backgroundClass = config.background_image ? 'background-image' : '';

    return `
      <div class="cardforge-responsive-container welcome-card ${backgroundClass}" ${backgroundStyle}>
        <div class="cardforge-content-grid welcome-classic">
          <div class="greeting-section">
            ${config.show_greeting !== false ? `
              <div class="user-name">${this._renderSafeHTML(userName)}</div>
              <div class="greeting-text">${systemData.greeting}！</div>
            ` : ''}
            
            ${config.show_datetime !== false ? `
              <div class="datetime-section">
                <div>${systemData.date}</div>
                <div>${systemData.time} ${systemData.weekday}</div>
              </div>
            ` : ''}
          </div>
          
          ${dailyQuote ? `
            <div class="quote-section">
              <div class="daily-quote">"${this._renderSafeHTML(dailyQuote.content)}"</div>
              ${dailyQuote.author ? `
                <div class="quote-author">—— ${this._renderSafeHTML(dailyQuote.author)}</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderModernLayout(config, systemData, userName, dailyQuote) {
    const backgroundStyle = config.background_image ? 
      `style="background-image: url('${this._renderSafeHTML(config.background_image)}')"` : '';
    
    const backgroundClass = config.background_image ? 'background-image' : '';
    const userInitial = userName ? userName.charAt(0).toUpperCase() : '家';

    return `
      <div class="cardforge-responsive-container welcome-card ${backgroundClass}" ${backgroundStyle}>
        <div class="welcome-modern">
          <div class="avatar-section">
            ${userInitial}
          </div>
          
          <div class="info-section">
            <div class="main-greeting">
              ${systemData.greeting}，${this._renderSafeHTML(userName)}！
            </div>
            
            ${config.show_datetime !== false ? `
              <div class="sub-info">
                ${systemData.date_short} · ${systemData.time} · ${systemData.weekday_short}
              </div>
            ` : ''}
          </div>
          
          ${dailyQuote ? `
            <div class="quote-section">
              <div class="daily-quote">"${this._renderSafeHTML(dailyQuote.content)}"</div>
              ${dailyQuote.author ? `
                <div class="quote-author">—— ${this._renderSafeHTML(dailyQuote.author)}</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderMinimalLayout(config, systemData, userName, dailyQuote) {
    const backgroundStyle = config.background_image ? 
      `style="background-image: url('${this._renderSafeHTML(config.background_image)}')"` : '';
    
    const backgroundClass = config.background_image ? 'background-image' : '';

    return `
      <div class="cardforge-responsive-container welcome-card ${backgroundClass}" ${backgroundStyle}>
        <div class="welcome-minimal">
          ${config.show_greeting !== false ? `
            <div class="greeting-text">
              ${systemData.greeting}，${this._renderSafeHTML(userName)}
            </div>
          ` : ''}
          
          ${config.show_datetime !== false ? `
            <div class="datetime-text">
              ${systemData.date_short} ${systemData.time}
            </div>
          ` : ''}
          
          ${dailyQuote ? `
            <div class="quote-text">
              ${this._renderSafeHTML(dailyQuote.content)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;