export class CardRegistry {
    static _initialized = false;
    static _cards = new Map();
    static _categories = new Map();
  
    static async initialize() {
      if (this._initialized) return;
  
      // 注册分类
      this._registerCategories();
      
      // 动态加载卡片配置
      await this._loadCardConfigs();
      
      this._initialized = true;
    }
  
    static _registerCategories() {
      const categories = {
        'time': { name: '时间日期', icon: '⏰', color: '#4CAF50' },
        'weather': { name: '天气环境', icon: '☀️', color: '#FF9800' },
        'device': { name: '设备状态', icon: '💡', color: '#2196F3' },
        'person': { name: '人员信息', icon: '👤', color: '#9C27B0' },
        'media': { name: '媒体控制', icon: '🎵', color: '#E91E63' },
        'other': { name: '其他', icon: '📦', color: '#607D8B' }
      };
  
      Object.entries(categories).forEach(([id, config]) => {
        this._categories.set(id, config);
      });
    }
  
    static async _loadCardConfigs() {
      const cardModules = [
        './cards/time-week-card.js',
        './cards/time-card.js',
        './cards/clock-lunar-card.js'
      ];
  
      for (const modulePath of cardModules) {
        try {
          const module = await import(modulePath);
          const cardConfig = module.default;
          
          if (this.validateCardConfig(cardConfig)) {
            this._cards.set(cardConfig.type, cardConfig);
          }
        } catch (error) {
          console.warn(`加载卡片配置失败 ${modulePath}:`, error);
        }
      }
    }
  
    static validateCardConfig(config) {
      const required = ['type', 'name', 'category', 'entityInterfaces'];
      return required.every(key => key in config);
    }
  
    static registerCard(config) {
      if (this.validateCardConfig(config)) {
        this._cards.set(config.type, config);
      } else {
        throw new Error('卡片配置不完整');
      }
    }
  
    static getCardConfig(cardType) {
      return this._cards.get(cardType);
    }
  
    static hasCardType(cardType) {
      return this._cards.has(cardType);
    }
  
    static getAllCards() {
      return Array.from(this._cards.values());
    }
  
    static getCardsByCategory(category) {
      return this.getAllCards().filter(card => card.category === category);
    }
  
    static getCategories() {
      return Array.from(this._categories.values());
    }
  
    static getDefaultCard() {
      const cards = this.getAllCards();
      return cards.length > 0 ? cards[0] : null;
    }
  
    static searchCards(query) {
      const lowerQuery = query.toLowerCase();
      return this.getAllCards().filter(card => 
        card.name.toLowerCase().includes(lowerQuery) ||
        card.description.toLowerCase().includes(lowerQuery) ||
        card.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
  }
  
  window.CardRegistry = CardRegistry;