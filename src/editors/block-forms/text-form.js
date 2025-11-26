// src/editors/block-forms/text-form.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { BaseForm } from './base-form.js';

class TextForm extends BaseForm {
  render() {
    if (!this._editingBlock) {
      return html`<div class="cf-text-sm cf-text-secondary">未选择文本块</div>`;
    }

    const config = this._editingBlock.config || {};

    return html`
      <div class="form-container">
        <div class="form-header">
          <div class="form-title">📝 文本块配置</div>
          <div class="form-actions">
            <button class="delete-btn" @click=${this._deleteBlock}>删除块</button>
          </div>
        </div>

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

            <div class="property-field">
              <label class="property-label">字体大小</label>
              <div class="radio-group">
                <label class="radio-option">
                  <ha-radio
                    name="size"
                    value="0.8em"
                    .checked=${config.size === '0.8em'}
                    @change=${e => this._updateConfig('size', e.target.value)}
                  ></ha-radio>
                  <span>小</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="size"
                    value="1em"
                    .checked=${!config.size || config.size === '1em'}
                    @change=${e => this._updateConfig('size', e.target.value)}
                  ></ha-radio>
                  <span>中</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="size"
                    value="1.2em"
                    .checked=${config.size === '1.2em'}
                    @change=${e => this._updateConfig('size', e.target.value)}
                  ></ha-radio>
                  <span>大</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('text-form')) {
  customElements.define('text-form', TextForm);
}

export { TextForm };
