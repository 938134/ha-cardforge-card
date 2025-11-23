// src/editors/dashboard/inline-block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class InlineBlockEditor extends LitElement {
  static properties = {
    block: { type: Object },
    availableEntities: { type: Array },
    layout: { type: String },
    onSave: { type: Object },
    onCancel: { type: Object },
    _editingBlock: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .inline-editor {
        background: var(--cf-surface);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-sm);
        width: 100%;
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

      .position-selector {
        display: flex;
        gap: var(--cf-spacing-sm);
        flex-wrap: wrap;
      }

      .position-btn {
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
      }

      .position-btn.selected {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
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

      @media (max-width: 600px) {
        .form-row {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .form-actions {
          flex-direction: column;
        }
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.availableEntities = [];
    this.layout = '2x2';
    this.onSave = () => {};
    this.onCancel = () => {};
    this._editingBlock = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = { ...this.block };
    }
  }

  render() {
    const blockTypes = Object.entries(BlockManager.BLOCK_TYPES).map(([value, info]) => ({
      value,
      label: info.name
    }));

    const gridConfig = BlockManager.LAYOUT_PRESETS[this.layout] || BlockManager.LAYOUT_PRESETS['2x2'];

    return html`
      <div class="inline-editor">
        <div class="editor-form">
          <div class="form-row">
            <label class="form-label">类型</label>
            <ha-combo-box
              .items=${blockTypes}
              .value=${this._editingBlock.type || 'text'}
              @value-changed=${e => this._updateBlock('type', e.detail.value)}
              label="选择类型"
            ></ha-combo-box>
          </div>

          <div class="form-row">
            <label class="form-label">${this._getContentLabel()}</label>
            ${this._renderContentField()}
          </div>

          <div class="form-row">
            <label class="form-label">显示标题</label>
            <ha-textfield
              .value=${this._editingBlock.config?.title || ''}
              @input=${e => this._updateConfig('title', e.target.value)}
              label="块标题"
              placeholder="例如：室内温度"
            ></ha-textfield>
          </div>

          <div class="form-row">
            <label class="form-label">位置</label>
            <div class="position-selector">
              ${this._renderPositionOptions(gridConfig)}
            </div>
          </div>

          ${this._editingBlock.type === 'text' ? html`
            <div class="form-row">
              <label class="form-label">背景色</label>
              <ha-textfield
                .value=${this._editingBlock.config?.background || ''}
                @input=${e => this._updateConfig('background', e.target.value)}
                label="背景颜色"
                placeholder="#f0f0f0"
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
    return labels[this._editingBlock.type] || '内容';
  }

  _renderContentField() {
    if (this._editingBlock.type === 'text') {
      return html`
        <ha-textarea
          .value=${this._editingBlock.content || ''}
          @input=${e => this._updateBlock('content', e.target.value)}
          label="输入内容"
          rows="3"
        ></ha-textarea>
      `;
    } else {
      return html`
        <ha-combo-box
          .items=${this.availableEntities}
          .value=${this._editingBlock.content || ''}
          @value-changed=${e => this._updateBlock('content', e.detail.value)}
          label="选择实体"
          allow-custom-value
        ></ha-combo-box>
      `;
    }
  }

  _renderPositionOptions(gridConfig) {
    const options = [];
    for (let row = 0; row < gridConfig.rows; row++) {
      for (let col = 0; col < gridConfig.cols; col++) {
        const isSelected = this._editingBlock.position?.row === row && 
                          this._editingBlock.position?.col === col;
        options.push(html`
          <button 
            class="position-btn ${isSelected ? 'selected' : ''}"
            @click=${() => this._updatePosition(row, col)}
            title="位置 ${row},${col}"
          >
            ${row},${col}
          </button>
        `);
      }
    }
    return options;
  }

  _updateBlock(key, value) {
    this._editingBlock = {
      ...this._editingBlock,
      [key]: value
    };
    
    if (key === 'type' && value !== 'text') {
      this._editingBlock.config = { ...this._editingBlock.config };
    }
  }

  _updateConfig(key, value) {
    this._editingBlock.config = {
      ...this._editingBlock.config,
      [key]: value
    };
  }

  _updatePosition(row, col) {
    this._editingBlock.position = { row, col };
  }

  _onSave() {
    this.onSave(this._editingBlock);
  }

  _onDelete() {
    if (confirm('确定要删除这个内容块吗？')) {
      // 触发删除逻辑
      this.dispatchEvent(new CustomEvent('block-deleted', {
        detail: { blockId: this.block.id }
      }));
    }
  }

  _onCancel() {
    this.onCancel();
  }
}

if (!customElements.get('inline-block-editor')) {
  customElements.define('inline-block-editor', InlineBlockEditor);
}

export { InlineBlockEditor };