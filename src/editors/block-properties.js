// src/editors/block-properties.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockRegistry } from '../core/block-registry.js';

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
        padding: var(--cf-spacing-md);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .property-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .property-group {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
      }

      .group-title {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .property-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }

      .property-field:last-child {
        margin-bottom: 0;
      }

      .property-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .property-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      .action-btn {
        flex: 1;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        transition: all var(--cf-transition-fast);
      }

      .action-btn.remove {
        background: var(--cf-error-color);
        color: white;
        border-color: var(--cf-error-color);
      }

      .action-btn:hover {
        opacity: 0.8;
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
        <div class="properties-container">
          <div class="empty-state">
            <ha-icon icon="mdi:select" style="font-size: 2em; opacity: 0.5;"></ha-icon>
            <div class="cf-text-sm cf-mt-md">选择一个块进行配置</div>
          </div>
        </div>
      `;
    }

    const blockManifest = blockRegistry.getBlockManifest(this._editingBlock.type);
    
    return html`
      <div class="properties-container">
        <div class="property-form">
          <!-- 块基本信息 -->
          <div class="property-group">
            <div class="group-title">
              <ha-icon icon="mdi:information"></ha-icon>
              块信息
            </div>
            <div class="property-field">
              <label class="property-label">块类型</label>
              <div class="cf-text-sm cf-text-secondary">${blockManifest?.name || this._editingBlock.type}</div>
            </div>
          </div>

          <!-- 块配置 -->
          ${this._renderBlockConfig(blockManifest)}
          
          <!-- 操作按钮 -->
          <div class="property-actions">
            <button class="action-btn remove" @click=${this._removeBlock}>
              删除块
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderBlockConfig(blockManifest) {
    const schema = blockManifest?.config_schema || {};
    
    if (Object.keys(schema).length === 0) {
      return html`
        <div class="property-group">
          <div class="group-title">
            <ha-icon icon="mdi:tune"></ha-icon>
            配置
          </div>
          <div class="cf-text-sm cf-text-secondary">此块无需额外配置</div>
        </div>
      `;
    }

    return html`
      <div class="property-group">
        <div class="group-title">
          <ha-icon icon="mdi:tune"></ha-icon>
          配置
        </div>
        ${Object.entries(schema).map(([key, field]) => 
          this._renderConfigField(key, field)
        )}
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

  _removeBlock() {
    if (!this._editingBlock) return;
    
    this.dispatchEvent(new CustomEvent('block-removed', {
      detail: { blockId: this._editingBlock.id }
    }));
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