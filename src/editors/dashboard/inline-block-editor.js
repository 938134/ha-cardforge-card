// src/editors/dashboard/inline-block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class InlineBlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    block: { type: Object },
    availableEntities: { type: Object },
    layout: { type: String },
    _editingBlock: { state: true },
    _showIconPicker: { state: true }
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

      .icon-selector {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .icon-preview {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .icon-preview:hover {
        background: rgba(var(--cf-rgb-primary), 0.2);
        transform: scale(1.05);
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
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      .action-btn {
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
        min-width: 80px;
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
        
        .action-btn {
          min-width: auto;
        }
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.availableEntities = [];
    this.layout = '2x2';
    this._editingBlock = {};
    this._showIconPicker = false;
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
            <label class="form-label">块类型</label>
            <ha-combo-box
              .items=${blockTypes}
              .value=${this._editingBlock.type || 'text'}
              @value-changed=${e => this._updateBlock('type', e.detail.value)}
              label="选择类型"
              fullwidth
            ></ha-combo-box>
          </div>

          <div class="form-row">
            <label class="form-label">显示标题</label>
            <ha-textfield
              .value=${this._editingBlock.config?.title || ''}
              @input=${e => this._updateConfig('title', e.target.value)}
              label="块标题"
              placeholder="例如：室内温度"
              fullwidth
            ></ha-textfield>
          </div>

          <div class="form-row">
            <label class="form-label">自定义图标</label>
            <div class="icon-selector">
              <div class="icon-preview" @click=${this._toggleIconPicker}>
                <ha-icon .icon=${this._editingBlock.config?.icon || BlockManager.getBlockIcon(this._editingBlock)}></ha-icon>
              </div>
              <ha-textfield
                .value=${this._editingBlock.config?.icon || ''}
                @input=${e => this._updateConfig('icon', e.target.value)}
                label="图标名称"
                placeholder="例如：mdi:home"
                fullwidth
              ></ha-textfield>
            </div>
          </div>

          ${this._showIconPicker ? html`
            <div class="form-row">
              <label class="form-label">选择图标</label>
              <ha-icon-picker
                .value=${this._editingBlock.config?.icon || ''}
                @value-changed=${e => this._updateConfig('icon', e.detail.value)}
                label="选择图标"
              ></ha-icon-picker>
            </div>
          ` : ''}

          <div class="form-row">
            <label class="form-label">${this._getContentLabel()}</label>
            ${this._renderContentField()}
          </div>

          <div class="form-row">
            <label class="form-label">网格位置</label>
            <div class="position-selector">
              ${this._renderPositionOptions(gridConfig)}
            </div>
          </div>

          ${this._editingBlock.type === 'text' ? html`
            <div class="form-row">
              <label class="form-label">背景颜色</label>
              <ha-textfield
                .value=${this._editingBlock.config?.background || ''}
                @input=${e => this._updateConfig('background', e.target.value)}
                label="背景颜色"
                placeholder="#f0f0f0 或 rgba(255,255,255,0.1)"
                fullwidth
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
      'text': '文本内容',
      'sensor': '传感器实体',
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
          label="输入文本内容"
          rows="3"
          fullwidth
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
          fullwidth
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

  _toggleIconPicker() {
    this._showIconPicker = !this._showIconPicker;
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
    this.dispatchEvent(new CustomEvent('block-saved', {
      detail: { block: this._editingBlock }
    }));
  }

  _onDelete() {
    if (confirm('确定要删除这个内容块吗？')) {
      this.dispatchEvent(new CustomEvent('block-deleted', {
        detail: { blockId: this.block.id }
      }));
    }
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('edit-cancelled'));
  }
}

if (!customElements.get('inline-block-editor')) {
  customElements.define('inline-block-editor', InlineBlockEditor);
}