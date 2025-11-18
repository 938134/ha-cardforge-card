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

      .field-group {
        margin-bottom: var(--cf-spacing-xl);
      }

      .group-header {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        padding-bottom: var(--cf-spacing-xs);
        border-bottom: 2px solid var(--cf-border);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
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

      /* ha-combo-box 样式修复 */
      ha-combo-box {
        width: 100%;
        --paper-input-container-color: var(--cf-text-secondary);
        --paper-input-container-focus-color: var(--cf-primary-color);
        --paper-input-container-input-color: var(--cf-text-primary);
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .switch-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        ha-combo-box {
          --paper-input-container-color: var(--cf-dark-text-secondary);
          --paper-input-container-focus-color: var(--cf-primary-color);
          --paper-input-container-input-color: var(--cf-dark-text);
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
            此卡片无需额外配置
          </div>
        </div>
      `;
    }

    // 按分组组织配置字段
    const groupedFields = this._groupFieldsByCategory();

    return html`
      <div class="config-editor">
        ${Object.entries(groupedFields).map(([group, fields]) => 
          this._renderFieldGroup(group, fields)
        )}
      </div>
    `;
  }

  _groupFieldsByCategory() {
    const groups = {
      appearance: { name: '外观设置', icon: 'mdi:palette', fields: [] },
      behavior: { name: '行为设置', icon: 'mdi:play', fields: [] },
      content: { name: '内容设置', icon: 'mdi:format-align-left', fields: [] },
      layout: { name: '布局设置', icon: 'mdi:view-grid', fields: [] },
      other: { name: '其他设置', icon: 'mdi:dots-horizontal', fields: [] }
    };

    Object.entries(this.schema).forEach(([key, field]) => {
      const group = field.group || 'other';
      if (groups[group]) {
        groups[group].fields.push([key, field]);
      } else {
        groups.other.fields.push([key, field]);
      }
    });

    // 过滤掉空的分组
    return Object.fromEntries(
      Object.entries(groups).filter(([_, group]) => group.fields.length > 0)
    );
  }

  _renderFieldGroup(groupName, groupData) {
    const booleanFields = groupData.fields.filter(([_, field]) => field.type === 'boolean');
    const otherFields = groupData.fields.filter(([_, field]) => field.type !== 'boolean');

    return html`
      <div class="field-group">
        <div class="group-header">
          <ha-icon .icon=${groupData.icon}></ha-icon>
          <span>${groupData.name}</span>
        </div>

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

if (!customElements.get('config-editor')) {
  customElements.define('config-editor', ConfigEditor);
}