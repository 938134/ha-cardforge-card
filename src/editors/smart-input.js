// src/editors/smart-input.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class SmartInput extends LitElement {
  static properties = {
    hass: { type: Object },
    requirement: { type: Object },
    value: { type: String },
    focused: { type: Boolean }
  };

  static styles = css`
    .smart-input-container {
      position: relative;
    }
    
    .smart-input {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
    }
    
    .smart-input:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.1);
    }
    
    .smart-input.entity {
      background: rgba(76, 175, 80, 0.05);
      border-color: rgba(76, 175, 80, 0.3);
    }
    
    .smart-input.jinja {
      background: rgba(255, 152, 0, 0.05);
      border-color: rgba(255, 152, 0, 0.3);
    }
    
    .smart-input.text {
      background: rgba(33, 150, 243, 0.05);
      border-color: rgba(33, 150, 243, 0.3);
    }
    
    .smart-input.empty {
      background: var(--card-background-color);
    }
    
    .input-icon {
      font-size: 1.1em;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }
    
    .smart-input ha-textfield {
      flex: 1;
      --mdc-text-field-fill-color: transparent;
      --mdc-text-field-label-ink-color: var(--secondary-text-color);
      --mdc-text-field-ink-color: var(--primary-text-color);
    }
    
    .type-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.7em;
      font-weight: 600;
      flex-shrink: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .type-badge.entity {
      background: rgba(76, 175, 80, 0.15);
      color: #2e7d32;
      border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    .type-badge.jinja {
      background: rgba(255, 152, 0, 0.15);
      color: #ef6c00;
      border: 1px solid rgba(255, 152, 0, 0.3);
    }
    
    .type-badge.text {
      background: rgba(33, 150, 243, 0.15);
      color: #1565c0;
      border: 1px solid rgba(33, 150, 243, 0.3);
    }
    
    .type-badge.empty {
      background: rgba(158, 158, 158, 0.15);
      color: #616161;
      border: 1px solid rgba(158, 158, 158, 0.3);
    }
    
    .value-preview {
      margin-top: 6px;
      padding: 6px 8px;
      background: var(--card-background-color);
      border-radius: 6px;
      font-size: 0.8em;
      display: flex;
      gap: 8px;
      align-items: center;
      border: 1px solid var(--divider-color);
    }
    
    .preview-label {
      color: var(--secondary-text-color);
      font-weight: 500;
      font-size: 0.75em;
    }
    
    .preview-value {
      color: var(--primary-text-color);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85em;
      flex: 1;
    }
    
    .input-hints {
      margin-top: 8px;
    }
    
    .hint-item {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      line-height: 1.4;
      margin-bottom: 2px;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }
    
    .hint-item::before {
      content: '💡';
      font-size: 0.9em;
      flex-shrink: 0;
      margin-top: 1px;
    }
    
    .quick-examples {
      margin-top: 8px;
      padding: 8px;
      background: rgba(var(--rgb-primary-color), 0.05);
      border-radius: 6px;
      border: 1px solid rgba(var(--rgb-primary-color), 0.1);
    }
    
    .examples-title {
      font-size: 0.75em;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }
    
    .example-item {
      font-size: 0.7em;
      color: var(--secondary-text-color);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      line-height: 1.3;
      margin-bottom: 2px;
    }
  `;

  render() {
    const valueType = this._detectValueType(this.value);
    const previewValue = this._getValuePreview(this.value, valueType);
    
    return html`
      <div class="smart-input-container">
        <div class="smart-input ${valueType}">
          <div class="input-icon">${this._getTypeIcon(valueType)}</div>
          <ha-textfield
            .label=${this._getInputLabel(valueType)}
            .value=${this.value}
            @input=${this._onInputChange}
            @focus=${this._onFocus}
            @blur=${this._onBlur}
            placeholder="输入实体ID、Jinja2模板或直接文本"
          ></ha-textfield>
          <div class="type-badge ${valueType}">${this._getTypeBadge(valueType)}</div>
        </div>
        
        ${previewValue ? html`
          <div class="value-preview">
            <span class="preview-label">预览:</span>
            <span class="preview-value">${previewValue}</span>
          </div>
        ` : ''}
        
        <div class="input-hints">
          ${this._getInputHints(valueType)}
        </div>

        ${this.focused ? html`
          <div class="quick-examples">
            <div class="examples-title">快速示例:</div>
            ${this._getQuickExamples(valueType)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _detectValueType(value) {
    if (!value) return 'empty';
    if (value.includes('{{') || value.includes('{%')) return 'jinja';
    if (value.includes('.') && this._isValidEntityId(value)) return 'entity';
    return 'text';
  }

  _isValidEntityId(value) {
    return /^[a-z_]+\.[a-z0-9_]+$/i.test(value.trim());
  }

  _getTypeIcon(type) {
    const icons = { 'empty': '🌐', 'entity': '🏷️', 'jinja': '🔧', 'text': '📝' };
    return icons[type] || '🌐';
  }

  _getTypeBadge(type) {
    const badges = { 'empty': '未设置', 'entity': '实体', 'jinja': '模板', 'text': '文本' };
    return badges[type] || '未知';
  }

  _getInputLabel(type) {
    const labels = {
      'entity': `实体ID`,
      'jinja': `Jinja2模板`,
      'text': `文本内容`,
      'empty': `${this.requirement?.description || '配置'}`
    };
    return labels[type] || '配置';
  }

  _getValuePreview(value, type) {
    if (!value) return '';
    
    try {
      switch (type) {
        case 'entity':
          const entity = this.hass?.states[value];
          return entity ? `${entity.state}${this._getEntityUnit(entity)}` : '❌ 实体不存在';
        case 'jinja':
          return value.includes('{{') && value.includes('}}') ? '✅ 模板语法正确' : '⚠️ 模板语法可能不完整';
        case 'text':
          return value.length > 20 ? `${value.substring(0, 20)}...` : value;
        default: return '';
      }
    } catch (e) {
      return '❌ 解析错误';
    }
  }

  _getEntityUnit(entity) {
    const unit = entity.attributes?.unit_of_measurement;
    return unit ? ` ${unit}` : '';
  }

  _getInputHints(type) {
    const hints = {
      'entity': html`<div class="hint-item">输入实体ID，如: sensor.temperature</div>`,
      'jinja': html`<div class="hint-item">使用Jinja2模板动态计算值</div>`,
      'text': html`<div class="hint-item">直接输入要显示的文本内容</div>`,
      'empty': html`<div class="hint-item">支持实体ID、Jinja2模板或直接文本</div>`
    };
    return hints[type] || hints.empty;
  }

  _getQuickExamples(type) {
    const examples = {
      'entity': html`
        <div class="example-item">sensor.temperature</div>
        <div class="example-item">weather.home</div>
      `,
      'jinja': html`
        <div class="example-item">{{ states('sensor.temperature') }}</div>
        <div class="example-item">{{ now().strftime('%H:%M') }}</div>
      `,
      'text': html`
        <div class="example-item">欢迎回家！</div>
        <div class="example-item">25°C 晴天</div>
      `,
      'empty': html`
        <div class="example-item">sensor.temperature (实体)</div>
        <div class="example-item">{{ states('sensor.temp') }} (模板)</div>
      `
    };
    return examples[type] || examples.empty;
  }

  _onInputChange(e) {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: e.target.value }
    }));
  }

  _onFocus() {
    this.focused = true;
    this.dispatchEvent(new CustomEvent('focus-changed', {
      detail: { focused: true }
    }));
  }

  _onBlur() {
    this.focused = false;
    this.dispatchEvent(new CustomEvent('focus-changed', {
      detail: { focused: false }
    }));
  }
}

if (!customElements.get('smart-input')) {
  customElements.define('smart-input', SmartInput);
}