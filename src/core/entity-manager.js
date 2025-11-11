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

  // 验证实体 - 简化版本，只检查实体是否存在
  static validateEntity(hass, entityId, requirement = {}) {
    if (!entityId) {
      return { 
        isValid: !requirement.required, 
        reason: requirement.required ? '必须选择实体' : '实体可选' 
      };
    }

    if (!hass || !hass.states) {
      return { isValid: false, reason: 'Home Assistant 未连接' };
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return { isValid: false, reason: '实体不存在' };
    }

    return { isValid: true, reason: '实体有效' };
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

  // 批量验证 - 简化版本
  static validateEntityConfig(hass, entityConfig, pluginRequirements) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      entities: {}
    };

    if (!pluginRequirements?.required) return results;

    // 简化验证：只检查实体是否存在
    pluginRequirements.required.forEach(req => {
      const entityId = entityConfig[req.key];
      const validation = this.validateEntity(hass, entityId, req);

      if (!validation.isValid) {
        results.valid = false;
        results.errors.push({
          key: req.key,
          description: req.description,
          reason: validation.reason,
          entityId: entityId
        });
      } else if (entityId) {
        results.entities[req.key] = hass.states[entityId];
      }
    });

    return results;
  }
}

// 初始化
EntityManager.init();

export { EntityManager };