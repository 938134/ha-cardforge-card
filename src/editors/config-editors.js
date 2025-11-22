// src/editors/config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class ConfigEditor extends LitElement {
  static properties = {
    config: { type: Object },
    pluginManifest: { type: Object },
    _schema: { state: true },
    _localConfig: { state: true }  // 添加本地状态管理
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

  constructor() {
    super();
    this._localConfig = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest')) {
      this._schema = this.pluginManifest?.config_schema || {};
    }
    
    if (changedProperties.has('config')) {
      // 同步配置到本地状态
      this._syncLocalConfig();
    }
  }

  _syncLocalConfig() {
    if (!this.config) return;
    
    // 应用默认值并同步配置
    this._localConfig = { ...this.config };
    
    // 确保所有配置字段都有值
    Object.entries(this._schema || {}).forEach(([key, field]) => {
      if (this._localConfig[key] === undefined && field.default !== undefined) {
        this._localConfig[key] = field.default;
      }
    });
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
    // 使用本地状态而不是直接使用config
    const currentValue = this._localConfig[key] !== undefined 
      ? this._localConfig[key] 
      : field.default;

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
              @change=${e => this._onBooleanChanged(key, e.target.checked)}
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
              .value=${currentValue || ''}
              @value-changed=${e => this._onSelectChanged(key, e.detail.value)}
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
              .value=${currentValue || ''}
              @input=${e => this._onInputChanged(key, e.target.value)}
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
              .value=${currentValue || ''}
              @input=${e => this._onInputChanged(key, e.target.value)}
              outlined
            ></ha-textfield>
          </div>
        `;
    }
  }

  _onBooleanChanged(key, value) {
    // 立即更新本地状态
    this._localConfig = {
      ...this._localConfig,
      [key]: value
    };
    
    // 立即触发配置变更事件
    this._debounceConfigChange();
  }

  _onSelectChanged(key, value) {
    this._localConfig = {
      ...this._localConfig,
      [key]: value
    };
    this._debounceConfigChange();
  }

  _onInputChanged(key, value) {
    this._localConfig = {
      ...this._localConfig,
      [key]: value
    };
    this._debounceConfigChange();
  }

  _debounceConfigChange() {
    // 清除之前的定时器
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    
    // 设置新的定时器，延迟触发配置变更
    this._debounceTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { 
          config: { ...this._localConfig }
        }
      }));
    }, 100); // 100ms 延迟，避免频繁触发
  }

  // 清理定时器
  disconnectedCallback() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    super.disconnectedCallback();
  }
}

if (!customElements.get('config-editor')) {
  customElements.define('config-editor', ConfigEditor);
}