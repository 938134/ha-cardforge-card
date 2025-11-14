// src/editors/entity-picker.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class EntityPicker extends LitElement {
  static properties = {
    hass: { type: Object },
    label: { type: String },
    value: { type: String },
    required: { type: Boolean },
    placeholder: { type: String },
    _showPicker: { state: true },
    _searchQuery: { state: true }
  };

  static styles = css`
    .input-container {
      margin-bottom: 16px;
      position: relative;
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
    
    .input-wrapper {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .input-field {
      flex: 1;
      --mdc-text-field-fill-color: var(--card-background-color);
    }
    
    .picker-button {
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0 12px;
      height: 56px;
      min-width: 60px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .picker-button:hover {
      background: var(--accent-color);
    }
    
    .picker-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 300px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 100;
      margin-top: 4px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .picker-header {
      padding: 12px;
      border-bottom: 1px solid var(--divider-color);
      font-weight: 600;
      font-size: 0.9em;
    }
    
    .search-box {
      padding: 8px 12px;
    }
    
    .entity-list {
      max-height: 200px;
      overflow-y: auto;
    }
    
    .entity-item {
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 1px solid var(--divider-color);
      font-size: 0.85em;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .entity-item:hover {
      background: rgba(var(--rgb-primary-color), 0.1);
    }
    
    .entity-name {
      font-weight: 500;
    }
    
    .entity-id {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      font-family: monospace;
    }
    
    .entity-state {
      font-size: 0.8em;
      color: var(--primary-color);
      margin-left: 8px;
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
  `;

  constructor() {
    super();
    this._showPicker = false;
    this._searchQuery = '';
  }

  render() {
    const hint = this._getInputHint();
    
    return html`
      <div class="input-container">
        <label class="input-label">
          ${this.label}
          ${this.required ? html`<span class="required-star">*</span>` : ''}
        </label>
        
        <div class="input-wrapper">
          <ha-textfield
            class="input-field"
            .value=${this.value}
            @input=${this._onInputChange}
            placeholder=${this.placeholder || `输入${this.label}`}
            outlined
          ></ha-textfield>
          
          <button class="picker-button" @click=${this._togglePicker}>
            ▾
          </button>
        </div>
        
        ${this._showPicker ? this._renderEntityPicker() : ''}
        
        ${hint ? html`
          <div class="input-hint">
            <div class="hint-content">${hint}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityPicker() {
    const entities = this._getFilteredEntities();
    
    return html`
      <div class="picker-dropdown">
        <div class="picker-header">选择实体</div>
        
        <div class="search-box">
          <ha-textfield
            .label=${"搜索实体..."}
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

  _getInputHint() {
    if (!this.value) {
      return html`💡 输入文本、Jinja2模板，或点击按钮选择实体`;
    }
    
    if (this.value.includes('{{') || this.value.includes('{%')) {
      return html`🔧 Jinja2模板`;
    }
    
    if (this.value.includes('.') && this.hass?.states[this.value]) {
      const entity = this.hass.states[this.value];
      const unit = entity.attributes?.unit_of_measurement;
      return html`🏷️ 实体: ${entity.state}${unit ? ` ${unit}` : ''}`;
    }
    
    return html`📝 文本内容`;
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
    
    return entities.slice(0, 50); // 限制数量
  }

  _togglePicker() {
    this._showPicker = !this._showPicker;
    this._searchQuery = '';
  }

  _selectEntity(entityId) {
    this.value = entityId;
    this._showPicker = false;
    this._notifyChange();
  }

  _onInputChange(e) {
    this.value = e.target.value;
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
    // 点击外部关闭选择器
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

if (!customElements.get('entity-picker')) {
  customElements.define('entity-picker', EntityPicker);
}