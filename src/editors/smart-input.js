// src/editors/smart-input.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardForgeStyles } from '../styles/index.js';

export class SmartInput extends LitElement {
  static properties = {
    hass: { type: Object },
    value: { type: String },
    placeholder: { type: String },
    _showEntityPicker: { state: true },
    _searchQuery: { state: true }
  };

  static styles = cardForgeStyles;

  constructor() {
    super();
    this._showEntityPicker = false;
    this._searchQuery = '';
    this._clickOutsideHandler = null;
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
          
          <button class="smart-input-entity-button" @click=${this._toggleEntityPicker} title="选择实体">
            🏷️
          </button>
        </div>
        
        ${this._showEntityPicker ? this._renderEntityPicker() : ''}
      </div>
    `;
  }

  _renderEntityPicker() {
    const entities = this._getFilteredEntities();
    
    return html`
      <div class="smart-input-dropdown">
        <div class="smart-input-picker-header">选择实体</div>
        
        <div class="smart-input-search-box">
          <ha-textfield
            .label=${"搜索实体..."}
            .value=${this._searchQuery}
            @input=${e => this._onSearchChange(e.target.value)}
            @click=${this._stopPropagation} <!-- 阻止事件冒泡 -->
            dense
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="smart-input-entity-list">
          ${entities.map(entity => html`
            <div class="smart-input-entity-item" @click=${() => this._selectEntity(entity.entity_id)}>
              <div class="smart-input-entity-name">${entity.friendly_name}</div>
              <div class="smart-input-entity-id">${entity.entity_id}</div>
            </div>
          `)}
          
          ${entities.length === 0 ? html`
            <div class="cf-flex cf-flex-center cf-p-md">
              <div class="cf-text-sm cf-text-secondary">未找到匹配的实体</div>
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
    
    if (this._showEntityPicker) {
      this._setupClickOutsideHandler();
    } else {
      this._removeClickOutsideHandler();
    }
  }

  _selectEntity(entityId) {
    this.value = entityId;
    this._showEntityPicker = false;
    this._removeClickOutsideHandler();
    this._notifyChange();
  }

  _onSearchChange(query) {
    this._searchQuery = query;
  }

  // 阻止事件冒泡，修复点击搜索框关闭下拉的问题
  _stopPropagation(e) {
    e.stopPropagation();
  }

  _setupClickOutsideHandler() {
    // 使用 setTimeout 确保事件处理器在本次事件循环后添加
    setTimeout(() => {
      this._clickOutsideHandler = (e) => {
        if (!this.contains(e.target)) {
          this._showEntityPicker = false;
          this._removeClickOutsideHandler();
          this.requestUpdate();
        }
      };
      document.addEventListener('click', this._clickOutsideHandler);
      document.addEventListener('touchstart', this._clickOutsideHandler);
    }, 0);
  }

  _removeClickOutsideHandler() {
    if (this._clickOutsideHandler) {
      document.removeEventListener('click', this._clickOutsideHandler);
      document.removeEventListener('touchstart', this._clickOutsideHandler);
      this._clickOutsideHandler = null;
    }
  }

  _notifyChange() {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: this.value }
    }));
  }

  disconnectedCallback() {
    this._removeClickOutsideHandler();
    super.disconnectedCallback();
  }
}

if (!customElements.get('smart-input')) {
  customElements.define('smart-input', SmartInput);
}