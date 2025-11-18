// src/core/entity-strategies.js

/**
 * 🎯 实体管理策略核心
 * 统一管理三种实体策略：自由布局、结构化、无状态
 */
export class EntityStrategies {
    // 策略类型常量
    static STRATEGY_TYPES = {
      FREE_LAYOUT: 'free_layout',
      STRUCTURED: 'structured',
      STATELESS: 'stateless'
    };
  
    /**
     * 🎪 策略检测 - 根据插件manifest自动选择策略
     */
    static detectStrategy(manifest) {
      if (!manifest) return this.STRATEGY_TYPES.STATELESS;
  
      // 1. 自由布局优先检测
      if (manifest.layout_type === 'free' || manifest.allow_custom_entities) {
        return this.STRATEGY_TYPES.FREE_LAYOUT;
      }
  
      // 2. 结构化实体检测
      if (manifest.entity_requirements && Object.keys(manifest.entity_requirements).length > 0) {
        return this.STRATEGY_TYPES.STRUCTURED;
      }
  
      // 3. 默认无状态
      return this.STRATEGY_TYPES.STATELESS;
    }
  
    /**
     * 📋 获取策略信息
     */
    static getStrategyInfo(manifest) {
      const strategyType = this.detectStrategy(manifest);
      
      const strategyConfigs = {
        [this.STRATEGY_TYPES.FREE_LAYOUT]: {
          name: '自由布局编辑器',
          description: '可任意添加和排列内容块，构建个性化布局',
          icon: 'mdi:view-grid-plus'
        },
        [this.STRATEGY_TYPES.STRUCTURED]: {
          name: '数据源配置', 
          description: '为此卡片配置需要的数据源和实体',
          icon: 'mdi:format-list-checks'
        },
        [this.STRATEGY_TYPES.STATELESS]: {
          name: '智能数据源',
          description: '此卡片使用内置数据，无需额外配置',
          icon: 'mdi:auto-fix'
        }
      };
  
      const config = strategyConfigs[strategyType] || strategyConfigs[this.STRATEGY_TYPES.STATELESS];
      
      return {
        type: strategyType,
        ...config
      };
    }
  
    /**
     * 🔧 策略验证器
     */
    static validateEntities(strategyType, entities, manifest) {
      switch (strategyType) {
        case this.STRATEGY_TYPES.FREE_LAYOUT:
          return this._validateFreeLayout(entities);
        case this.STRATEGY_TYPES.STRUCTURED:
          return this._validateStructured(entities, manifest);
        default:
          return this._validateStateless();
      }
    }
  
    static _validateFreeLayout(entities) {
      const blocks = this.extractContentBlocks(entities);
      return {
        valid: blocks.length > 0,
        errors: blocks.length === 0 ? ['请至少添加一个内容块'] : [],
        warnings: []
      };
    }
  
    static _validateStructured(entities, manifest) {
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
  
    static _validateStateless() {
      return { valid: true, errors: [], warnings: [] };
    }
  
    /**
     * 🎨 策略处理器 - 将原始实体转换为策略特定格式
     */
    static processEntities(strategyType, entities, manifest, hass) {
      switch (strategyType) {
        case this.STRATEGY_TYPES.FREE_LAYOUT:
          return this._processFreeLayout(entities, hass);
        case this.STRATEGY_TYPES.STRUCTURED:
          return this._processStructured(entities, manifest, hass);
        default:
          return this._processStateless();
      }
    }
  
    static _processFreeLayout(entities, hass) {
      const blocks = this.extractContentBlocks(entities);
      
      return {
        strategy: this.STRATEGY_TYPES.FREE_LAYOUT,
        blocks: blocks.map(block => this._enrichBlockData(block, hass)),
        layout: this._extractLayoutConfig(entities),
        totalBlocks: blocks.length
      };
    }
  
    static _processStructured(entities, manifest, hass) {
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
        strategy: this.STRATEGY_TYPES.STRUCTURED,
        entities: processed,
        requirementCount: Object.keys(requirements).length,
        configuredCount: Object.keys(processed).length
      };
    }
  
    static _processStateless() {
      return {
        strategy: this.STRATEGY_TYPES.STATELESS,
        message: '使用内置数据源',
        timestamp: new Date().toISOString()
      };
    }
  
    /**
     * 🧩 自由布局专用方法
     */
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
  
    static _extractLayoutConfig(entities) {
      return {
        columns: entities._layout_columns || 3,
        style: entities._layout_style || 'grid',
        spacing: entities._layout_spacing || 'normal'
      };
    }
  
    static _enrichBlockData(block, hass) {
      // 为内容块丰富实时数据
      if (block.type === 'sensor' && block.content) {
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
  
    /**
     * 🔄 默认实体生成
     */
    static getDefaultEntities(strategyType, manifest) {
      switch (strategyType) {
        case this.STRATEGY_TYPES.FREE_LAYOUT:
          return this._getDefaultFreeLayoutEntities();
        case this.STRATEGY_TYPES.STRUCTURED:
          return this._getDefaultStructuredEntities(manifest);
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
  
    static _getDefaultStructuredEntities(manifest) {
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
  
  // 导出单例
  export const entityStrategies = EntityStrategies;