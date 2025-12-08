import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { designSystem } from '../core/design-system.js';
import { getEntityIcon, getEntityFriendlyName } from '../core/card-tools.js';

/**
 * 块编辑表单组件
 */
export class BlockEditForm extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    cardDefinition: { type: Object },
    _availableEntities: { state: true },
    _formData: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .edit-form {
        background: var(--cf-surface);
        padding: var(--cf-spacing-lg);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--cf-spacing-md);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }

      /* 固定区域提示 */
      .fixed-area-hint {
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-tertiary);
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
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        min-width: 70px;
        transition: all var(--cf-transition-fast);
      }

      .action-btn:hover {
        background: var(--cf-background);
      }

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-btn.primary:hover {
        opacity: 0.9;
      }

      /* 字段标签 */
      .field-label {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-secondary);
      }

      .required-marker {
        color: var(--cf-error-color);
      }

      /* 表单控件样式 */
      ha-combo-box, ha-textfield, ha-icon-picker, ha-select {
        width: 100%;
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .fixed-area-hint {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.hass = null;
    this.cardDefinition = {};
    this._availableEntities = [];
    this._formData = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }

    if (changedProperties.has('block')) {
      this._formData = { ...this.block };
    }
  }

  /**
   * 更新可用实体列表
   */
  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId,
        description: entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  render() {
    const isRequired = this.block.presetKey ? true : false;
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';

    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            <div class="field-label">
              选择实体
              ${isRequired ? html`<span class="required-marker">*</span>` : ''}
            </div>
            
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._formData.entity || ''}
                @value-changed=${this._handleEntityChange}
                allow-custom-value
                label="输入或选择实体ID"
                ?required=${isRequired}
                fullwidth
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this._formData.entity || ''}
                @input=${this._handleEntityInput}
                label="实体ID"
                placeholder="例如: sensor.example"
                ?required=${isRequired}
                fullwidth
              ></ha-textfield>
            `}
          </div>

          <!-- 显示名称 -->
          <div class="form-field">
            <div class="field-label">显示名称</div>
            <ha-textfield
              .value=${this._formData.name || ''}
              @input=${this._handleNameChange}
              label="如果不填，将使用实体友好名称"
              fullwidth
            ></ha-textfield>
          </div>

          <!-- 图标 -->
          <div class="form-field">
            <div class="field-label">自定义图标</div>
            <ha-icon-picker
              .value=${this._formData.icon || ''}
              @value-changed=${this._handleIconChange}
              label="选择图标"
              fullwidth
            ></ha-icon-picker>
          </div>

          <!-- 区域选择 -->
          <div class="form-field">
            ${isPresetCard ? html`
              <div class="fixed-area-hint">
                <ha-icon icon="mdi:lock"></ha-icon>
                <span>固定为内容区域（预设卡片）</span>
              </div>
            ` : html`
              <div class="field-label">所属区域</div>
              <ha-select
                .value=${this._formData.area || 'content'}
                @closed=${e => e.stopPropagation()}
                @change=${e => this._handleAreaChange(e.target.value)}
                fullwidth
              >
                <ha-list-item value="header">
                  <ha-icon icon="mdi:format-header-1" slot="item-icon"></ha-icon>
                  标题区域
                </ha-list-item>
                <ha-list-item value="content">
                  <ha-icon icon="mdi:view-grid" slot="item-icon"></ha-icon>
                  内容区域
                </ha-list-item>
                <ha-list-item value="footer">
                  <ha-icon icon="mdi:page-layout-footer" slot="item-icon"></ha-icon>
                  页脚区域
                </ha-list-item>
              </ha-select>
            `}
          </div>
        </div>

        <div class="form-actions">
          <button class="action-btn" @click=${this._handleCancel}>取消</button>
          <button class="action-btn primary" @click=${this._handleSave}>保存</button>
        </div>
      </div>
    `;
  }

  /**
   * 处理实体变化
   */
  _handleEntityChange(e) {
    const entityId = e.detail.value;
    this._formData.entity = entityId;

    // 自动填充逻辑
    const updates = {};
    
    if (entityId && this.hass?.states?.[entityId]) {
      // 自动填充名称
      if (!this._formData.name || this._formData.name === '新块') {
        const friendlyName = getEntityFriendlyName(this.hass, entityId, entityId);
        if (friendlyName !== entityId) {
          updates.name = friendlyName;
        }
      }

      // 自动填充图标
      if (!this._formData.icon || this._formData.icon === 'mdi:cube-outline') {
        const defaultIcon = getEntityIcon(this.hass, entityId, 'mdi:cube');
        updates.icon = defaultIcon;
      }
    }

    this.dispatchEvent(new CustomEvent('field-change', {
      detail: {
        field: 'entity',
        value: entityId,
        updates
      }
    }));
  }

  /**
   * 处理实体输入
   */
  _handleEntityInput(e) {
    const entityId = e.target.value;
    this._formData.entity = entityId;
    
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'entity', value: entityId }
    }));
  }

  /**
   * 处理名称变化
   */
  _handleNameChange(e) {
    const name = e.target.value;
    this._formData.name = name;
    
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'name', value: name }
    }));
  }

  /**
   * 处理图标变化
   */
  _handleIconChange(e) {
    const icon = e.detail.value;
    this._formData.icon = icon;
    
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'icon', value: icon }
    }));
  }

  /**
   * 处理区域变化
   */
  _handleAreaChange(areaId) {
    // 如果是预设卡片，忽略区域变化
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset') {
      areaId = 'content';
    }

    this._formData.area = areaId;
    
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'area', value: areaId }
    }));
  }

  /**
   * 处理取消
   */
  _handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  /**
   * 处理保存
   */
  _handleSave() {
    // 验证必填字段
    if (this.block.presetKey && !this._formData.entity) {
      alert('实体为必填项');
      return;
    }

    this.dispatchEvent(new CustomEvent('save'));
  }
}

// 注册自定义元素
if (!customElements.get('block-edit-form')) {
  customElements.define('block-edit-form', BlockEditForm);
}
