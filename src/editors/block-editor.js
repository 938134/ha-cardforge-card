// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';

class BlockEditor extends LitElement {
  static properties = {
    blockConfig: { type: Object },
    hass: { type: Object },
    availableEntities: { type: Array },
    _editingConfig: { state: true },
    _entityInfo: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-editor {
        width: 100%;
      }

      .editor-form {
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

      .entity-info {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
        line-height: 1.3;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-sm);
      }

      .form-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-md);
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
    this._editingConfig = {};
    this._entityInfo = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('blockConfig')) {
      this._editingConfig = { ...this.blockConfig };
      this._updateEntityInfo();
    }
  }

  render() {
    const isEntityBlock = !!this._editingConfig.entity;

    return html`
      <div class="block-editor">
        <div class="editor-form">
          <!-- 实体选择 -->
          <div class="config-field">
            <label class="config-label">实体</label>
            <ha-combo-box
              .items=${this.availableEntities}
              .value=${this._editingConfig.entity || ''}
              @value-changed=${this._onEntitySelected}
              allow-custom-value
              label="选择或输入实体ID"
              fullwidth
            ></ha-combo-box>
            ${this._renderEntityInfo()}
          </div>

          <!-- 名称输入 -->
          <div class="config-field">
            <label class="config-label">显示名称</label>
            <ha-textfield
              .value=${this._editingConfig.title || ''}
              @input=${e => this._updateConfig('title', e.target.value)}
              placeholder="输入显示名称"
              fullwidth
            ></ha-textfield>
          </div>

          <!-- 图标选择 -->
          <div class="config-field">
            <label class="config-label">图标</label>
            <ha-icon-picker
              .value=${this._editingConfig.icon || ''}
              @value-changed=${e => this._updateConfig('icon', e.detail.value)}
              label="选择图标"
              fullwidth
            ></ha-icon-picker>
          </div>

          <!-- 内容输入（仅文本块显示） -->
          ${!isEntityBlock ? html`
            <div class="config-field">
              <label class="config-label">内容</label>
              <ha-textarea
                .value=${this._editingConfig.content || ''}
                @input=${e => this._updateConfig('content', e.target.value)}
                placeholder="输入内容..."
                rows="3"
                fullwidth
              ></ha-textarea>
            </div>
          ` : ''}

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
    if (!this._entityInfo) return '';

    return html`
      <div class="entity-info">
        <div><strong>状态:</strong> ${this._entityInfo.state}</div>
        ${this._entityInfo.unit ? html`
          <div><strong>单位:</strong> ${this._entityInfo.unit}</div>
        ` : ''}
        ${this._entityInfo.friendlyName ? html`
          <div><strong>名称:</strong> ${this._entityInfo.friendlyName}</div>
        ` : ''}
      </div>
    `;
  }

  _onEntitySelected(e) {
    const entityId = e.detail.value;
    this._updateConfig('entity', entityId);
    
    // 自动填充名称和图标
    if (entityId && this.hass?.states[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 自动填充名称
      if (!this._editingConfig.title && entity.attributes?.friendly_name) {
        this._updateConfig('title', entity.attributes.friendly_name);
      }
      
      // 自动填充图标
      if (!this._editingConfig.icon) {
        const suggestedIcon = BlockSystem.getEntityIcon(entityId, this.hass);
        this._updateConfig('icon', suggestedIcon);
      }
    }
    
    this._updateEntityInfo();
  }

  _updateEntityInfo() {
    if (!this._editingConfig.entity || !this.hass) {
      this._entityInfo = null;
      return;
    }
    
    const entity = this.hass.states[this._editingConfig.entity];
    if (!entity) {
      this._entityInfo = { state: '实体未找到' };
      return;
    }
    
    this._entityInfo = {
      state: entity.state,
      unit: entity.attributes?.unit_of_measurement || '',
      friendlyName: entity.attributes?.friendly_name || this._editingConfig.entity
    };
  }

  _updateConfig(key, value) {
    this._editingConfig = {
      ...this._editingConfig,
      [key]: value
    };
  }

  _onSave() {
    // 验证配置
    const validation = BlockSystem.validateBlock(this._editingConfig);
    if (!validation.valid) {
      alert(`配置错误：${validation.errors.join(', ')}`);
      return;
    }
    
    this.dispatchEvent(new CustomEvent('block-saved', {
      detail: { blockConfig: this._editingConfig }
    }));
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('edit-cancelled'));
  }
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}

export { BlockEditor };