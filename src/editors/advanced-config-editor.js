// src/editors/advanced-config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class AdvancedConfigEditor extends LitElement {
  static properties = {
    schema: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    hass: { type: Object },
    _contentBlocks: { state: true },
    _editingBlock: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .config-editor {
        width: 100%;
      }

      .config-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
        width: 100%;
      }

      .config-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .config-label {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .required-star {
        color: var(--cf-error-color);
      }

      .switch-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
      }

      .switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        transition: all var(--cf-transition-fast);
        min-height: 52px;
      }

      .switch-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .switch-label {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .number-input {
        width: 100%;
      }

      /* 自由布局内容块编辑器 */
      .content-blocks-editor {
        margin-top: var(--cf-spacing-lg);
      }

      .blocks-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-md);
      }

      .blocks-title {
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .add-block-btn {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: var(--cf-primary-color);
        color: white;
        border: none;
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        font-size: 0.9em;
        transition: all var(--cf-transition-fast);
      }

      .add-block-btn:hover {
        background: var(--cf-accent-color);
        transform: translateY(-1px);
      }

      .blocks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--cf-spacing-md);
      }

      .content-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        position: relative;
      }

      .content-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }

      .block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-type {
        font-size: 0.8em;
        padding: 2px 8px;
        background: var(--cf-primary-color);
        color: white;
        border-radius: var(--cf-radius-sm);
      }

      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
      }

      .block-action {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity var(--cf-transition-fast);
        padding: 4px;
      }

      .block-action:hover {
        opacity: 1;
      }

      .block-content {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        word-break: break-word;
      }

      .block-preview {
        margin-top: var(--cf-spacing-xs);
        font-size: 0.8em;
        opacity: 0.7;
      }

      /* 块编辑对话框 */
      .edit-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
        z-index: 1000;
        min-width: 400px;
        max-width: 90vw;
        box-shadow: var(--cf-shadow-xl);
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-lg);
      }

      .dialog-title {
        font-weight: 600;
        font-size: 1.1em;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.7;
        font-size: 1.2em;
      }

      .dialog-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-lg);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .switch-item,
        .content-block {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .edit-dialog {
          background: var(--cf-dark-background);
          border-color: var(--cf-dark-border);
        }
      }

      /* 响应式优化 */
      @media (max-width: 1024px) {
        .config-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
        }
        
        .switch-group {
          grid-template-columns: 1fr;
        }

        .blocks-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
      }

      @media (max-width: 768px) {
        .edit-dialog {
          min-width: 90vw;
          padding: var(--cf-spacing-md);
        }
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._editingBlock = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('pluginManifest')) {
      this._contentBlocks = this._extractContentBlocks();
    }
  }

  render() {
    // 如果是自由布局卡片，显示内容块编辑器
    if (this.pluginManifest?.layout_type === 'free') {
      return this._renderFreeLayoutEditor();
    }

    // 否则显示普通的高级配置
    return this._renderNormalConfig();
  }

  _renderNormalConfig() {
    if (!this.schema || Object.keys(this.schema).length === 0) {
      return html`
        <div class="config-editor">
          <div class="empty-state">
            <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color);"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">此卡片无需额外配置</div>
          </div>
        </div>
      `;
    }

    const booleanFields = Object.entries(this.schema).filter(([_, field]) => field.type === 'boolean');
    const otherFields = Object.entries(this.schema).filter(([_, field]) => field.type !== 'boolean');

    return html`
      <div class="config-editor">
        <!-- 布尔类型配置 -->
        ${booleanFields.length > 0 ? html`
          <div class="switch-group">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        <!-- 其他类型配置 -->
        ${otherFields.length > 0 ? html`
          <div class="config-grid">
            ${otherFields.map(([key, field]) => this._renderOtherField(key, field))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderFreeLayoutEditor() {
    return html`
      <div class="config-editor">
        <!-- 普通配置字段 -->
        ${this._renderNormalConfig()}
        
        <!-- 内容块编辑器 -->
        <div class="content-blocks-editor">
          <div class="blocks-header">
            <div class="blocks-title">内容块管理</div>
            <button class="add-block-btn" @click=${this._addContentBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加内容块
            </button>
          </div>

          ${this._contentBlocks.length === 0 ? html`
            <div class="empty-state">
              <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5;"></ha-icon>
              <div class="cf-text-md cf-mt-sm">暂无内容块</div>
              <div class="cf-text-sm cf-mt-xs">点击"添加内容块"开始构建布局</div>
            </div>
          ` : html`
            <div class="blocks-grid">
              ${this._contentBlocks.map(block => this._renderContentBlock(block))}
            </div>
          `}
        </div>

        <!-- 编辑对话框 -->
        ${this._editingBlock ? this._renderEditDialog() : ''}
      </div>
    `;
  }

  _renderContentBlock(block) {
    return html`
      <div class="content-block" @click=${() => this._editBlock(block)}>
        <div class="block-header">
          <span class="block-type">${this._getBlockTypeName(block.type)}</span>
          <div class="block-actions">
            <button class="block-action" @click=${(e) => this._deleteBlock(e, block.id)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>
        </div>
        <div class="block-content">${this._getBlockPreview(block)}</div>
        ${block.entity_id ? html`
          <div class="block-preview">实体: ${block.entity_id}</div>
        ` : ''}
      </div>
    `;
  }

  _renderEditDialog() {
    return html`
      <div class="edit-dialog">
        <div class="dialog-header">
          <div class="dialog-title">编辑内容块</div>
          <button class="close-btn" @click=${this._closeEditDialog}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        
        <div class="dialog-content">
          <div class="config-field">
            <label class="config-label">内容块类型</label>
            <ha-combo-box
              .items=${[
                { value: 'text', label: '文本块' },
                { value: 'sensor', label: '传感器' },
                { value: 'switch', label: '开关' },
                { value: 'light', label: '灯光' }
              ]}
              .value=${this._editingBlock.type}
              @value-changed=${e => this._updateEditingBlock('type', e.detail.value)}
            ></ha-combo-box>
          </div>

          ${this._editingBlock.type === 'text' ? html`
            <div class="config-field">
              <label class="config-label">文本内容</label>
              <ha-textarea
                .value=${this._editingBlock.content}
                @input=${e => this._updateEditingBlock('content', e.target.value)}
                rows="3"
                auto-grow
              ></ha-textarea>
            </div>
          ` : html`
            <div class="config-field">
              <label class="config-label">选择实体</label>
              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._editingBlock.content}
                @value-changed=${e => this._updateEditingBlock('content', e.detail.value)}
                allow-custom-entity
              ></ha-entity-picker>
            </div>
          `}

          <div class="config-field">
            <label class="config-label">显示名称（可选）</label>
            <ha-textfield
              .value=${this._editingBlock.name || ''}
              @input=${e => this._updateEditingBlock('name', e.target.value)}
              placeholder="自定义显示名称"
            ></ha-textfield>
          </div>
        </div>

        <div class="dialog-actions">
          <mwc-button @click=${this._closeEditDialog}>取消</mwc-button>
          <mwc-button @click=${this._saveBlock} raised>保存</mwc-button>
        </div>
      </div>
    `;
  }

  _extractContentBlocks() {
    const blocks = [];
    const entities = this.config.entities || {};

    Object.entries(entities).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        const nameKey = `${blockId}_name`;
        
        blocks.push({
          id: blockId,
          type: value,
          content: entities[blockId] || '',
          name: entities[nameKey] || '',
          entity_id: entities[blockId] || ''
        });
      }
    });

    return blocks.sort((a, b) => a.id.localeCompare(b.id));
  }

  _getBlockTypeName(type) {
    const names = {
      text: '文本',
      sensor: '传感器',
      switch: '开关',
      light: '灯光'
    };
    return names[type] || type;
  }

  _getBlockPreview(block) {
    if (block.name) return block.name;
    if (block.type === 'text') {
      return block.content.substring(0, 30) + (block.content.length > 30 ? '...' : '');
    }
    return block.content.split('.')[1] || block.content;
  }

  _addContentBlock() {
    const blockId = `block_${Date.now()}`;
    const newEntities = {
      ...this.config.entities,
      [blockId]: '',
      [`${blockId}_type`]: 'text'
    };

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));

    // 自动打开编辑对话框
    setTimeout(() => {
      this._editingBlock = {
        id: blockId,
        type: 'text',
        content: '',
        name: ''
      };
    }, 100);
  }

  _editBlock(block) {
    this._editingBlock = { ...block };
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation();
    
    const newEntities = { ...this.config.entities };
    // 删除与块相关的所有字段
    Object.keys(newEntities).forEach(key => {
      if (key.startsWith(blockId)) {
        delete newEntities[key];
      }
    });

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }

  _updateEditingBlock(field, value) {
    this._editingBlock = {
      ...this._editingBlock,
      [field]: value
    };
  }

  _saveBlock() {
    const newEntities = {
      ...this.config.entities,
      [this._editingBlock.id]: this._editingBlock.content,
      [`${this._editingBlock.id}_type`]: this._editingBlock.type
    };

    // 保存自定义名称
    if (this._editingBlock.name) {
      newEntities[`${this._editingBlock.id}_name`] = this._editingBlock.name;
    }

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));

    this._closeEditDialog();
  }

  _closeEditDialog() {
    this._editingBlock = null;
  }

  // 原有的配置字段渲染方法保持不变
  _renderBooleanField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;
    
    return html`
      <div class="switch-item">
        <span class="switch-label">
          ${field.label}
          ${field.required ? html`<span class="required-star">*</span>` : ''}
        </span>
        <ha-switch
          .checked=${!!currentValue}
          @change=${e => this._onConfigChanged(key, e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }

  _renderOtherField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
      case 'select':
        const items = field.options.map(option => ({
          value: option,
          label: option
        }));
        
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-combo-box
              .items=${items}
              .value=${currentValue}
              @value-changed=${e => this._onConfigChanged(key, e.detail.value)}
              allow-custom-value
            ></ha-combo-box>
          </div>
        `;
        
      case 'number':
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-textfield
              class="number-input"
              .value=${currentValue}
              @input=${e => this._onConfigChanged(key, e.target.value)}
              type="number"
              min=${field.min}
              max=${field.max}
              outlined
            ></ha-textfield>
          </div>
        `;
        
      default:
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-textfield
              .value=${currentValue}
              @input=${e => this._onConfigChanged(key, e.target.value)}
              outlined
            ></ha-textfield>
          </div>
        `;
    }
  }

  _onConfigChanged(key, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { 
        config: {
          [key]: value
        }
      }
    }));
  }
}

if (!customElements.get('advanced-config-editor')) {
  customElements.define('advanced-config-editor', AdvancedConfigEditor);
}