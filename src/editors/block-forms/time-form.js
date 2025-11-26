// src/editors/block-forms/time-form.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { BaseForm } from './base-form.js';

class TimeForm extends BaseForm {
  render() {
    if (!this._editingBlock) {
      return html`<div class="cf-text-sm cf-text-secondary">未选择时间块</div>`;
    }

    const config = this._editingBlock.config || {};

    return html`
      <div class="form-container">
        <div class="form-header">
          <div class="form-title">⏰ 时间块配置</div>
          <div class="form-actions">
            <button class="delete-btn" @click=${this._deleteBlock}>删除块</button>
          </div>
        </div>

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
                <label class="checkbox-option">
                  <ha-checkbox
                    .checked=${config.show_weekday || false}
                    @change=${e => this._updateConfig('show_weekday', e.target.checked)}
                  ></ha-checkbox>
                  <span>显示星期</span>
                </label>
              </div>
            </div>

            <div class="property-field">
              <label class="property-label">日期格式</label>
              <div class="radio-group">
                <label class="radio-option">
                  <ha-radio
                    name="date-format"
                    value="Y-M-D"
                    .checked=${!config.date_format || config.date_format === 'Y-M-D'}
                    @change=${e => this._updateConfig('date_format', e.target.value)}
                  ></ha-radio>
                  <span>年-月-日</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="date-format"
                    value="M/D/Y"
                    .checked=${config.date_format === 'M/D/Y'}
                    @change=${e => this._updateConfig('date_format', e.target.value)}
                  ></ha-radio>
                  <span>月/日/年</span>
                </label>
                <label class="radio-option">
                  <ha-radio
                    name="date-format"
                    value="D/M/Y"
                    .checked=${config.date_format === 'D/M/Y'}
                    @change=${e => this._updateConfig('date_format', e.target.value)}
                  ></ha-radio>
                  <span>日/月/年</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('time-form')) {
  customElements.define('time-form', TimeForm);
}

export { TimeForm };
