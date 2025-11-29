// src/editors/form-builder.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class FormBuilder extends LitElement {
  static properties = {
    config: { type: Object },
    schema: { type: Object },
    hass: { type: Object },
    availableEntities: { type: Array }
  };

  static styles = [
    designSystem,
    css`
      .form-builder {
        width: 100%;
        container-type: inline-size;
        container-name: form-builder;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
        width: 100%;
      }
      
      .form-cell {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        min-width: 0;
      }
      
      /* 布尔字段特殊布局 - 单列显示 */
      .boolean-fields {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
        margin-bottom: var(--cf-spacing-lg);
        padding-bottom: var(--cf-spacing-md);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .boolean-field {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm) 0;
      }
      
      .boolean-field:not(:last-child) {
        border-bottom: 1px solid var(--cf-border-light, rgba(0, 0, 0, 0.1));
      }
      
      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .field-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
        line-height: 1.3;
      }
      
      /* 颜色预览 */
      .color-preview {
        width: 20px;
        height: 20px;
        border-radius: var(--cf-radius-sm);
        border: 1px solid var(--cf-border);
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        background: var(--cf-surface);
        border-radius: var(--cf-radius-md);
        border: 2px dashed var(--cf-border);
      }
      
      .empty-icon {
        font-size: 2em;
        opacity: 0.5;
        margin-bottom: var(--cf-spacing-md);
      }
      
      /* 响应式设计 */
      @container form-builder (max-width: 600px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
      }
      
      /* 确保表单组件样式一致 */
      ha-textfield, ha-select, ha-combo-box, ha-icon-picker {
        width: 100%;
      }
      
      /* 滑块组件特殊布局 */
      .slider-container {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        width: 100%;
      }
      
      .slider-value {
        min-width: 40px;
        text-align: center;
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      /* 字段组样式 */
      .field-group {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    const fields = Object.entries(this.schema);
    
    // 分离布尔字段和其他字段
    const booleanFields = fields.filter(([, field]) => field.type === 'boolean');
    const otherFields = fields.filter(([, field]) => field.type !== 'boolean');
    
    return html`
      <div class="form-builder">
        <!-- 布尔字段单独一行 -->
        ${booleanFields.length > 0 ? html`
          <div class="boolean-fields">
            ${booleanFields.map(([key, field]) => 
              this._renderBooleanField(key, field)
            )}
          </div>
        ` : ''}
        
        <!-- 其他字段按2列布局 -->
        ${this._renderFieldGrid(otherFields)}
      </div>
    `;
  }

  _renderFieldGrid(fields) {
    const rows = [];
    for (let i = 0; i < fields.length; i += 2) {
      rows.push(fields.slice(i, i + 2));
    }
    
    return html`
      <div class="form-grid">
        ${rows.map(row => html`
          ${row.map(([key, field]) => html`
            <div class="form-cell">
              <div class="field-group">
                ${this._renderField(key, field)}
                ${field.description ? html`
                  <div class="field-description">${field.description}</div>
                ` : ''}
              </div>
            </div>
          `)}
        `)}
      </div>
    `;
  }

  _renderField(key, field) {
    const value = this.config?.[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
      case 'entity':
        return this._renderEntityField(key, field, value);
      case 'icon':
        return this._renderIconField(key, field, value);
      case 'select':
        return this._renderSelectField(key, field, value);
      case 'color':
        return this._renderColorField(key, field, value);
      case 'slider':
        return this._renderSliderField(key, field, value);
      case 'boolean':
        return this._renderBooleanField(key, field, value);
      default:
        return this._renderTextField(key, field, value);
    }
  }

  _renderBooleanField(key, field, value) {
    const currentValue = this.config?.[key] !== undefined ? this.config[key] : field.default;
    
    return html`
      <div class="boolean-field">
        <ha-switch
          .checked=${!!currentValue}
          @change=${e => this._onFieldChange(key, e.target.checked)}
        ></ha-switch>
        <div class="cf-flex cf-flex-column">
          <div class="field-label">${field.label}</div>
          ${field.description ? html`
            <div class="field-description">${field.description}</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderEntityField(key, field, value) {
    return html`
      ${this.availableEntities ? html`
        <ha-combo-box
          .items=${this.availableEntities}
          .value=${value || ''}
          @value-changed=${e => this._onFieldChange(key, e.detail.value)}
          allow-custom-value
          .label=${field.label}
          fullwidth
        ></ha-combo-box>
      ` : html`
        <ha-textfield
          .value=${value || ''}
          @input=${e => this._onFieldChange(key, e.target.value)}
          .label=${field.label}
          fullwidth
        ></ha-textfield>
      `}
    `;
  }

  _renderColorField(key, field, value) {
    const colorOptions = field.options || [
      { value: 'blue', label: '蓝色' },
      { value: 'red', label: '红色' },
      { value: 'green', label: '绿色' },
      { value: 'yellow', label: '黄色' },
      { value: 'purple', label: '紫色' }
    ];

    const getColorPreview = (colorValue) => {
      const colorMap = {
        blue: '#4285f4',
        red: '#ea4335',
        green: '#34a853',
        yellow: '#fbbc05',
        purple: '#a142f4'
      };
      return colorMap[colorValue] || colorValue;
    };

    const currentColor = value || field.default || 'blue';

    return html`
      <ha-select
        .value=${currentColor}
        @closed=${this._preventClose}
        naturalMenuWidth
        fixedMenuPosition
        fullwidth
        .label=${field.label}
      >
        ${colorOptions.map(option => html`
          <ha-list-item 
            .value=${option.value}
            @click=${() => this._onFieldChange(key, option.value)}
          >
            <div class="cf-flex cf-gap-sm">
              <div class="color-preview" style="background: ${getColorPreview(option.value)}"></div>
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

    return html`
      <div class="slider-container">
        <ha-slider
          .value=${currentValue}
          .min=${min}
          .max=${max}
          .step=${step}
          @change=${e => this._onFieldChange(key, parseInt(e.target.value))}
          pin
          fullwidth
        ></ha-slider>
        <div class="slider-value">${currentValue}${field.unit || ''}</div>
      </div>
      <div class="field-label">${field.label}</div>
    `;
  }

  _renderIconField(key, field, value) {
    return html`
      <ha-icon-picker
        .value=${value || ''}
        @value-changed=${e => this._onFieldChange(key, e.detail.value)}
        .label=${field.label}
        fullwidth
      ></ha-icon-picker>
    `;
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];

    return html`
      <ha-select
        .value=${value || ''}
        @closed=${this._preventClose}
        naturalMenuWidth
        fixedMenuPosition
        fullwidth
        .label=${field.label}
      >
        ${options.map(option => html`
          <ha-list-item 
            .value=${option.value || option}
            @click=${() => this._onFieldChange(key, option.value || option)}
          >
            ${option.label || option}
          </ha-list-item>
        `)}
      </ha-select>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <ha-textfield
        .value=${value || ''}
        @input=${e => this._onFieldChange(key, e.target.value)}
        placeholder=${field.placeholder || ''}
        fullwidth
        .label=${field.label}
      ></ha-textfield>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:check-circle"></ha-icon>
        <div class="cf-text-md">无需额外配置</div>
      </div>
    `;
  }

  _onFieldChange(key, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { [key]: value } }
    }));
  }

  _preventClose(e) {
    e.stopPropagation();
  }
}

if (!customElements.get('form-builder')) {
  customElements.define('form-builder', FormBuilder);
}
export { FormBuilder };