// src/editors/config-editors.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class BaseConfigEditor extends LitElement {
  static properties = {
    config: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .config-editor {
        width: 100%;
      }

      .simple-config-grid {
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

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      @media (max-width: 768px) {
        .simple-config-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  render() {
    // 基础配置只有主题和动画
    const baseSchema = {
      'theme': {
        type: 'select',
        label: '主题风格',
        options: ['自动', '浅色', '深色', '毛玻璃', '渐变', '霓虹', '水墨'],
        default: '自动'
      },
      'animation': {
        type: 'select',
        label: '入场动画',
        options: ['无', '淡入', '上浮', '缩放'],
        default: '淡入'
      }
    };

    return html`
      <div class="config-editor">
        <div class="simple-config-grid">
          ${Object.entries(baseSchema).map(([key, field]) => 
            this._renderField(key, field)
          )}
        </div>
      </div>
    `;
  }

  _renderField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

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
          @value-changed=${e => this._onConfigChanged(key, e.detail.value)}
          allow-custom-value
        ></ha-combo-box>
      </div>
    `;
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

export class AdvancedConfigEditor extends LitElement {
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

      .plugin-config-grid {
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
        .plugin-config-grid {
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
        ${booleanFields.length > 0 ? html`
          <div class="plugin-config-grid">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        ${otherFields.length > 0 ? html`
          <div class="plugin-config-grid">
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
        <span class="switch-label">${field.label}</span>
        <ha-switch
          .checked=${!!currentValue}
          @change=${e => this._onConfigChanged(key, e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }

  _renderOtherField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

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
          @value-changed=${e => this._onConfigChanged(key, e.detail.value)}
          allow-custom-value
        ></ha-combo-box>
      </div>
    `;
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

// 注册自定义元素
if (!customElements.get('base-config-editor')) {
  customElements.define('base-config-editor', BaseConfigEditor);
}

if (!customElements.get('advanced-config-editor')) {
  customElements.define('advanced-config-editor', AdvancedConfigEditor);
}
