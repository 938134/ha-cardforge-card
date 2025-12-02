// src/core/card-system.js
import { renderBlock, renderBlocks } from './block-renderer.js';

class CardSystem {
  constructor() {
    this.cards = new Map();
    this._initialized = false;
  }

  // 初始化卡片系统
  async initialize() {
    if (this._initialized) return;
    
    // 动态发现所有卡片
    await this._discoverCards();
    
    this._initialized = true;
  }

  // 动态发现卡片
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
        // 静默失败，不影响其他卡片
      }
    }
  }

  // 注册卡片模块
  _registerCardModule(module) {
    if (!module.card) {
      return;
    }

    const cardId = module.card.id;
    if (!cardId) {
      return;
    }

    // 验证必需字段
    if (!module.card.meta || !module.card.schema || 
        !module.card.template || !module.card.styles) {
      return;
    }

    // 注册卡片
    this.cards.set(cardId, {
      id: cardId,
      definition: module.card,
      CardClass: module.CardClass || null
    });
  }

  // 获取卡片定义
  getCard(cardId) {
    return this.cards.get(cardId)?.definition;
  }

  // 获取默认卡片
  getDefaultCard() {
    const defaultCards = ['clock', 'welcome', 'dashboard'];
    for (const cardId of defaultCards) {
      if (this.cards.has(cardId)) {
        return this.getCard(cardId);
      }
    }
    return this.cards.values().next().value?.definition;
  }

  // 按分类获取卡片
  getCardsByCategory(category) {
    return Array.from(this.cards.values())
      .filter(item => item.definition.meta.category === category)
      .map(item => ({
        id: item.id,
        ...item.definition.meta,
        schema: item.definition.schema
      }));
  }

  // 获取所有卡片列表
  getAllCards() {
    return Array.from(this.cards.values()).map(item => ({
      id: item.id,
      ...item.definition.meta,
      schema: item.definition.schema
    }));
  }

  // 获取所有卡片分类
  getAllCategories() {
    const categories = new Set();
    this.cards.forEach(item => {
      if (item.definition.meta.category) {
        categories.add(item.definition.meta.category);
      }
    });
    return Array.from(categories);
  }

  // 渲染卡片
  renderCard(cardId, userConfig = {}, hass = null, themeVariables = {}) {
    const card = this.getCard(cardId);
    if (!card) {
      throw new Error(`卡片不存在: ${cardId}`);
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
      throw new Error(`卡片渲染失败: ${error.message}`);
    }
  }

  // 合并配置（用户配置 + 默认值）
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
}

// 创建全局实例
const cardSystem = new CardSystem();

// 自动初始化
cardSystem.initialize();

export { cardSystem, CardSystem };