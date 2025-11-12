// src/core/entity-manager.js
class EntityManager {
  static _favoriteEntities = new Set();
  static _subscribers = new Set();

  static init() {
    this._loadFavorites();
  }

  // 订阅实体变化
  static subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  // 发布变化通知
  static _notifySubscribers(event, data) {
    this._subscribers.forEach(callback => callback(event, data));
  }

  // 优雅的实体获取
  static getEntityInfo(hass, entityId) {
    if (!entityId || !hass?.states) return null;
    
    const entity = hass.states[entityId];
    if (!entity) return null;

    return {
      entity_id: entityId,
      state: entity.state,
      attributes: entity.attributes,
      domain: entityId.split('.')[0],
      friendly_name: entity.attributes?.friendly_name || entityId,
      unit: entity.attributes?.unit_of_measurement,
      icon: entity.attributes?.icon,
      last_changed: entity.last_changed,
      last_updated: entity.last_updated
    };
  }

  // 智能实体验证
  static validateEntity(hass, entityId, requirement = {}) {
    const result = {
      isValid: false,
      reason: '',
      suggestions: []
    };

    if (!entityId) {
      result.reason = requirement.required ? '必须选择实体' : '实体可选';
      result.isValid = !requirement.required;
      return result;
    }

    if (!hass?.states) {
      result.reason = 'Home Assistant 未连接';
      return result;
    }

    const entity = hass.states[entityId];
    if (!entity) {
      result.reason = '实体不存在';
      // 提供智能建议
      result.suggestions = this._getEntitySuggestions(hass, entityId, requirement);
      return result;
    }

    // 可选：基于需求类型进行验证
    if (requirement.type && !this._validateEntityType(entity, requirement.type)) {
      result.reason = `实体类型不匹配，期望: ${requirement.type}`;
      result.suggestions = this._getSimilarEntities(hass, requirement.type);
      return result;
    }

    result.isValid = true;
    result.reason = '实体有效';
    return result;
  }

  static _getEntitySuggestions(hass, entityId, requirement) {
    const suggestions = [];
    const domains = requirement.type ? [requirement.type] : Object.keys(hass.states)
      .map(id => id.split('.')[0])
      .filter((domain, index, arr) => arr.indexOf(domain) === index);

    domains.forEach(domain => {
      const similar = Object.keys(hass.states).find(id => 
        id.includes(entityId.split('.').pop()) && id.startsWith(domain)
      );
      if (similar) suggestions.push(similar);
    });

    return suggestions.slice(0, 3);
  }

  // 收藏管理
  static addToFavorites(entityId) {
    this._favoriteEntities.add(entityId);
    this._saveFavorites();
    this._notifySubscribers('favorites-changed', { entityId, action: 'added' });
  }

  static removeFromFavorites(entityId) {
    this._favoriteEntities.delete(entityId);
    this._saveFavorites();
    this._notifySubscribers('favorites-changed', { entityId, action: 'removed' });
  }

  static isFavorite(entityId) {
    return this._favoriteEntities.has(entityId);
  }

  static getFavorites() {
    return Array.from(this._favoriteEntities);
  }
}
