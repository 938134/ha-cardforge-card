// src/editors/block-properties.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';

class BlockProperties extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    _availableEntities: { state: true },
    _editingBlock: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .properties-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
      }

      .selected-block-info {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
      }

      .info-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
      }

      .info-icon {
        font-size: 1.2em;
      }

      .info-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .info-type {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 8px;
        border-radius: var(--cf-radius-sm);
      }

      .property-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .property-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .property-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .no-config {
        text-align: center;
        padding: var(--cf-spacing-lg);
        color: var(--cf-text-secondary);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
      }
    `
  ];

  constructor() {
    super();
    this._availableEntities = [];
    this._editingBlock = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = this.block ? { ...this.block } : null;
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    if (!this._editingBlock) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:select" style="font-size: 2em; opacity: 0.5;"></ha-icon>
          <div class="cf-text-sm cf-mt-md">请先选择一个块</div>
          <div class="cf-text-xs cf-mt-sm cf-text-secondary">点击上方的块卡片进行选择</div>
        </div>
      `;
    }

    const blockManifest = blockRegistry.getBlockManifest(this._editingBlock.type);
    const schema = blockManifest?.config_schema || {};
    
    return html`
      <div class="properties-container">
        <!-- 选中块信息 -->
        <div class="selected-block-info">
          <div class="info-header">
            <div class="info-icon">${blockManifest?.icon || '📦'}</div>
            <div class="info-title">${blockManifest?.name || this._editingBlock.type}</div>
            <div class="info-type">${this._editingBlock.type}</div>
          </div>
          <div class="cf-text-sm cf-text-secondary">
            ${blockManifest?.description || '暂无描述'}
          </div>
        </div>

        <!-- 配置表单 -->
        ${Object.keys(schema).length === 0 ? html`
          <div class="no-config">
            <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color);"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">此块无需额外配置</div>
          </div>
        ` : html`
          <div class="property-form">
            ${Object.entries(schema).map(([key, field]) => 
              this._renderConfigField(key, field)
            )}
          </div>
        `}
      </div>
    `;
  }

  _renderConfigField(key, field) {
    const currentValue = this._editingBlock.config?.[key] ?? field.default;
    
    switch (field.type) {
      case 'boolean':
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-switch
              .checked=${!!currentValue}
              @change=${e => this._updateConfig(key, e.target.checked)}
            ></ha-switch>
          </div>
        `;

      case 'select':
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-select
              .value=${currentValue}
              @closed=${this._preventClose}
              naturalMenuWidth
              fixedMenuPosition
              fullwidth
              @change=${e => this._updateConfig(key, e.target.value)}
            >
              ${field.options.map(option => html`
                <ha-list-item .value=${option}>${option}</ha-list-item>
              `)}
            </ha-select>
          </div>
        `;

      case 'entity':
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-combo-box
              .items=${this._availableEntities}
              .value=${currentValue}
              @value-changed=${e => this._updateConfig(key, e.detail.value)}
              allow-custom-value
              fullwidth
            ></ha-combo-box>
          </div>
        `;

      default: // string, number
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-textfield
              .value=${currentValue}
              @input=${e => this._updateConfig(key, e.target.value)}
              .type=${field.type === 'number' ? 'number' : 'text'}
              fullwidth
              placeholder=${field.default || ''}
            ></ha-textfield>
          </div>
        `;
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _updateConfig(key, value) {
    if (!this._editingBlock) return;
    
    this._editingBlock = {
      ...this._editingBlock,
      config: {
        ...this._editingBlock.config,
        [key]: value
      }
    };
    
    this._notifyBlockUpdated();
  }

  _notifyBlockUpdated() {
    this.dispatchEvent(new CustomEvent('block-updated', {
      detail: { block: this._editingBlock }
    }));
  }

  _preventClose(e) {
    e.stopPropagation();
  }
}

if (!customElements.get('block-properties')) {
  customElements.define('block-properties', BlockProperties);
}

export { BlockProperties };
