// 表单构建器 - 智能多列布局（完全使用 Lit 框架）
import { LitElement, html, css } from 'lit';
import { designSystem } from '../core/design-system.js';

class FormBuilder extends LitElement {
  static properties = {
    config: { type: Object },
    schema: { type: Object },
    hass: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      /* 字段网格布局 - 智能多列 */
      .field-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px 12px;
        align-items: start;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      
      /* 字段宽度类别 */
      .field-wide {
        grid-column: 1 / -1;
      }
      
      .field-narrow {
        min-width: 150px;
      }
      
      .field-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
        line-height: 1.4;
        grid-column: 1 / -1;
      }
      
      /* 布尔字段组保持原有布局 */
      .boolean-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin-bottom: 8px;
      }
      
      .boolean-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: 8px;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }
      
      .boolean-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }
      
      /* 表单控件样式 */
      ha-textfield, ha-select, ha-combo-box, ha-icon-picker {
        width: 100%;
      }
      
      /* 必填字段标记 */
      ha-textfield[required]::part(label)::after,
      ha-select[required]::part(label)::after,
      ha-combo-box[required]::part(label)::after,
      ha-icon-picker[required]::part(label)::after {
        content: " *";
        color: #f44336;
      }
      
      /* 响应式调整 */
      @media (max-width: 768px) {
        .field-grid {
          grid-template-columns: 1fr;
          gap: 14px;
        }
        
        .boolean-group {
          grid-template-columns: 1fr;
        }
        
        .field-narrow {
          min-width: auto;
        }
      }
      
      @media (max-width: 480px) {
        .field-grid {
          gap: 12px;
        }
        
        .boolean-item {
          padding: 6px 10px;
        }
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 32px 20px;
        color: var(--cf-text-secondary);
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          <div>此卡片无需额外配置</div>
        </div>
      `;
    }

    const booleanFields = [];
    const otherFields = [];
    
    Object.entries(this.schema).forEach(([key, field]) => {
      if (field.type === 'boolean') {
        booleanFields.push([key, field]);
      } else {
        otherFields.push([key, field]);
      }
    });

    return html`
      <div class="form-container">
        <!-- 布尔字段组 -->
        ${booleanFields.length > 0 ? html`
          <div class="boolean-group">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        <!-- 其他字段 - 智能网格布局 -->
        ${otherFields.length > 0 ? html`
          <div class="field-grid">
            ${otherFields.map(([key, field]) => {
              const widthClass = this._getFieldWidthClass(field);
              const hasDescription = field.description;
              
              return html`
                <div class="form-field ${widthClass}">
                  ${this._renderField(key, field)}
                </div>
                ${hasDescription ? html`
                  <div class="field-description">
                    ${field.description}
                  </div>
                ` : ''}
              `;
            })}
          </div>
        ` : ''}
      </div>
    `;
  }

  _getFieldWidthClass(field) {
    switch (field.type) {
      case 'entity':
      case 'text':
        return 'field-wide';
        
      case 'select':
        const options = field.options || [];
        if (options.length <= 3) {
          return 'field-narrow';
        }
        return 'field-medium';
        
      case 'number':
      case 'icon':
        return 'field-narrow';
        
      default:
        return 'field-medium';
    }
  }

  _renderBooleanField(key, field) {
    const value = this.config?.[key] ?? field.default ?? false;
    
    return html`
      <div 
        class="boolean-item"
        @click=${() => this._updateField(key, !value)}
      >
        <ha-switch
          .checked=${value}
          @click=${e => e.stopPropagation()}
          @change=${e => this._updateField(key, e.target.checked)}
        ></ha-switch>
        <div>${field.label}${field.required ? ' *' : ''}</div>
      </div>
    `;
  }

  _renderField(key, field) {
    const value = this.config?.[key] ?? field.default ?? '';
    
    switch (field.type) {
      case 'select':
        return this._renderSelectField(key, field, value);
      case 'number':
        return this._renderNumberField(key, field, value);
      case 'entity':
        return this._renderEntityField(key, field, value);
      case 'icon':
        return this._renderIconField(key, field, value);
      default:
        return this._renderTextField(key, field, value);
    }
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];
    
    return html`
      <ha-select
        .value=${value}
        @closed=${e => e.stopPropagation()}
        fullwidth
        .label=${field.label}
        ?required=${field.required}
        @change=${e => this._updateField(key, e.target.value)}
      >
        ${options.map(option => html`
          <ha-list-item .value=${typeof option === 'object' ? option.value : option}>
            ${typeof option === 'object' ? option.label : option}
          </ha-list-item>
        `)}
      </ha-select>
    `;
  }

  _renderNumberField(key, field, value) {
    return html`
      <ha-textfield
        type="number"
        .value=${value}
        @input=${e => this._updateField(key, parseInt(e.target.value) || field.min || 0)}
        .label=${field.label}
        ?required=${field.required}
        .min=${field.min}
        .max=${field.max}
        .step=${field.step || 1}
        fullwidth
      ></ha-textfield>
    `;
  }

  _renderEntityField(key, field, value) {
    const entities = this._getAvailableEntities();
    
    return html`
      ${entities.length > 0 ? html`
        <ha-combo-box
          .items=${entities}
          .value=${value}
          @value-changed=${e => this._updateField(key, e.detail.value)}
          allow-custom-value
          .label=${field.label}
          ?required=${field.required}
          fullwidth
        ></ha-combo-box>
      ` : html`
        <ha-textfield
          .value=${value}
          @input=${e => this._updateField(key, e.target.value)}
          .label=${field.label}
          ?required=${field.required}
          fullwidth
        ></ha-textfield>
      `}
    `;
  }

  _renderIconField(key, field, value) {
    return html`
      <ha-icon-picker
        .value=${value}
        @value-changed=${e => this._updateField(key, e.detail.value)}
        .label=${field.label}
        ?required=${field.required}
        fullwidth
      ></ha-icon-picker>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <ha-textfield
        .value=${value}
        @input=${e => this._updateField(key, e.target.value)}
        .label=${field.label}
        ?required=${field.required}
        .placeholder=${field.placeholder || ''}
        fullwidth
      ></ha-textfield>
    `;
  }

  _getAvailableEntities() {
    if (!this.hass?.states) return [];
    
    return Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _updateField(key, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { [key]: value } }
    }));
  }
}

if (!customElements.get('form-builder')) {
  customElements.define('form-builder', FormBuilder);
}

export { FormBuilder };