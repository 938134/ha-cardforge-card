// src/core/entity-manager.js
export class EntityManager {
    constructor() {
      this.favorites = new Set();
      this._loadFavorites();
    }
    
    _loadFavorites() {
      try {
        const stored = localStorage.getItem('cardforge-favorite-entities');
        if (stored) {
          const favorites = JSON.parse(stored);
          favorites.forEach(entityId => this.favorites.add(entityId));
        }
      } catch (error) {
        console.warn('加载收藏实体失败:', error);
      }
    }
    
    _saveFavorites() {
      try {
        const favorites = Array.from(this.favorites);
        localStorage.setItem('cardforge-favorite-entities', JSON.stringify(favorites));
      } catch (error) {
        console.warn('保存收藏实体失败:', error);
      }
    }
    
    // 实体操作
    validateEntity(hass, entityId, expectedType = null) {
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
    
    filterEntities(hass, filters = {}) {
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
    
    getEntityInfo(hass, entityId) {
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
    
    // 智能推荐
    getRecommendedEntities(hass, requirements) {
      if (!hass?.states || !requirements) return {};
      
      const recommendations = {};
      
      if (requirements.required) {
        requirements.required.forEach(req => {
          const suggested = this._suggestEntity(hass, req);
          if (suggested) recommendations[req.key] = suggested;
        });
      }
      
      return recommendations;
    }
    
    _suggestEntity(hass, requirement) {
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
      const favorite = candidates.find(entityId => this.favorites.has(entityId));
      if (favorite) return favorite;
      
      // 根据实体名称智能匹配
      const smartMatch = this._smartMatchEntity(candidates, requirement.key);
      if (smartMatch) return smartMatch;
      
      return candidates[0] || null;
    }
    
    _smartMatchEntity(candidates, requirementKey) {
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
    addToFavorites(entityId) {
      this.favorites.add(entityId);
      this._saveFavorites();
    }
    
    removeFromFavorites(entityId) {
      this.favorites.delete(entityId);
      this._saveFavorites();
    }
    
    isFavorite(entityId) {
      return this.favorites.has(entityId);
    }
    
    getFavorites() {
      return Array.from(this.favorites);
    }
    
    // 工具方法
    getDefaultEntities(plugin, existingEntities = {}) {
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
  }