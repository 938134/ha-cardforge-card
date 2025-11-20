// src/core/entity-manager.js
import { entityStrategies } from './entity-strategies.js';

export class EntityManager {
  constructor() {
    this._entities = new Map();
    this._strategy = null;
    this._hass = null;
  }

  // === 策略管理 ===
  setStrategy(strategyType, manifest) {
    this._strategy = entityStrategies.createStrategy(strategyType, manifest);
    return this._strategy;
  }

  getCurrentStrategy() {
    return this._strategy;
  }

  // === 实体数据处理 ===
  processEntities(rawEntities, hass = this._hass) {
    if (!this._strategy) {
      throw new Error('请先设置实体策略');
    }
    
    const processed = this._strategy.process(rawEntities, hass);
    this._updateEntitiesCache(processed);
    return processed;
  }

  validateEntities(rawEntities) {
    if (!this._strategy) {
      return { valid: true, errors: [], warnings: [] };
    }
    return this._strategy.validate(rawEntities);
  }

  // === 实体访问 ===
  getEntity(key) {
    return this._entities.get(key);
  }

  getEntityDisplayData(entityKey) {
    const entity = this.getEntity(entityKey);
    if (!entity) return null;

    return {
      value: entity.value,
      displayName: this._getDisplayName(entity),
      icon: this._getEntityIcon(entity),
      state: entity.state,
      attributes: entity.attributes || {},
      type: entity.type,
      config: entity.config || {}
    };
  }

  getAllEntities() {
    return Object.fromEntries(this._entities);
  }

  // === 实体更新 ===
  updateEntity(key, value, type = 'auto', config = {}) {
    if (!this._strategy) {
      // 默认处理
      this._entities.set(key, { value, type, config });
      return this.getEntity(key);
    }

    const processed = this._strategy.processSingleEntity(key, value, type, config);
    this._entities.set(key, processed);
    return processed;
  }

  removeEntity(key) {
    return this._entities.delete(key);
  }

  clearEntities() {
    this._entities.clear();
  }

  // === Home Assistant 集成 ===
  setHass(hass) {
    this._hass = hass;
  }

  getEntityState(entityId) {
    if (!this._hass || !entityId) return null;
    return this._hass.states[entityId];
  }

  // === 私有方法 ===
  _updateEntitiesCache(processedData) {
    if (processedData.entities) {
      Object.entries(processedData.entities).forEach(([key, entity]) => {
        this._entities.set(key, entity);
      });
    }
    
    if (processedData.blocks) {
      processedData.blocks.forEach(block => {
        this._entities.set(block.id, block);
      });
    }
  }

  _getDisplayName(entity) {
    if (entity.displayName) return entity.displayName;
    if (entity.name) return entity.name;
    if (entity.value && this._hass?.states[entity.value]) {
      return this._hass.states[entity.value].attributes?.friendly_name || entity.value;
    }
    return entity.value || '未知实体';
  }

  _getEntityIcon(entity) {
    if (entity.icon) return entity.icon;
    if (entity.value && this._hass?.states[entity.value]) {
      const domain = entity.value.split('.')[0];
      const domainIcons = {
        'light': '💡', 'sensor': '📊', 'switch': '🔌', 'climate': '🌡️',
        'media_player': '📺', 'person': '👤', 'weather': '🌤️'
      };
      return domainIcons[domain] || '🏷️';
    }
    return '🔧';
  }
}

// 创建全局实例
export const entityManager = new EntityManager();