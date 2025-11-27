// src/editors/block-system/inline-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockSystem } from '../../core/block-system.js';

class InlineEditor extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    _editingConfig: { state: true },
    _availableEntities: { state: true }
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

  constructor() {
    super();
    this._editingConfig = null;
    this._availableEntities = [];
    this._autoFillTimeout = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingConfig = this.block ? { ...this.block } : null;
    }
    
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }
  }

  render() {
    if (!this._editingConfig) {
      return html``;
    }

    return html`
      <div class="inline-editor">
        <div class="editor-form">
          <!-- 第一行: 实体选择 -->
          <div class="form-field">
            <div class="field-label">实体</div>
            <ha-combo-box
              .items=${this._availableEntities}
              .value=${this._editingConfig.entity || ''}
              @value-changed=${this._onEntityChanged}
              allow-custom-value
              label="选择或输入实体ID"
              fullwidth
            ></ha-combo-box>
          </div>

          <!-- 第二行: 名称输入 -->
          <div class="form-field">
            <div class="field-label">显示名称</div>
            <ha-textfield
              .value=${this._editingConfig.title || ''}
              @input=${e => this._updateConfig('title', e.target.value)}
              placeholder="输入显示名称"
              fullwidth
            ></ha-textfield>
          </div>

          <!-- 第三行: 图标选择 -->
          <div class="form-field">
            <div class="field-label">图标</div>
            <ha-icon-picker
              .value=${this._editingConfig.icon || ''}
              @value-changed=${e => this._updateConfig('icon', e.detail.value)}
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

  _onEntityChanged(e) {
    const entityId = e.detail.value;
    this._updateConfig('entity', entityId);
    
    // 延迟自动填充，避免频繁更新导致的闪烁
    if (this._autoFillTimeout) {
      clearTimeout(this._autoFillTimeout);
    }
    
    this._autoFillTimeout = setTimeout(() => {
      this._autoFillFromEntity(entityId);
    }, 300);
  }

  _autoFillFromEntity(entityId) {
    if (!entityId || !this.hass?.states[entityId]) return;
    
    const entity = this.hass.states[entityId];
    const updates = {};
    
    // 自动填充名称（如果当前名称为空或是默认值）
    if (!this._editingConfig.title || this._editingConfig.title === this._editingConfig.id) {
      if (entity.attributes?.friendly_name) {
        updates.title = entity.attributes.friendly_name;
      }
    }
    
    // 自动填充图标（如果当前图标为空）
    if (!this._editingConfig.icon) {
      updates.icon = BlockSystem.getEntityIcon(entityId, this.hass);
    }
    
    // 批量更新配置
    if (Object.keys(updates).length > 0) {
      this._editingConfig = {
        ...this._editingConfig,
        ...updates
      };
      this.requestUpdate();
    }
  }

  _updateConfig(key, value) {
    if (!this._editingConfig) return;
    
    this._editingConfig = {
      ...this._editingConfig,
      [key]: value
    };
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

  _onSave() {
    if (!this._editingConfig) return;
    
    const validation = BlockSystem.validateBlock(this._editingConfig);
    if (!validation.valid) {
      alert(`配置错误：${validation.errors.join(', ')}`);
      return;
    }
    
    // 清除定时器
    if (this._autoFillTimeout) {
      clearTimeout(this._autoFillTimeout);
    }
    
    this.dispatchEvent(new CustomEvent('save', {
      detail: { config: { ...this._editingConfig } }
    }));
  }

  _onCancel() {
    // 清除定时器
    if (this._autoFillTimeout) {
      clearTimeout(this._autoFillTimeout);
    }
    
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // 组件卸载时清除定时器
    if (this._autoFillTimeout) {
      clearTimeout(this._autoFillTimeout);
    }
  }
}

if (!customElements.get('inline-editor')) {
  customElements.define('inline-editor', InlineEditor);
}

export { InlineEditor };