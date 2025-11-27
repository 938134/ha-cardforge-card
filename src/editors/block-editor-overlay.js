// src/editors/block-editor-overlay.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockEditorOverlay extends LitElement {
  static properties = {
    open: { type: Boolean },
    blockConfig: { type: Object },
    hass: { type: Object },
    _editingConfig: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-overlay {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 320px;
        background: var(--cf-background);
        border-left: 1px solid var(--cf-border);
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
      }

      .editor-overlay.open {
        transform: translateX(0);
      }

      .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
      }

      .editor-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        color: var(--cf-text-secondary);
        padding: 4px;
      }

      .close-btn:hover {
        color: var(--cf-text-primary);
      }

      .editor-content {
        flex: 1;
        padding: var(--cf-spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .editor-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-lg);
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
        font-weight: 500;
        transition: all var(--cf-transition-fast);
      }

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-btn:hover {
        opacity: 0.8;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .field-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      /* 移动端适配 */
      @media (max-width: 600px) {
        .editor-overlay {
          width: 100%;
        }
      }
    `
  ];

  constructor() {
    super();
    this.open = false;
    this.blockConfig = {};
    this._editingConfig = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('blockConfig')) {
      this._editingConfig = { ...this.blockConfig };
    }
  }

  render() {
    if (!this.open) return '';

    return html`
      <div class="editor-overlay open">
        <div class="editor-header">
          <div class="editor-title">编辑块</div>
          <button class="close-btn" @click=${this._onCancel}>✕</button>
        </div>
        
        <div class="editor-content">
          <div class="form-field">
            <div class="field-label">实体</div>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this._editingConfig.entity || ''}
              @value-changed=${e => this._updateConfig('entity', e.detail.value)}
              allow-custom-entity
            ></ha-entity-picker>
          </div>

          <div class="form-field">
            <div class="field-label">名称</div>
            <ha-textfield
              .value=${this._editingConfig.title || ''}
              @input=${e => this._updateConfig('title', e.target.value)}
              placeholder="输入显示名称"
              fullwidth
            ></ha-textfield>
          </div>

          <div class="form-field">
            <div class="field-label">图标</div>
            <ha-icon-picker
              .value=${this._editingConfig.icon || ''}
              @value-changed=${e => this._updateConfig('icon', e.detail.value)}
              label="选择图标"
              fullwidth
            ></ha-icon-picker>
          </div>
        </div>

        <div class="editor-actions">
          <button class="action-btn" @click=${this._onCancel}>取消</button>
          <button class="action-btn primary" @click=${this._onSave}>保存</button>
        </div>
      </div>
    `;
  }

  _updateConfig(key, value) {
    this._editingConfig = {
      ...this._editingConfig,
      [key]: value
    };
  }

  _onSave() {
    this.dispatchEvent(new CustomEvent('block-saved', {
      detail: { blockConfig: this._editingConfig }
    }));
    this.open = false;
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('edit-cancelled'));
    this.open = false;
  }
}

if (!customElements.get('block-editor-overlay')) {
  customElements.define('block-editor-overlay', BlockEditorOverlay);
}

export { BlockEditorOverlay };