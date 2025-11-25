// src/editors/block-properties.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';

class BlockProperties extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    _availableEntities: { state: true },
    _editingBlock: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .properties-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
      }

      .property-group {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
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

      .property-hint {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
        font-style: italic;
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
    `
  ];

  constructor() {
    super();
    this._availableEntities = [];
    this._editingBlock = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = this.block ? { ...this.block } : null;
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    if (!this._editingBlock) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:select" style="font-size: 1.5em; opacity: 0.5;"></ha-icon>
          <div class="cf-text-sm cf-mt-md">请先选择一个块</div>
        </div>
      `;
    }

    const blockManifest = blockManager.getBlockManifest(this._editingBlock.type);
    
    return html`
      <div class="properties-container">
        ${this._renderBlockProperties()}
      </div>
    `;
  }

  _renderBlockProperties() {
    switch (this._editingBlock.type) {
      case 'entity':
        return this._renderEntityProperties();
      case 'text':
        return this._renderTextProperties();
      case 'time':
        return this._renderTimeProperties();
      case 'layout':
        return this._renderLayoutProperties();
      default:
        return html`<div class="cf-text-sm cf-text-secondary">暂不支持此块类型的配置</div>`;
    }
  }

  _renderEntityProperties() {
    const config = this._editingBlock.config || {};
    const entity = config.entity ? this.hass?.states?.[config.entity] : null;
    const friendlyName = entity?.attributes?.friendly_name || config.entity;

    return html`
      <!-- 基础设置 -->
      <div class="property-group">
        <div class="property-group-title">🏷️ 基础设置</div>
        <div class="property-form">
          <!-- 实体选择 -->
          <div class="property-field">
            <label class="property-label">实体选择</label>
            <ha-combo-box
              .items=${this._availableEntities}
              .value=${config.entity || ''}
              @value-changed=${e => this._updateEntityConfig('entity', e.detail.value)}
              allow-custom-value
              fullwidth
            ></ha-combo-box>
          </div>

          <!-- 显示名称 -->
          <div class="property-field">
            <label class="property-label">显示名称</label>
            <ha-textfield
              .value=${config.name || friendlyName || ''}
              @input=${e => this._updateEntityConfig('name', e.target.value)}
              fullwidth
              placeholder="自动从实体获取"
            ></ha-textfield>
          </div>

          <!-- 图标选择 -->
          <div class="property-field">
            <label class="property-label">图标选择</label>
            ${this._renderIconPicker(config.icon)}
          </div>
        </div>
      </div>

      <!-- 显示选项 -->
      <div class="property-group">
        <div class="property-group-title">🎨 显示选项</div>
        <div class="property-form">
          <div class="checkbox-group">
            <label class="checkbox-option">
              <ha-checkbox
                .checked=${config.show_name !== false}
                @change=${e => this._updateEntityConfig('show_name', e.target.checked)}
              ></ha-checkbox>
              <span>显示名称</span>
            </label>
            <label class="checkbox-option">
              <ha-checkbox
                .checked=${config.show_icon !== false}
                @change=${e => this._updateEntityConfig('show_icon', e.target.checked)}
              ></ha-checkbox>
              <span>显示图标</span>
            </label>
            <label class="checkbox-option">
              <ha-checkbox
                .checked=${config.show_unit !== false}
                @change=${e => this._updateEntityConfig('show_unit', e.target.checked)}
              ></ha-checkbox>
              <span>显示单位</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  _renderTextProperties() {
    const config = this._editingBlock.config || {};

    return html`
      <div class="property-group">
        <div class="property-group-title">🏷️ 内容设置</div>
        <div class="property-form">
          <div class="property-field">
            <label class="property-label">文本内容</label>
            <ha-textfield
              .value=${config.content || ''}
              @input=${e => this._updateTextConfig('content', e.target.value)}
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
                  @change=${e => this._updateTextConfig('align', e.target.value)}
                ></ha-radio>
                <span>左对齐</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="align"
                  value="center"
                  .checked=${!config.align || config.align === 'center'}
                  @change=${e => this._updateTextConfig('align', e.target.value)}
                ></ha-radio>
                <span>居中</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="align"
                  value="right"
                  .checked=${config.align === 'right'}
                  @change=${e => this._updateTextConfig('align', e.target.value)}
                ></ha-radio>
                <span>右对齐</span>
              </label>
            </div>
          </div>

          <div class="property-field">
            <label class="property-label">字体大小</label>
            <div class="radio-group">
              <label class="radio-option">
                <ha-radio
                  name="size"
                  value="0.8em"
                  .checked=${config.size === '0.8em'}
                  @change=${e => this._updateTextConfig('size', e.target.value)}
                ></ha-radio>
                <span>小</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="size"
                  value="1em"
                  .checked=${!config.size || config.size === '1em'}
                  @change=${e => this._updateTextConfig('size', e.target.value)}
                ></ha-radio>
                <span>中</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="size"
                  value="1.2em"
                  .checked=${config.size === '1.2em'}
                  @change=${e => this._updateTextConfig('size', e.target.value)}
                ></ha-radio>
                <span>大</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderTimeProperties() {
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
                  @change=${() => this._updateTimeConfig('use_24_hour', true)}
                ></ha-radio>
                <span>24小时制</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="time-format"
                  value="12"
                  .checked=${config.use_24_hour === false}
                  @change=${() => this._updateTimeConfig('use_24_hour', false)}
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
                  @change=${e => this._updateTimeConfig('show_date', e.target.checked)}
                ></ha-checkbox>
                <span>显示日期</span>
              </label>
              <label class="checkbox-option">
                <ha-checkbox
                  .checked=${config.show_seconds || false}
                  @change=${e => this._updateTimeConfig('show_seconds', e.target.checked)}
                ></ha-checkbox>
                <span>显示秒数</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderLayoutProperties() {
    const config = this._editingBlock.config || {};

    return html`
      <div class="property-group">
        <div class="property-group-title">🏷️ 布局设置</div>
        <div class="property-form">
          <div class="property-field">
            <label class="property-label">布局类型</label>
            <div class="radio-group" style="flex-direction: column; gap: var(--cf-spacing-sm);">
              <label class="radio-option">
                <ha-radio
                  name="layout-type"
                  value="vertical"
                  .checked=${!config.layout || config.layout === 'vertical'}
                  @change=${e => this._updateLayoutConfig('layout', e.target.value)}
                ></ha-radio>
                <span>垂直布局</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="layout-type"
                  value="horizontal"
                  .checked=${config.layout === 'horizontal'}
                  @change=${e => this._updateLayoutConfig('layout', e.target.value)}
                ></ha-radio>
                <span>水平布局</span>
              </label>
              <label class="radio-option">
                <ha-radio
                  name="layout-type"
                  value="grid"
                  .checked=${config.layout === 'grid'}
                  @change=${e => this._updateLayoutConfig('layout', e.target.value)}
                ></ha-radio>
                <span>网格布局</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderIconPicker(currentIcon) {
    return html`
      <ha-icon-picker
        .value=${currentIcon || ''}
        @value-changed=${e => this._updateEntityConfig('icon', e.detail.value)}
        .hass=${this.hass}
      ></ha-icon-picker>
    `;
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

  _updateTextConfig(key, value) {
    this._updateConfig(key, value);
  }

  _updateTimeConfig(key, value) {
    this._updateConfig(key, value);
  }

  _updateLayoutConfig(key, value) {
    this._updateConfig(key, value);
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

  _notifyBlockUpdated() {
    this.dispatchEvent(new CustomEvent('block-updated', {
      detail: { block: this._editingBlock }
    }));
  }
}

if (!customElements.get('block-properties')) {
  customElements.define('block-properties', BlockProperties);
}

export { BlockProperties };
