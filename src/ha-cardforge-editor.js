// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import './components/card-config.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static styles = css`
    .editor { padding: 16px; max-width: 600px; }
    .section { margin-bottom: 24px; padding: 16px; background: var(--card-background-color); border-radius: 8px; border: 1px solid var(--divider-color); }
    .section-title { margin: 0 0 16px 0; font-size: 1.1em; color: var(--primary-color); display: flex; align-items: center; gap: 8px; }
    .form-group { margin-bottom: 16px; }
    .action-buttons { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
    .card-type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .card-type-option { padding: 16px; border: 2px solid var(--divider-color); border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.2s; }
    .card-type-option:hover { border-color: var(--primary-color); }
    .card-type-option.selected { border-color: var(--primary-color); background: rgba(var(--primary-color-rgb), 0.1); }
    .card-type-icon { font-size: 2em; margin-bottom: 8px; }
  `;

  constructor() {
    super();
    this.config = { type: 'time-week' };
  }

  setConfig(config) {
    this.config = { 
      type: config.type || 'time-week',
      ...config 
    };
  }

  render() {
    const availableCards = window.CardConfig.getAllCardConfigs();

    return html`
      <div class="editor">
        <!-- 卡片类型选择 -->
        <div class="section">
          <h3 class="section-title">🎨 选择卡片类型</h3>
          <div class="card-type-grid">
            ${availableCards.map(card => html`
              <div 
                class="card-type-option ${this.config.type === card.type ? 'selected' : ''}"
                @click=${() => this._changeCardType(card.type)}
              >
                <div class="card-type-icon">${card.icon}</div>
                <div style="font-weight: 500;">${card.name}</div>
                <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px;">
                  ${card.description}
                </div>
              </div>
            `)}
          </div>
        </div>

        <!-- 动态卡片配置 -->
        ${this._renderCardConfig()}

        <!-- 操作按钮 -->
        <div class="action-buttons" style="justify-content: flex-end;">
          <mwc-button @click=${this._cancel} label="取消"></mwc-button>
          <mwc-button @click=${this._save} unelevated label="保存"></mwc-button>
        </div>
      </div>
    `;
  }

  _renderCardConfig() {
    const cardConfig = window.CardConfig.getCardConfig(this.config.type);
    
    if (!cardConfig.fields || cardConfig.fields.length === 0) {
      return html`<div class="section">该卡片类型暂无配置选项</div>`;
    }

    return html`
      <div class="section">
        <h3 class="section-title">⚙️ ${cardConfig.name} 配置</h3>
        ${cardConfig.fields.map(field => this._renderField(field))}
      </div>
    `;
  }

  _renderField(field) {
    const currentValue = this._getNestedValue(this.config, field.key) ?? field.default;
    
    switch (field.type) {
      case 'entity':
        return html`
          <div class="form-group">
            <ha-entity-picker
              label=${field.label}
              .hass=${this.hass}
              .value=${currentValue || ''}
              @value-changed=${e => this._updateConfig(field.key, e.detail.value)}
              style="width: 100%;"
            ></ha-entity-picker>
          </div>
        `;
        
      case 'boolean':
        return html`
          <div class="form-group">
            <ha-formfield label=${field.label}>
              <ha-switch
                .checked=${!!currentValue}
                @change=${e => this._updateConfig(field.key, e.target.checked)}
              ></ha-switch>
            </ha-formfield>
          </div>
        `;
        
      default:
        return html`<div>未知字段类型: ${field.type}</div>`;
    }
  }

  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  _changeCardType(cardType) {
    const cardConfig = window.CardConfig.getCardConfig(cardType);
    
    // 创建新卡片的默认配置
    const newConfig = { type: cardType };
    
    // 设置字段默认值
    if (cardConfig.fields) {
      cardConfig.fields.forEach(field => {
        if (field.default !== undefined) {
          this._setNestedValue(newConfig, field.key, field.default);
        }
      });
    }
    
    this.config = newConfig;
    this._fireConfigChanged();
  }

  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, obj);
    target[lastKey] = value;
  }

  _updateConfig(path, value) {
    this._setNestedValue(this.config, path, value);
    this.requestUpdate();
    this._fireConfigChanged();
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-cancel', { bubbles: true, composed: true }));
  }

  _save() {
    this._fireConfigChanged();
    this.dispatchEvent(new CustomEvent('config-save', { bubbles: true, composed: true }));
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('ha-cardforge-editor', HaCardForgeEditor);