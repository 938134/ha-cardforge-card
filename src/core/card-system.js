/**
 * 卡片系统 - 负责卡片注册、发现、实例管理
 * 合并了原card-registry的功能
 */
class CardSystem {
  constructor() {
    this.cards = new Map(); // 卡片定义
    this.instances = new Map(); // 卡片实例
    this.categories = new Set(); // 卡片分类
    this._initialized = false;
  }

  /**
   * 初始化卡片系统
   */
  async initialize() {
    if (this._initialized) return;
    
    try {
      // 动态发现卡片
      await this._discoverCards();
      this._initialized = true;
      console.log(`卡片系统初始化完成，发现 ${this.cards.size} 个卡片`);
    } catch (error) {
      console.error('卡片系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 动态发现卡片
   */
  async _discoverCards() {
    // 卡片模块路径映射
    const cardModules = [
      { path: '../cards/clock-card.js', name: 'clock' },
      { path: '../cards/week-card.js', name: 'week' },
      { path: '../cards/welcome-card.js', name: 'welcome' },
      { path: '../cards/poetry-card.js', name: 'poetry' },
      { path: '../cards/dashboard-card.js', name: 'dashboard' }
    ];

    for (const moduleInfo of cardModules) {
      try {
        const module = await import(moduleInfo.path);
        if (module.CardClass && typeof module.CardClass === 'function') {
          this.registerCard(moduleInfo.name, module.CardClass);
        }
      } catch (error) {
        console.warn(`卡片加载失败 ${moduleInfo.name}:`, error);
      }
    }
  }

  /**
   * 注册卡片类型
   */
  registerCard(cardId, CardClass, meta = {}) {
    if (this.cards.has(cardId)) {
      console.warn(`卡片 ${cardId} 已存在，将被覆盖`);
    }

    const cardMeta = {
      id: cardId,
      name: meta.name || cardId,
      description: meta.description || '',
      icon: meta.icon || 'mdi:card-text-outline',
      category: meta.category || '通用',
      tags: meta.tags || [],
      recommendedSize: meta.recommendedSize || 1,
      ...meta
    };

    this.cards.set(cardId, { CardClass, meta: cardMeta });
    
    // 更新分类
    if (cardMeta.category) {
      this.categories.add(cardMeta.category);
    }
    
    console.log(`卡片注册成功: ${cardId} (${cardMeta.name})`);
  }

  /**
   * 获取卡片定义
   */
  getCard(cardId) {
    return this.cards.get(cardId);
  }

  /**
   * 获取所有卡片
   */
  getAllCards() {
    return Array.from(this.cards.values()).map(item => ({
      ...item.meta,
      hasSchema: !!item.CardClass.schema,
      hasBlocks: !!item.CardClass.blocksConfig
    }));
  }

  /**
   * 获取卡片分类
   */
  getCategories() {
    return Array.from(this.categories);
  }

  /**
   * 按分类获取卡片
   */
  getCardsByCategory(category) {
    return Array.from(this.cards.values())
      .filter(item => item.meta.category === category)
      .map(item => item.meta);
  }

  /**
   * 创建卡片实例
   */
  createCardInstance(cardId, config = {}, hass = null) {
    const cardDef = this.getCard(cardId);
    if (!cardDef) {
      throw new Error(`卡片类型不存在: ${cardId}`);
    }

    // 验证配置
    const validatedConfig = this._validateConfig(cardDef.CardClass, config);
    
    // 创建实例
    const instanceId = `${cardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const instance = {
      id: instanceId,
      cardId,
      config: validatedConfig,
      hass,
      timestamp: Date.now()
    };

    this.instances.set(instanceId, instance);
    return instance;
  }

  /**
   * 验证配置
   */
  _validateConfig(CardClass, userConfig) {
    const schema = CardClass.schema || {};
    const defaultConfig = {};
    
    // 应用schema中的默认值
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined && userConfig[key] === undefined) {
        defaultConfig[key] = field.default;
      }
    });

    // 合并配置
    return {
      card_type: userConfig.card_type,
      theme: userConfig.theme || 'auto',
      ...defaultConfig,
      ...userConfig
    };
  }

  /**
   * 获取卡片配置模式
   */
  getCardSchema(cardId) {
    const cardDef = this.getCard(cardId);
    if (!cardDef) return null;
    
    return cardDef.CardClass.schema || null;
  }

  /**
   * 获取卡片块配置
   */
  getCardBlocksConfig(cardId) {
    const cardDef = this.getCard(cardId);
    if (!cardDef) return null;
    
    return cardDef.CardClass.blocksConfig || null;
  }

  /**
   * 销毁卡片实例
   */
  destroyCardInstance(instanceId) {
    if (this.instances.has(instanceId)) {
      this.instances.delete(instanceId);
      return true;
    }
    return false;
  }

  /**
   * 清理过期的实例
   */
  cleanupInstances(maxAge = 3600000) { // 默认1小时
    const now = Date.now();
    let cleaned = 0;
    
    for (const [id, instance] of this.instances.entries()) {
      if (now - instance.timestamp > maxAge) {
        this.instances.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// 创建全局实例
const cardSystem = new CardSystem();

// 自动初始化
cardSystem.initialize().catch(console.error);

export { cardSystem };
