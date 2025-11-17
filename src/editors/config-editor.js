// src/editors/config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class ConfigEditor extends LitElement {
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
        gap: var(--cf-spacing-lg);
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
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        margin-bottom: var(--cf-spacing-xs);
      }

      .required-star {
        color: var(--cf-error-color);
      }

      .switch-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
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

      /* ha-select 样式优化 */
      ha-select {
        width: 100%;
        --mdc-select-fill-color: var(--cf-surface);
        --mdc-select-label-ink-color: var(--cf-text-secondary);
        --mdc-select-ink-color: var(--cf-text-primary);
        --mdc-select-dropdown-icon-color: var(--cf-text-secondary);
        --mdc-select-focused-dropdown-icon-color: var(--cf-primary-color);
        --mdc-select-fill-color: var(--cf-surface);
        --mdc-select-idle-line-color: var(--cf-border);
        --mdc-select-hover-line-color: var(--cf-primary-color);
        --mdc-select-focused-line-color: var(--cf-primary-color);
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .switch-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        ha-select {
          --mdc-select-fill-color: var(--cf-dark-surface);
          --mdc-select-label-ink-color: var(--cf-dark-text-secondary);
          --mdc-select-ink-color: var(--cf-dark-text);
          --mdc-select-dropdown-icon-color: var(--cf-dark-text-secondary);
          --mdc-select-idle-line-color: var(--cf-dark-border);
        }
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

      @media (max-width: 768px) {
        .config-grid {
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return html`
        <div class="config-editor">
          <div class="cf-text-sm cf-text-secondary cf-text-center cf-p-md">
            此插件无需额外配置
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
            <ha-select
              .value=${currentValue}
              @selected=${e => this._onSelectChanged(key, e.target.value)}
              @closed=${e => e.stopPropagation()}
              fixedMenuPosition
              naturalMenuWidth
            >
              ${items.map(item => html`
                <mwc-list-item .value=${item.value}>${item.label}</mwc-list-item>
              `)}
            </ha-select>
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

  _onSelectChanged(key, value) {
    this._onConfigChanged(key, value);
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