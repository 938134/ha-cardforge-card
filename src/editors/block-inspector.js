// src/editors/block-inspector.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { blockManager } from '../core/block-manager.js';
import { designSystem } from '../core/design-system.js';

class BlockInspector extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    _editingBlock: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-inspector {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .inspector-header {
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
        background: var(--cf-surface);
      }

      .block-title {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .block-name {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .block-type {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
      }

      .inspector-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--cf-spacing-lg);
      }

      .section {
        margin-bottom: var(--cf-spacing-xl);
      }

      .section-title {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        padding-bottom: var(--cf-spacing-sm);
        border-bottom: 1px solid var(--cf-border);
      }

      .edit-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .form-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-md);
      }

      .switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        transition: all var(--cf-transition-fast);
      }

      .switch-item:hover {
        border-color: var(--cf-primary-color);
      }

      .switch-label {
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      .inspector-actions {
        padding: var(--cf-spacing-lg);
        border-top: 1px solid var(--cf-border);
        background: var(--cf-surface);
      }

      .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-sm);
      }

      .action-btn {
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
      }

      .action-btn:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .action-btn.remove {
        color: var(--cf-error-color);
        border-color: var(--cf-error-color);
      }

      .action-btn.remove:hover {
        background: var(--cf-error-color);
        color: white;
      }

      .action-btn.duplicate {
        color: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
      }

      .action-btn.duplicate:hover {
        background: var(--cf-primary-color);
        color: white;
      }

      .validation-errors {
        background: rgba(var(--cf-rgb-error), 0.1);
        border: 1px solid var(--cf-error-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .error-item {
        font-size: 0.8em;
        color: var(--cf-error-color);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }
        
        .action-buttons {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  constructor() {
    super();
    this._editingBlock = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = { ...this.block };
    }
  }

  render() {
    if (!this.block) {
      return html`<div class="empty-state">请选择块</div>`;
    }

    const blockInfo = blockManager.getBlockManifest(this.block.type);
    const validation = blockManager.validateConfig(this.block.type, this.block.config);

    return html`
      <div class="block-inspector">
        <div class="inspector-header">
          <div class="block-title">
            <div class="block-icon">
              <ha-icon .icon=${blockInfo?.icon || 'mdi:cube'}></ha-icon>
            </div>
            <div class="block-name">${blockInfo?.name || this.block.type}</div>
          </div>
          <div class="block-type">${this.block.type}</div>
        </div>

        <div class="inspector-content">
          ${validation.errors.length > 0 ? html`
            <div class="validation-errors">
              ${validation.errors.map(error => html`
                <div class="error-item">
                  <ha-icon icon="mdi:alert-circle"></ha-icon>
                  <span>${error}</span>
                </div>
              `)}
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">块配置</div>
            <div class="edit-form">
              ${unsafeHTML(blockManager.getEditTemplate(
                this._editingBlock, 
                this.hass, 
                this._onConfigChange.bind(this)
              ))}
            </div>
          </div>

          ${this._renderPositionSection()}
        </div>

        <div class="inspector-actions">
          <div class="action-buttons">
            <button class="action-btn remove" @click=${this._removeBlock}>
              <ha-icon icon="mdi:delete"></ha-icon>
              删除
            </button>
            <button class="action-btn duplicate" @click=${this._duplicateBlock}>
              <ha-icon icon="mdi:content-duplicate"></ha-icon>
              复制
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPositionSection() {
    if (this.block.position) {
      return html`
        <div class="section">
          <div class="section-title">位置和大小</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">X 位置</label>
              <ha-textfield
                .value=${this.block.position.x}
                @input=${e => this._updatePosition('x', parseInt(e.target.value) || 0)}
                type="number"
                min="0"
                max="10"
                fullwidth
              ></ha-textfield>
            </div>
            <div class="form-field">
              <label class="form-label">Y 位置</label>
              <ha-textfield
                .value=${this.block.position.y}
                @input=${e => this._updatePosition('y', parseInt(e.target.value) || 0)}
                type="number"
                min="0"
                max="10"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">宽度</label>
              <ha-textfield
                .value=${this.block.position.w}
                @input=${e => this._updatePosition('w', parseInt(e.target.value) || 1)}
                type="number"
                min="1"
                max="10"
                fullwidth
              ></ha-textfield>
            </div>
            <div class="form-field">
              <label class="form-label">高度</label>
              <ha-textfield
                .value=${this.block.position.h}
                @input=${e => this._updatePosition('h', parseInt(e.target.value) || 1)}
                type="number"
                min="1"
                max="10"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }

  _onConfigChange(key, value) {
    this._editingBlock = {
      ...this._editingBlock,
      config: {
        ...this._editingBlock.config,
        [key]: value
      }
    };
    
    this._notifyBlockUpdated();
  }

  _updatePosition(key, value) {
    this._editingBlock = {
      ...this._editingBlock,
      position: {
        ...this._editingBlock.position,
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

  _removeBlock() {
    if (confirm('确定要删除这个块吗？')) {
      this.dispatchEvent(new CustomEvent('block-removed', {
        detail: { blockId: this.block.id }
      }));
    }
  }

  _duplicateBlock() {
    const newBlock = {
      ...this.block,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: this.block.position ? { ...this.block.position } : undefined
    };
    
    this.dispatchEvent(new CustomEvent('block-updated', {
      detail: { block: newBlock }
    }));
  }
}

if (!customElements.get('block-inspector')) {
  customElements.define('block-inspector', BlockInspector);
}

export { BlockInspector };