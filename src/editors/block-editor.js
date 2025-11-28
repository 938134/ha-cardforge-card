// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockEditor extends LitElement {
  static properties = {
    blockConfig: { type: Object },
    hass: { type: Object },
    availableEntities: { type: Array },
    _currentConfig: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-editor {
        background: var(--cf-surface);
        border: 2px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        margin-top: var(--cf-spacing-md);
        animation: expandIn 0.3s ease;
      }

      @keyframes expandIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .form-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      .form-field {
        display: flex;
        gap: var(--cf-spacing-sm);
        align-items: center;
      }

      .form-field ha-select,
      .form-field ha-combo-box,
      .form-field ha-textfield {
        flex: 1;
      }

      .radio-group {
        display: flex;
        gap: var(--cf-spacing-md);
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        cursor: pointer;
      }

      .radio-option input[type="radio"] {
        margin: 0;
      }

      .form-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-lg);
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

      /* 响应式适配 */
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .form-label {
          margin-top: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._currentConfig = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('blockConfig') && this.blockConfig) {
      // 初始化当前编辑配置
      this._currentConfig = { ...this.blockConfig };
    }
  }

  render() {
    if (!this._currentConfig) {
      return html``;
    }

    return html`
      <div class="block-editor">
        <div class="form-grid">
          <!-- 区域选择 -->
          <div class="form-label">区域</div>
          <div class="form-field">
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="area" value="header" 
                  ?checked=${this._currentConfig.area === 'header'}
                  @change=${e => this._updateField('area', e.target.value)}>
                标题
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="content" 
                  ?checked=${!this._currentConfig.area || this._currentConfig.area === 'content'}
                  @change=${e => this._updateField('area', e.target.value)}>
                内容
              </label>
              <label class="radio-option">
                <input type="radio" name="area" value="footer" 
                  ?checked=${this._currentConfig.area === 'footer'}
                  @change=${e => this._updateField('area', e.target.value)}>
                页脚
              </label>
            </div>
          </div>

          <!-- 实体选择 -->
          <div class="form-label">实体</div>
          <div class="form-field">
            ${this.availableEntities?.length > 0 ? html`
              <ha-combo-box
                .items=${this.availableEntities}
                .value=${this._currentConfig.entity || ''}
                @value-changed=${e => this._onEntityChange(e.detail.value)}
                allow-custom-value
                label="选择实体"
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this._currentConfig.entity || ''}
                @input=${e => this._updateField('entity', e.target.value)}
                placeholder="输入实体ID"
                fullwidth
              ></ha-textfield>
            `}
          </div>

          <!-- 图标选择 -->
          <div class="form-label">图标</div>
          <div class="form-field">
            <ha-icon-picker
              .value=${this._currentConfig.icon || ''}
              @value-changed=${e => this._updateField('icon', e.detail.value)}
              label="选择图标"
            ></ha-icon-picker>
          </div>

          <!-- 内容输入 -->
          <div class="form-label">内容</div>
          <div class="form-field">
            <ha-textfield
              .value=${this._currentConfig.content || ''}
              @input=${e => this._updateField('content', e.target.value)}
              placeholder="输入显示内容"
              fullwidth
            ></ha-textfield>
          </div>
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
    `;
  }

  _onEntityChange(entityId) {
    this._updateField('entity', entityId);
    
    // 自动填充实体信息
    if (entityId && this.hass?.states[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 自动填充图标
      if (entity.attributes?.icon) {
        this._updateField('icon', entity.attributes.icon);
      } else {
        // 如果没有实体图标，使用默认图标
        const entityType = entityId.split('.')[0];
        const iconMap = {
          'light': 'mdi:lightbulb',
          'switch': 'mdi:power',
          'sensor': 'mdi:gauge',
          'binary_sensor': 'mdi:checkbox-marked-circle-outline',
          'climate': 'mdi:thermostat',
          'cover': 'mdi:blinds',
          'media_player': 'mdi:speaker'
        };
        this._updateField('icon', iconMap[entityType] || 'mdi:cube');
      }
      
      // 自动填充内容（状态值）
      const unit = entity.attributes?.unit_of_measurement || '';
      const stateDisplay = unit ? `${entity.state} ${unit}` : entity.state;
      this._updateField('content', stateDisplay);
    }
  }

  _updateField(key, value) {
    if (this._currentConfig) {
      this._currentConfig[key] = value;
      
      // 实时通知配置变更
      this.dispatchEvent(new CustomEvent('config-change', {
        detail: {
          blockId: this.blockConfig?.id,
          changes: { [key]: value }
        }
      }));
      
      this.requestUpdate();
    }
  }

  _onSave() {
    this.dispatchEvent(new CustomEvent('save'));
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}

export { BlockEditor };