// src/ui/entity-picker.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class EntityPicker extends LitElement {
  static properties = {
    hass: { type: Object },
    entities: { type: Object },
    plugin: { type: Object },
    selectedEntities: { type: Object }
  };

  static styles = css`
    .entity-picker {
      padding: 16px;
    }
    
    .entity-requirements {
      background: var(--secondary-background-color);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9em;
    }

    .requirement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .requirement-badge {
      background: var(--primary-color);
      color: white;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.7em;
    }

    .optional-badge {
      background: var(--secondary-text-color);
      color: white;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.7em;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .entity-label {
      font-weight: 500;
      font-size: 0.9em;
    }
    
    .no-requirements {
      text-align: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }
    
    .section-title {
      margin: 0 0 16px 0;
      font-size: 1.2em;
      font-weight: bold;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;

  constructor() {
    super();
    this.hass = null;
    this.entities = {};
    this.plugin = null;
    this.selectedEntities = {};
  }

  render() {
    if (!this.plugin) {
      return html`
        <div class="no-requirements">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <div style="margin-top: 12px;">请先选择插件</div>
        </div>
      `;
    }

    const requirements = this._getPluginRequirements();

    return html`
      <div class="entity-picker">
        <div class="section-title">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span>实体配置</span>
        </div>

        <!-- 实体需求说明 -->
        ${requirements.required.length > 0 || requirements.optional.length > 0 ? html`
          <div class="entity-requirements">
            <div style="font-weight: bold; margin-bottom: 8px;">实体需求:</div>
            ${this._renderEntityRequirements(requirements)}
          </div>
        ` : ''}
        
        <!-- 实体选择器 -->
        ${this._renderEntitySelectors(requirements)}
      </div>
    `;
  }

  _getPluginRequirements() {
    if (!this.plugin) {
      return { required: [], optional: [] };
    }

    const requirements = {
      required: [],
      optional: []
    };

    // 根据插件类型确定实体需求
    if (this.plugin.requiresWeek || this.plugin.category === 'time') {
      requirements.required.push(
        { key: 'time', type: 'sensor', description: '时间实体' },
        { key: 'date', type: 'sensor', description: '日期实体' }
      );
      requirements.optional.push(
        { key: 'week', type: 'sensor', description: '星期实体' }
      );
    }

    if (this.plugin.category === 'weather') {
      requirements.required.push(
        { key: 'weather', type: 'weather', description: '天气实体' }
      );
    }

    if (this.plugin.id === 'clock-lunar') {
      requirements.optional.push(
        { key: 'lunar', type: 'sensor', description: '农历实体' }
      );
    }

    return requirements;
  }

  _renderEntityRequirements(requirements) {
    return html`
      ${requirements.required.length > 0 ? html`
        <div style="margin-bottom: 8px;">
          <div style="font-size: 0.8em; margin-bottom: 4px;">必需实体:</div>
          ${requirements.required.map(req => html`
            <div class="requirement-item">
              <span class="requirement-badge">必需</span>
              <span>${req.description} (${req.type})</span>
            </div>
          `)}
        </div>
      ` : ''}
      
      ${requirements.optional.length > 0 ? html`
        <div>
          <div style="font-size: 0.8em; margin-bottom: 4px;">可选实体:</div>
          ${requirements.optional.map(req => html`
            <div class="requirement-item">
              <span class="optional-badge">可选</span>
              <span>${req.description} (${req.type})</span>
            </div>
          `)}
        </div>
      ` : ''}
    `;
  }

  _renderEntitySelectors(requirements) {
    if (requirements.required.length === 0 && requirements.optional.length === 0) {
      return html`
        <div class="no-requirements">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div style="margin-top: 12px;">此插件无需特殊实体配置</div>
        </div>
      `;
    }

    return html`
      ${requirements.required.map(req => this._renderEntityRow(req, true))}
      ${requirements.optional.map(req => this._renderEntityRow(req, false))}
    `;
  }

  _renderEntityRow(requirement, isRequired) {
    const currentValue = this.selectedEntities[requirement.key] || '';
    const isValid = this._validateEntity(currentValue, requirement.type);
    
    return html`
      <div class="entity-row">
        <div class="entity-label">${requirement.description}</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${currentValue}
          @value-changed=${e => this._onEntityChanged(requirement.key, e.detail.value)}
          allow-custom-entity
          .includeDomains=${this._getDomainsForType(requirement.type)}
        ></ha-entity-picker>
        <ha-icon-button 
          .path=${this._getValidationIcon(currentValue, isValid, isRequired)}
          .style="color: ${this._getValidationColor(currentValue, isValid, isRequired)}"
        ></ha-icon-button>
      </div>
    `;
  }

  _getDomainsForType(type) {
    const domainMap = {
      'sensor': ['sensor'],
      'weather': ['weather'],
      'binary_sensor': ['binary_sensor']
    };
    return domainMap[type] || [type];
  }

  _validateEntity(entityId, expectedType) {
    if (!entityId || !this.hass?.states) return false;
    
    const entity = this.hass.states[entityId];
    if (!entity) return false;
    
    const domain = entityId.split('.')[0];
    return domain === expectedType;
  }

  _getValidationIcon(entityId, isValid, isRequired) {
    if (!entityId) {
      return isRequired ? 'mdi:alert-circle' : 'mdi:information-outline';
    }
    return isValid ? 'mdi:check-circle' : 'mdi:alert-circle';
  }

  _getValidationColor(entityId, isValid, isRequired) {
    if (!entityId) {
      return isRequired ? 'var(--warning-color)' : 'var(--disabled-text-color)';
    }
    return isValid ? 'var(--success-color)' : 'var(--error-color)';
  }

  _onEntityChanged(key, value) {
    this.selectedEntities = {
      ...this.selectedEntities,
      [key]: value
    };
    
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: this.selectedEntities }
    }));
  }

  // 公共方法
  setPlugin(plugin) {
    this.plugin = plugin;
    this.selectedEntities = this._getDefaultEntities(plugin);
  }

  setEntities(entities) {
    this.selectedEntities = { ...entities };
  }

  getEntities() {
    return { ...this.selectedEntities };
  }

  _getDefaultEntities(plugin) {
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
    
    return defaults;
  }

  validateEntities() {
    const requirements = this._getPluginRequirements();
    const errors = [];
    
    requirements.required.forEach(req => {
      if (!this.selectedEntities[req.key]) {
        errors.push(`缺少必需实体: ${req.description}`);
      } else if (!this._validateEntity(this.selectedEntities[req.key], req.type)) {
        errors.push(`实体类型不匹配: ${req.description}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }
}

customElements.define('entity-picker', EntityPicker);