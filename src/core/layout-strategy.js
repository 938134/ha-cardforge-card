// src/core/layout-strategy.js
export const LAYOUT_MODES = {
    FREE: 'free',           // 自由布局模式
    ENTITY_DRIVEN: 'entity_driven'  // 实体驱动模式
  };
  
  export class LayoutStrategy {
    // 策略检测
    static detectMode(manifest) {
      if (!manifest) return LAYOUT_MODES.ENTITY_DRIVEN;
  
      // 自由布局优先检测
      if (manifest.layout_type === 'free' || manifest.allow_custom_entities) {
        return LAYOUT_MODES.FREE;
      }
  
      // 默认实体驱动
      return LAYOUT_MODES.ENTITY_DRIVEN;
    }
  
    // 获取策略信息
    static getStrategyInfo(manifest) {
      const mode = this.detectMode(manifest);
      
      const strategyConfigs = {
        [LAYOUT_MODES.FREE]: {
          name: '自由布局编辑器',
          description: '可任意添加和排列内容块，构建个性化布局',
          icon: 'mdi:view-grid-plus'
        },
        [LAYOUT_MODES.ENTITY_DRIVEN]: {
          name: '数据源配置', 
          description: '为此卡片配置需要的数据源和实体',
          icon: 'mdi:format-list-checks'
        }
      };
  
      return {
        mode,
        ...strategyConfigs[mode]
      };
    }
  
    // 统一实体处理
    static processEntities(mode, entities, manifest, hass) {
      switch (mode) {
        case LAYOUT_MODES.FREE:
          return this._processFreeLayout(entities, hass);
        case LAYOUT_MODES.ENTITY_DRIVEN:
          return this._processEntityDriven(entities, manifest, hass);
        default:
          return this._processEntityDriven(entities, manifest, hass);
      }
    }
  
    // 统一验证
    static validateEntities(mode, entities, manifest) {
      switch (mode) {
        case LAYOUT_MODES.FREE:
          return this._validateFreeLayout(entities);
        case LAYOUT_MODES.ENTITY_DRIVEN:
          return this._validateEntityDriven(entities, manifest);
        default:
          return { valid: true, errors: [], warnings: [] };
      }
    }
  
    // === 自由布局处理 ===
    static _processFreeLayout(entities, hass) {
      const blocks = this.extractContentBlocks(entities);
      
      return {
        mode: LAYOUT_MODES.FREE,
        blocks: blocks.map(block => this._enrichBlockData(block, hass)),
        layout: this._extractLayoutConfig(entities),
        totalBlocks: blocks.length
      };
    }
  
    static _validateFreeLayout(entities) {
      const blocks = this.extractContentBlocks(entities);
      return {
        valid: blocks.length > 0,
        errors: blocks.length === 0 ? ['请至少添加一个内容块'] : [],
        warnings: []
      };
    }
  
    // === 实体驱动处理 ===
    static _processEntityDriven(entities, manifest, hass) {
      const requirements = manifest.entity_requirements || {};
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
        mode: LAYOUT_MODES.ENTITY_DRIVEN,
        entities: processed,
        requirementCount: Object.keys(requirements).length,
        configuredCount: Object.keys(processed).length
      };
    }
  
    static _validateEntityDriven(entities, manifest) {
      const requirements = manifest.entity_requirements || {};
      const errors = [];
      const warnings = [];
  
      Object.entries(requirements).forEach(([key, req]) => {
        if (req.required && (!entities[key] || entities[key].trim() === '')) {
          errors.push(`必需字段 "${req.name}" 未配置`);
        }
      });
  
      return { valid: errors.length === 0, errors, warnings };
    }
  
    // === 内容块处理 ===
    static extractContentBlocks(entities) {
      const blocks = [];
      
      Object.entries(entities || {}).forEach(([key, value]) => {
        if (key.endsWith('_type')) {
          const blockId = key.replace('_type', '');
          const configKey = `${blockId}_config`;
          
          try {
            blocks.push({
              id: blockId,
              type: value,
              content: entities[blockId] || '',
              config: entities[configKey] ? JSON.parse(entities[configKey]) : {},
              order: parseInt(blockId.split('_').pop()) || 0
            });
          } catch (e) {
            console.warn(`解析内容块配置失败: ${blockId}`, e);
          }
        }
      });
  
      return blocks.sort((a, b) => a.order - b.order);
    }
  
    static _enrichBlockData(block, hass) {
      // 为内容块丰富实时数据
      if (block.type !== 'text' && block.content) {
        const entity = hass?.states[block.content];
        if (entity) {
          block.realTimeData = {
            state: entity.state,
            attributes: entity.attributes,
            lastChanged: entity.last_changed
          };
        }
      }
      
      return block;
    }
  
    static _extractLayoutConfig(entities) {
      return {
        columns: entities._layout_columns || 3,
        style: entities._layout_style || 'grid',
        spacing: entities._layout_spacing || 'normal'
      };
    }
  
    // === 默认实体生成 ===
    static getDefaultEntities(mode, manifest) {
      switch (mode) {
        case LAYOUT_MODES.FREE:
          return this._getDefaultFreeLayoutEntities();
        case LAYOUT_MODES.ENTITY_DRIVEN:
          return this._getDefaultEntityDrivenEntities(manifest);
        default:
          return {};
      }
    }
  
    static _getDefaultFreeLayoutEntities() {
      return {
        'block_1': '欢迎使用自由布局！',
        'block_1_type': 'text',
        'block_1_config': JSON.stringify({ size: 'medium', style: 'header' }),
        '_layout_columns': 3,
        '_layout_style': 'grid'
      };
    }
  
    static _getDefaultEntityDrivenEntities(manifest) {
      const defaults = {};
      const requirements = manifest.entity_requirements || {};
      
      Object.entries(requirements).forEach(([key, req]) => {
        if (req.default) {
          defaults[key] = req.default;
        }
      });
      
      return defaults;
    }
  }