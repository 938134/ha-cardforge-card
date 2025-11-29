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
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-sm);
      }
      .cell {
        flex: 1 1 280px;          /* 两列：最小 280px，不足自动换行 */
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      @media (max-width: 480px) {
        .cell {
          flex: 1 1 100%;         /* 窄屏 1 列 */
        }
      }
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

    /* 1. 先拿所有字段 */
    const fields = Object.entries(this.schema);

    /* 2. 排序：boolean 优先，其余保持原顺序 */
    const sorted = [
      ...fields.filter(([, f]) => f.type === 'boolean'),
      ...fields.filter(([, f]) => f.type !== 'boolean')
    ];

    /* 3. 每行两个组件 */
    const rows = [];
    for (let i = 0; i < sorted.length; i += 2) {
      rows.push(sorted.slice(i, i + 2));
    }

    return html`
      <div class="form-builder">
        ${rows.map(row => html`
          <div class="row">
            ${row.map(([key, field]) => html`
              <div class="cell">${this._renderField(key, field)}</div>
            `)}
          </div>
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
      <div class="cf-flex cf-gap-sm">
        <ha-switch
          .checked=${!!currentValue}
          @change=${e => this._onFieldChange(key, e.target.checked)}
        ></ha-switch>
        <div class="field-label">${field.label}</div>
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
      <div class="cf-flex cf-gap-sm">
        <ha-slider
          .value=${currentValue}
          .min=${min}
          .max=${max}
          .step=${step}
          @change=${e => this._onFieldChange(key, parseInt(e.target.value))}
          pin
          fullwidth
          .label=${field.label}
        ></ha-slider>
        <div class="cf-text-sm">${currentValue}${field.unit || ''}</div>
      </div>
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