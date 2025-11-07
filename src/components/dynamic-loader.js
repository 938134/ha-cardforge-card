// src/components/dynamic-loader.js
export class DynamicLoader {
  static cardCache = new Map();
  
  // 自动发现卡片目录下的所有文件
  static async discoverCards() {
    try {
      // 只保留三个时间卡片
      const cardMap = {
        'time-week-card': { type: 'time-week', name: '时间星期', icon: '⏰', description: '垂直布局的时间星期卡片' },
        'time-card': { type: 'time', name: '时间卡片', icon: '🕒', description: '水平布局的时间日期卡片' },
        'clock-lunar-card': { type: 'clock-lunar', name: '时钟农历', icon: '🌙', description: '模拟时钟和农历信息' }
      };
      
      const cards = {};
      
      // 尝试动态加载每个卡片
      for (const [fileName, cardInfo] of Object.entries(cardMap)) {
        try {
          const module = await import(`../cards/${fileName}.js`);
          const className = Object.keys(module).find(key => 
            key.toLowerCase().includes('card') && key !== 'default'
          ) || Object.keys(module)[0];
          
          if (className) {
            cards[cardInfo.type] = {
              ...cardInfo,
              className,
              fileName: `${fileName}.js`,
              module
            };
            
            // 缓存组件类
            this.cardCache.set(cardInfo.type, module[className]);
          }
        } catch (error) {
          console.warn(`卡片 ${cardInfo.type} 加载失败:`, error);
        }
      }
      
      return cards;
    } catch (error) {
      console.error('自动发现卡片失败:', error);
      return {};
    }
  }
  
  // 动态加载卡片
  static async loadCard(cardType) {
    // 先从缓存获取
    if (this.cardCache.has(cardType)) {
      return this.cardCache.get(cardType);
    }
    
    // 自动发现并加载
    const cards = await this.discoverCards();
    if (cards[cardType]) {
      return cards[cardType].module[cards[cardType].className];
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