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
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
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

      /* 实体选择器样式 */
      .entity-field {
        width: 100%;
      }

      /* 图标选择器样式 */
      .icon-field {
        width: 100%;
      }

      /* 文本区域样式 */
      .textarea-field {
        width: 100%;
        min-height: 80px;
        resize: vertical;
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
      case 'textarea':
        return this._renderTextareaField(key, field, value);
      case 'select':
        return this._renderSelectField(key, field, value);
      case 'boolean':
        return this._renderBooleanField(key, field, value);
      case 'color':
        return this._renderColorField(key, field, value);
      default:
        return this._renderTextField(key, field, value);
    }
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
            label="选择或输入实体ID"
            fullwidth
            class="entity-field"
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

  _renderIconField(key, field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-icon-picker
          .value=${value || ''}
          @value-changed=${e => this._onFieldChange(key, e.detail.value)}
          label="选择图标"
          fullwidth
          class="icon-field"
        ></ha-icon-picker>
      </div>
    `;
  }

  _renderTextareaField(key, field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-textarea
          .value=${value || ''}
          @input=${e => this._onFieldChange(key, e.target.value)}
          placeholder=${field.placeholder || ''}
          rows="3"
          fullwidth
          class="textarea-field"
        ></ha-textarea>
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

  _renderBooleanField(key, field, value) {
    return html`
      <div class="form-field">
        <ha-switch
          .checked=${!!value}
          @change=${e => this._onFieldChange(key, e.target.checked)}
        ></ha-switch>
        <div class="field-label" style="margin-bottom: 0;">${field.label}</div>
      </div>
    `;
  }

  _renderColorField(key, field, value) {
    return html`
      <div class="form-field">
        <div class="field-label">${field.label}</div>
        <ha-textfield
          .value=${value || ''}
          @input=${e => this._onFieldChange(key, e.target.value)}
          placeholder="#000000"
          fullwidth
        ></ha-textfield>
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
