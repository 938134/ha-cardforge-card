// 卡片系统 - 完全使用 Lit 框架
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
        // 静默失败
      }
    }
  }

  // 注册卡片模块
  _registerCardModule(module) {
    if (!module.card) return;
    const cardId = module.card.id;
    if (!cardId) return;

    this.cards.set(cardId, {
      id: cardId,
      definition: module.card
    });
  }

  // 获取卡片定义
  getCard(cardId) {
    const cardData = this.cards.get(cardId);
    return cardData?.definition || null;
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

  // 获取所有卡片
  getAllCards() {
    return Array.from(this.cards.values()).map(item => ({
      id: item.id,
      ...item.definition.meta,
      schema: item.definition.schema || {},
      blockType: item.definition.blockType || 'none'
    }));
  }

  // 渲染卡片 - 修正：返回 TemplateResult 和 CSSResult
  renderCard(cardId, userConfig = {}, hass = null, themeVariables = {}) {
    const card = this.getCard(cardId);
    if (!card) {
      throw new Error(`卡片不存在: ${cardId}`);
    }

    // 合并配置
    const config = this._mergeConfig(card.schema || {}, userConfig);
    
    try {
      // 调用卡片的 template 和 styles 方法
      const template = card.template(config, { hass, theme: themeVariables });
      const styles = card.styles(config, themeVariables);
      
      return { template, styles, config };
    } catch (error) {
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
cardSystem.initialize();

export { cardSystem, CardSystem };