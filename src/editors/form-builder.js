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
      
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        width: 100%;
      }
      
      .form-cell {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }
      
      /* 布尔字段样式 */
      .boolean-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: 8px;
        min-height: 60px;
      }
      
      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: 4px;
      }
      
      .field-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
      }
      
      /* 颜色预览 */
      .color-preview {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid var(--cf-border);
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 20px;
        color: var(--cf-text-secondary);
        background: var(--cf-surface);
        border-radius: 8px;
        border: 2px dashed var(--cf-border);
      }
      
      .empty-icon {
        font-size: 2em;
        opacity: 0.5;
        margin-bottom: 12px;
      }
      
      /* 响应式设计 - 只在很窄的屏幕才切换为单列 */
      @media (max-width: 480px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: 12px;
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
        gap: 12px;
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
        gap: 8px;
        width: 100%;
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    // 获取所有字段并按类型排序：布尔类型优先
    const fields = Object.entries(this.schema).sort(([, fieldA], [, fieldB]) => {
      // 布尔类型排在最前面
      if (fieldA.type === 'boolean' && fieldB.type !== 'boolean') return -1;
      if (fieldA.type !== 'boolean' && fieldB.type === 'boolean') return 1;
      return 0; // 保持原有顺序
    });
    
    // 将字段分成每2个一组
    const rows = [];
    for (let i = 0; i < fields.length; i += 2) {
      rows.push(fields.slice(i, i + 2));
    }
    
    return html`
      <div class="form-builder">
        <div class="form-grid">
          ${rows.map(row => html`
            ${row.map(([key, field]) => html`
              <div class="form-cell ${field.type === 'boolean' ? 'boolean-cell' : ''}">
                ${this._renderField(key, field)}
                ${field.description ? html`
                  <div class="field-description">${field.description}</div>
                ` : ''}
              </div>
            `)}
          `)}
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
      <div style="display: flex; align-items: center; gap: 12px;">
        <ha-switch
          .checked=${!!currentValue}
          @change=${e => this._onFieldChange(key, e.target.checked)}
        ></ha-switch>
        <div style="display: flex; flex-direction: column;">
          <div class="field-label">${field.label}</div>
        </div>
      </div>
    `;
  }

  _renderEntityField(key, field, value) {
    return html`
      <div class="field-group">
        <div class="field-label">${field.label}</div>
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
            placeholder=${field.placeholder || ''}
            .label=${field.label}
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

    return html`
      <div class="field-group">
        <div class="field-label">${field.label}</div>
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
              <div style="display: flex; align-items: center; gap: 8px;">
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
      <div class="field-group">
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
      <div class="field-group">
        <div class="field-label">${field.label}</div>
        <ha-icon-picker
          .value=${value || ''}
          @value-changed=${e => this._onFieldChange(key, e.detail.value)}
          .label=${field.label}
          fullwidth
        ></ha-icon-picker>
      </div>
    `;
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];

    return html`
      <div class="field-group">
        <div class="field-label">${field.label}</div>
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
      </div>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <div class="field-group">
        <div class="field-label">${field.label}</div>
        <ha-textfield
          .value=${value || ''}
          @input=${e => this._onFieldChange(key, e.target.value)}
          placeholder=${field.placeholder || ''}
          .label=${field.label}
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