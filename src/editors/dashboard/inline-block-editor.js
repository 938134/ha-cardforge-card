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
    _entityOptions: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .inline-editor {
        background: var(--cf-surface);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        width: 100%;
      }

      .editor-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-lg);
        align-items: start;
      }

      .form-column {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .config-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .config-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .icon-selector {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .icon-preview {
        width: 48px;
        height: 48px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        flex-shrink: 0;
      }

      .icon-preview:hover {
        background: rgba(var(--cf-rgb-primary), 0.2);
        transform: scale(1.05);
      }

      .form-actions {
        grid-column: 1 / -1;
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-md);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      .action-btn {
        padding: var(--cf-spacing-sm) var(--cf-spacing-lg);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
        min-width: 100px;
      }

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }

      .entity-info {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
        line-height: 1.3;
      }

      @media (max-width: 768px) {
        .editor-form {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
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
    this._entityOptions = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = { ...this.block };
    }
    
    if (changedProperties.has('availableEntities') || changedProperties.has('hass')) {
      this._updateEntityOptions();
    }
  }

  render() {
    const blockTypes = Object.entries(BlockManager.BLOCK_TYPES).map(([value, info]) => ({
      value,
      label: info.name
    }));

    const gridConfig = BlockManager.LAYOUT_PRESETS[this.layout] || BlockManager.LAYOUT_PRESETS['2x2'];
    const positionOptions = this._getPositionOptions(gridConfig);

    return html`
      <div class="inline-editor">
        <div class="editor-form">
          <!-- 左栏：基础配置 -->
          <div class="form-column">
            <div class="config-field">
              <label class="config-label">块类型</label>
              <ha-select
                .value=${this._editingBlock.type || 'text'}
                @selected=${e => this._updateBlock('type', e.target.value)}
                fullwidth
              >
                ${blockTypes.map(type => html`
                  <ha-list-item .value=${type.value}>${type.label}</ha-list-item>
                `)}
              </ha-select>
            </div>

            <div class="config-field">
              <label class="config-label">显示名称</label>
              <ha-textfield
                .value=${this._editingBlock.config?.title || ''}
                @input=${e => this._updateConfig('title', e.target.value)}
                placeholder="例如：室内温度"
                fullwidth
              ></ha-textfield>
            </div>

            <div class="config-field">
              <label class="config-label">自定义图标</label>
              <div class="icon-selector">
                <div class="icon-preview">
                  <ha-icon .icon=${this._editingBlock.config?.icon || BlockManager.getBlockIcon(this._editingBlock)}></ha-icon>
                </div>
                <ha-icon-picker
                  .value=${this._editingBlock.config?.icon || ''}
                  @value-changed=${e => this._updateConfig('icon', e.detail.value)}
                  label="选择图标"
                  fullwidth
                ></ha-icon-picker>
              </div>
            </div>

            <div class="config-field">
              <label class="config-label">网格位置</label>
              <ha-select
                .value=${this._getPositionValue()}
                @selected=${e => this._onPositionSelected(e.target.value)}
                fullwidth
              >
                ${positionOptions.map(option => html`
                  <ha-list-item .value=${option.value}>${option.label}</ha-list-item>
                `)}
              </ha-select>
            </div>
          </div>

          <!-- 右栏：内容配置 -->
          <div class="form-column">
            <div class="config-field">
              <label class="config-label">${this._getContentLabel()}</label>
              ${this._renderContentField()}
              ${this._renderEntityInfo()}
            </div>

            ${this._editingBlock.type === 'text' ? html`
              <div class="config-field">
                <label class="config-label">背景颜色</label>
                <ha-textfield
                  .value=${this._editingBlock.config?.background || ''}
                  @input=${e => this._updateConfig('background', e.target.value)}
                  placeholder="#f0f0f0 或 rgba(255,255,255,0.1)"
                  fullwidth
                ></ha-textfield>
              </div>
            ` : ''}
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
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
          placeholder="输入文本内容..."
          rows="4"
          fullwidth
        ></ha-textarea>
      `;
    } else {
      return html`
        <ha-combo-box
          .items=${this._entityOptions}
          .value=${this._editingBlock.content || ''}
          @value-changed=${e => this._onEntitySelected(e.detail.value)}
          placeholder="选择或输入实体ID"
          allow-custom-value
          fullwidth
        ></ha-combo-box>
      `;
    }
  }

  _renderEntityInfo() {
    if (this._editingBlock.type === 'text' || !this._editingBlock.content) return '';
    
    const entity = this.hass?.states[this._editingBlock.content];
    if (!entity) return html`<div class="entity-info">实体未找到或不可用</div>`;
    
    return html`
      <div class="entity-info">
        <div>状态: ${entity.state}</div>
        ${entity.attributes?.unit_of_measurement ? html`
          <div>单位: ${entity.attributes.unit_of_measurement}</div>
        ` : ''}
        ${entity.attributes?.friendly_name ? html`
          <div>名称: ${entity.attributes.friendly_name}</div>
        ` : ''}
      </div>
    `;
  }

  _getPositionOptions(gridConfig) {
    const options = [];
    for (let row = 0; row < gridConfig.rows; row++) {
      for (let col = 0; col < gridConfig.cols; col++) {
        options.push({
          value: `${row},${col}`,
          label: `位置 ${row},${col}`
        });
      }
    }
    return options;
  }

  _getPositionValue() {
    const pos = this._editingBlock.position;
    return pos ? `${pos.row},${pos.col}` : '0,0';
  }

  _updateEntityOptions() {
    this._entityOptions = this.availableEntities || [];
  }

  _onEntitySelected(entityId) {
    this._updateBlock('content', entityId);
    
    // 自动填充名称和图标
    if (entityId && this.hass?.states[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 自动填充名称
      if (!this._editingBlock.config?.title && entity.attributes?.friendly_name) {
        this._updateConfig('title', entity.attributes.friendly_name);
      }
      
      // 自动填充图标
      if (!this._editingBlock.config?.icon && entity.attributes?.icon) {
        this._updateConfig('icon', entity.attributes.icon);
      }
    }
  }

  _onPositionSelected(positionValue) {
    const [row, col] = positionValue.split(',').map(Number);
    this._updatePosition(row, col);
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

  _onCancel() {
    this.dispatchEvent(new CustomEvent('edit-cancelled'));
  }
}

if (!customElements.get('inline-block-editor')) {
  customElements.define('inline-block-editor', InlineBlockEditor);
}