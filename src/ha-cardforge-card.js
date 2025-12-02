// src/ha-cardforge-card.js - 完整修复版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { cardSystem } from './core/card-system.js';
import { themeSystem } from './core/theme-system.js';
import { designSystem } from './core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardData: { state: true },
    _error: { state: true },
    _loading: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .cardforge-container {
        position: relative;
        height: 100%;
        min-height: 80px;
      }
      
      .cardforge-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        text-align: center;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-lg);
      }
      
      .error-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .error-message {
        font-size: 0.9em;
        line-height: 1.4;
      }
      
      .error-hint {
        font-size: 0.8em;
        margin-top: 8px;
        color: var(--cf-text-secondary);
        opacity: 0.8;
      }
      
      .cardforge-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        color: var(--cf-text-secondary);
      }
      
      ha-circular-progress {
        margin-bottom: 12px;
      }
      
      /* 确保卡片容器正确继承高度 */
      ha-card {
        height: 100%;
        overflow: hidden;
      }
    `
  ];

  constructor() {
    super();
    this._cardData = null;
    this._error = null;
    this._loading = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      console.log('📥 收到配置:', config);
      
      // 验证配置并应用卡片默认值
      this.config = await this._validateAndMergeConfig(config);
      console.log('✅ 处理后配置:', this.config);
      
      // 等待系统初始化
      await cardSystem.initialize();
      await themeSystem.initialize();
      
      // 获取主题变量
      const themeVariables = themeSystem.getThemeVariables(this.config.theme || 'auto');
      
      // 渲染卡片
      this._cardData = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass,
        themeVariables
      );
      
      console.log('🎨 卡片渲染完成');
      this._loading = false;
      
    } catch (error) {
      console.error('❌ 卡片加载失败:', error);
      this._error = error.message || '未知错误';
      this._loading = false;
    }
  }

  async _validateAndMergeConfig(userConfig) {
    if (!userConfig) {
      console.log('⚠️ 配置为空，使用默认配置');
      return this.constructor.getStubConfig();
    }
    
    // 支持旧版本的 cardType 字段
    let card_type = userConfig.card_type;
    if (!card_type && userConfig.cardType) {
      card_type = userConfig.cardType;
      delete userConfig.cardType;
      console.log('🔄 转换 cardType -> card_type:', card_type);
    }
    
    // 必须有 card_type
    if (!card_type) {
      const availableCards = this._getAvailableCardTypes();
      const cardList = availableCards.map(card => `- ${card.id} (${card.name})`).join('\n');
      
      throw new Error(
        '必须指定 card_type 参数。\n\n' +
        '例如：\n' +
        'type: custom:ha-cardforge-card\n' +
        'card_type: clock\n\n' +
        '支持的卡片类型：\n' +
        cardList + '\n\n' +
        '请通过卡片编辑器添加卡片，或手动添加 card_type 字段。'
      );
    }
    
    // 确保卡片系统已初始化
    await cardSystem.initialize();
    
    // 获取卡片定义
    const card = cardSystem.getCard(card_type);
    if (!card) {
      throw new Error(`卡片类型不存在: "${card_type}"`);
    }
    
    console.log('📋 卡片定义找到:', card.id);
    
    // 应用卡片schema中的默认值
    const defaultConfig = {};
    const schema = card.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    console.log('⚙️ 卡片默认配置:', defaultConfig);
    
    // 合并配置：默认值 + 用户配置（用户配置覆盖默认值）
    const mergedConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: card_type,
      theme: userConfig.theme || 'auto',
      ...defaultConfig,
      ...userConfig  // 用户配置最后，覆盖默认值
    };
    
    // 删除可能存在的旧字段
    delete mergedConfig.cardType;
    
    console.log('🔄 最终合并配置:', mergedConfig);
    return mergedConfig;
  }

  _getAvailableCardTypes() {
    try {
      return cardSystem.getAllCards();
    } catch (error) {
      console.warn('获取卡片列表失败:', error);
      return [
        { id: 'clock', name: '时钟' },
        { id: 'week', name: '星期' },
        { id: 'welcome', name: '欢迎' },
        { id: 'poetry', name: '诗词' },
        { id: 'dashboard', name: '仪表盘' }
      ];
    }
  }

  render() {
    if (this._error) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error">
              <div class="error-icon">❌</div>
              <div class="error-message">${this._error}</div>
              ${this._error.includes('card_type') ? html`
                <div class="error-hint">
                  提示：请通过卡片编辑器重新添加此卡片
                </div>
              ` : ''}
            </div>
          </div>
        </ha-card>
      `;
    }
    
    if (this._loading || !this._cardData) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-loading">
              <ha-circular-progress indeterminate></ha-circular-progress>
              <div>加载中...</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    try {
      const themeStyles = themeSystem.getThemeStyles(this.config.theme || 'auto');
      const cardStyles = this._cardData.styles || '';
      
      return html`
        <ha-card>
          <div class="cardforge-container">
            ${unsafeHTML(this._cardData.template)}
          </div>
        </ha-card>
        
        <style>
          ${themeStyles}
          ${cardStyles}
        </style>
      `;
    } catch (error) {
      console.error('❌ 卡片渲染失败:', error);
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error">
              <div class="error-icon">⚠️</div>
              <div class="error-message">渲染错误: ${error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      this._updateCard();
    }
    
    // 监听主题变化
    if (changedProperties.has('config') && 
        changedProperties.get('config')?.theme !== this.config?.theme) {
      console.log('🎨 主题变化，重新渲染');
      this._updateCard();
    }
  }

  async _updateCard() {
    if (!this.config?.card_type) {
      console.log('⚠️ 更新卡片: 无 card_type');
      return;
    }
    
    console.log('🔄 更新卡片渲染');
    
    try {
      const themeVariables = themeSystem.getThemeVariables(this.config.theme || 'auto');
      this._cardData = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass,
        themeVariables
      );
      this.requestUpdate(); // 强制重新渲染
    } catch (error) {
      console.warn('更新卡片失败:', error);
    }
  }

  // 提供给 Home Assistant 编辑器使用的默认配置
  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',  // 默认显示时钟卡片
      theme: 'auto',
      showDate: true,
      showWeekday: true
    };
  }

  // 获取卡片大小（用于布局）
  getCardSize() {
    const card = cardSystem.getCard(this.config?.card_type);
    return card?.layout?.recommendedSize || 3;
  }

  // 获取配置元素（编辑器）
  static getConfigElement() {
    return document.createElement('card-editor');
  }
}

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
