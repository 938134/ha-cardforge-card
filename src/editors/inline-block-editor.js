// src/editors/inline-block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class InlineBlockEditor extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    availableEntities: { type: Array },
    onSave: { type: Object },
    onDelete: { type: Object },
    onCancel: { type: Object }
  };

  static styles = [
    foundationStyles,
    css`
      .inline-editor {
        background: var(--cf-surface);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-sm);
      }

      .editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .form-row {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .form-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .form-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-md);
      }

      .action-btn {
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
      }

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-btn.delete {
        background: var(--cf-error-color);
        color: white;
        border-color: var(--cf-error-color);
      }

      .action-btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.availableEntities = [];
    this.onSave = () => {};
    this.onDelete = () => {};
    this.onCancel = () => {};
  }

  render() {
    const blockTypes = [
      { value: 'text', label: '文本块' },
      { value: 'sensor', label: '传感器' },
      { value: 'weather', label: '天气' },
      { value: 'switch', label: '开关' }
    ];

    return html`
      <div class="inline-editor">
        <div class="editor-form">
          <div class="form-row">
            <label class="form-label">类型</label>
            <ha-combo-box
              .items=${blockTypes}
              .value=${this.block.type || 'text'}
              @value-changed=${e => this._updateBlock('type', e.detail.value)}
              label="选择类型"
            ></ha-combo-box>
          </div>

          <div class="form-row">
            <label class="form-label">${this._getContentLabel()}</label>
            ${this._renderContentField()}
          </div>

          ${this.block.type === 'text' ? html`
            <div class="form-row">
              <label class="form-label">背景色</label>
              <ha-textfield
                .value=${this.block.config?.background || ''}
                @input=${e => this._updateConfig('background', e.target.value)}
                label="背景颜色"
                placeholder="#f0f0f0"
              ></ha-textfield>
            </div>
            <div class="form-row">
              <label class="form-label">文字颜色</label>
              <ha-textfield
                .value=${this.block.config?.textColor || ''}
                @input=${e => this._updateConfig('textColor', e.target.value)}
                label="文字颜色"
                placeholder="#333333"
              ></ha-textfield>
            </div>
          ` : ''}

          <div class="form-actions">
            <button class="action-btn delete" @click=${this._onDelete}>
              删除
            </button>
            <button class="action-btn" @click=${this._onCancel}>
              取消
            </button>
            <button class="action-btn primary" @click=${this._onSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _getContentLabel() {
    const labels = {
      'text': '内容',
      'sensor': '传感器',
      'weather': '天气实体',
      'switch': '开关实体'
    };
    return labels[this.block.type] || '内容';
  }

  _renderContentField() {
    if (this.block.type === 'text') {
      return html`
        <ha-textarea
          .value=${this.block.content || ''}
          @input=${e => this._updateBlock('content', e.target.value)}
          label="输入内容"
          rows="2"
        ></ha-textarea>
      `;
    } else {
      return html`
        <ha-combo-box
          .items=${this.availableEntities}
          .value=${this.block.content || ''}
          @value-changed=${e => this._updateBlock('content', e.detail.value)}
          label="选择实体"
          allow-custom-value
        ></ha-combo-box>
      `;
    }
  }

  _updateBlock(key, value) {
    this.block = {
      ...this.block,
      [key]: value
    };
    
    if (key === 'type' && value !== 'text') {
      this.block.config = {};
    }
  }

  _updateConfig(key, value) {
    this.block.config = {
      ...this.block.config,
      [key]: value
    };
  }

  _onSave() {
    this.onSave(this.block);
  }

  _onDelete() {
    if (confirm('确定要删除这个内容块吗？')) {
      this.onDelete(this.block.id);
    }
  }

  _onCancel() {
    this.onCancel();
  }
}

if (!customElements.get('inline-block-editor')) {
  customElements.define('inline-block-editor', InlineBlockEditor);
}