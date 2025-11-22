// src/editors/inline-block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class InlineBlockEditor extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    onSave: { type: Object },
    onDelete: { type: Object },
    onCancel: { type: Object }
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

      .form-controls {
        display: flex;
        gap: var(--cf-spacing-sm);
      }

      .entity-picker-row {
        display: flex;
        gap: var(--cf-spacing-sm);
        align-items: start;
      }

      .entity-picker {
        flex: 1;
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

        .entity-picker-row {
          flex-direction: column;
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
            <label class="form-label">名称</label>
            <ha-textfield
              .value=${this.block.config?.name || ''}
              @input=${e => this._updateConfig('name', e.target.value)}
              label="内容块名称"
              fullwidth
            ></ha-textfield>
          </div>

          <div class="form-row">
            <label class="form-label">图标</label>
            <ha-icon-picker
              .value=${this.block.config?.icon || this._getDefaultIcon()}
              @value-changed=${e => this._updateConfig('icon', e.detail.value)}
              label="选择图标"
            ></ha-icon-picker>
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
      'sensor': '传感器实体',
      'weather': '天气实体',
      'switch': '开关实体'
    };
    return labels[this.block.type] || '内容';
  }

  _getDefaultIcon() {
    const icons = {
      'text': 'mdi:text',
      'sensor': 'mdi:gauge',
      'weather': 'mdi:weather-cloudy', 
      'switch': 'mdi:power'
    };
    return icons[this.block.type] || 'mdi:cube';
  }

  _renderContentField() {
    if (this.block.type === 'text') {
      return html`
        <ha-textarea
          .value=${this.block.content || ''}
          @input=${e => this._updateBlock('content', e.target.value)}
          label="输入内容"
          rows="2"
          fullwidth
        ></ha-textarea>
      `;
    } else {
      return html`
        <div class="entity-picker-row">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this.block.content || ''}
            @value-changed=${e => this._updateBlock('content', e.detail.value)}
            .label=${`选择${this._getContentLabel()}`}
            allow-custom-entity
            class="entity-picker"
          ></ha-entity-picker>
          
          ${this.block.content ? html`
            <ha-icon-picker
              .value=${this.block.config?.icon || this._getDefaultIcon()}
              @value-changed=${e => this._updateConfig('icon', e.detail.value)}
              .label=${`${this._getContentLabel()}图标`}
            ></ha-icon-picker>
          ` : ''}
        </div>
      `;
    }
  }

  _updateBlock(key, value) {
    this.block = {
      ...this.block,
      [key]: value
    };
    
    if (key === 'type' && value !== 'text') {
      // 切换类型时重置配置，但保留名称
      const name = this.block.config?.name;
      this.block.config = name ? { name } : {};
      
      // 自动设置图标
      this.block.config.icon = this._getDefaultIcon();
    }
    
    // 如果是实体类型且选择了实体，自动设置名称
    if (key === 'content' && value && this.block.type !== 'text') {
      const entity = this.hass?.states[value];
      if (entity && !this.block.config?.name) {
        this.block.config.name = entity.attributes.friendly_name || value;
      }
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