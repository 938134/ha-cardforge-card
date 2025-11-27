// src/editors/dynamic-form.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class DynamicForm extends LitElement {
  static properties = {
    config: { type: Object },
    schema: { type: Object },
    _formValues: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .dynamic-form {
        width: 100%;
      }

      /* 布尔值字段网格 - 2列 */
      .boolean-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }

      /* 选择器字段网格 - 2列 */
      .select-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      /* 输入字段 - 全宽度 */
      .input-grid {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      /* 布尔值字段样式 */
      .switch-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        transition: all var(--cf-transition-fast);
        min-height: 52px;
      }

      .switch-field:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .switch-label {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        flex: 1;
      }

      /* 选择器和输入字段 */
      .select-field,
      .text-field,
      .color-field {
        width: 100%;
      }

      /* 颜色选择器容器 - 简化版本 */
      .color-field-container {
        width: 100%;
      }

      /* 全宽度字段 */
      .full-width {
        grid-column: 1 / -1;
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .boolean-grid,
        .select-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .switch-field {
          min-height: 48px;
          padding: var(--cf-spacing-sm);
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .switch-field {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }
    `
  ];

  constructor() {
    super();
    this._formValues = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('schema')) {
      this._initializeFormValues();
    }
  }

  _initializeFormValues() {
    if (!this.schema) return;

    this._formValues = { ...this.config };
    
    // 设置默认值
    Object.entries(this.schema).forEach(([key, field]) => {
      if (this._formValues[key] === undefined && field.default !== undefined) {
        this._formValues[key] = field.default;
      }
    });
  }

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    const booleanFields = this._getFieldsByType('boolean');
    const selectFields = this._getFieldsByType('select');
    const colorFields = this._getFieldsByType('color');
    const otherFields = this._getOtherFields();

    return html`
      <div class="dynamic-form">
        ${booleanFields.length > 0 ? this._renderBooleanGrid(booleanFields) : ''}
        ${selectFields.length > 0 ? this._renderSelectGrid(selectFields) : ''}
        ${colorFields.length > 0 ? this._renderColorFields(colorFields) : ''}
        ${otherFields.length > 0 ? this._renderInputGrid(otherFields) : ''}
      </div>
    `;
  }

  _getFieldsByType(type) {
    if (!this.schema) return [];
    return Object.entries(this.schema)
      .filter(([key, field]) => field.type === type)
      .map(([key, field]) => ({ key, ...field }));
  }

  _getOtherFields() {
    if (!this.schema) return [];
    const excludedTypes = ['boolean', 'select', 'color'];
    return Object.entries(this.schema)
      .filter(([key, field]) => !excludedTypes.includes(field.type))
      .map(([key, field]) => ({ key, ...field }));
  }

  _renderBooleanGrid(fields) {
    return html`
      <div class="boolean-grid">
        ${fields.map(field => this._renderBooleanField(field))}
      </div>
    `;
  }

  _renderSelectGrid(fields) {
    return html`
      <div class="select-grid">
        ${fields.map(field => this._renderSelectField(field))}
      </div>
    `;
  }

  _renderColorFields(fields) {
    return html`
      <div class="select-grid">
        ${fields.map(field => this._renderColorField(field))}
      </div>
    `;
  }

  _renderInputGrid(fields) {
    if (fields.length === 0) return '';

    return html`
      <div class="input-grid">
        ${fields.map(field => this._renderInputField(field))}
      </div>
    `;
  }

  _renderBooleanField(field) {
    const value = this._formValues[field.key] !== undefined ? this._formValues[field.key] : field.default;

    return html`
      <div class="switch-field">
        <span class="switch-label">${field.label}</span>
        <ha-switch
          .checked=${!!value}
          @change=${e => this._onFieldChange(field.key, e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }

  _renderSelectField(field) {
    const value = this._formValues[field.key] !== undefined ? this._formValues[field.key] : field.default;
    const options = field.options || [];

    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-select
          .value=${value || ''}
          @closed=${this._preventClose}
          naturalMenuWidth
          fixedMenuPosition
          class="select-field"
        >
          ${options.map(option => html`
            <ha-list-item 
              .value=${option}
              @click=${() => this._onFieldChange(field.key, option)}
            >
              ${option}
            </ha-list-item>
          `)}
        </ha-select>
      </div>
    `;
  }

  _renderColorField(field) {
    const value = this._formValues[field.key] !== undefined ? this._formValues[field.key] : field.default;

    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <div class="color-field-container">
          <ha-color-picker
            .value=${value || '#000000'}
            @value-changed=${e => this._onFieldChange(field.key, e.detail.value)}
            .label=${field.label}
            fullwidth
          ></ha-color-picker>
        </div>
      </div>
    `;
  }

  _renderInputField(field) {
    const value = this._formValues[field.key] !== undefined ? this._formValues[field.key] : field.default;
    const isFullWidth = field.type === 'text' || field.type === 'textarea';

    return html`
      <div class="form-field ${isFullWidth ? 'full-width' : ''}">
        <div class="field-label">${field.label}</div>
        ${field.type === 'textarea' ? 
          this._renderTextareaField(field, value) :
          this._renderTextField(field, value)
        }
      </div>
    `;
  }

  _renderTextField(field, value) {
    return html`
      <ha-textfield
        .value=${value || ''}
        @input=${e => this._onFieldChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
        .type=${field.type === 'number' ? 'number' : 'text'}
        .min=${field.min}
        .max=${field.max}
        fullwidth
        class="text-field"
        placeholder=${field.placeholder || ''}
      ></ha-textfield>
    `;
  }

  _renderTextareaField(field, value) {
    return html`
      <ha-textarea
        .value=${value || ''}
        @input=${e => this._onFieldChange(field.key, e.target.value)}
        rows="3"
        fullwidth
        class="text-field"
        placeholder=${field.placeholder || ''}
      ></ha-textarea>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-lg">
        <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color); font-size: 2em;"></ha-icon>
        <div class="cf-text-md cf-mt-md cf-text-secondary">此卡片无需额外配置</div>
      </div>
    `;
  }

  _onFieldChange(key, value) {
    this._formValues[key] = value;
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { [key]: value } }
    }));
  }

  _preventClose(e) {
    e.stopPropagation();
  }
}

if (!customElements.get('dynamic-form')) {
  customElements.define('dynamic-form', DynamicForm);
}

export { DynamicForm };
