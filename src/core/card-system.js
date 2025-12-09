// 卡片系统 - 修复版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class CardSystem {
  constructor() {
    this.cards = new Map();
    this._initialized = false;
  }

  // 初始化
  async initialize() {
    if (this._initialized) return;
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
        console.warn('卡片加载失败:', error);
      }
    }
  }

  // 注册卡片模块
  _registerCardModule(module) {
    if (!module.card) return;
    const cardId = module.card.id;
    if (!cardId) return;

    this.cards.set(cardId, module.card);
  }

  // 获取卡片定义
  getCard(cardId) {
    return this.cards.get(cardId) || null;
  }

  // 获取默认卡片
  getDefaultCard() {
    const defaultCards = ['clock', 'welcome', 'dashboard'];
    for (const cardId of defaultCards) {
      if (this.cards.has(cardId)) {
        return this.getCard(cardId);
      }
    }
    return this.cards.values().next().value;
  }

  // 获取所有卡片
  getAllCards() {
    return Array.from(this.cards.values()).map(card => ({
      id: card.id,
      ...card.meta,
      schema: card.schema || {},
      blockType: card.blockType || 'none'
    }));
  }

  // 渲染卡片 - 关键修复：正确处理模板和样式
  renderCard(cardId, userConfig = {}, hass = null) {
    const card = this.getCard(cardId);
    if (!card) {
      throw new Error(`卡片不存在: ${cardId}`);
    }

    // 合并配置
    const config = this._mergeConfig(card.schema || {}, userConfig);
    
    try {
      // 调用卡片的 template 和 styles 方法
      const template = card.template(config, { hass });
      
      // 确保 styles 返回 CSSResult
      let styles = css``;
      if (typeof card.styles === 'function') {
        styles = card.styles(config);
      } else if (card.styles) {
        styles = card.styles;
      }
      
      return {
        template,
        styles,
        config
      };
    } catch (error) {
      console.error(`卡片 "${cardId}" 渲染失败:`, error);
      throw new Error(`卡片渲染失败: ${error.message}`);
    }
  }

  // 合并配置
  _mergeConfig(schema, userConfig) {
    const config = { ...userConfig };
    
    // 应用schema中的默认值
    if (schema) {
      Object.entries(schema).forEach(([key, field]) => {
        if (config[key] === undefined && field.default !== undefined) {
          config[key] = field.default;
        }
      });
    }
    
    // 确保有blocks字段
    if (config.blocks === undefined) {
      config.blocks = {};
    }
    
    return config;
  }
}

// 全局实例
const cardSystem = new CardSystem();
// 注意：这里不要立即调用 initialize()，让组件自己控制
// cardSystem.initialize();

export { cardSystem, CardSystem };
