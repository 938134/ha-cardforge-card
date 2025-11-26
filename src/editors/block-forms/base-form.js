// src/editors/block-forms/base-form.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { blockManager } from '../../core/block-manager.js';

class BaseForm extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    _editingBlock: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .form-container {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        margin-top: var(--cf-spacing-md);
      }

      .form-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-lg);
        padding-bottom: var(--cf-spacing-md);
        border-bottom: 1px solid var(--cf-border);
      }

      .form-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .form-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
      }

      .property-group {
        margin-bottom: var(--cf-spacing-lg);
      }

      .property-group-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .property-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .property-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .property-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .radio-group {
        display: flex;
        gap: var(--cf-spacing-md);
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        cursor: pointer;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        cursor: pointer;
      }

      .delete-btn {
        background: var(--cf-error-color);
        color: white;
        border: none;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border-radius: var(--cf-radius-sm);
        cursor: pointer;
        font-size: 0.85em;
      }

      .delete-btn:hover {
        opacity: 0.8;
      }
    `
  ];

  constructor() {
    super();
    this._editingBlock = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = this.block ? { ...this.block } : null;
    }
  }

  render() {
    if (!this._editingBlock) {
      return html`<div class="cf-text-sm cf-text-secondary">未选择块</div>`;
    }

    const manifest = blockManager.getBlockManifest(this._editingBlock.type);
    
    return html`
      <div class="form-container">
        <div class="form-header">
          <div class="form-title">
            ${manifest?.icon || '📦'} ${manifest?.name || this._editingBlock.type} 配置
          </div>
          <div class="form-actions">
            <button class="delete-btn" @click=${this._deleteBlock}>
              删除块
            </button>
          </div>
        </div>

        ${this._renderFormContent()}
      </div>
    `;
  }

  _renderFormContent() {
    switch (this._editingBlock.type) {
      case 'text':
        return this._renderTextForm();
      case 'entity':
        return this._renderEntityForm();
      case 'time':
        return this._renderTimeForm();
      case 'layout':
        return this._renderLayoutForm();
      default:
        return html`<div class="cf-text-sm cf-text-secondary">暂不支持此块类型的配置</div>`;
    }
  }

  _renderTextForm() {
    const config = this._editingBlock.config || {};

    return html`
      <div class="property-group">
        <div class="property-group-title">🏷️ 内容设置</div>
        <div class="property-form">
          <div class="property-field">
            <label class="property-label">文本内容</label>
            <ha-textfield
              .value=${config.content || ''}
              @input=${e => this._updateConfig('content', e.target.value)}
              fullwidth
              placeholder="请输入文本内容"
            ></ha-textfield>
          </div>

          <div class="property-field">
            <label class="property-label">对齐方式</label>
            <div class="radio-group">
              <label class="radio-option">
                <ha-radio
                  name="align"
                  value="left"
                  .checked=${config.align === 'left'}
                  @change=${e => this._updateConfig('align', e.target.value)}
                ></ha-radio>
                <span>左对齐</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="align"
                  value="center"
                  .checked=${!config.align || config.align === 'center'}
                  @change=${e => this._updateConfig('align', e.target.value)}
                ></ha-radio>
                <span>居中</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="align"
                  value="right"
                  .checked=${config.align === 'right'}
                  @change=${e => this._updateConfig('align', e.target.value)}
                ></ha-radio>
                <span>右对齐</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderEntityForm() {
    const config = this._editingBlock.config || {};
    const entity = config.entity ? this.hass?.states?.[config.entity] : null;
    const friendlyName = entity?.attributes?.friendly_name || config.entity;

    return html`
      <div class="property-group">
        <div class="property-group-title">🏷️ 基础设置</div>
        <div class="property-form">
          <div class="property-field">
            <label class="property-label">实体选择</label>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${config.entity || ''}
              @value-changed=${e => this._updateEntityConfig('entity', e.detail.value)}
              allow-custom-entity
            ></ha-entity-picker>
          </div>

          <div class="property-field">
            <label class="property-label">显示名称</label>
            <ha-textfield
              .value=${config.name || friendlyName || ''}
              @input=${e => this._updateConfig('name', e.target.value)}
              fullwidth
              placeholder="自动从实体获取"
            ></ha-textfield>
          </div>

          <div class="property-field">
            <label class="property-label">图标</label>
            <ha-icon-picker
              .value=${config.icon || ''}
              @value-changed=${e => this._updateConfig('icon', e.detail.value)}
              .hass=${this.hass}
            ></ha-icon-picker>
          </div>
        </div>
      </div>

      <div class="property-group">
        <div class="property-group-title">🎨 显示选项</div>
        <div class="property-form">
          <div class="checkbox-group">
            <label class="checkbox-option">
              <ha-checkbox
                .checked=${config.show_name !== false}
                @change=${e => this._updateConfig('show_name', e.target.checked)}
              ></ha-checkbox>
              <span>显示名称</span>
            </label>
            <label class="checkbox-option">
              <ha-checkbox
                .checked=${config.show_icon !== false}
                @change=${e => this._updateConfig('show_icon', e.target.checked)}
              ></ha-checkbox>
              <span>显示图标</span>
            </label>
            <label class="checkbox-option">
              <ha-checkbox
                .checked=${config.show_unit !== false}
                @change=${e => this._updateConfig('show_unit', e.target.checked)}
              ></ha-checkbox>
              <span>显示单位</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  _renderTimeForm() {
    const config = this._editingBlock.config || {};

    return html`
      <div class="property-group">
        <div class="property-group-title">🏷️ 格式设置</div>
        <div class="property-form">
          <div class="property-field">
            <label class="property-label">时间格式</label>
            <div class="radio-group">
              <label class="radio-option">
                <ha-radio
                  name="time-format"
                  value="24"
                  .checked=${config.use_24_hour !== false}
                  @change=${() => this._updateConfig('use_24_hour', true)}
                ></ha-radio>
                <span>24小时制</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="time-format"
                  value="12"
                  .checked=${config.use_24_hour === false}
                  @change=${() => this._updateConfig('use_24_hour', false)}
                ></ha-radio>
                <span>12小时制</span>
              </label>
            </div>
          </div>

          <div class="property-field">
            <label class="property-label">显示选项</label>
            <div class="checkbox-group">
              <label class="checkbox-option">
                <ha-checkbox
                  .checked=${config.show_date !== false}
                  @change=${e => this._updateConfig('show_date', e.target.checked)}
                ></ha-checkbox>
                <span>显示日期</span>
              </label>
              <label class="checkbox-option">
                <ha-checkbox
                  .checked=${config.show_seconds || false}
                  @change=${e => this._updateConfig('show_seconds', e.target.checked)}
                ></ha-checkbox>
                <span>显示秒数</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderLayoutForm() {
    const config = this._editingBlock.config || {};

    return html`
      <div class="property-group">
        <div class="property-group-title">🏗️ 布局设置</div>
        <div class="property-form">
          <div class="property-field">
            <label class="property-label">布局类型</label>
            <div class="radio-group" style="flex-direction: column; gap: var(--cf-spacing-sm);">
              <label class="radio-option">
                <ha-radio
                  name="layout-type"
                  value="vertical"
                  .checked=${!config.layout || config.layout === 'vertical'}
                  @change=${e => this._updateConfig('layout', e.target.value)}
                ></ha-radio>
                <span>垂直布局</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="layout-type"
                  value="horizontal"
                  .checked=${config.layout === 'horizontal'}
                  @change=${e => this._updateConfig('layout', e.target.value)}
                ></ha-radio>
                <span>水平布局</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="layout-type"
                  value="grid"
                  .checked=${config.layout === 'grid'}
                  @change=${e => this._updateConfig('layout', e.target.value)}
                ></ha-radio>
                <span>网格布局</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _updateEntityConfig(key, value) {
    this._updateConfig(key, value);
    
    // 自动填充友好名称
    if (key === 'entity' && value && this.hass?.states?.[value]) {
      const entity = this.hass.states[value];
      if (entity.attributes?.friendly_name && !this._editingBlock.config.name) {
        this._updateConfig('name', entity.attributes.friendly_name);
      }
    }
  }

  _updateConfig(key, value) {
    if (!this._editingBlock) return;
    
    this._editingBlock = {
      ...this._editingBlock,
      config: {
        ...this._editingBlock.config,
        [key]: value
      }
    };
    
    this._notifyBlockUpdated();
  }

  _deleteBlock() {
    this.dispatchEvent(new CustomEvent('block-deleted', {
      detail: { blockId: this._editingBlock.id }
    }));
  }

  _notifyBlockUpdated() {
    this.dispatchEvent(new CustomEvent('block-updated', {
      detail: { block: this._editingBlock }
    }));
  }
}

if (!customElements.get('block-form')) {
  customElements.define('block-form', BaseForm);
}

export { BaseForm };
