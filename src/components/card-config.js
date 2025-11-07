// src/components/card-config.js
export class CardConfig {
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
        { type: 'boolean', key: 'show_seconds', label: '显示秒针', default: true }
      ]
    }
  };

  static getCardConfig(cardType) {
    return this.cardConfigs[cardType] || this.cardConfigs['time-week'];
  }

  static getAllCardConfigs() {
    return Object.entries(this.cardConfigs).map(([type, config]) => ({
      type,
      ...config
    }));
  }
}

window.CardConfig = CardConfig;