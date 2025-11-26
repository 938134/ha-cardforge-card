// src/editors/block-forms/layout-form.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { BaseForm } from './base-form.js';

class LayoutForm extends BaseForm {
  render() {
    if (!this._editingBlock) {
      return html`<div class="cf-text-sm cf-text-secondary">未选择布局块</div>`;
    }

    const config = this._editingBlock.config || {};

    return html`
      <div class="form-container">
        <div class="form-header">
          <div class="form-title">📐 布局块配置</div>
          <div class="form-actions">
            <button class="delete-btn" @click=${this._deleteBlock}>删除块</button>
          </div>
        </div>

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
                  <span>垂直布局 - 从上到下排列</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="layout-type"
                    value="horizontal"
                    .checked=${config.layout === 'horizontal'}
                    @change=${e => this._updateConfig('layout', e.target.value)}
                  ></ha-radio>
                  <span>水平布局 - 从左到右排列</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="layout-type"
                    value="grid"
                    .checked=${config.layout === 'grid'}
                    @change=${e => this._updateConfig('layout', e.target.value)}
                  ></ha-radio>
                  <span>网格布局 - 2列网格排列</span>
                </label>
              </div>
            </div>

            <div class="property-field">
              <label class="property-label">间距设置</label>
              <div class="radio-group">
                <label class="radio-option">
                  <ha-radio
                    name="gap-size"
                    value="small"
                    .checked=${config.gap === 'small'}
                    @change=${e => this._updateConfig('gap', e.target.value)}
                  ></ha-radio>
                  <span>紧凑</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="gap-size"
                    value="medium"
                    .checked=${!config.gap || config.gap === 'medium'}
                    @change=${e => this._updateConfig('gap', e.target.value)}
                  ></ha-radio>
                  <span>正常</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="gap-size"
                    value="large"
                    .checked=${config.gap === 'large'}
                    @change=${e => this._updateConfig('gap', e.target.value)}
                  ></ha-radio>
                  <span>宽松</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="property-group">
          <div class="property-group-title">📦 内容管理</div>
          <div class="property-form">
            <div class="property-field">
              <div class="cf-text-sm cf-text-secondary">
                布局块可以包含其他块。在内容编辑器中为此布局块添加子块。
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('layout-form')) {
  customElements.define('layout-form', LayoutForm);
}

export { LayoutForm };
