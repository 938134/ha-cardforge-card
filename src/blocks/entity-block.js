// src/blocks/entity-block.js
import { BaseBlock } from '../core/base-block.js';

class EntityBlock extends BaseBlock {
  getTemplate(config, hass) {
    const entityId = config.entity;
    const entity = entityId ? hass?.states?.[entityId] : null;
    
    const state = entity?.state || '未知';
    const unit = entity?.attributes?.unit_of_measurement || '';
    const friendlyName = entity?.attributes?.friendly_name || entityId;
    
    return this._renderBlockContainer(`
      <div class="entity-content">
        ${config.show_icon && config.icon ? `<div class="entity-icon">${config.icon}</div>` : ''}
        ${config.show_name ? `<div class="entity-name">${friendlyName}</div>` : ''}
        <div class="entity-state">${state}${unit ? ` ${unit}` : ''}</div>
      </div>
    `, 'entity-block');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .entity-block .entity-content {
        padding: var(--cf-spacing-md);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .entity-icon {
        font-size: 1.5em;
      }
      
      .entity-name {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .entity-state {
        font-size: 1.3em;
        font-weight: 600;
        color: var(--cf-primary-color);
      }
    `;
  }
}

EntityBlock.manifest = {
  type: 'entity',
  name: '实体块',
  description: '显示Home Assistant实体状态',
  icon: '📊',
  category: 'data',
  config_schema: {
    entity: {
      type: 'string',
      label: '实体ID',
      default: ''
    },
    name: {
      type: 'string',
      label: '显示名称',
      default: ''
    },
    icon: {
      type: 'string',
      label: '图标',
      default: ''
    },
    show_name: {
      type: 'boolean',
      label: '显示名称',
      default: true
    },
    show_icon: {
      type: 'boolean',
      label: '显示图标',
      default: true
    },
    show_unit: {
      type: 'boolean',
      label: '显示单位',
      default: true
    }
  }
};

export { EntityBlock as default };
