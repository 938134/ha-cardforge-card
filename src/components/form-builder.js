import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { designSystem } from '../core/design-system.js';

/**
 * 表单构建器 - 智能多列布局
 */
export class FormBuilder extends LitElement {
  static properties = {
    schema: { type: Object },
    config: { type: Object },
    hass: { type: Object },
    _availableEntities: { state: true },
    _fieldErrors: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .form-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      /* 字段网格布局 */
      .field-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--cf-spacing-md) var(--cf-spacing-sm);
        align-items: start;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
        min-width: 0;
      }

      /* 字段宽度类别 */
      .field-wide {
        grid-column: 1 / -1;
      }

      .field-narrow {
        min-width: 150px;
      }

      /* 字段标签 */
      .field-label {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-secondary);
      }

      .required-marker {
        color: var(--cf-error-color);
        font-weight: var(--cf-font-weight-bold);
      }

      /* 字段描述 */
      .field-description {
        grid-column: 1 / -1;
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
        line-height: var(--cf-line-height-normal);
        margin-top: -var(--cf-spacing-xs);
      }

      /* 布尔字段组 */
      .boolean-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
      }

      .boolean-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .boolean-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-primary-color-rgb), 0.03);
      }

      .boolean-item.active {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-primary-color-rgb), 0.08);
      }

      /* 错误状态 */
      .field-error {
        grid-column: 1 / -1;
        font-size: var(--cf-font-size-xs);
        color: var(--cf-error-color);
        margin-top: -var(--cf-spacing-xs);
      }

      /* 表单控件样式 */
      ha-textfield, ha-select, ha-combo-box, ha-icon-picker {
        width: 100%;
      }

      ha-textfield::part(input), 
      ha-select::part(select), 
      ha-combo-box::part(input) {
        font-family: var(--cf-font-family-base);
      }

      /* 响应式设计 */
      @container (max-width: 768px) {
        .field-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .boolean-group {
          grid-template-columns: 1fr;
        }
      }

      /* 空状态 */
      .empty-form {
        text-align: center;
        padding: var(--cf-spacing-2xl);
        color: var(--cf-text-tertiary);
      }

      .empty-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }
    `
  ];

  constructor() {
    super();
    this.schema = {};
    this.config = {};
    this.hass = null;
    this._availableEntities = [];
    this._fieldErrors = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }

    if (changedProperties.has('config') || changedProperties.has('schema')) {
      this._validateFields();
    }
  }

  /**
   * 更新可用实体列表
   */
  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId,
        description: entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * 验证字段
   */
  _validateFields() {
    const errors = {};
    
    Object.entries(this.schema).forEach(([key, field]) => {
      const value = this.config?.[key];
      
      if (field.required && (value === undefined || value === '' || value === null)) {
        errors[key] = '此字段为必填项';
      }
      
      if (field.type === 'number') {
        const numValue = parseFloat(value);
        if (field.min !== undefined && numValue < field.min) {
          errors[key] = `最小值不能小于 ${field.min}`;
        }
        if (field.max !== undefined && numValue > field.max) {
          errors[key] = `最大值不能大于 ${field.max}`;
        }
      }
      
      if (field.type === 'select' && field.options) {
        const optionValues = field.options.map(opt => 
          typeof opt === 'object' ? opt.value : opt
        );
        if (value && !optionValues.includes(value)) {
          errors[key] = '请选择有效的选项';
        }
      }
    });
    
    this._fieldErrors = errors;
  }

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return html`
        <div class="empty-form">
          <div class="empty-icon">
            <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          </div>
          <div>此卡片无需额外配置</div>
        </div>
      `;
    }

    // 分离布尔字段和其他字段
    const booleanFields = [];
    const otherFields = [];
    
    Object.entries(this.schema).forEach(([key, field]) => {
      if (field.type === 'boolean') {
        booleanFields.push({ key, field });
      } else {
        otherFields.push({ key, field });
      }
    });

    return html`
      <div class="form-container">
        ${booleanFields.length > 0 ? html`
          <div class="boolean-group">
            ${booleanFields.map(({ key, field }) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        ${otherFields.length > 0 ? html`
          <div class="field-grid">
            ${otherFields.map(({ key, field }) => {
              const widthClass = this._getFieldWidthClass(field);
              const hasError = this._fieldErrors[key];
              
              return html`
                <div class="form-field ${widthClass}">
                  ${this._renderFieldLabel(key, field)}
                  ${this._renderField(key, field)}
                </div>
                
                ${field.description ? html`
                  <div class="field-description">
                    ${field.description}
                  </div>
                ` : ''}
                
                ${hasError ? html`
                  <div class="field-error">
                    <ha-icon icon="mdi:alert-circle" style="width: 12px; height: 12px; margin-right: 4px;"></ha-icon>
                    ${hasError}
                  </div>
                ` : ''}
              `;
            })}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 获取字段宽度类别
   */
  _getFieldWidthClass(field) {
    switch (field.type) {
      case 'text':
      case 'entity':
        return 'field-wide';
      case 'select':
        const options = field.options || [];
        return options.length <= 3 ? 'field-narrow' : '';
      case 'number':
      case 'icon':
        return 'field-narrow';
      default:
        return '';
    }
  }

  /**
   * 渲染字段标签
   */
  _renderFieldLabel(key, field) {
    return html`
      <div class="field-label">
        ${field.label || key}
        ${field.required ? html`<span class="required-marker">*</span>` : ''}
      </div>
    `;
  }

  /**
   * 渲染布尔字段
   */
  _renderBooleanField(key, field) {
    const value = this.config?.[key] ?? field.default ?? false;
    const isActive = !!value;
    
    return html`
      <div 
        class="boolean-item ${isActive ? 'active' : ''}"
        @click=${() => this._updateField(key, !value)}
      >
        <ha-switch
          .checked=${value}
          @click=${e => e.stopPropagation()}
          @change=${e => this._updateField(key, e.target.checked)}
        ></ha-switch>
        <span>${field.label || key}</span>
      </div>
    `;
  }

  /**
   * 渲染字段
   */
  _renderField(key, field) {
    const value = this.config?.[key] ?? field.default ?? '';
    const hasError = this._fieldErrors[key];
    
    switch (field.type) {
      case 'select':
        return this._renderSelectField(key, field, value, hasError);
      case 'number':
        return this._renderNumberField(key, field, value, hasError);
      case 'entity':
        return this._renderEntityField(key, field, value, hasError);
      case 'icon':
        return this._renderIconField(key, field, value, hasError);
      default:
        return this._renderTextField(key, field, value, hasError);
    }
  }

  /**
   * 渲染选择字段
   */
  _renderSelectField(key, field, value, hasError) {
    const options = field.options || [];
    
    return html`
      <ha-select
        .value=${value}
        @closed=${e => e.stopPropagation()}
        fullwidth
        .label=${field.label}
        ?required=${field.required}
        .invalid=${!!hasError}
        @change=${e => this._updateField(key, e.target.value)}
      >
        ${options.map(option => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          
          return html`
            <ha-list-item .value=${optionValue}>
              ${optionLabel}
            </ha-list-item>
          `;
        })}
      </ha-select>
    `;
  }

  /**
   * 渲染数字字段
   */
  _renderNumberField(key, field, value, hasError) {
    return html`
      <ha-textfield
        type="number"
        .value=${value}
        @input=${e => this._updateField(key, parseFloat(e.target.value) || field.min || 0)}
        .label=${field.label}
        ?required=${field.required}
        .invalid=${!!hasError}
        .min=${field.min}
        .max=${field.max}
        .step=${field.step || 1}
        fullwidth
      ></ha-textfield>
    `;
  }

  /**
   * 渲染实体字段
   */
  _renderEntityField(key, field, value, hasError) {
    return html`
      ${this._availableEntities.length > 0 ? html`
        <ha-combo-box
          .items=${this._availableEntities}
          .value=${value}
          @value-changed=${e => this._updateField(key, e.detail.value)}
          allow-custom-value
          .label=${field.label}
          ?required=${field.required}
          .invalid=${!!hasError}
          fullwidth
        ></ha-combo-box>
      ` : html`
        <ha-textfield
          .value=${value}
          @input=${e => this._updateField(key, e.target.value)}
          .label=${field.label}
          ?required=${field.required}
          .invalid=${!!hasError}
          fullwidth
        ></ha-textfield>
      `}
    `;
  }

  /**
   * 渲染图标字段
   */
  _renderIconField(key, field, value, hasError) {
    return html`
      <ha-icon-picker
        .value=${value}
        @value-changed=${e => this._updateField(key, e.detail.value)}
        .label=${field.label}
        ?required=${field.required}
        .invalid=${!!hasError}
        fullwidth
      ></ha-icon-picker>
    `;
  }

  /**
   * 渲染文本字段
   */
  _renderTextField(key, field, value, hasError) {
    return html`
      <ha-textfield
        .value=${value}
        @input=${e => this._updateField(key, e.target.value)}
        .label=${field.label}
        ?required=${field.required}
        .invalid=${!!hasError}
        .placeholder=${field.placeholder || ''}
        fullwidth
      ></ha-textfield>
    `;
  }

  /**
   * 更新字段值
   */
  _updateField(key, value) {
    const oldValue = this.config?.[key];
    
    if (oldValue === value) {
      return;
    }
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { [key]: value } }
    }));
    
    // 重新验证
    setTimeout(() => this._validateFields(), 0);
  }
}

// 注册自定义元素
if (!customElements.get('form-builder')) {
  customElements.define('form-builder', FormBuilder);
}
