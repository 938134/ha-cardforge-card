// src/editors/smart-input.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class SmartInput extends LitElement {
  static properties = {
    hass: { type: Object },
    value: { type: String },
    placeholder: { type: String },
    _showEntityPicker: { state: true },
    _searchQuery: { state: true }
  };

  constructor() {
    super();
    this._showEntityPicker = false;
    this._searchQuery = '';
  }

  render() {
    return html`
      <div class="smart-input-container">
        <div class="smart-input-wrapper">
          <ha-textfield
            class="smart-input-field"
            .value=${this.value}
            @input=${this._onInputChange}
            placeholder=${this.placeholder}
            outlined
            fullwidth
          ></ha-textfield>
          
          <button class="entity-button" @click=${this._toggleEntityPicker} title="选择实体">
            🏷️
          </button>
        </div>
        
        ${this._showEntityPicker ? this._renderEntityPicker() : ''}
        
        <div class="smart-input-hint">
          💡 支持实体ID (sensor.temperature) 或 Jinja2模板 ({{ states('sensor.temp') }})
        </div>
      </div>
    `;
  }

  _renderEntityPicker() {
    const entities = this._getFilteredEntities();
    
    return html`
      <div class="entity-picker-dropdown">
        <div class="picker-header">选择实体</div>
        
        <div class="picker-search-box">
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
              <div class="entity-name">${entity.friendly_name}</div>
              <div class="entity-id">${entity.entity_id}</div>
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
    
    return entities.slice(0, 30);
  }

  _onInputChange(e) {
    this.value = e.target.value;
    this._notifyChange();
  }

  _toggleEntityPicker() {
    this._showEntityPicker = !this._showEntityPicker;
    this._searchQuery = '';
  }

  _selectEntity(entityId) {
    this.value = entityId;
    this._showEntityPicker = false;
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
    if (changedProperties.has('_showEntityPicker') && this._showEntityPicker) {
      setTimeout(() => {
        const handler = (e) => {
          if (!this.contains(e.target)) {
            this._showEntityPicker = false;
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