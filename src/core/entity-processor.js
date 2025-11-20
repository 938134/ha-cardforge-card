// src/core/entity-processor.js
export class EntityProcessor {
    // 从原始entities提取内容块
    static extractContentBlocks(entities) {
      const blocks = [];
      
      Object.entries(entities || {}).forEach(([key, value]) => {
        if (key.endsWith('_type')) {
          const blockId = key.replace('_type', '');
          
          const block = {
            id: blockId,
            type: this._getStringValue(value),
            content: this._getStringValue(entities[blockId] || ''),
            config: {},
            order: parseInt(this._getStringValue(entities[`${blockId}_order`])) || 0
          };
          
          // 解析配置
          const configKey = `${blockId}_config`;
          if (entities[configKey]) {
            try {
              block.config = JSON.parse(this._getStringValue(entities[configKey]));
            } catch (e) {
              console.warn(`解析内容块配置失败: ${blockId}`, e);
            }
          }
          
          blocks.push(block);
        }
      });
      
      return blocks.sort((a, b) => a.order - b.order);
    }
  
    // 增强实体数据
    static enrichEntityData(entities, hass) {
      const enriched = {};
      
      Object.entries(entities || {}).forEach(([key, value]) => {
        const stringValue = this._getStringValue(value);
        
        enriched[key] = {
          _source: stringValue,
          _isEntity: stringValue.includes('.'),
          state: stringValue,
          attributes: {}
        };
        
        // 如果是实体ID，获取实时状态
        if (stringValue.includes('.') && hass?.states?.[stringValue]) {
          const entityState = hass.states[stringValue];
          enriched[key].state = entityState.state;
          enriched[key].attributes = entityState.attributes || {};
          enriched[key].lastChanged = entityState.last_changed;
        }
      });
      
      return enriched;
    }
  
    // 实体配置验证
    static validateEntityConfig(entities, requirements) {
      const errors = [];
      const warnings = [];
  
      Object.entries(requirements || {}).forEach(([key, req]) => {
        const value = entities[key];
        
        if (req.required && (!value || this._getStringValue(value).trim() === '')) {
          errors.push(`必需字段 "${req.name}" 未配置`);
        }
        
        // 类型验证
        if (value && req.type) {
          const stringValue = this._getStringValue(value);
          
          switch (req.type) {
            case 'entity':
              if (!stringValue.includes('.')) {
                warnings.push(`"${req.name}" 可能不是有效的实体ID`);
              }
              break;
            case 'number':
              if (isNaN(parseFloat(stringValue))) {
                warnings.push(`"${req.name}" 应该包含数字值`);
              }
              break;
          }
        }
      });
  
      return { valid: errors.length === 0, errors, warnings };
    }
  
    // 获取实体显示名称
    static getEntityDisplayName(entityConfig, hass) {
      if (entityConfig.name) {
        return entityConfig.name;
      }
      
      if (entityConfig._source && hass?.states?.[entityConfig._source]) {
        return hass.states[entityConfig._source].attributes?.friendly_name || entityConfig._source;
      }
      
      return entityConfig._source || '未知实体';
    }
  
    // 获取实体图标
    static getEntityIcon(entityConfig, hass) {
      if (entityConfig.icon) {
        return entityConfig.icon;
      }
      
      if (entityConfig._source && hass?.states?.[entityConfig._source]) {
        const domain = entityConfig._source.split('.')[0];
        
        const domainIcons = {
          'light': 'mdi:lightbulb',
          'sensor': 'mdi:gauge',
          'switch': 'mdi:power',
          'climate': 'mdi:thermostat',
          'media_player': 'mdi:television',
          'person': 'mdi:account'
        };
        
        return domainIcons[domain] || 'mdi:tag';
      }
      
      return 'mdi:cog';
    }
  
    // 工具方法
    static _getStringValue(value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'object') return value._source || value.state || '';
      return String(value);
    }
  
    // 智能数据获取
    static getFlexibleValue(hass, source, defaultValue = '') {
      if (!source) return defaultValue;
      
      // 实体ID直接获取状态
      if (source.includes('.') && hass?.states?.[source]) {
        const entity = hass.states[source];
        return entity.state || defaultValue;
      }
      
      // 直接文本
      return source;
    }
  
    // 安全数值转换
    static safeParseFloat(value, defaultValue = 0) {
      if (value === null || value === undefined) return defaultValue;
      const num = parseFloat(value);
      return isNaN(num) ? defaultValue : num;
    }
  
    static safeParseInt(value, defaultValue = 0) {
      if (value === null || value === undefined) return defaultValue;
      const num = parseInt(value);
      return isNaN(num) ? defaultValue : num;
    }
  }