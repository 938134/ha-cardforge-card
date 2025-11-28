// src/editors/block-properties.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockProperties extends LitElement {
  static properties = {
    blockConfig: { type: Object },
    hass: { type: Object },
    availableEntities: { type: Array },
    _entityInfo: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-properties {
        width: 100%;
      }

      .entity-info {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-lg);
        line-height: 1.3;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-sm);
      }

      /* 紧凑网格布局 */
      .form-grid {
        display: grid;
        grid-template-columns: 25% 75%;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .form-row {
        display: contents;
      }

      .form-label {
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      /* 操作按钮 */
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

      /* 移动端适配 */
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .form-label {
          margin-top: var(--cf-spacing-md);
        }
      }
    `
  ];

  constructor() {
    super();
    this._entityInfo = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('blockConfig')) {
      this._updateEntityInfo();
    }
  }

  render() {
    if (!this.blockConfig) {
      return html`<div class="cf-text-secondary">请选择一个块进行编辑</div>`;
    }

    return html`
      <div class="block-properties">
        ${this._renderEntityInfo()}
        ${this._renderForm()}
        ${this._renderActions()}
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

  _renderForm() {
    return html`
      <div class="form-grid">
        <!-- 区域选择 -->
        <div class="form-label">区域</div>
        <div class="form-field">
          <ha-select
            .value=${this.blockConfig.area || 'content'}
            @closed=${this._preventClose}
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
          >
            <ha-list-item value="header" @click=${() => this._updateField('area', 'header')}>
              标题
            </ha-list-item>
            <ha-list-item value="content" @click=${() => this._updateField('area', 'content')}>
              内容
            </ha-list-item>
            <ha-list-item value="footer" @click=${() => this._updateField('area', 'footer')}>
              页脚
            </ha-list-item>
          </ha-select>
        </div>

        <!-- 实体选择 -->
        <div class="form-label">实体</div>
        <div class="form-field">
          ${this.availableEntities ? html`
            <ha-combo-box
              .items=${this.availableEntities}
              .value=${this.blockConfig.entity || ''}
              @value-changed=${e => this._updateField('entity', e.detail.value)}
              allow-custom-value
              label="选择实体"
              fullwidth
            ></ha-combo-box>
          ` : html`
            <ha-textfield
              .value=${this.blockConfig.entity || ''}
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
            .value=${this.blockConfig.icon || ''}
            @value-changed=${e => this._updateField('icon', e.detail.value)}
            label="选择图标"
            fullwidth
          ></ha-icon-picker>
        </div>

        <!-- 名称输入 -->
        <div class="form-label">名称</div>
        <div class="form-field">
          <ha-textfield
            .value=${this.blockConfig.title || ''}
            @input=${e => this._updateField('title', e.target.value)}
            placeholder="输入显示名称"
            fullwidth
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  _renderActions() {
    return html`
      <div class="form-actions">
        <button class="action-btn" @click=${this._onCancel}>
          取消
        </button>
        <button class="action-btn primary" @click=${this._onSave}>
          保存
        </button>
      </div>
    `;
  }

  _updateField(key, value) {
    if (!this.blockConfig) return;

    // 直接修改配置对象
    this.blockConfig[key] = value;

    // 自动填充实体相关信息
    if (key === 'entity' && value && this.hass) {
      const entity = this.hass.states[value];
      if (entity) {
        // 自动填充名称
        if (!this.blockConfig.title && entity.attributes?.friendly_name) {
          this.blockConfig.title = entity.attributes.friendly_name;
        }
        
        // 自动填充图标
        if (!this.blockConfig.icon) {
          this.blockConfig.icon = this._getEntityIcon(value, this.hass);
        }
      }
    }

    this._updateEntityInfo();
    this.requestUpdate();
  }

  _updateEntityInfo() {
    if (!this.blockConfig?.entity || !this.hass) {
      this._entityInfo = null;
      return;
    }
    
    const entity = this.hass.states[this.blockConfig.entity];
    if (!entity) {
      this._entityInfo = { state: '实体未找到' };
      return;
    }
    
    this._entityInfo = {
      state: entity.state,
      unit: entity.attributes?.unit_of_measurement || '',
      friendlyName: entity.attributes?.friendly_name || this.blockConfig.entity
    };
  }

  _getEntityIcon(entityId, hass) {
    if (!entityId || !hass) return 'mdi:help-circle';
    
    const entity = hass.states[entityId];
    if (entity?.attributes?.icon) {
      return entity.attributes.icon;
    }
    
    const entityType = entityId.split('.')[0];
    const iconMap = {
      'sensor': 'mdi:gauge',
      'binary_sensor': 'mdi:checkbox-marked-circle-outline',
      'switch': 'mdi:power',
      'light': 'mdi:lightbulb',
      'climate': 'mdi:thermostat',
      'cover': 'mdi:blinds',
      'media_player': 'mdi:speaker',
      'weather': 'mdi:weather-cloudy'
    };
    
    return iconMap[entityType] || 'mdi:cube';
  }

  _onSave() {
    // 关键：保存时确保数据已经更新
    this.dispatchEvent(new CustomEvent('save'));
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  _preventClose(e) {
    e.stopPropagation();
  }
}

if (!customElements.get('block-properties')) {
  customElements.define('block-properties', BlockProperties);
}

export { BlockProperties };