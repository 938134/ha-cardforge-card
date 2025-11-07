// src/components/registry.js
export class CardRegistry {
    static cardTypes = {
      'standard': './cards/standard-card.js',
      'button': './cards/button-card.js'
    };
  
    static async loadCard(cardType) {
      if (!this.cardTypes[cardType]) {
        throw new Error(`不支持的卡片类型: ${cardType}`);
      }
  
      try {
        // 动态导入卡片组件
        const module = await import(this.cardTypes[cardType]);
        return module[this._getClassName(cardType)] || module.default;
      } catch (error) {
        console.error(`加载卡片 ${cardType} 失败:`, error);
        throw error;
      }
    }
  
    static _getClassName(cardType) {
      const classMap = {
        'standard': 'StandardCard',
        'button': 'ButtonCard'
      };
      return classMap[cardType] || 'StandardCard';
    }
  
    // 自动发现卡片
    static async discoverCards() {
      const cards = {};
      for (const [type, path] of Object.entries(this.cardTypes)) {
        try {
          await this.loadCard(type);
          cards[type] = path;
        } catch (error) {
          console.warn(`卡片 ${type} 加载失败:`, error);
        }
      }
      return cards;
    }
  }
  
  window.CardRegistry = CardRegistry;