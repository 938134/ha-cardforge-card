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

      /* 开关项网格布局 */
      .grid-switches {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      /* 样式设置网格布局 */
      .grid-styles {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--cf-spacing-md);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        min-height: 60px;
      }

      /* 开关项样式 */
      .switch-field {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm) 0;
      }

      .switch-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        cursor: pointer;
      }

      /* 下拉框和输入框样式 */
      .select-field, .text-field {
        width: 100%;
      }

      /* 颜色选择器样式 */
      .color-field {
        width: 100%;
      }

      .color-preview {
        width: 24px;
        height: 24px;
        border-radius: var(--cf-radius-sm);
        border: 1px solid var(--cf-border);
        margin-right: var(--cf-spacing-sm);
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

      /* 移动端适配 */
      @media (max-width: 768px) {
        .grid-switches,
        .grid-styles {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
        
        .form-field {
          min-height: 50px;
        }
      }

      @media (max-width: 600px) {
        .grid-switches,
        .grid-styles {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    // 分组渲染：开关项和样式设置
    const switchFields = [];
    const styleFields = [];

    Object.entries(this.schema).forEach(([key, field]) => {
      if (field.type === 'boolean') {
        switchFields.push([key, field]);
      } else {
        styleFields.push([key, field]);
      }
    });

    return html`
      <div class="form-builder">
        ${switchFields.length > 0 ? html`
          <div class="grid-switches">
            ${switchFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        ${styleFields.length > 0 ? html`
          <div class="grid-styles">
            ${styleFields.map(([key, field]) => this._renderField(key, field))}
          </div>
        ` : ''}
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
      default:
        return this._renderTextField(key, field, value);
    }
  }

  _renderBooleanField(key, field, value) {
    const currentValue = this.config?.[key] !== undefined ? this.config[key] : field.default;
    
    return html`
      <div class="form-field">
        <label class="switch-field">
          <ha-switch
            .checked=${!!currentValue}
            @change=${e => this._onFieldChange(key, e.target.checked)}
          ></ha-switch>
          <span class="switch-label">${field.label}</span>
        </label>
      </div>
    `;
  }

  _renderEntityField(key, field, value) {
    return html`
      <div class="form-field">
        <ha-combo-box
          class="select-field"
          .items=${this.availableEntities}
          .value=${value || ''}
          @value-changed=${e => this._onFieldChange(key, e.detail.value)}
          allow-custom-value
          label=${field.label}
          fullwidth
        ></ha-combo-box>
      </div>
    `;
  }

  _renderIconField(key, field, value) {
    return html`
      <div class="form-field">
        <ha-icon-picker
          .value=${value || ''}
          @value-changed=${e => this._onFieldChange(key, e.detail.value)}
          label=${field.label}
          fullwidth
        ></ha-icon-picker>
      </div>
    `;
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];

    return html`
      <div class="form-field">
        <ha-select
          class="select-field"
          .value=${value || ''}
          @closed=${this._preventClose}
          naturalMenuWidth
          fixedMenuPosition
          fullwidth
          label=${field.label}
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
      </div>
    `;
  }

  _renderColorField(key, field, value) {
    const currentValue = value || field.default || '#333333';
    
    return html`
      <div class="form-field">
        <ha-color-picker
          class="color-field"
          .value=${currentValue}
          @value-changed=${e => this._onFieldChange(key, e.detail.value)}
          label=${field.label}
          fullwidth
        ></ha-color-picker>
      </div>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <div class="form-field">
        <ha-textfield
          class="text-field"
          .value=${value || ''}
          @input=${e => this._onFieldChange(key, e.target.value)}
          placeholder=${field.placeholder || field.label}
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