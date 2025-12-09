// 主卡片组件 - 简化版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardData: { state: true },
    _error: { state: true },
    _themeStyles: { state: true },
    _cardStyles: { state: true },
    _isRendering: { state: true },
    _renderPhase: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .cardforge-container {
        position: relative;
        height: 100%;
        min-height: 80px;
        container-type: inline-size;
        container-name: cardforge-container;
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
      
      .cardforge-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        color: var(--cf-text-secondary);
      }
    `
  ];

  constructor() {
    super();
    this.config = null;
    this._cardData = null;
    this._error = null;
    this._themeStyles = null;
    this._cardStyles = null;
    this._isRendering = false;
    this._renderPhase = 'init';
  }

  async setConfig(config) {
    // 重置状态
    this._renderPhase = 'loading';
    this._isRendering = true;
    this._error = null;
    this._cardData = null;
    this._themeStyles = null;
    this._cardStyles = null;
    
    // 立即更新UI显示加载状态
    this.requestUpdate();
    
    try {
      // 验证和合并配置
      const validatedConfig = await this._validateAndMergeConfig(config);
      
      // 设置配置
      this.config = validatedConfig;
      
      // 确保系统已初始化
      await this._ensureSystemsInitialized();
      
      // 渲染卡片
      await this._renderCard();
      
      // 渲染成功
      this._renderPhase = 'ready';
      
    } catch (error) {
      this._error = error.message || '未知错误';
      this._renderPhase = 'error';
    } finally {
      // 渲染完成
      this._isRendering = false;
      // 触发UI更新
      this.requestUpdate();
    }
  }

  async _validateAndMergeConfig(userConfig) {
    if (!userConfig || typeof userConfig !== 'object') {
      return this.constructor.getStubConfig();
    }
    
    // 确保卡片系统已初始化
    try {
      await cardSystem.initialize();
    } catch (error) {
      console.error('卡片系统初始化失败:', error);
    }
    
    // 获取卡片定义
    const cardType = userConfig.card_type || 'clock';
    const card = cardSystem.getCard(cardType);
    
    if (!card) {
      return this.constructor.getStubConfig();
    }
    
    // 应用卡片schema中的默认值
    const defaultConfig = {};
    const schema = card.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined && userConfig[key] === undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    // 合并配置
    const mergedConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: cardType,
      theme: userConfig.theme || 'auto',
      ...defaultConfig,
      ...userConfig
    };
    
    // 确保有blocks字段
    if (mergedConfig.blocks === undefined) {
      mergedConfig.blocks = {};
    }
    
    return mergedConfig;
  }

  async _ensureSystemsInitialized() {
    if (!this._systemsInitialized) {
      try {
        await Promise.all([
          cardSystem.initialize(),
          themeSystem.initialize()
        ]);
        this._systemsInitialized = true;
      } catch (error) {
        throw new Error('系统初始化失败');
      }
    }
  }

  async _renderCard() {
    // 检查 config 是否存在
    if (!this.config || !this.config.card_type) {
      this._error = '卡片配置无效';
      return;
    }
    
    try {
      // 获取卡片渲染结果
      const cardResult = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass
      );
      
      if (!cardResult) {
        throw new Error('卡片渲染返回空结果');
      }
      
      this._cardData = cardResult;
      
      // 获取主题样式
      const theme = themeSystem.getTheme(this.config.theme || 'auto');
      this._themeStyles = theme?.styles || css``;
      this._cardStyles = cardResult.styles || css``;
      
      this._error = null;
      
    } catch (error) {
      this._error = `卡片渲染失败: ${error.message}`;
      this._cardData = null;
      throw error;
    }
  }

  render() {
    // 根据渲染阶段显示不同内容
    switch (this._renderPhase) {
      case 'init':
        return html`
          <ha-card>
            <div class="cardforge-container">
              <div class="cardforge-loading">
                <ha-circular-progress indeterminate></ha-circular-progress>
                <div>等待配置...</div>
              </div>
            </div>
          </ha-card>
        `;
        
      case 'loading':
        return html`
          <ha-card>
            <div class="cardforge-container">
              <div class="cardforge-loading">
                <ha-circular-progress indeterminate></ha-circular-progress>
                <div>加载卡片中...</div>
              </div>
            </div>
          </ha-card>
        `;
        
      case 'error':
        return html`
          <ha-card>
            <div class="cardforge-container">
              <div class="cardforge-error">
                <div class="error-icon">❌</div>
                <div class="error-message">${this._error || '未知错误'}</div>
              </div>
            </div>
          </ha-card>
        `;
        
      case 'ready':
        if (!this._cardData || !this._cardData.template) {
          return html`
            <ha-card>
              <div class="cardforge-container">
                <div class="cardforge-error">
                  <div class="error-icon">⚠️</div>
                  <div class="error-message">卡片数据无效</div>
                </div>
              </div>
            </ha-card>
          `;
        }
        
        try {
          return html`
            <ha-card>
              <div class="cardforge-container">
                ${this._cardData.template}
              </div>
            </ha-card>
            <style>
              ${this._themeStyles}
              ${this._cardStyles}
            </style>
          `;
        } catch (error) {
          return html`
            <ha-card>
              <div class="cardforge-container">
                <div class="cardforge-error">
                  <div class="error-icon">⚠️</div>
                  <div class="error-message">模板错误</div>
                </div>
              </div>
            </ha-card>
          `;
        }
        
      default:
        return html`
          <ha-card>
            <div class="cardforge-container">
              <div class="cardforge-error">
                <div class="error-icon">❓</div>
                <div class="error-message">未知状态</div>
              </div>
            </div>
          </ha-card>
        `;
    }
  }

  updated(changedProperties) {
    // 只有当 hass 改变且已经准备好时才重新渲染
    if (changedProperties.has('hass') && 
        this._renderPhase === 'ready' && 
        !this._isRendering) {
      this._isRendering = true;
      this._renderPhase = 'loading';
      this.requestUpdate();
      
      this._renderCard().then(() => {
        this._renderPhase = 'ready';
        this._isRendering = false;
        this.requestUpdate();
      }).catch(error => {
        this._error = error.message;
        this._renderPhase = 'error';
        this._isRendering = false;
        this.requestUpdate();
      });
    }
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto',
      blocks: {},
      showYearProgress: true,
      showWeekProgress: true
    };
  }

  getCardSize() {
    if (!this.config?.card_type) return 3;
    
    const card = cardSystem.getCard(this.config.card_type);
    return card?.layout?.recommendedSize || 3;
  }

  static getConfigElement() {
    return document.createElement('card-editor');
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
