// src/editors/config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class ConfigEditor extends LitElement {
  static properties = {
    config: { type: Object },
    pluginManifest: { type: Object },
    _schema: { state: true }
  };

  static styles = [
    designSystem,
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
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .required-star {
        color: var(--cf-error-color);
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

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      @media (max-width: 768px) {
        .config-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest')) {
      this._schema = this.pluginManifest?.config_schema || {};
    }
  }

  render() {
    if (Object.keys(this._schema).length === 0) {
      return html`
        <div class="config-editor">
          <div class="empty-state">
            <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color);"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">此卡片无需额外配置</div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="config-editor">
        <div class="config-grid">
          ${Object.entries(this._schema).map(([key, field]) => 
            this._renderField(key, field)
          )}
        </div>
      </div>
    `;
  }

  _renderField(key, field) {
    // 修复：正确处理默认值和当前值
    const defaultValue = field.default !== undefined ? field.default : false;
    const currentValue = this.config[key] !== undefined ? this.config[key] : defaultValue;

    switch (field.type) {
      case 'boolean':
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

if (!customElements.get('config-editor')) {
  customElements.define('config-editor', ConfigEditor);
}