// src/editors/form-builder.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class FormBuilder extends LitElement {
  static properties = {
    config: { type: Object },
    schema: { type: Object },
    hass: { type: Object },
    _processedFields: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .form-builder {
        width: 100%;
      }
      
      /* 表单字段网格 */
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }
      
      /* 表单行（用于成组的字段） */
      .form-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        width: 100%;
      }
      
      .form-cell {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }
      
      /* 字段标签 */
      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .required-mark {
        color: var(--cf-error-color);
        margin-left: 2px;
      }
      
      /* 字段描述 */
      .field-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
        margin-top: 2px;
      }
      
      /* 开关组（水平排列） */
      .boolean-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--cf-border);
      }
      
      .boolean-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: 8px;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }
      
      .boolean-item:hover {
        border-color: var(--cf-primary-color);
        background: var(--cf-surface);
      }
      
      /* 滑块容器 */
      .slider-container {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
      }
      
      .slider-value {
        min-width: 50px;
        text-align: center;
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        font-weight: 500;
      }
      
      /* 颜色预览 */
      .color-preview {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--cf-border);
        flex-shrink: 0;
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 32px 20px;
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2.5em;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1em;
        line-height: 1.4;
      }
      
      /* 条件显示逻辑 */
      .conditional-field {
        transition: all var(--cf-transition-normal);
      }
      
      .conditional-field.hidden {
        display: none;
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        .form-row {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        .boolean-group {
          grid-template-columns: 1fr;
        }
      }
      
      @media (max-width: 480px) {
        .slider-container {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }
        
        .slider-value {
          text-align: center;
        }
      }
      
      /* 确保表单组件样式一致 */
      ha-textfield, ha-select, ha-combo-box, ha-icon-picker {
        width: 100%;
      }
      
      ha-slider {
        width: 100%;
      }
    `
  ];

  constructor() {
    super();
    this._processedFields = [];
  }

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    // 处理字段，分离布尔字段和其他字段
    const booleanFields = [];
    const otherFields = [];
    
    Object.entries(this.schema).forEach(([key, field]) => {
      // 检查字段是否应该显示
      if (field.visibleWhen && typeof field.visibleWhen === 'function') {
        if (!field.visibleWhen(this.config)) {
          return; // 跳过这个字段
        }
      }
      
      if (field.type === 'boolean') {
        booleanFields.push([key, field]);
      } else {
        otherFields.push([key, field]);
      }
    });
    
    this._processedFields = [...booleanFields, ...otherFields];

    return html`
      <div class="form-builder">
        <!-- 布尔字段组 -->
        ${booleanFields.length > 0 ? html`
          <div class="boolean-group">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        <!-- 其他字段 -->
        ${otherFields.length > 0 ? html`
          <div class="form-grid">
            ${otherFields.map(([key, field]) => html`
              <div class="form-cell ${this._getConditionalClass(key, field)}">
                ${this._renderField(key, field)}
                ${field.description ? html`
                  <div class="field-description">${field.description}</div>
                ` : ''}
              </div>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderBooleanField(key, field) {
    const value = this._getFieldValue(key, field);
    
    return html`
      <div 
        class="boolean-item"
        @click=${() => this._toggleBoolean(key, !value)}
      >
        <ha-switch
          .checked=${value}
          @click=${e => e.stopPropagation()}
          @change=${e => this._updateField(key, e.target.checked)}
        ></ha-switch>
        <div class="field-label">
          ${field.label}
          ${field.required ? html`<span class="required-mark">*</span>` : ''}
        </div>
      </div>
    `;
  }

  _renderField(key, field) {
    const value = this._getFieldValue(key, field);
    
    switch (field.type) {
      case 'select':
        return this._renderSelectField(key, field, value);
      case 'number':
        return this._renderNumberField(key, field, value);
      case 'color':
        return this._renderColorField(key, field, value);
      case 'slider':
        return this._renderSliderField(key, field, value);
      case 'entity':
        return this._renderEntityField(key, field, value);
      case 'icon':
        return this._renderIconField(key, field, value);
      default:
        return this._renderTextField(key, field, value);
    }
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];
    
    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span class="required-mark">*</span>` : ''}
      </div>
      <ha-select
        .value=${value || ''}
        @closed=${e => e.stopPropagation()}
        naturalMenuWidth
        fixedMenuPosition
        fullwidth
        .label=${field.label}
        @change=${e => this._updateField(key, e.target.value)}
      >
        ${options.map(option => html`
          <ha-list-item 
            .value=${typeof option === 'object' ? option.value : option}
          >
            ${typeof option === 'object' ? option.label : option}
          </ha-list-item>
        `)}
      </ha-select>
    `;
  }

  _renderNumberField(key, field, value) {
    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span class="required-mark">*</span>` : ''}
      </div>
      <ha-textfield
        type="number"
        .value=${value}
        @input=${e => this._updateField(key, parseInt(e.target.value) || field.min || 0)}
        .label=${field.label}
        .min=${field.min}
        .max=${field.max}
        .step=${field.step || 1}
        fullwidth
      ></ha-textfield>
    `;
  }

  _renderColorField(key, field, value) {
    const options = field.options || [
      { value: 'blue', label: '蓝色', color: '#4285f4' },
      { value: 'red', label: '红色', color: '#ea4335' },
      { value: 'green', label: '绿色', color: '#34a853' },
      { value: 'yellow', label: '黄色', color: '#fbbc05' },
      { value: 'purple', label: '紫色', color: '#a142f4' }
    ];

    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span class="required-mark">*</span>` : ''}
      </div>
      <ha-select
        .value=${value || field.default || 'blue'}
        @closed=${e => e.stopPropagation()}
        naturalMenuWidth
        fixedMenuPosition
        fullwidth
        .label=${field.label}
      >
        ${options.map(option => html`
          <ha-list-item 
            .value=${option.value}
            @click=${() => this._updateField(key, option.value)}
          >
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="color-preview" style="background: ${option.color || option.value}"></div>
              <span>${option.label}</span>
            </div>
          </ha-list-item>
        `)}
      </ha-select>
    `;
  }

  _renderSliderField(key, field, value) {
    const currentValue = value !== undefined ? value : field.default || field.min || 0;
    const min = field.min || 0;
    const max = field.max || 100;
    const step = field.step || 1;
    const unit = field.unit || '';

    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span class="required-mark">*</span>` : ''}
      </div>
      <div class="slider-container">
        <ha-slider
          .value=${currentValue}
          .min=${min}
          .max=${max}
          .step=${step}
          @change=${e => this._updateField(key, parseInt(e.target.value))}
          pin
          fullwidth
        ></ha-slider>
        <div class="slider-value">${currentValue}${unit}</div>
      </div>
    `;
  }

  _renderEntityField(key, field, value) {
    const entities = this._getAvailableEntities();
    
    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span class="required-mark">*</span>` : ''}
      </div>
      ${entities.length > 0 ? html`
        <ha-combo-box
          .items=${entities}
          .value=${value || ''}
          @value-changed=${e => this._updateField(key, e.detail.value)}
          allow-custom-value
          .label=${field.label}
          fullwidth
        ></ha-combo-box>
      ` : html`
        <ha-textfield
          .value=${value || ''}
          @input=${e => this._updateField(key, e.target.value)}
          .label=${field.label}
          .placeholder=${field.placeholder || '例如: light.living_room'}
          fullwidth
        ></ha-textfield>
      `}
    `;
  }

  _renderIconField(key, field, value) {
    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span class="required-mark">*</span>` : ''}
      </div>
      <ha-icon-picker
        .value=${value || ''}
        @value-changed=${e => this._updateField(key, e.detail.value)}
        .label=${field.label}
        fullwidth
      ></ha-icon-picker>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span class="required-mark">*</span>` : ''}
      </div>
      <ha-textfield
        .value=${value || ''}
        @input=${e => this._updateField(key, e.target.value)}
        .label=${field.label}
        .placeholder=${field.placeholder || ''}
        fullwidth
      ></ha-textfield>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
        </div>
        <div class="empty-text">此卡片无需额外配置</div>
      </div>
    `;
  }

  _getFieldValue(key, field) {
    // 优先使用配置中的值
    if (this.config?.[key] !== undefined) {
      return this.config[key];
    }
    
    // 回退到默认值
    return field.default !== undefined ? field.default : '';
  }

  _getAvailableEntities() {
    if (!this.hass?.states) return [];
    
    return Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _getConditionalClass(key, field) {
    if (!field.visibleWhen) return '';
    
    const shouldShow = field.visibleWhen(this.config);
    return shouldShow ? '' : 'hidden';
  }

  _toggleBoolean(key, value) {
    this._updateField(key, value);
  }

  _updateField(key, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { [key]: value } }
    }));
  }
}

if (!customElements.get('form-builder')) {
  customElements.define('form-builder', FormBuilder);
}

export { FormBuilder };