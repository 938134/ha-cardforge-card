// src/components/dynamic-loader.js
export class DynamicLoader {
  static cardCache = new Map();
  
  // 预加载所有卡片
  static async preloadCards() {
    try {
      // 静态导入所有卡片
      const timeWeekModule = await import('../cards/time-week-card.js');
      const timeModule = await import('../cards/time-card.js');
      const clockLunarModule = await import('../cards/clock-lunar-card.js');
      
      const cards = {
        'time-week': {
          type: 'time-week',
          name: '时间星期',
          icon: '⏰',
          description: '垂直布局的时间星期卡片',
          className: 'TimeWeekCard',
          module: timeWeekModule
        },
        'time': {
          type: 'time',
          name: '时间卡片',
          icon: '🕒',
          description: '水平布局的时间日期卡片',
          className: 'TimeCard',
          module: timeModule
        },
        'clock-lunar': {
          type: 'clock-lunar',
          name: '时钟农历',
          icon: '🌙',
          description: '模拟时钟和农历信息',
          className: 'ClockLunarCard',
          module: clockLunarModule
        }
      };
      
      // 缓存所有卡片
      Object.entries(cards).forEach(([type, card]) => {
        this.cardCache.set(type, card.module[card.className]);
      });
      
      return cards;
    } catch (error) {
      console.error('预加载卡片失败:', error);
      return {};
    }
  }
  
  // 自动发现卡片
  static async discoverCards() {
    const cards = await this.preloadCards();
    return cards;
  }
  
  // 动态加载卡片
  static async loadCard(cardType) {
    // 先从缓存获取
    if (this.cardCache.has(cardType)) {
      return this.cardCache.get(cardType);
    }
    
    throw new Error(`不支持的卡片类型: ${cardType}`);
  }
  
  // 获取卡片标签名
  static getTagName(cardType) {
    const tagMap = {
      'time-week': 'time-week-card',
      'time': 'time-card',
      'clock-lunar': 'clock-lunar-card'
    };
    
    return tagMap[cardType] || `${cardType.replace(/_/g, '-')}-card`;
  }
  
  // 获取所有可用卡片类型
  static async getAvailableCards() {
    const cards = await this.discoverCards();
    return Object.values(cards).map(card => ({
      type: card.type,
      name: card.name,
      icon: card.icon,
      description: card.description
    }));
  }
}

window.DynamicLoader = DynamicLoader;