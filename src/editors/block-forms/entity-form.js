// src/editors/block-forms/entity-form.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { BaseForm } from './base-form.js';

class EntityForm extends BaseForm {
  render() {
    if (!this._editingBlock) {
      return html`<div class="cf-text-sm cf-text-secondary">未选择实体块</div>`;
    }

    const config = this._editingBlock.config || {};
    const entity = config.entity ? this.hass?.states?.[config.entity] : null;
    const friendlyName = entity?.attributes?.friendly_name || config.entity;

    return html`
      <div class="form-container">
        <div class="form-header">
          <div class="form-title">📊 实体块配置</div>
          <div class="form-actions">
            <button class="delete-btn" @click=${this._deleteBlock}>删除块</button>
          </div>
        </div>

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
      
      // 自动推荐图标
      if (!this._editingBlock.config.icon) {
        const suggestedIcon = this._suggestIcon(value);
        if (suggestedIcon) {
          this._updateConfig('icon', suggestedIcon);
        }
      }
    }
  }

  _suggestIcon(entityId) {
    if (entityId.includes('light.')) return 'mdi:lightbulb';
    if (entityId.includes('sensor.temperature')) return 'mdi:thermometer';
    if (entityId.includes('sensor.humidity')) return 'mdi:water-percent';
    if (entityId.includes('sensor.pressure')) return 'mdi:gauge';
    if (entityId.includes('switch.')) return 'mdi:power-plug';
    if (entityId.includes('binary_sensor.')) return 'mdi:motion-sensor';
    return 'mdi:circle';
  }
}

if (!customElements.get('entity-form')) {
  customElements.define('entity-form', EntityForm);
}

export { EntityForm };
