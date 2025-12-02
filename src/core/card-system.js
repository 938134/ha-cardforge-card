// src/core/card-system.js
import { renderBlock, renderBlocks } from './block-renderer.js';

class CardSystem {
  constructor() {
    this.cards = new Map();
    this._initialized = false;
  }

  /**
   * 初始化卡片系统
   */
  async initialize() {
    if (this._initialized) return;
    
    console.log('🔄 初始化卡片系统...');
    
    // 动态发现所有卡片
    await this._discoverCards();
    
    this._initialized = true;
    console.log(`✅ 卡片系统初始化完成，加载 ${this.cards.size} 张卡片`);
  }

  /**
   * 动态发现卡片
   */
  async _discoverCards() {
    const cardModules = [
      () => import('../cards/clock-card.js'),
      () => import('../cards/week-card.js'),
      () => import('../cards/welcome-card.js'),
      () => import('../cards/poetry-card.js'),
      () => import('../cards/dashboard-card.js')
    ];

    for (const importFn of cardModules) {
      try {
        const module = await importFn();
        this._registerCardModule(module);
      } catch (error) {
        console.warn(`⚠️ 加载卡片失败:`, error);
      }
    }
  }

  /**
   * 注册卡片模块
   */
  _registerCardModule(module) {
    if (!module.card) {
      console.warn('卡片缺少 card 声明，跳过注册');
      return;
    }

    const cardId = module.card.id;
    if (!cardId) {
      console.warn('卡片缺少 id，跳过');
      return;
    }

    // 验证必需字段
    if (!module.card.meta || !module.card.schema || 
        !module.card.template || !module.card.styles) {
      console.warn(`卡片 ${cardId} 缺少必需字段，跳过`);
      return;
    }

    // 注册卡片
    this.cards.set(cardId, {
      id: cardId,
      definition: module.card,
      CardClass: module.CardClass || null
    });
    
    console.log(`✅ 注册卡片: ${cardId} (${module.card.meta.name})`);
  }

  /**
   * 获取卡片定义
   */
  getCard(cardId) {
    return this.cards.get(cardId)?.definition;
  }

  /**
   * 获取所有卡片列表
   */
  getAllCards() {
    return Array.from(this.cards.values()).map(item => ({
      id: item.id,
      ...item.definition.meta,
      schema: item.definition.schema
    }));
  }

  /**
   * 渲染卡片
   */
  renderCard(cardId, userConfig = {}, hass = null, themeVariables = {}) {
    const card = this.getCard(cardId);
    if (!card) {
      const availableCards = Array.from(this.cards.keys()).join(', ');
    }

    // 合并配置（用户配置 + 默认值）
    const config = this._mergeConfig(card.schema, userConfig);
    
    // 准备数据上下文
    const data = { hass };
    const context = { 
      theme: themeVariables,
      renderBlock: (block) => renderBlock(block, hass),
      renderBlocks: (blocks) => renderBlocks(blocks, hass)
    };

    // 调用卡片的模板和样式函数
    try {
      const template = card.template(config, data, context);
      const styles = card.styles(config, themeVariables);
      
      return {
        template,
        styles,
        config
      };
    } catch (error) {
      console.error(`❌ 渲染卡片 ${cardId} 失败:`, error);
      return this._renderErrorCard(`卡片渲染失败: ${error.message}`);
    }
  }

  /**
   * 合并配置（用户配置 + 默认值）
   */
  _mergeConfig(schema, userConfig) {
    const config = { ...userConfig };
    
    // 应用schema中的默认值
    Object.entries(schema).forEach(([key, field]) => {
      if (config[key] === undefined && field.default !== undefined) {
        config[key] = field.default;
      }
    });
    
    return config;
  }

  /**
   * 渲染错误卡片
   */
  _renderErrorCard(message) {
    return {
      template: `
        <div class="cardforge-error">
          <div class="error-icon">❌</div>
          <div class="error-message">${message}</div>
        </div>
      `,
      styles: `
        .cardforge-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--cf-text-secondary);
        }
        .error-icon { font-size: 2em; margin-bottom: 12px; }
        .error-message { font-size: 0.9em; }
      `
    };
  }
}

// 创建全局实例
const cardSystem = new CardSystem();

// 自动初始化
cardSystem.initialize();

export { cardSystem, CardSystem };
