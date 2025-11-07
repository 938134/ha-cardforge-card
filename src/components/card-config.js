// src/components/card-config.js
export class CardConfig {
  // 卡片配置元数据 - 只保留三个时间卡片
  static cardConfigs = {
    'time-week': {
      name: '时间星期卡片',
      icon: '⏰',
      description: '垂直布局的时间星期卡片',
      category: 'time',
      fields: [
        { type: 'entity', key: 'entities.time', label: '时间实体', default: 'sensor.time' },
        { type: 'entity', key: 'entities.date', label: '日期实体', default: 'sensor.date' },
        { type: 'entity', key: 'entities.week', label: '星期实体', default: 'sensor.xing_qi' }
      ]
    },
    'time': {
      name: '时间卡片', 
      icon: '🕒',
      description: '水平布局的时间日期卡片',
      category: 'time',
      fields: [
        { type: 'entity', key: 'entities.time', label: '时间实体', default: 'sensor.time' },
        { type: 'entity', key: 'entities.date', label: '日期实体', default: 'sensor.date' },
        { type: 'entity', key: 'entities.week', label: '星期实体', default: 'sensor.xing_qi' }
      ]
    },
    'clock-lunar': {
      name: '时钟农历卡片',
      icon: '🌙',
      description: '模拟时钟和农历信息',
      category: 'time',
      fields: [
        { type: 'entity', key: 'entities.time', label: '时间实体', default: 'sensor.time' },
        { type: 'entity', key: 'entities.date', label: '日期实体', default: 'sensor.date' },
        { type: 'entity', key: 'entities.lunar', label: '农历实体', default: 'sensor.nong_li' },
        { type: 'boolean', key: 'show_seconds', label: '显示秒针', default: true },
        { 
          type: 'select', 
          key: 'tap_action.action', 
          label: '点击动作', 
          default: 'more-info',
          options: [
            { value: 'none', label: '无动作' },
            { value: 'more-info', label: '显示详情' },
            { value: 'navigate', label: '导航' }
          ]
        }
      ]
    }
  };
  
  // 自动注册新卡片配置
  static registerCard(type, config) {
    this.cardConfigs[type] = config;
  }
  
  // 获取卡片配置
  static getCardConfig(cardType) {
    return this.cardConfigs[cardType] || {
      name: cardType,
      icon: '❓',
      description: '未知卡片类型',
      category: 'other',
      fields: []
    };
  }
  
  // 获取所有卡片配置
  static getAllCardConfigs() {
    return Object.entries(this.cardConfigs).map(([type, config]) => ({
      type,
      ...config
    }));
  }
  
  // 根据类别筛选卡片
  static getCardsByCategory(category) {
    return this.getAllCardConfigs().filter(card => card.category === category);
  }
}

window.CardConfig = CardConfig;