// ha-cardforge-card/managers/entity.js
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

  // 获取默认实体配置
  static getDefaultEntities(plugin, existingEntities = {}) {
    const defaults = {
      time: 'sensor.time',
      date: 'sensor.date'
    };
    
    if (plugin.requiresWeek) {
      defaults.week = 'sensor.xing_qi';
    }
    
    if (plugin.category === 'weather') {
      defaults.weather = 'weather.home';
    }
    
    if (plugin.id === 'clock-lunar') {
      defaults.lunar = 'sensor.lunar_date';
    }
    
    return { ...defaults, ...existingEntities };
  }

  // UI 渲染方法
  static renderEntityConfig(hass, entities, onEntityChanged) {
    return `
      <div class="entity-row">
        <div class="entity-label">时间实体</div>
        <ha-entity-picker
          .hass="${hass}"
          .value="${entities.time || ''}"
          @value-changed="${(e) => onEntityChanged('time', e.detail.value)}"
          allow-custom-entity
        ></ha-entity-picker>
        <ha-icon-button 
          .path="${entities.time ? 'mdi:check-circle' : 'mdi:alert-circle'}"
          .style="color: ${entities.time ? 'var(--success-color)' : 'var(--warning-color)'}"
        ></ha-icon-button>
      </div>

      <div class="entity-row">
        <div class="entity-label">日期实体</div>
        <ha-entity-picker
          .hass="${hass}"
          .value="${entities.date || ''}"
          @value-changed="${(e) => onEntityChanged('date', e.detail.value)}"
          allow-custom-entity
        ></ha-entity-picker>
        <ha-icon-button 
          .path="${entities.date ? 'mdi:check-circle' : 'mdi:alert-circle'}"
          .style="color: ${entities.date ? 'var(--success-color)' : 'var(--warning-color)'}"
        ></ha-icon-button>
      </div>

      <div class="entity-row">
        <div class="entity-label">星期实体</div>
        <ha-entity-picker
          .hass="${hass}"
          .value="${entities.week || ''}"
          @value-changed="${(e) => onEntityChanged('week', e.detail.value)}"
          allow-custom-entity
        ></ha-entity-picker>
        <ha-icon-button 
          .path="${entities.week ? 'mdi:check-circle' : 'mdi:information-outline'}"
          .style="color: ${entities.week ? 'var(--success-color)' : 'var(--disabled-text-color)'}"
        ></ha-icon-button>
      </div>

      <div class="entity-row">
        <div class="entity-label">天气实体</div>
        <ha-entity-picker
          .hass="${hass}"
          .value="${entities.weather || ''}"
          @value-changed="${(e) => onEntityChanged('weather', e.detail.value)}"
          allow-custom-entity
        ></ha-entity-picker>
        <ha-icon-button 
          .path="${entities.weather ? 'mdi:check-circle' : 'mdi:information-outline'}"
          .style="color: ${entities.weather ? 'var(--success-color)' : 'var(--disabled-text-color)'}"
        ></ha-icon-button>
      </div>

      <div class="entity-row">
        <div class="entity-label">农历实体</div>
        <ha-entity-picker
          .hass="${hass}"
          .value="${entities.lunar || ''}"
          @value-changed="${(e) => onEntityChanged('lunar', e.detail.value)}"
          allow-custom-entity
        ></ha-entity-picker>
        <ha-icon-button 
          .path="${entities.lunar ? 'mdi:check-circle' : 'mdi:information-outline'}"
          .style="color: ${entities.lunar ? 'var(--success-color)' : 'var(--disabled-text-color)'}"
        ></ha-icon-button>
      </div>
    `;
  }
}

// 初始化
EntityManager.init();
window.EntityManager = EntityManager;

export { EntityManager };