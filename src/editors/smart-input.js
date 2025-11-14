// src/editors/smart-input.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class SmartInput extends LitElement {
  static properties = {
    hass: { type: Object },
    value: { type: String },
    placeholder: { type: String },
    _inputType: { state: true },
    _showEntityPicker: { state: true },
    _previewValue: { state: true }
  };

  static styles = css`
    .smart-input-container {
      position: relative;
    }
    
    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
    }
    
    .input-wrapper:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.1);
    }
    
    .input-wrapper.entity {
      background: rgba(76, 175, 80, 0.05);
      border-color: rgba(76, 175, 80, 0.3);
    }
    
    .input-wrapper.jinja {
      background: rgba(255, 152, 0, 0.05);
      border-color: rgba(255, 152, 0, 0.3);
    }
    
    .input-wrapper.text {
      background: rgba(33, 150, 243, 0.05);
      border-color: rgba(33, 150, 243, 0.3);
    }
    
    .input-icon {
      font-size: 1.1em;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }
    
    .input-field {
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
    
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    
    .action-button {
      background: none;
      border: none;
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s ease;
    }
    
    .action-button:hover {
      background: rgba(var(--rgb-primary-color), 0.1);
      color: var(--primary-color);
    }
    
    .preview-section {
      margin-top: 8px;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: 6px;
      border: 1px solid var(--divider-color);
    }
    
    .preview-label {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .preview-value {
      font-size: 0.85em;
      color: var(--primary-text-color);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      word-break: break-all;
    }
    
    .hint-section {
      margin-top: 8px;
    }
    
    .entity-picker-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 100;
      margin-top: 4px;
      max-height: 200px;
      overflow-y: auto;
    }
  `;

  constructor() {
    super();
    this._inputType = 'empty';
    this._showEntityPicker = false;
    this._previewValue = '';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('value') || changedProperties.has('hass')) {
      this._updateInputType();
      this._updatePreview();
    }
  }

  render() {
    return html`
      <div class="smart-input-container">
        <div class="input-wrapper ${this._inputType}">
          <div class="input-icon">${this._getInputIcon()}</div>
          
          <ha-textfield
            class="input-field"
            .value=${this.value}
            @input=${this._onInputChange}
            placeholder=${this.placeholder}
            fullwidth
          ></ha-textfield>
          
          <div class="type-badge ${this._inputType}">
            ${this._getTypeLabel()}
          </div>
          
          <div class="action-buttons">
            <button class="action-button" @click=${this._toggleEntityPicker} title="选择实体">
              🏷️
            </button>
            <button class="action-button" @click=${this._showTemplates} title="模板示例">
              🔧
            </button>
          </div>
        </div>
        
        ${this._showEntityPicker ? this._renderEntityPicker() : ''}
        
        ${this._previewValue ? this._renderPreview() : ''}
        
        ${this._renderHints()}
      </div>
    `;
  }

  _renderEntityPicker() {
    const entities = this._getFilteredEntities();
    
    return html`
      <div class="entity-picker-dropdown">
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--divider-color); font-weight: 600;">
          选择实体
        </div>
        <div style="max-height: 150px; overflow-y: auto;">
          ${entities.map(entity => html`
            <div 
              style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--divider-color);"
              @click=${() => this._selectEntity(entity.entity_id)}
            >
              <div style="font-weight: 500;">${entity.f