// src/blocks/types/sensor-block.js
import { BaseBlock } from '../base-block.js';

class SensorBlock extends BaseBlock {
  static blockType = 'sensor';
  static blockName = '传感器';
  static blockIcon = 'mdi:gauge';
  static category = 'sensors';
  static description = '显示传感器实体状态';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const entityId = config.entity;
    
    if (!entityId) {
      return this._renderEmpty('请选择传感器实体');
    }

    const entity = hass?.states?.[entityId];
    if (!entity) {
      return this._renderEmpty('实体未找到');
    }

    const state = entity.state;
    const unit = entity.attributes?.unit_of_measurement || '';
    const friendlyName = entity.attributes?.friendly_name || entityId;
    const icon = config.icon || entity.attributes?.icon || 'mdi:gauge';

    return this._renderContainer(`
      ${this._renderHeader(config.title || friendlyName, config.subtitle)}
      <div class="block-value-section">
        ${icon ? `<ha-icon icon="${icon}" class="cf-mb-sm"></ha-icon>` : ''}
        <div class="block-value">${this._escapeHtml(state)}</div>
        ${unit ? `<div class="block-unit">${this._escapeHtml(unit)}</div>` : ''}
      </div>
    `, 'sensor-block');
  }

  getStyles(block) {
    return `
      .sensor-block .block-value-section {
        gap: var(--cf-spacing-sm);
      }
      
      .sensor-block ha-icon {
        color: var(--cf-primary-color);
        font-size: 1.5em;
      }
      
      @container (max-width: 300px) {
        .sensor-block .block-value {
          font-size: 1.2em;
        }
        
        .sensor-block ha-icon {
          font-size: 1.2em;
        }
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const entities = this._getAvailableEntities(hass);

    return `
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">实体</label>
          <ha-combo-box
            .items="${JSON.stringify(entities)}"
            .value="${config.entity || ''}"
            @value-changed="${e => onConfigChange('entity', e.detail.value)}"
            allow-custom-value
            fullwidth
          ></ha-combo-box>
        </div>
        
        <div class="form-field">
          <label class="form-label">标题</label>
          <ha-textfield
            .value="${config.title || ''}"
            @input="${e => onConfigChange('title', e.target.value)}"
            placeholder="使用实体名称"
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="form-field">
          <label class="form-label">副标题</label>
          <ha-textfield
            .value="${config.subtitle || ''}"
            @input="${e => onConfigChange('subtitle', e.target.value)}"
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="form-field">
          <label class="form-label">图标</label>
          <ha-icon-picker
            .value="${config.icon || ''}"
            @value-changed="${e => onConfigChange('icon', e.detail.value)}"
            fullwidth
          ></ha-icon-picker>
        </div>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      entity: '',
      title: '',
      subtitle: '',
      icon: ''
    };
  }

  validateConfig(config) {
    const errors = [];
    if (!config.entity) {
      errors.push('必须选择实体');
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }

  _getAvailableEntities(hass) {
    if (!hass?.states) return [];
    
    return Object.entries(hass.states)
      .filter(([entityId, entity]) => 
        entityId.startsWith('sensor.') || 
        entityId.startsWith('binary_sensor.')
      )
      .map(([entityId, entity]) => ({
        value: entityId,
        label: entity.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _renderEmpty(message) {
    return this._renderContainer(`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
        <ha-icon icon="mdi:alert-circle-outline" class="cf-text-secondary"></ha-icon>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">${message}</div>
      </div>
    `, 'sensor-block empty');
  }
}

export { SensorBlock as default };