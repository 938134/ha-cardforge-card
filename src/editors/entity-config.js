// src/editors/entity-config.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class EntityConfig extends LitElement {
  static properties = {
    hass: { type: Object },
    activePlugin: { type: Object },
    entities: { type: Object },
    focusedInputs: { type: Object }
  };

  render() {
    if (!this.activePlugin) {
      return html`<div class="entity-help">💡 请先选择要配置的卡片类型</div>`;
    }

    const requirements = this.activePlugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return html`<div class="entity-help">✅ 此插件无需配置实体</div>`;
    }

    return requirements.map(req => this._renderEntityRow(req));
  }

  _renderEntityRow(requirement) {
    const currentValue = this.entities?.[requirement.key] || '';
    const isFocused = this.focusedInputs?.has(requirement.key);

    return html`
      <div class="config-row ${isFocused ? 'focused' : ''}">
        <div class="entity-label">
          ${requirement.description}
          ${requirement.required ? html`<span class="required-star">*</span>` : ''}
        </div>
        
        <smart-input
          .hass=${this.hass}
          .requirement=${requirement}
          .value=${currentValue}
          .focused=${isFocused}
          @value-changed=${e => this._onEntityChange(requirement.key, e.detail.value)}
          @focus-changed=${e => this._onInputFocusChange(requirement.key, e.detail.focused)}
        ></smart-input>
      </div>
    `;
  }

  _onEntityChange(key, value) {
    this.dispatchEvent(new CustomEvent('entity-changed', {
      detail: { key, value }
    }));
  }

  _onInputFocusChange(key, focused) {
    this.dispatchEvent(new CustomEvent('focus-changed', {
      detail: { key, focused }
    }));
  }
}

if (!customElements.get('entity-config')) {
  customElements.define('entity-config', EntityConfig);
}