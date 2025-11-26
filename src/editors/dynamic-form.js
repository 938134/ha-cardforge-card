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

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--cf-spacing-md);
        align-items: start;
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

      .select-field,
      .text-field {
        width: 100%;
      }

      .color-preview {
        width: 20px;
        height: 20px;
        border-radius: var(--cf-radius-sm);
        border: 1px solid var(--cf-border);
        margin-left: var(--cf-spacing-sm);
      }

      .full-width {
        grid-column: 1 / -1;
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .form-grid {
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

    return html`
      <div class="dynamic-form">
        <div class="form-grid">
          ${Object.entries(this.schema).map(([key, field]) => 
            this._renderField(key, field)
          )}
        </div>
      </div>
    `;
  }

  _renderField(key, field) {
    const value = this._formValues[key] !== undefined ? this._formValues[key] : field.default;
    const isFullWidth = field.type === 'text' || field.type === 'textarea';

    return html`
      <div class="form-field ${isFullWidth ? 'full-width' : ''}">
        ${this._renderFieldLabel(field)}
        ${this._renderFieldInput(key, field, value)}
      </div>
    `;
  }

  _renderFieldLabel(field) {
    return html`
      <div class="field-label">
        ${field.label}
        ${field.required ? html`<span style="color: var(--cf-error-color);"> *</span>` : ''}
      </div>
    `;
  }

  _renderFieldInput(key, field, value) {
    switch (field.type) {
      case 'boolean':
        return this._renderSwitchField(key, field, value);
      case 'select':
        return this._renderSelectField(key, field, value);
      case 'number':
        return this._renderNumberField(key, field, value);
      case 'color':
        return this._renderColorField(key, field, value);
      case 'textarea':
        return this._renderTextareaField(key, field, value);
      default:
        return this._renderTextField(key, field, value);
    }
  }

  _renderSwitchField(key, field, value) {
    return html`
      <div class="switch-field">
        <span class="switch-label">${field.label}</span>
        <ha-switch
          .checked=${!!value}
          @change=${e => this._onFieldChange(key, e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];
    
    return html`
      <ha-select
        .label=${field.label}
        .value=${value || ''}
        @closed=${this._preventClose}
        naturalMenuWidth
        fixedMenuPosition
        class="select-field"
      >
        ${options.map(option => html`
          <ha-list-item 
            .value=${option}
            @click=${() => this._onFieldChange(key, option)}
          >
            ${option}
          </ha-list-item>
        `)}
      </ha-select>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <ha-textfield
        .label=${field.label}
        .value=${value || ''}
        @input=${e => this._onFieldChange(key, e.target.value)}
        .type=${field.type === 'number' ? 'number' : 'text'}
        .min=${field.min}
        .max=${field.max}
        fullwidth
        class="text-field"
      ></ha-textfield>
    `;
  }

  _renderNumberField(key, field, value) {
    return html`
      <ha-textfield
        .label=${field.label}
        .value=${value || ''}
        @input=${e => this._onFieldChange(key, Number(e.target.value))}
        type="number"
        .min=${field.min}
        .max=${field.max}
        fullwidth
        class="text-field"
      ></ha-textfield>
    `;
  }

  _renderColorField(key, field, value) {
    return html`
      <div style="display: flex; align-items: center; gap: var(--cf-spacing-sm);">
        <ha-textfield
          .label=${field.label}
          .value=${value || ''}
          @input=${e => this._onFieldChange(key, e.target.value)}
          fullwidth
          class="text-field"
        ></ha-textfield>
        <div 
          class="color-preview" 
          style="background: ${value || '#000000'};"
          title="颜色预览"
        ></div>
      </div>
    `;
  }

  _renderTextareaField(key, field, value) {
    return html`
      <ha-textarea
        .label=${field.label}
        .value=${value || ''}
        @input=${e => this._onFieldChange(key, e.target.value)}
        rows="3"
        fullwidth
        class="text-field"
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