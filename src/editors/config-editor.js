// src/editors/config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class ConfigEditor extends LitElement {
  static properties = {
    schema: { type: Object },
    config: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .config-editor {
        width: 100%;
      }

      .boolean-fields {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .boolean-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .boolean-field:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .boolean-label {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .other-fields {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .config-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
      }

      .config-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .config-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .config-field,
        .boolean-field {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .boolean-fields {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return this._renderEmptyState();
    }

    const booleanFields = this._getBooleanFields();
    const otherFields = this._getOtherFields();

    return html`
      <div class="config-editor">
        ${booleanFields.length > 0 ? html`
          <div class="boolean-fields">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        ${otherFields.length > 0 ? html`
          <div class="other-fields">
            ${otherFields.map(([key, field]) => this._renderOtherField(key, field))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _getBooleanFields() {
    return Object.entries(this.schema).filter(([_, field]) => field.type === 'boolean');
  }

  _getOtherFields() {
    return Object.entries(this.schema).filter(([_, field]) => field.type !== 'boolean');
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color); font-size: 3em; margin-bottom: var(--cf-spacing-md);"></ha-icon>
        <div class="cf-text-sm cf-text-secondary">此卡片无需额外配置</div>
      </div>
    `;
  }

  _renderBooleanField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    return html`
      <div class="boolean-field" @click=${() => this._toggleBoolean(key, !currentValue)}>
        <span class="boolean-label">${field.label}</span>
        <ha-switch
          .checked=${!!currentValue}
          @click=${(e) => e.stopPropagation()}
          @change=${(e) => this._toggleBoolean(key, e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }

  _renderOtherField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
      case 'select':
        return this._renderSelectField(key, field, currentValue);
      case 'number':
        return this._renderNumberField(key, field, currentValue);
      default:
        return this._renderTextField(key, field, currentValue);
    }
  }

  _renderSelectField(key, field, currentValue) {
    const items = field.options.map(option => ({
      value: option,
      label: option
    }));

    return html`
      <div class="config-field">
        <label class="config-label">${field.label}</label>
        <ha-combo-box
          .items=${items}
          .value=${currentValue}
          @value-changed=${e => this._onFieldChanged(key, e.detail.value)}
          allow-custom-value
        ></ha-combo-box>
        ${field.description ? html`
          <div class="config-description">${field.description}</div>
        ` : ''}
      </div>
    `;
  }

  _renderNumberField(key, field, currentValue) {
    return html`
      <div class="config-field">
        <label class="config-label">${field.label}</label>
        <ha-textfield
          .value=${currentValue}
          @input=${e => this._onFieldChanged(key, e.target.value)}
          type="number"
          min=${field.min || ''}
          max=${field.max || ''}
          outlined
        ></ha-textfield>
        ${field.description ? html`
          <div class="config-description">${field.description}</div>
        ` : ''}
      </div>
    `;
  }

  _renderTextField(key, field, currentValue) {
    return html`
      <div class="config-field">
        <label class="config-label">${field.label}</label>
        <ha-textfield
          .value=${currentValue}
          @input=${e => this._onFieldChanged(key, e.target.value)}
          placeholder=${field.placeholder || ''}
          outlined
        ></ha-textfield>
        ${field.description ? html`
          <div class="config-description">${field.description}</div>
        ` : ''}
      </div>
    `;
  }

  _toggleBoolean(key, value) {
    this._onFieldChanged(key, value);
  }

  _onFieldChanged(key, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { 
        config: {
          [key]: value
        }
      }
    }));
  }
}

if (!customElements.get('config-editor')) {
  customElements.define('config-editor', ConfigEditor);
}
