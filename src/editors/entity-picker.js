// src/editors/entity-picker.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class EntityPicker extends LitElement {
  static properties = {
    hass: { type: Object },
    label: { type: String },
    value: { type: String },
    required: { type: Boolean },
    placeholder: { type: String },
    _inputMode: { state: true },
    _entities: { state: true }
  };

  static styles = css`
    .input-container {
      margin-bottom: 16px;
    }
    
    .input-label {
      display: block;
      font-weight: 500;
      font-size: 0.9em;
      color: var(--primary-text-color);
      margin-bottom: 6px;
    }
    
    .required-star {
      color: var(--error-color);
      margin-left: 2px;
    }
    
    .mode-selector {
      margin-bottom: 8px;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    .input-hint {
      margin-top: 4px;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      line-height: 1.3;
      min-height: 1.2em;
    }
    
    .hint-content {
      display: flex;
      align-items: center;
      gap: 4px;
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
  `;

  constructor() {
    super();
    this._inputMode = 'entity'; // 'entity', 'jinja', 'text'
    this._entities = [];
  }

  firstUpdated() {
    this._detectInputMode();
  }

  render() {
    const hint = this._getInputHint();
    const preview = this._getValuePreview();
    
    return html`
      <div class="input-container">
        <label class="input-label">
          ${this.label}
          ${this.required ? html`<span class="required-star">*</span>` : ''}
        </label>
        
        <div class="mode-selector">
          <ha-button-menu>
            <ha-button slot="trigger">
              ${this._getModeLabel(this._inputMode)}
            </ha-button>
            <mwc-list-item @click=${() => this._setInputMode('entity')}>
              🏷️ 选择实体
            </mwc-list-item>
            <mwc-list-item @click=${() => this._setInputMode('jinja')}>
              🔧 Jinja2模板
            </mwc-list-item>
            <mwc-list-item @click=${() => this._setInputMode('text')}>
              📝 直接文本
            </mwc-list-item>
          </ha-button-menu>
        </div>
        
        <div class="input-wrapper">
          ${this._renderInput()}
        </div>
        
        ${preview ? html`
          <div class="value-preview">
            <span class="preview-label">预览:</span>
            <span class="preview-value">${preview}</span>
          </div>
        ` : ''}
        
        ${hint ? html`
          <div class="input-hint">
            <div class="hint-content">${hint}</div>
          </div>
        ` : ''}
        
        ${this._renderInputHints()}
      </div>
    `;
  }

  _renderInput() {
    switch (this._inputMode) {
      case 'entity':
        return html`
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this.value}
            @value-changed=${this._onEntitySelected}
            allow-custom-entity
            .placeholder=${this.placeholder || '选择实体或输入实体ID'}
          ></ha-entity-picker>
        `;
        
      case 'jinja':
        return html`
          <ha-textarea
            .value=${this.value}
            @input=${this._onInputChange}
            .placeholder=${this.placeholder || '输入Jinja2模板，如: {{ states("sensor.temperature") }}'}
            autogrow
            rows="2"
          ></ha-textarea>
        `;
        
      case 'text':
      default:
        return html`
          <ha-textfield
            .value=${this.value}
            @input=${this._onInputChange}
            .placeholder=${this.placeholder || '输入文本内容'}
            fullwidth
          ></ha-textfield>
        `;
    }
  }

  _renderInputHints() {
    const hints = {
      entity: [
        '选择现有的实体或直接输入实体ID',
        '支持所有类型的实体：传感器、开关、灯光等',
        '实体状态将自动显示在卡片中'
      ],
      jinja: [
        '使用Jinja2模板动态生成内容',
        '示例: {{ states("sensor.temperature") }}',
        '示例: {{ now().strftime("%H:%M") }}',
        '示例: {{ states.sensor.humidity.attributes.unit_of_measurement }}'
      ],
      text: [
        '直接输入静态文本内容',
        '支持多行文本和特殊字符',
        '适合固定显示的内容'
      ]
    };

    const currentHints = hints[this._inputMode] || [];
    
    return html`
      <div class="input-hints">
        ${currentHints.map(hint => html`
          <div class="hint-item">${hint}</div>
        `)}
      </div>
    `;
  }

  _getModeLabel(mode) {
    const labels = {
      entity: '🏷️ 实体',
      jinja: '🔧 模板', 
      text: '📝 文本'
    };
    return labels[mode] || '选择输入方式';
  }

  _detectInputMode() {
    if (!this.value) {
      this._inputMode = 'entity';
      return;
    }

    if (this.value.includes('{{') || this.value.includes('{%')) {
      this._inputMode = 'jinja';
    } else if (this.value.includes('.') && this.hass?.states[this.value]) {
      this._inputMode = 'entity';
    } else {
      this._inputMode = 'text';
    }
  }

  _setInputMode(mode) {
    this._inputMode = mode;
    
    // 清空值当切换模式时（可选）
    if (mode === 'entity' && this.value && !this.value.includes('.') && !this.hass?.states[this.value]) {
      this.value = '';
      this._notifyChange();
    }
  }

  _getInputHint() {
    if (!this.value) {
      return '💡 选择输入方式并配置数据源';
    }
    
    switch (this._inputMode) {
      case 'entity':
        const entity = this.hass?.states[this.value];
        if (entity) {
          const unit = entity.attributes?.unit_of_measurement;
          return `🏷️ 实体: ${entity.state}${unit ? ` ${unit}` : ''}`;
        }
        return '🔍 输入有效的实体ID';
        
      case 'jinja':
        return '🔧 Jinja2模板 - 支持动态内容';
        
      case 'text':
        return '📝 文本内容';
        
      default:
        return '';
    }
  }

  _getValuePreview() {
    if (!this.value || !this.hass) return '';
    
    try {
      // 简化的预览逻辑
      if (this._inputMode === 'entity' && this.hass.states[this.value]) {
        const entity = this.hass.states[this.value];
        return `${entity.state}${entity.attributes?.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ''}`;
      }
      
      if (this._inputMode === 'jinja') {
        // 简单的模板预览（实际使用时需要更复杂的解析）
        if (this.value.includes("states('")) {
          const entityMatch = this.value.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && this.hass.states[entityMatch[1]]) {
            return this.hass.states[entityMatch[1]].state;
          }
        }
        return '动态内容';
      }
      
      return this.value.length > 50 ? this.value.substring(0, 50) + '...' : this.value;
    } catch (e) {
      return '预览不可用';
    }
  }

  _onEntitySelected(event) {
    this.value = event.detail.value;
    this._inputMode = 'entity';
    this._notifyChange();
  }

  _onInputChange(event) {
    this.value = event.target.value;
    this._notifyChange();
  }

  _notifyChange() {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: this.value }
    }));
  }

  updated(changedProperties) {
    if (changedProperties.has('value')) {
      this._detectInputMode();
    }
  }
}

if (!customElements.get('entity-picker')) {
  customElements.define('entity-picker', EntityPicker);
}