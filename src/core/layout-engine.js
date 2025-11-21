// src/core/layout-engine.js
import { BlockManager } from './block-manager.js';

export const LAYOUT_MODES = {
  FREE: 'free',
  ENTITY_DRIVEN: 'entity_driven'
};

export class LayoutEngine {
  // 自动检测布局模式
  static detectMode(manifest) {
    if (!manifest) return LAYOUT_MODES.ENTITY_DRIVEN;

    // 自由布局优先检测
    if (manifest.layout_type === 'free' || manifest.allow_custom_entities) {
      return LAYOUT_MODES.FREE;
    }

    // 默认实体驱动
    return LAYOUT_MODES.ENTITY_DRIVEN;
  }

  // 获取布局信息
  static getLayoutInfo(manifest) {
    const mode = this.detectMode(manifest);
    
    const layoutConfigs = {
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
      ...layoutConfigs[mode]
    };
  }

  // 统一实体处理
  static process(entities, manifest, hass) {
    const mode = this.detectMode(manifest);
    
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
  static validate(entities, manifest) {
    const mode = this.detectMode(manifest);
    
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
    const blocks = BlockManager.deserializeFromEntities(entities);
    const enrichedBlocks = BlockManager.enrichWithRealtimeData(blocks, hass);
    
    return {
      mode: LAYOUT_MODES.FREE,
      blocks: enrichedBlocks,
      layout: this._extractLayoutConfig(entities),
      totalBlocks: blocks.length
    };
  }

  static _validateFreeLayout(entities) {
    const blocks = BlockManager.deserializeFromEntities(entities);
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
      if (req.required && (!entities[key] || String(entities[key]).trim() === '')) {
        errors.push(`必需字段 "${req.name}" 未配置`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  // === 布局配置提取 ===
  static _extractLayoutConfig(entities) {
    return {
      columns: entities._layout_columns || 3,
      style: entities._layout_style || 'grid',
      spacing: entities._layout_spacing || 'normal'
    };
  }

  // === 默认实体生成 ===
  static getDefaultEntities(manifest) {
    const mode = this.detectMode(manifest);
    
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
    return BlockManager.serializeToEntities([
      BlockManager.createBlock('text', 'block_1')
    ]);
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