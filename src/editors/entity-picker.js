// src/editors/entity-picker.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

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
    
    return entities.slice(0, 50);
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