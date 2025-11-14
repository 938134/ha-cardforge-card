// src/core/smart-input.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { sharedStyles } from '../styles/shared-styles.js';
import { componentStyles } from '../styles/component-styles.js';
import { responsiveStyles } from '../styles/responsive-styles.js';

export class SmartInput extends LitElement {
  static properties = {
    hass: { type: Object },
    label: { type: String },
    value: { type: String },
    required: { type: Boolean },
    placeholder: { type: String },
    _showPicker: { state: true },
    _inputType: { state: true },
    _previewValue: { state: true },
    _searchQuery: { state: true }
  };

  static styles = [
    sharedStyles,
    componentStyles,
    responsiveStyles,
    css`
      :host {
        display: block;
      }
    `
  ];

  constructor() {
    super();
    this._showPicker = false;
    this._inputType = 'empty';
    this._previewValue = '';
    this._searchQuery = '';
  }

  render() {
    return html`
      <div class="smart-input-container">
        <label class="smart-input-label">
          ${this.label}
          ${this.required ? html`<span style="color: var(--error-color); margin-left: 2px;">*</span>` : ''}
        </label>
        
        <div class="smart-input-wrapper ${this._inputType}">
          <div class="input-icon">
            ${this._getInputIcon()}
          </div>
          
          <ha-textfield
            class="smart-input-field"
            .value=${this.value}
            @input=${this._onInputChange}
            placeholder=${this.placeholder || `输入${this.label}`}
            fullwidth
          ></ha-textfield>
          
          <button class="input-dropdown-button" @click=${this._togglePicker}>
            ▾
          </button>
        </div>
        
        ${this._showPicker ? this._renderEntityPicker() : ''}
        
        ${this._previewValue ? this._renderPreview() : ''}
        
        ${this._renderInputHints()}
      </div>
    `;
  }

  _getInputIcon() {
    const icons = {
      entity: '📡',
      jinja: '🔧', 
      text: '📝',
      empty: '💡'
    };
    return icons[this._inputType];
  }

  _renderPreview() {
    return html`
      <div class="input-preview">
        <span class="preview-label">当前值:</span>
        <span class="preview-value">${this._previewValue}</span>
        <span class="type-badge ${this._inputType}">
          ${this._getTypeLabel()}
        </span>
      </div>
    `;
  }

  _getTypeLabel() {
    const labels = {
      entity: '实体',
      jinja: '模板',
      text: '文本',
      empty: '未设置'
    };
    return labels[this._inputType];
  }

  _renderInputHints() {
    const hints = {
      entity: '输入实体ID或点击右侧按钮选择',
      jinja: 'Jinja2模板，支持 {{ states() }} 等函数',
      text: '静态文本内容',
      empty: '输入实体ID、Jinja2模板或静态文本'
    };

    return html`
      <div class="config-hint">
        ${hints[this._inputType]}
      </div>
    `;
  }

  _renderEntityPicker() {
    const entities = this._getFilteredEntities();
    
    return html`
      <div class="entity-picker-dropdown">
        <div class="entity-search">
          <ha-textfield
            label="搜索实体..."
            .value=${this._searchQuery}
            @input=${e => this._onSearchChange(e.target.value)}
            dense
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="entity-list">
          ${entities.map(entity => html`
            <div class="entity-item" @click=${() => this._selectEntity(entity.entity_id)}>
              <div>
                <div class="entity-name">${entity.friendly_name}</div>
                <div class="entity-id">${entity.entity_id}</div>
              </div>
              <div class="entity-state">${entity.state}</div>
            </div>
          `)}
          
          ${entities.length === 0 ? html`
            <div style="padding: 12px; text-align: center; color: var(--secondary-text-color);">
              未找到匹配的实体
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _getFilteredEntities() {
    if (!this.hass) return [];
    
    const entities = Object.entries(this.hass.states)
      .map(([entity_id, stateObj]) => ({
        entity_id,
        friendly_name: stateObj.attributes?.friendly_name || entity_id,
        state: stateObj.state
      }))
      .filter(entity => {
        if (!this._searchQuery) return true;
        const query = this._searchQuery.toLowerCase();
        return entity.entity_id.toLowerCase().includes(query) || 
               entity.friendly_name.toLowerCase().includes(query);
      })
      .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));
    
    return entities.slice(0, 50);
  }

  _onInputChange(e) {
    this.value = e.target.value;
    this._analyzeInputType();
    this._updatePreview();
    this._notifyChange();
  }

  _analyzeInputType() {
    if (!this.value) {
      this._inputType = 'empty';
      return;
    }
    
    if (this.value.includes('{{') || this.value.includes('{%')) {
      this._inputType = 'jinja';
    } else if (this.value.includes('.') && this.hass?.states[this.value]) {
      this._inputType = 'entity';
    } else {
      this._inputType = 'text';
    }
  }

  _updatePreview() {
    if (!this.value || !this.hass) {
      this._previewValue = '';
      return;
    }
    
    try {
      if (this._inputType === 'entity' && this.hass.states[this.value]) {
        const entity = this.hass.states[this.value];
        const unit = entity.attributes?.unit_of_measurement;
        this._previewValue = `${entity.state}${unit ? ` ${unit}` : ''}`;
      } else if (this._inputType === 'jinja') {
        // 简化的Jinja2预览
        this._previewValue = this._evaluateJinjaPreview(this.value);
      } else {
        this._previewValue = this.value;
      }
    } catch (error) {
      this._previewValue = '预览解析错误';
    }
  }

  _evaluateJinjaPreview(template) {
    let result = template;
    
    // 处理实体状态
    const stateMatches = template.match(/{{\s*states\(['"]([^'"]+)['"]\)\s*}}/g);
    if (stateMatches) {
      stateMatches.forEach(match => {
        const entityMatch = match.match(/states\(['"]([^'"]+)['"]\)/);
        if (entityMatch && this.hass?.states?.[entityMatch[1]]) {
          result = result.replace(match, this.hass.states[entityMatch[1]].state);
        }
      });
    }
    
    // 清理剩余的模板标记
    result = result.replace(/{{\s*[^}]*\s*}}/g, '');
    
    return result || '模板预览';
  }

  _togglePicker() {
    this._showPicker = !this._showPicker;
    this._searchQuery = '';
  }

  _selectEntity(entityId) {
    this.value = entityId;
    this._showPicker = false;
    this._analyzeInputType();
    this._updatePreview();
    this._notifyChange();
  }

  _onSearchChange(query) {
    this._searchQuery = query;
  }

  _notifyChange() {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: this.value }
    }));
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('value')) {
      this._analyzeInputType();
      this._updatePreview();
    }
    
    if (changedProperties.has('_showPicker') && this._showPicker) {
      setTimeout(() => {
        const handler = (e) => {
          if (!this.contains(e.target)) {
            this._showPicker = false;
            document.removeEventListener('click', handler);
            this.requestUpdate();
          }
        };
        document.addEventListener('click', handler);
      });
    }
  }
}

if (!customElements.get('smart-input')) {
  customElements.define('smart-input', SmartInput);
}
