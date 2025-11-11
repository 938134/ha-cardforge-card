// src/core/entity-manager.js
class EntityManager {
  static _favoriteEntities = new Set();

  static init() {
    this._loadFavorites();
  }

  static _loadFavorites() {
    try {
      const stored = localStorage.getItem('cardforge-favorite-entities');
      if (stored) {
        const favorites = JSON.parse(stored);
        favorites.forEach(entityId => this._favoriteEntities.add(entityId));
      }
    } catch (error) {
      console.warn('加载收藏实体失败:', error);
    }
  }

  static _saveFavorites() {
    try {
      const favorites = Array.from(this._favoriteEntities);
      localStorage.setItem('cardforge-favorite-entities', JSON.stringify(favorites));
    } catch (error) {
      console.warn('保存收藏实体失败:', error);
    }
  }

  // 获取实体信息
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
      icon: entity.attributes?.icon
    };
  }

  // 验证实体
  static validateEntity(hass, entityId, requirement = {}) {
    if (!entityId || !hass?.states) {
      return { isValid: false, reason: '实体ID为空' };
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return { isValid: false, reason: '实体不存在' };
    }

    const domain = entityId.split('.')[0];
    if (requirement.domains && !requirement.domains.includes(domain)) {
      return { 
        isValid: false, 
        reason: `实体类型应为 ${requirement.domains.join(' 或 ')}，实际为 ${domain}` 
      };
    }

    return { isValid: true, entity };
  }

  // 收藏管理
  static addToFavorites(entityId) {
    this._favoriteEntities.add(entityId);
    this._saveFavorites();
  }

  static removeFromFavorites(entityId) {
    this._favoriteEntities.delete(entityId);
    this._saveFavorites();
  }

  static isFavorite(entityId) {
    return this._favoriteEntities.has(entityId);
  }

  static getFavorites() {
    return Array.from(this._favoriteEntities);
  }
}

// 初始化
EntityManager.init();

export { EntityManager };
