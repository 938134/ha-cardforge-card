// src/editors/dynamic-form.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class DynamicForm extends LitElement {
  static properties = {
    config: { type: Object },
    schema: { type: Object },
    _formValues: { state: true },
    _fieldGroups: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .dynamic-form {
        width: 100%;
      }

      /* 智能网格布局 - 自适应列数 */
      .smart-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      /* 紧凑模式 - 更多列 */
      .smart-grid.compact {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      /* 超紧凑模式 - 最小列宽 */
      .smart-grid.ultra-compact {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--cf-spacing-xs);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        min-height: 70px;
      }

      .field-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }

      /* 布尔值字段样式 */
      .switch-field {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        transition: all var(--cf-transition-fast);
        min-height: 70px;
        justify-content: space-between;
      }

      .switch-field:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .switch-label {
        font-size: 0.85em;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }

      .switch-control {
        align-self: flex-end;
      }

      /* 选择器和输入字段 */
      .select-field,
      .text-field,
      .color-field {
        width: 100%;
      }

      /* 颜色选择器紧凑样式 */
      .color-field {
        width: 100%;
      }

      /* 文本区域全宽度 */
      .textarea-field {
        grid-column: 1 / -1;
      }

      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

      /* 响应式适配 */
      @media (max-width: 1200px) {
        .smart-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
        
        .smart-grid.compact {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
      }

      @media (max-width: 768px) {
        .smart-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--cf-spacing-sm);
        }
        
        .smart-grid.compact {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
        
        .smart-grid.ultra-compact {
          grid-template-columns: 1fr;
        }
        
        .form-field {
          min-height: 65px;
        }
        
        .switch-field {
          min-height: 65px;
          padding: var(--cf-spacing-xs);
        }
      }

      @media (max-width: 480px) {
        .smart-grid {
          grid-template-columns: 1fr;
        }
        
        .smart-grid.compact,
        .smart-grid.ultra-compact {
          grid-template-columns: 1fr;
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
    this._fieldGroups = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('schema')) {
      this._initializeFormValues();
      this._organizeFields();
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

  _organizeFields() {
    if (!this.schema) {
      this._fieldGroups = [];
      return;
    }

    const fields = Object.entries(this.schema).map(([key, field]) => ({
      key,
      ...field
    }));

    // 根据字段类型和数量智能分组
    const booleanFields = fields.filter(field => field.type === 'boolean');
    const selectFields = fields.filter(field => field.type === 'select');
    const colorFields = fields.filter(field => field.type === 'color');
    const otherFields = fields.filter(field => 
      !['boolean', 'select', 'color'].includes(field.type)
    );

    this._fieldGroups = [];

    // 第一组：选择器和颜色字段（高优先级）
    if (selectFields.length > 0 || colorFields.length > 0) {
      this._fieldGroups.push({
        name: 'style-settings',
        fields: [...selectFields, ...colorFields],
        compact: selectFields.length + colorFields.length > 4
      });
    }

    // 第二组：布尔字段
    if (booleanFields.length > 0) {
      this._fieldGroups.push({
        name: 'display-controls',
        fields: booleanFields,
        compact: booleanFields.length > 3
      });
    }

    // 第三组：其他字段
    if (otherFields.length > 0) {
      this._fieldGroups.push({
        name: 'advanced-settings',
        fields: otherFields,
        compact: false
      });
    }
  }

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    return html`
      <div class="dynamic-form">
        ${this._fieldGroups.map(group => this._renderFieldGroup(group))}
      </div>
    `;
  }

  _renderFieldGroup(group) {
    if (!group.fields || group.fields.length === 0) return '';

    const gridClass = group.compact ? 'smart-grid compact' : 'smart-grid';

    return html`
      <div class="${gridClass}">
        ${group.fields.map(field => this._renderField(field))}
      </div>
    `;
  }

  _renderField(field) {
    const value = this._formValues[field.key] !== undefined ? 
      this._formValues[field.key] : field.default;

    switch (field.type) {
      case 'boolean':
        return this._renderBooleanField(field, value);
      case 'select':
        return this._renderSelectField(field, value);
      case 'color':
        return this._renderColorField(field, value);
      case 'textarea':
        return this._renderTextareaField(field, value);
      default:
        return this._renderInputField(field, value);
    }
  }

  _renderBooleanField(field, value) {
    return html`
      <div class="form-field">
        <div class="switch-field">
          <div class="switch-label">${field.label}</div>
          <div class="switch-control">
            <ha-switch
              .checked=${!!value}
              @change=${e => this._onFieldChange(field.key, e.target.checked)}
            ></ha-switch>
          </div>
        </div>
      </div>
    `;
  }

  _renderSelectField(field, value) {
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

  _renderColorField(field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-color-picker
          .value=${value || '#000000'}
          @value-changed=${e => this._onFieldChange(field.key, e.detail.value)}
          class="color-field"
        ></ha-color-picker>
      </div>
    `;
  }

  _renderInputField(field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
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
      </div>
    `;
  }

  _renderTextareaField(field, value) {
    return html`
      <div class="form-field textarea-field">
        <div class="field-label">${field.label}</div>
        <ha-textarea
          .value=${value || ''}
          @input=${e => this._onFieldChange(field.key, e.target.value)}
          rows="3"
          fullwidth
          class="text-field"
          placeholder=${field.placeholder || ''}
        ></ha-textarea>
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color); font-size: 2em; margin-bottom: var(--cf-spacing-sm);"></ha-icon>
        <div class="cf-text-md cf-text-secondary">此卡片无需额外配置</div>
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