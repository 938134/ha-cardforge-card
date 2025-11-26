// src/core/card-registry.js
class CardRegistry {
  constructor() {
    this.cards = new Map();
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
    const cardFiles = {
      'poetry-card': () => import('../cards/poetry-card.js'),
      'welcome-card': () => import('../cards/welcome-card.js'),
      'oil-price-card': () => import('../cards/oil-price-card.js'),
      'clock-card': () => import('../cards/clock-card.js'),
    };

    for (const [cardId, importFn] of Object.entries(cardFiles)) {
      try {
        const module = await importFn();
        this._registerCardModule(cardId, module);
      } catch (error) {
        console.warn(`⚠️ 加载卡片 ${cardId} 失败:`, error);
      }
    }
  }

  _registerCardModule(cardId, module) {
    if (module.default && typeof module.default.getDefaultConfig === 'function') {
      const card = module.default;
      
      this.cards.set(cardId, {
        id: cardId,
        manifest: {
          id: card.manifest?.id || cardId,
          name: card.manifest?.name || this._formatCardName(cardId),
          description: card.manifest?.description || `${this._formatCardName(cardId)}卡片`,
          icon: card.manifest?.icon || '📄',
          category: card.manifest?.category || 'general',
          config_schema: card.manifest?.config_schema || {}
        },
        getDefaultConfig: card.getDefaultConfig ? card.getDefaultConfig.bind(card) : (() => ({})),
        getManifest: card.getManifest ? card.getManifest.bind(card) : (() => ({})),
        render: card.prototype?.render ? card.prototype.render.bind(card) : (() => ({ template: '', styles: '' }))
      });
    } else {
      console.warn(`卡片 ${cardId} 格式不正确，跳过`);
    }
  }

  _formatCardName(cardId) {
    return cardId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(' Card', '');
  }

  // === 卡片管理 API ===
  getCard(cardId) {
    return this.cards.get(cardId) || this.cards.values().next().value;
  }

  getAllCards() {
    return Array.from(this.cards.values()).map(item => ({
      ...item.manifest,
      id: item.id
    }));
  }

  getCardClass(cardId) {
    const card = this.cards.get(cardId);
    return card ? card.class : null;
  }

  createCardInstance(cardId) {
    const CardClass = this.getCardClass(cardId);
    return CardClass ? new CardClass() : null;
  }

  getCardManifest(cardId) {
    const card = this.cards.get(cardId);
    return card ? card.manifest : null;
  }

  getCardDefaultConfig(cardId) {
    const card = this.cards.get(cardId);
    if (card && typeof card.getDefaultConfig === 'function') {
      return card.getDefaultConfig();
    }
    return {};
  }
}

// 创建全局卡片注册表实例
const cardRegistry = new CardRegistry();

// 自动初始化
cardRegistry.initialize();

export { cardRegistry, CardRegistry };