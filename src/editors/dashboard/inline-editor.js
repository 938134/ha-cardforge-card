// src/editors/dashboard/inline-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class InlineEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    block: { type: Object },
    availableEntities: { type: Object },
    layout: { type: String },
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
        width: 100%;
      }

      .editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .form-row {
        display: grid;
        grid-template-columns: 25% 75%;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .form-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        text-align: right;
      }

      .form-control {
        width: 100%;
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
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-sm);
        grid-column: 1 / -1;
      }

      .help-text {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
        line-height: 1.3;
        grid-column: 1 / -1;
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .form-label {
          text-align: left;
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
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = { ...this.block };
    }
  }

  render() {
    const areaTypes = [
      { value: 'content', label: '内容区域' },
      { value: 'header', label: '标题区域' },
      { value: 'footer', label: '页脚区域' }
    ];

    return html`
      <div class="inline-editor">
        <div class="editor-form">
          <!-- 区域类型 -->
          <div class="form-row">
            <label class="form-label">区域类型</label>
            <div class="form-control">
              <ha-select
                .value=${this._editingBlock.config?.blockType || 'content'}
                @closed=${this._preventClose}
                naturalMenuWidth
                fixedMenuPosition
                fullwidth
              >
                ${areaTypes.map(area => html`
                  <ha-list-item 
                    .value=${area.value}
                    @click=${() => this._updateConfig('blockType', area.value)}
                  >
                    ${area.label}
                  </ha-list-item>
                `)}
              </ha-select>
            </div>
          </div>

          <!-- 传感器选择 -->
          <div class="form-row">
            <label class="form-label">传感器</label>
            <div class="form-control">
              <ha-combo-box
                .items=${this.availableEntities}
                .value=${this._editingBlock.content || ''}
                @value-changed=${e => this._onEntitySelected(e.detail.value)}
                placeholder="选择或输入实体ID"
                allow-custom-value
                fullwidth
              ></ha-combo-box>
            </div>
          </div>

          ${this._editingBlock.content ? this._renderEntityInfo() : ''}

          <!-- 显示名称 -->
          <div class="form-row">
            <label class="form-label">名称</label>
            <div class="form-control">
              <ha-textfield
                .value=${this._editingBlock.config?.title || ''}
                @input=${e => this._updateConfig('title', e.target.value)}
                placeholder="例如：室内温度"
                fullwidth
              ></ha-textfield>
            </div>
          </div>

          <!-- 图标选择 -->
          <div class="form-row">
            <label class="form-label">图标</label>
            <div class="form-control">
              <ha-icon-picker
                .value=${this._editingBlock.config?.icon || ''}
                @value-changed=${e => this._updateConfig('icon', e.detail.value)}
                label="选择图标"
                fullwidth
              ></ha-icon-picker>
            </div>
          </div>

          <div class="help-text">
            选择实体显示传感器数据，留空则显示为文本块
          </div>

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

  _renderEntityInfo() {
    if (!this._editingBlock.content) return '';
    
    const entity = this.hass?.states[this._editingBlock.content];
    if (!entity) return html`<div class="entity-info">实体未找到或不可用</div>`;
    
    return html`
      <div class="entity-info">
        <div><strong>状态:</strong> ${entity.state}</div>
        ${entity.attributes?.unit_of_measurement ? html`
          <div><strong>单位:</strong> ${entity.attributes.unit_of_measurement}</div>
        ` : ''}
        ${entity.attributes?.friendly_name ? html`
          <div><strong>实体名称:</strong> ${entity.attributes.friendly_name}</div>
        ` : ''}
      </div>
    `;
  }

  _preventClose(e) {
    e.stopPropagation();
  }

  _onEntitySelected(entityId) {
    this._updateBlock('content', entityId);
    
    // 自动填充名称和图标
    if (entityId && this.hass?.states[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 自动填充名称（仅当用户未手动设置时）
      if (!this._editingBlock.config?.title && entity.attributes?.friendly_name) {
        this._updateConfig('title', entity.attributes.friendly_name);
      }
      
      // 自动填充图标（仅当用户未手动设置时）
      if (!this._editingBlock.config?.icon) {
        const suggestedIcon = BlockManager.getEntityIcon(entityId, this.hass);
        this._updateConfig('icon', suggestedIcon);
      }
    }
  }

  _updateBlock(key, value) {
    this._editingBlock = {
      ...this._editingBlock,
      [key]: value
    };
  }

  _updateConfig(key, value) {
    this._editingBlock.config = {
      ...this._editingBlock.config,
      [key]: value
    };
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

if (!customElements.get('inline-editor')) {
  customElements.define('inline-editor', InlineEditor);
}