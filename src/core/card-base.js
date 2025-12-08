// core/card-base.js - 卡片抽象基类
import { LitElement, html, css } from 'https://unpkg.com/lit@3.0.0/index.js?module';
import { designSystem } from './design-system.js';
import { createCardStyles } from './card-styles.js';

/**
 * 卡片抽象基类
 * 所有卡片组件的基类，提供统一的生命周期和样式管理
 */
export class CardBase extends LitElement {
  // 静态属性 - 子类必须覆盖这些
  static cardId = 'base';
  static meta = {
    name: '基类卡片',
    description: '卡片基类',
    icon: '📄',
    category: '系统'
  };
  
  static schema = {};
  static presetBlocks = null;
  static blockType = 'none';
  
  // 实例属性
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _error: { state: true }
  };
  
  // 基类通用样式
  static baseStyles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 80px;
    }
    
    .cardforge-container {
      height: 100%;
      min-height: 80px;
      container-type: inline-size;
      container-name: cardforge-container;
      position: relative;
    }
    
    .card-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 120px;
      text-align: center;
      color: var(--cf-text-tertiary);
      padding: var(--cf-spacing-2xl);
    }
    
    .card-empty-icon {
      font-size: 2.5em;
      margin-bottom: var(--cf-spacing-md);
      opacity: 0.4;
    }
    
    .card-empty-text {
      font-size: var(--cf-font-size-lg);
      font-weight: var(--cf-font-weight-medium);
    }
    
    .card-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 120px;
      text-align: center;
      color: var(--cf-error-color);
      padding: var(--cf-spacing-xl);
    }
    
    .card-error-icon {
      font-size: 2em;
      margin-bottom: var(--cf-spacing-md);
    }
    
    .card-error-text {
      font-size: var(--cf-font-size-md);
      font-weight: var(--cf-font-weight-medium);
    }
  `;
  
  constructor() {
    super();
    this.config = {};
    this.hass = null;
    this._error = null;
  }
  
  /**
   * 获取配置值
   */
  getConfigValue(key, defaultValue = null) {
    const schema = this.constructor.schema || {};
    const field = schema[key];
    
    if (this.config[key] !== undefined) {
      return this.config[key];
    }
    
    if (field && field.default !== undefined) {
      return field.default;
    }
    
    return defaultValue;
  }
  
  /**
   * 获取卡片自定义样式
   * 子类可以覆盖此方法
   */
  getCustomStyles() {
    return '';
  }
  
  /**
   * 获取卡片完整样式
   */
  getCardStyles() {
    const customStyles = this.getCustomStyles();
    return createCardStyles(customStyles);
  }
  
  /**
   * 渲染卡片内容
   * 子类必须实现此方法
   */
  renderContent() {
    throw new Error('子类必须实现 renderContent 方法');
  }
  
  /**
   * 渲染方法
   */
  render() {
    if (this._error) {
      return html`
        <div class="cardforge-container">
          <div class="card-error">
            <div class="card-error-icon">⚠️</div>
            <div class="card-error-text">${this._error}</div>
          </div>
        </div>
      `;
    }
    
    try {
      // 确保配置正确
      this._ensureConfig();
      
      return html`
        <div class="cardforge-container">
          ${this.renderContent()}
        </div>
      `;
    } catch (error) {
      console.error(`卡片 ${this.constructor.cardId} 渲染错误:`, error);
      return html`
        <div class="cardforge-container">
          <div class="card-error">
            <div class="card-error-icon">⚠️</div>
            <div class="card-error-text">${error.message}</div>
          </div>
        </div>
      `;
    }
  }
  
  /**
   * 确保配置有默认值
   */
  _ensureConfig() {
    const schema = this.constructor.schema || {};
    const newConfig = { ...this.config };
    
    Object.entries(schema).forEach(([key, field]) => {
      if (newConfig[key] === undefined && field.default !== undefined) {
        newConfig[key] = field.default;
      }
    });
    
    // 确保 blocks 存在
    if (newConfig.blocks === undefined) {
      newConfig.blocks = {};
    }
    
    this.config = newConfig;
  }
  
  /**
   * 获取卡片定义对象（用于注册到卡片系统）
   */
  static getDefinition() {
    const cls = this;
    
    return {
      id: cls.cardId,
      meta: cls.meta,
      schema: cls.schema,
      blockType: cls.blockType,
      presetBlocks: cls.presetBlocks,
      
      template: (config, data) => {
        const cardInstance = new cls();
        cardInstance.config = config;
        cardInstance.hass = data?.hass || null;
        cardInstance._ensureConfig();
        
        // 渲染并获取 HTML
        const result = cardInstance.render();
        return `<div class="cardforge-container">${result.strings.join('')}</div>`;
      },
      
      styles: (config, theme) => {
        const cardInstance = new cls();
        cardInstance.config = config;
        const customStyles = cardInstance.getCustomStyles();
        return createCardStyles(customStyles);
      }
    };
  }
}
