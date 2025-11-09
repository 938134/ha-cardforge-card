// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // 必需方法 - 子类必须实现
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // 可选方法 - 实体需求定义
  getEntityRequirements() {
    return [];
  }

  // 工具方法
  _getEntityState(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _formatTime(timeStr) {
    if (!timeStr) return '00:00';
    return timeStr.split(':').slice(0, 2).join(':');
  }

  _formatDate(dateStr) {
    if (!dateStr) return '2000-01-01';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  }
}