// src/core/card-registry.js
class CardRegistry {
  constructor() {
    this._cards = new Map();
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) return;

    try {
      await this._discoverCards();
      this._initialized = true;
    } catch (error) {
      console.error('❌ 卡片注册表初始化失败:', error);
    }
  }

  async _discoverCards() {
    const cardModules = [
      () => import('../cards/clock-card.js'),
      () => import('../cards/week-card.js'),
      () => import('../cards/welcome-card.js'),
      () => import('../cards/poetry-card.js'),
      () => import('../cards/dashboard-card.js'),
    ];

    for (const importFn of cardModules) {
      try {
        const module = await importFn();
        this._registerCardModule(module);
      } catch (error) {
        console.error(`❌ 加载卡片失败:`, error);
      }
    }
  }

  _registerCardModule(module) {
    if (!module.manifest) {
      console.warn('卡片缺少 manifest，跳过注册');
      return;
    }

    const cardId = module.manifest.id;
    if (!cardId) {
      console.warn('卡片缺少 manifest.id，跳过');
      return;
    }

    if (module.default) {
      const CardClass = module.default;
      
      // 检查卡片类是否完整
      if (typeof CardClass.prototype.getDefaultConfig === 'function' && 
          typeof CardClass.prototype.getManifest === 'function') {
        
        this._cards.set(cardId, {
          id: cardId,
          class: CardClass,
          manifest: module.manifest
        });
        
        console.log(`✅ 成功注册卡片: ${cardId}`);
      } else {
        console.warn(`卡片 ${cardId} 接口不完整，跳过`);
      }
    } else {
      console.warn(`卡片 ${cardId} 缺少默认导出，跳过`);
    }
  }

  // === 核心API ===
  getCard(cardId) {
    return this._cards.get(cardId);
  }

  getAllCards() {
    return Array.from(this._cards.values()).map(item => ({
      ...item.manifest,
      id: item.id
    }));
  }

  getCardClass(cardId) {
    const card = this._cards.get(cardId);
    return card ? card.class : null;
  }

  createCardInstance(cardId) {
    const CardClass = this.getCardClass(cardId);
    return CardClass ? new CardClass() : null;
  }

  getCardManifest(cardId) {
    const card = this._cards.get(cardId);
    return card ? card.manifest : null;
  }
}

// 创建全局卡片注册表实例
const cardRegistry = new CardRegistry();

// 自动初始化
cardRegistry.initialize();

export { cardRegistry, CardRegistry };