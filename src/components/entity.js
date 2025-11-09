// ha-cardforge-card/components/entity.js
class EntityManager {
  static _favoriteEntities = new Set();
  static _entityCache = new Map();

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
      icon: entity.attributes?.icon,
      device_class: entity.attributes?.device_class
    };
  }

  // 验证实体
  static validateEntity(hass, entityId, expectedType = null) {
    if (!entityId || !hass?.states) {
      return { isValid: false, reason: '实体ID为空' };
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return { isValid: false, reason: '实体不存在' };
    }

    const domain = entityId.split('.')[0];
    if (expectedType && domain !== expectedType) {
      return { 
        isValid: false, 
        reason: `类型不匹配: 期望 ${expectedType}, 实际 ${domain}` 
      };
    }

    return { isValid: true, entity };
  }

  // 过滤实体
  static filterEntities(hass, filters = {}) {
    if (!hass?.states) return [];

    return Object.keys(hass.states).filter(entityId => {
      const domain = entityId.split('.')[0];
      const entity = hass.states[entityId];
      
      if (filters.domains) {
        const domains = Array.isArray(filters.domains) ? filters.domains : [filters.domains];
        if (!domains.includes(domain)) return false;
      }

      if (filters.excludeDomains) {
        const excludeDomains = Array.isArray(filters.excludeDomains) ? 
          filters.excludeDomains : [filters.excludeDomains];
        if (excludeDomains.includes(domain)) return false;
      }

      if (filters.deviceClass && domain === 'sensor') {
        if (entity.attributes?.device_class !== filters.deviceClass) return false;
      }

      if (filters.state) {
        if (entity.state === 'unavailable' || entity.state === 'unknown') return false;
      }

      return true;
    });
  }

  // 获取推荐实体
  static getRecommendedEntities(hass, styleRequirements) {
    if (!hass?.states || !styleRequirements) return {};

    const recommendations = {};

    if (styleRequirements.required) {
      styleRequirements.required.forEach(req => {
        const suggested = this._suggestEntity(hass, req);
        if (suggested) recommendations[req.key] = suggested;
      });
    }

    return recommendations;
  }

  static _suggestEntity(hass, requirement) {
    const filters = { domains: requirement.type, state: true };

    // 根据需求类型设置特定过滤器
    switch (requirement.key) {
      case 'time':
        filters.domains = ['sensor'];
        filters.deviceClass = 'timestamp';
        break;
      case 'date':
        filters.domains = ['sensor'];
        filters.deviceClass = 'date';
        break;
      case 'week':
        filters.domains = ['sensor'];
        // 星期实体通常有特定命名模式
        break;
      case 'temperature':
        filters.domains = ['sensor', 'weather'];
        filters.deviceClass = 'temperature';
        break;
      case 'weather':
        filters.domains = ['weather'];
        break;
      case 'lunar':
        filters.domains = ['sensor'];
        // 农历实体通常有特定命名
        break;
    }

    const candidates = this.filterEntities(hass, filters);

    // 优先选择收藏的实体
    const favorite = candidates.find(entityId => this._favoriteEntities.has(entityId));
    if (favorite) return favorite;

    // 根据实体名称智能匹配
    const smartMatch = this._smartMatchEntity(candidates, requirement.key);
    if (smartMatch) return smartMatch;

    // 选择状态正常的实体
    const valid = candidates.find(entityId => {
      const validation = this.validateEntity(hass, entityId, requirement.type);
      return validation.isValid;
    });

    return valid || candidates[0] || null;
  }

  static _smartMatchEntity(candidates, requirementKey) {
    const patterns = {
      time: ['time', 'current_time', 'datetime'],
      date: ['date', 'current_date', 'today'],
      week: ['week', 'weekday', 'xing_qi', 'zhou'],
      weather: ['weather', 'climate', 'forecast'],
      temperature: ['temperature', 'temp', 'wendu'],
      lunar: ['lunar', 'nongli', 'chinese_calendar']
    };

    const pattern = patterns[requirementKey];
    if (!pattern) return null;

    for (const entityId of candidates) {
      const lowerEntityId = entityId.toLowerCase();
      for (const p of pattern) {
        if (lowerEntityId.includes(p)) {
          return entityId;
        }
      }
    }

    return null;
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

  // 批量验证
  static validateEntityConfig(hass, entityConfig, styleRequirements) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      entities: {}
    };

    if (!styleRequirements?.required) return results;

    // 验证必需实体
    styleRequirements.required.forEach(req => {
      const entityId = entityConfig[req.key];
      const validation = this.validateEntity(hass, entityId, req.type);

      if (!validation.isValid) {
        results.valid = false;
        results.errors.push({
          key: req.key,
          description: req.description,
          reason: validation.reason,
          entityId: entityId
        });
      } else {
        results.entities[req.key] = validation.entity;
      }
    });

    return results;
  }

  // 获取实体域列表
  static getEntityDomains(hass) {
    if (!hass?.states) return [];
    
    const domains = new Set();
    Object.keys(hass.states).forEach(entityId => {
      const domain = entityId.split('.')[0];
      domains.add(domain);
    });
    
    return Array.from(domains).sort();
  }

  // 获取域内的实体
  static getEntitiesByDomain(hass, domain) {
    if (!hass?.states) return [];
    
    return Object.keys(hass.states).filter(entityId => 
      entityId.split('.')[0] === domain
    );
  }

  // 实体搜索
  static searchEntities(hass, query, domain = null) {
    if (!hass?.states) return [];
    
    const searchTerm = query.toLowerCase();
    return Object.keys(hass.states).filter(entityId => {
      const entity = hass.states[entityId];
      const matchesDomain = !domain || entityId.split('.')[0] === domain;
      const matchesQuery = entityId.toLowerCase().includes(searchTerm) ||
                          entity.attributes?.friendly_name?.toLowerCase().includes(searchTerm);
      
      return matchesDomain && matchesQuery;
    });
  }

  // 获取实体统计
  static getEntityStats(hass) {
    if (!hass?.states) return {};
    
    const stats = {
      total: Object.keys(hass.states).length,
      byDomain: {},
      unavailable: 0
    };
    
    Object.keys(hass.states).forEach(entityId => {
      const domain = entityId.split('.')[0];
      const entity = hass.states[entityId];
      
      // 统计域
      stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
      
      // 统计不可用实体
      if (entity.state === 'unavailable') {
        stats.unavailable++;
      }
    });
    
    return stats;
  }
}

// 初始化
EntityManager.init();
window.EntityManager = EntityManager;

export { EntityManager };