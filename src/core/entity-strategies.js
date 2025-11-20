// src/core/entity-strategies.js
export class EntityStrategies {
  static STRATEGY_TYPES = {
    FREE_LAYOUT: 'free_layout',
    STRUCTURED: 'structured', 
    STATELESS: 'stateless'
  };

  createStrategy(strategyType, manifest) {
    switch (strategyType) {
      case this.STRATEGY_TYPES.FREE_LAYOUT:
        return new FreeLayoutStrategy(manifest);
      case this.STRATEGY_TYPES.STRUCTURED:
        return new StructuredStrategy(manifest);
      case this.STRATEGY_TYPES.STATELESS:
        return new StatelessStrategy(manifest);
      default:
        return new StatelessStrategy(manifest);
    }
  }

  detectStrategy(manifest) {
    if (!manifest) return this.STRATEGY_TYPES.STATELESS;

    if (manifest.layout_type === 'free' || manifest.allow_custom_entities) {
      return this.STRATEGY_TYPES.FREE_LAYOUT;
    }

    if (manifest.entity_requirements && Object.keys(manifest.entity_requirements).length > 0) {
      return this.STRATEGY_TYPES.STRUCTURED;
    }

    return this.STRATEGY_TYPES.STATELESS;
  }
}

// 策略基类
class BaseStrategy {
  constructor(manifest) {
    this.manifest = manifest;
  }

  process(entities, hass) {
    throw new Error('必须实现 process 方法');
  }

  validate(entities) {
    throw new Error('必须实现 validate 方法');
  }

  processSingleEntity(key, value, type, config) {
    throw new Error('必须实现 processSingleEntity 方法');
  }
}

class FreeLayoutStrategy extends BaseStrategy {
  process(entities, hass) {
    const blocks = this._extractContentBlocks(entities);
    const enrichedBlocks = blocks.map(block => this._enrichBlockData(block, hass));
    
    return {
      strategy: 'free_layout',
      blocks: enrichedBlocks,
      layout: this._extractLayoutConfig(entities),
      totalBlocks: blocks.length
    };
  }

  validate(entities) {
    const blocks = this._extractContentBlocks(entities);
    return {
      valid: blocks.length > 0,
      errors: blocks.length === 0 ? ['请至少添加一个内容块'] : [],
      warnings: []
    };
  }

  processSingleEntity(key, value, type, config) {
    return {
      key,
      value,
      type: type || 'text',
      config,
      role: this._detectRole(key)
    };
  }

  _extractContentBlocks(entities) {
    const blocks = [];
    
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        
        try {
          blocks.push({
            id: blockId,
            type: value,
            content: entities[blockId] || '',
            config: entities[`${blockId}_config`] ? JSON.parse(entities[`${blockId}_config`]) : {},
            order: parseInt(blockId.split('_').pop()) || 0,
            role: this._detectRole(blockId)
          });
        } catch (e) {
          console.warn(`解析内容块配置失败: ${blockId}`, e);
        }
      }
    });
    
    return blocks.sort((a, b) => a.order - b.order);
  }

  _enrichBlockData(block, hass) {
    // 为实体类型块丰富实时数据
    if (block.type !== 'text' && block.content && hass?.states[block.content]) {
      const entity = hass.states[block.content];
      block.realTimeData = {
        state: entity.state,
        attributes: entity.attributes,
        lastChanged: entity.last_changed,
        lastUpdated: entity.last_updated
      };
    }
    
    return block;
  }

  _extractLayoutConfig(entities) {
    return {
      columns: entities._layout_columns || 3,
      style: entities._layout_style || 'grid',
      spacing: entities._layout_spacing || 'normal'
    };
  }

  _detectRole(key) {
    if (key === 'title' || key === 'subtitle') return 'header';
    if (key === 'footer') return 'footer';
    return 'content';
  }
}

class StructuredStrategy extends BaseStrategy {
  process(entities, hass) {
    const requirements = this.manifest.entity_requirements || {};
    const processed = {};

    Object.keys(requirements).forEach(key => {
      if (entities[key]) {
        const entityState = hass?.states[entities[key]];
        processed[key] = {
          value: entities[key],
          state: entityState?.state || entities[key],
          attributes: entityState?.attributes || {},
          ...requirements[key]
        };
      }
    });

    return {
      strategy: 'structured',
      entities: processed,
      requirementCount: Object.keys(requirements).length,
      configuredCount: Object.keys(processed).length
    };
  }

  validate(entities) {
    const requirements = this.manifest.entity_requirements || {};
    const errors = [];
    const warnings = [];

    Object.entries(requirements).forEach(([key, req]) => {
      if (req.required && (!entities[key] || entities[key].trim() === '')) {
        errors.push(`必需字段 "${req.name}" 未配置`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  processSingleEntity(key, value, type, config) {
    const requirement = this.manifest.entity_requirements?.[key];
    
    return {
      key,
      value,
      type: requirement?.type || 'entity',
      config,
      name: requirement?.name || key,
      required: requirement?.required || false
    };
  }
}

class StatelessStrategy extends BaseStrategy {
  process(entities, hass) {
    return {
      strategy: 'stateless',
      message: '使用内置数据源',
      timestamp: new Date().toISOString(),
      entities: entities || {}
    };
  }

  validate(entities) {
    return { valid: true, errors: [], warnings: [] };
  }

  processSingleEntity(key, value, type, config) {
    return {
      key,
      value,
      type: type || 'text',
      config
    };
  }
}

// 导出单例
export const entityStrategies = new EntityStrategies();