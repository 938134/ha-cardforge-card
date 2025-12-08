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
    // 卡片模块路径映射 - 使用函数包装动态导入
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
        if (module.default && typeof module.default === 'function') {
          // 从default导出获取卡片类
          const CardClass = module.default;
          const cardId = this._extractCardId(CardClass);
          
          if (cardId) {
            this.registerCard(cardId, CardClass);
          }
        } else if (module.card) {
          // 兼容旧的导出方式
          const card = module.card;
          if (card.id && card.template) {
            // 转换为新的卡片类
            const CardClass = this._convertLegacyCard(card);
            this.registerCard(card.id, CardClass);
          }
        }
      } catch (error) {
        console.warn(`卡片加载失败:`, error);
      }
    }
  }

  /**
   * 从卡片类提取ID
   */
  _extractCardId(CardClass) {
    // 尝试从静态属性获取
    if (CardClass.meta?.id) {
      return CardClass.meta.id;
    }
    
    // 尝试从类名推断
    const className = CardClass.name;
    if (className.endsWith('Card')) {
      return className.replace('Card', '').toLowerCase();
    }
    
    // 尝试从文件名推断
    const importPath = CardClass.toString().match(/from\s+['"]([^'"]+)['"]/);
    if (importPath) {
      const path = importPath[1];
      const match = path.match(/\/([^/]+)\.js$/);
      if (match) {
        return match[1].replace('-card', '');
      }
    }
    
    return null;
  }

  /**
   * 转换旧版卡片定义
   */
  _convertLegacyCard(legacyCard) {
    // 这是一个简化的转换，实际需要根据旧版卡片结构调整
    class ConvertedCard extends HTMLElement {
      static get meta() {
        return legacyCard.meta || {
          name: legacyCard.id || '未知卡片',
          description: '转换自旧版卡片',
          icon: '🔄',
          category: '其他'
        };
      }

      static get schema() {
        return legacyCard.schema || {};
      }

      static get blocksConfig() {
        return legacyCard.blockType ? {
          type: legacyCard.blockType,
          blocks: legacyCard.presetBlocks || {}
        } : null;
      }

      connectedCallback() {
        this.render();
      }

      setConfig(config) {
        this.config = config;
        this.render();
      }

      set hass(value) {
        this._hass = value;
        this.render();
      }

      get hass() {
        return this._hass;
      }

      render() {
        if (!this.config || !this.hass) return;
        
        try {
          const template = legacyCard.template(this.config, { hass: this.hass });
          const styles = legacyCard.styles ? legacyCard.styles(this.config) : '';
          
          this.innerHTML = `
            <style>${styles}</style>
            ${template}
          `;
        } catch (error) {
          console.error('卡片渲染失败:', error);
          this.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
            卡片渲染失败: ${error.message}
          </div>`;
        }
      }

      getCardSize() {
        return legacyCard.layout?.recommendedSize || 3;
      }
    }

    return ConvertedCard;
  }

  /**
   * 注册卡片类型
   */
  registerCard(cardId, CardClass, meta = {}) {
    if (this.cards.has(cardId)) {
      console.warn(`卡片 ${cardId} 已存在，将被覆盖`);
    }

    // 从卡片类提取元数据
    const cardMeta = {
      id: cardId,
      name: meta.name || CardClass.meta?.name || cardId,
      description: meta.description || CardClass.meta?.description || '',
      icon: meta.icon || CardClass.meta?.icon || 'mdi:card-text-outline',
      category: meta.category || CardClass.meta?.category || '通用',
      tags: meta.tags || CardClass.meta?.tags || [],
      recommendedSize: meta.recommendedSize || CardClass.meta?.recommendedSize || 1,
      ...meta
    };

    this.cards.set(cardId, { 
      CardClass, 
      meta: cardMeta,
      schema: CardClass.schema || {},
      blocksConfig: CardClass.blocksConfig || null
    });
    
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
      id: item.meta.id,
      name: item.meta.name,
      description: item.meta.description,
      icon: item.meta.icon,
      category: item.meta.category,
      tags: item.meta.tags,
      recommendedSize: item.meta.recommendedSize,
      hasSchema: !!item.schema && Object.keys(item.schema).length > 0,
      hasBlocks: !!item.blocksConfig
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
      card_type: userConfig.card_type || 'clock',
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
    
    return cardDef.schema || null;
  }

  /**
   * 获取卡片块配置
   */
  getCardBlocksConfig(cardId) {
    const cardDef = this.getCard(cardId);
    if (!cardDef) return null;
    
    return cardDef.blocksConfig || null;
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
