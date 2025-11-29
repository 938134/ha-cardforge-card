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
      }

      /* 动态网格布局 - 按列填充 */
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--cf-spacing-md);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      /* 开关字段样式 */
      .switch-field {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        min-height: 44px;
      }

      .field-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      /* 颜色选择器样式 */
      .color-picker {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .color-preview {
        width: 20px;
        height: 20px;
        border-radius: var(--cf-radius-sm);
        border: 1px solid var(--cf-border);
      }

      /* 滑动条样式 */
      .slider-container {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .slider-value {
        min-width: 40px;
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        text-align: right;
      }

      /* 移动端适配 */
      @container (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .switch-field {
          padding: var(--cf-spacing-xs);
        }

        .form-field {
          gap: var(--cf-spacing-xs);
        }
      }

      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-lg);
        color: var(--cf-text-secondary);
      }

      .empty-icon {
        font-size: 2em;
        opacity: 0.5;
        margin-bottom: var(--cf-spacing-md);
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    return html`
      <div class="form-builder">
        <div class="form-grid">
          ${Object.entries(this.schema).map(([key, field]) => 
            this._renderField(key, field)
          )}
        </div>
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
      <div class="form-field">
        <div class="switch-field">
          <ha-switch
            .checked=${!!currentValue}
            @change=${e => this._onFieldChange(key, e.target.checked)}
          ></ha-switch>
          <div class="field-label">${field.label}</div>
        </div>
      </div>
    `;
  }

  _renderEntityField(key, field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        ${this.availableEntities ? html`
          <ha-combo-box
            .items=${this.availableEntities}
            .value=${value || ''}
            @value-changed=${e => this._onFieldChange(key, e.detail.value)}
            allow-custom-value
            label="选择实体"
            fullwidth
          ></ha-combo-box>
        ` : html`
          <ha-textfield
            .value=${value || ''}
            @input=${e => this._onFieldChange(key, e.target.value)}
            placeholder="输入实体ID"
            fullwidth
          ></ha-textfield>
        `}
      </div>
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
    const previewColor = getColorPreview(currentColor);

    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-select
          .value=${currentColor}
          @closed=${this._preventClose}
          naturalMenuWidth
          fixedMenuPosition
          fullwidth
        >
          ${colorOptions.map(option => html`
            <ha-list-item 
              .value=${option.value}
              @click=${() => this._onFieldChange(key, option.value)}
            >
              <div class="color-picker">
                <div class="color-preview" style="background: ${getColorPreview(option.value)}"></div>
                <span>${option.label}</span>
              </div>
            </ha-list-item>
          `)}
        </ha-select>
      </div>
    `;
  }

  _renderSliderField(key, field, value) {
    const currentValue = value !== undefined ? value : field.default || field.min || 0;
    const min = field.min || 0;
    const max = field.max || 100;
    const step = field.step || 1;

    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
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
      </div>
    `;
  }

  _renderIconField(key, field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-icon-picker
          .value=${value || ''}
          @value-changed=${e => this._onFieldChange(key, e.detail.value)}
          label="选择图标"
          fullwidth
        ></ha-icon-picker>
      </div>
    `;
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];

    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-select
          .value=${value || ''}
          @closed=${this._preventClose}
          naturalMenuWidth
          fixedMenuPosition
          fullwidth
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
      </div>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-textfield
          .value=${value || ''}
          @input=${e => this._onFieldChange(key, e.target.value)}
          placeholder=${field.placeholder || ''}
          fullwidth
        ></ha-textfield>
      </div>
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