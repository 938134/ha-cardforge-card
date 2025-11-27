// src/editors/block-system/inline-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';

class InlineEditor extends LitElement {
  static properties = {
    blockId: { type: String },
    editingConfig: { type: Object },
    availableEntities: { type: Array }
  };

  static styles = [
    designSystem,
    css`
      .inline-editor {
        background: rgba(var(--cf-rgb-primary), 0.03);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-sm);
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
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

      .action-btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .form-actions {
          justify-content: stretch;
        }
        
        .action-btn {
          flex: 1;
        }
      }
    `
  ];

  render() {
    // 关键修复：如果 editingConfig 为 null 或 undefined，不渲染编辑器
    if (!this.editingConfig) {
      console.log('🛑 InlineEditor: editingConfig 为空，不渲染');
      return html``;
    }

    console.log('🎨 InlineEditor: 渲染编辑器，数据:', this.editingConfig);

    return html`
      <div class="inline-editor">
        <div class="editor-form">
          <!-- 第一行: 实体选择 -->
          <div class="form-field">
            <div class="field-label">实体</div>
            <ha-combo-box
              .items=${this.availableEntities || []}
              .value=${this.editingConfig.entity || ''}
              @value-changed=${e => this._onEntityChanged(e.detail.value)}
              allow-custom-value
              label="选择或输入实体ID"
              fullwidth
            ></ha-combo-box>
          </div>

          <!-- 第二行: 名称输入 -->
          <div class="form-field">
            <div class="field-label">显示名称</div>
            <ha-textfield
              .value=${this.editingConfig.title || ''}
              @input=${e => this._onFieldChange('title', e.target.value)}
              placeholder="输入显示名称"
              fullwidth
            ></ha-textfield>
          </div>

          <!-- 第三行: 图标选择 -->
          <div class="form-field">
            <div class="field-label">图标</div>
            <ha-icon-picker
              .value=${this.editingConfig.icon || ''}
              @value-changed=${e => this._onFieldChange('icon', e.detail.value)}
              label="选择图标"
              fullwidth
            ></ha-icon-picker>
          </div>

          <div class="form-actions">
            <button class="action-btn" @click=${this._onCancel}>取消</button>
            <button class="action-btn primary" @click=${this._onSave}>保存</button>
          </div>
        </div>
      </div>
    `;
  }

  _onEntityChanged(entityId) {
    this._onFieldChange('entity', entityId);
  }

  _onFieldChange(key, value) {
    this.dispatchEvent(new CustomEvent('update-editing-config', {
      detail: {
        blockId: this.blockId,
        updates: { [key]: value }
      }
    }));
  }

  _onSave() {
    console.log('💾 InlineEditor: 触发保存');
    this.dispatchEvent(new CustomEvent('save-block', {
      detail: {
        blockId: this.blockId,
        config: this.editingConfig
      }
    }));
  }

  _onCancel() {
    console.log('❌ InlineEditor: 触发取消');
    this.dispatchEvent(new CustomEvent('cancel-edit', {
      detail: { blockId: this.blockId }
    }));
  }
}

if (!customElements.get('inline-editor')) {
  customElements.define('inline-editor', InlineEditor);
}

export { InlineEditor };