// src/core/entity-manager.js
class EntityManager {
  static validateEntity(hass, entityId) {
    if (!entityId) return { isValid: false, reason: '未选择实体' };
    if (!hass?.states?.[entityId]) return { isValid: false, reason: '实体不存在' };
    return { isValid: true, reason: '实体有效' };
  }

  static getEntityState(hass, entityId) {
    return hass?.states?.[entityId] || null;
  }

  static createEntityPicker(hass, value, onChange) {
    return {
      type: 'entity-picker',
      hass,
      value,
      onChange,
      config: { allowCustomEntity: true }
    };
  }
}

export { EntityManager };