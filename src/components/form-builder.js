// 表单构建器 - 优化标签显示
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
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
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .field-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
        line-height: 1.4;
      }
      
      .boolean-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
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
      }
      
      ha-textfield, ha-select, ha-combo-box, ha-icon-picker {
        width: 100%;
      }
      
      /* 必填字段标记 */
      .required-field::part(label) {
        position: relative;
      }
      
      .required-field::part(label)::after {
        content: "*";
        color: #f44336;
        margin-left: 4px;
      }
      
      /* 优化表单控件间距 */
      .form-grid > .form-field {
        margin-bottom: 4px;
      }
      
      /* 响应式调整 */
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        .boolean-group {
          grid-template-columns: 1fr;
        }
      }
      
      @media (max-width: 480px) {
        .form-grid {
          gap: 14px;
        }
        
        .boolean-item {
          padding: 6px 10px;
        }
      }
    `
  ];

  render() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return html`
        <div style="text-align:center;padding:32px 20px;color:var(--cf-text-secondary)">
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          <div>此卡片无需额外配置</div>
        </div>
      `;
    }

    // 处理字段
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
      <div class="form-builder">
        <!-- 布尔字段组 -->
        ${booleanFields.length > 0 ? html`
          <div class="boolean-group">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        <!-- 其他字段 -->
        ${otherFields.length > 0 ? html`
          <div class="form-grid">
            ${otherFields.map(([key, field]) => html`
              <div class="form-field ${field.required ? 'required-field' : ''}">
                ${this._renderField(key, field)}
                ${field.description ? html`
                  <div class="field-description">${field.description}</div>
                ` : ''}
              </div>
            `)}
          </div>
        ` : ''}
      </div>
    `;
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
        .label=${field.label + (field.required ? ' *' : '')}
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
        .label=${field.label + (field.required ? ' *' : '')}
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
          .label=${field.label + (field.required ? ' *' : '')}
          fullwidth
        ></ha-combo-box>
      ` : html`
        <ha-textfield
          .value=${value}
          @input=${e => this._updateField(key, e.target.value)}
          .label=${field.label + (field.required ? ' *' : '')}
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
        .label=${field.label + (field.required ? ' *' : '')}
        fullwidth
      ></ha-icon-picker>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <ha-textfield
        .value=${value}
        @input=${e => this._updateField(key, e.target.value)}
        .label=${field.label + (field.required ? ' *' : '')}
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