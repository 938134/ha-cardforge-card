// src/editors/advanced-config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class AdvancedConfigEditor extends LitElement {
  static properties = {
    schema: { type: Object },
    config: { type: Object }
  };

  static styles = [
    foundationStyles,
    css`
      .config-editor {
        width: 100%;
      }

      .config-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
        width: 100%;
      }

      .config-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .config-label {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .required-star {
        color: var(--cf-error-color);
      }

      .switch-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
      }

      .switch-item {
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

      .switch-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .switch-label {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .number-input {
        width: 100%;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      /* 响应式优化 */
      @media (max-width: 1024px) {
        .config-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
        }
        
        .switch-group {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return html`
        <div class="config-editor">
          <div class="empty-state">
            <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color);"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">此卡片无需额外配置</div>
          </div>
        </div>
      `;
    }

    const booleanFields = Object.entries(this.schema).filter(([_, field]) => field.type === 'boolean');
    const otherFields = Object.entries(this.schema).filter(([_, field]) => field.type !== 'boolean');

    return html`
      <div class="config-editor">
        <!-- 布尔类型配置 -->
        ${booleanFields.length > 0 ? html`
          <div class="switch-group">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        <!-- 其他类型配置 -->
        ${otherFields.length > 0 ? html`
          <div class="config-grid">
            ${otherFields.map(([key, field]) => this._renderOtherField(key, field))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderBooleanField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;
    
    return html`
      <div class="switch-item">
        <span class="switch-label">
          ${field.label}
          ${field.required ? html`<span class="required-star">*</span>` : ''}
        </span>
        <ha-switch
          .checked=${!!currentValue}
          @change=${e => this._onConfigChanged(key, e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }

  _renderOtherField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
      case 'select':
        const items = field.options.map(option => ({
          value: option,
          label: option
        }));
        
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-combo-box
              .items=${items}
              .value=${currentValue}
              @value-changed=${e => this._onConfigChanged(key, e.detail.value)}
              allow-custom-value
            ></ha-combo-box>
          </div>
        `;
        
      case 'number':
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-textfield
              class="number-input"
              .value=${currentValue}
              @input=${e => this._onConfigChanged(key, e.target.value)}
              type="number"
              min=${field.min}
              max=${field.max}
              outlined
            ></ha-textfield>
          </div>
        `;
        
      default:
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-textfield
              .value=${currentValue}
              @input=${e => this._onConfigChanged(key, e.target.value)}
              outlined
            ></ha-textfield>
          </div>
        `;
    }
  }

  _onConfigChanged(key, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { 
        config: {
          [key]: value
        }
      }
    }));
  }
}

if (!customElements.get('advanced-config-editor')) {
  customElements.define('advanced-config-editor', AdvancedConfigEditor);
}