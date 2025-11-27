// src/editors/dynamic-form.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class DynamicForm extends LitElement {
  static properties = {
    config: { type: Object },
    schema: { type: Object },
    _formValues: { state: true },
    _leftColumnFields: { state: true },
    _rightColumnFields: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .dynamic-form {
        width: 100%;
      }

      /* 双栏网格布局 */
      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-lg);
        align-items: start;
      }

      .settings-column {
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
        font-weight: 500;
        font-size: 0.9em;
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

      /* 选择器字段 */
      .select-field {
        width: 100%;
      }

      /* 颜色选择器 - 确保正确显示 */
      .color-picker-container {
        width: 100%;
      }

      ha-color-picker {
        width: 100%;
        --ha-color-picker-width: 100%;
        --ha-color-picker-height: 40px;
      }

      /* 输入字段 */
      .text-field {
        width: 100%;
      }

      /* 空状态 */
      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .settings-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
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
    this._leftColumnFields = [];
    this._rightColumnFields = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('schema')) {
      this._initializeFormValues();
      this._distributeFields();
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

  _distributeFields() {
    if (!this.schema) {
      this._leftColumnFields = [];
      this._rightColumnFields = [];
      return;
    }

    const fields = Object.entries(this.schema).map(([key, field]) => ({
      key,
      ...field
    }));

    // 智能分配字段到两列
    this._leftColumnFields = [];
    this._rightColumnFields = [];

    // 先分配布尔字段，平衡两列
    const booleanFields = fields.filter(field => field.type === 'boolean');
    const otherFields = fields.filter(field => field.type !== 'boolean');

    // 平均分配布尔字段
    const booleanMid = Math.ceil(booleanFields.length / 2);
    this._leftColumnFields.push(...booleanFields.slice(0, booleanMid));
    this._rightColumnFields.push(...booleanFields.slice(booleanMid));

    // 分配其他字段，保持两列平衡
    const totalFields = booleanFields.length + otherFields.length;
    const targetPerColumn = Math.ceil(totalFields / 2);
    
    const currentLeftCount = this._leftColumnFields.length;
    const currentRightCount = this._rightColumnFields.length;

    // 为左列添加其他字段直到达到目标数量
    const leftNeeded = Math.max(0, targetPerColumn - currentLeftCount);
    this._leftColumnFields.push(...otherFields.slice(0, leftNeeded));

    // 剩余字段分配到右列
    this._rightColumnFields.push(...otherFields.slice(leftNeeded));
  }

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    return html`
      <div class="dynamic-form">
        <div class="settings-grid">
          <!-- 左列 -->
          <div class="settings-column">
            ${this._leftColumnFields.map(field => this._renderField(field))}
          </div>

          <!-- 右列 -->
          <div class="settings-column">
            ${this._rightColumnFields.map(field => this._renderField(field))}
          </div>
        </div>
      </div>
    `;
  }

  _renderField(field) {
    switch (field.type) {
      case 'boolean':
        return this._renderBooleanField(field);
      case 'select':
        return this._renderSelectField(field);
      case 'color':
        return this._renderColorField(field);
      default:
        return this._renderInputField(field);
    }
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
        <div class="color-picker-container">
          <ha-color-picker
            .value=${value || '#000000'}
            @value-changed=${e => this._onFieldChange(field.key, e.detail.value)}
            .label=${field.label}
          ></ha-color-picker>
        </div>
      </div>
    `;
  }

  _renderInputField(field) {
    const value = this._formValues[field.key] !== undefined ? this._formValues[field.key] : field.default;

    return html`
      <div class="form-field">
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
      <div class="empty-state">
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
