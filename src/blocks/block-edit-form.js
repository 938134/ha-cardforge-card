// blocks/block-edit-form.js - 自动填充优化版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { ENTITY_ICONS } from './block-config.js';

export class BlockEditForm extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    cardDefinition: { type: Object },
    presetDef: { type: Object },
    _availableEntities: { state: true },
    _currentBlock: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .edit-form {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-md);
        padding: 16px;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--cf-border);
      }
      
      .action-btn {
        padding: 8px 16px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
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
      
      /* 表单控件 */
      ha-combo-box, ha-textfield, ha-icon-picker, ha-select {
        width: 100%;
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.hass = null;
    this.cardDefinition = {};
    this.presetDef = null;
    this._availableEntities = [];
    this._currentBlock = { ...this.block };
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }
    if (changedProperties.has('block')) {
      this._currentBlock = { ...this.block };
    }
  }

  render() {
    const isRequired = this.presetDef?.required || false;
    
    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._currentBlock.entity || ''}
                @value-changed=${this._handleEntityChange}
                allow-custom-value
                label="选择实体"
                placeholder="输入或选择实体ID"
                ?required=${isRequired}
                fullwidth
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this._currentBlock.entity || ''}
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
            <ha-textfield
              .value=${this._currentBlock.name || ''}
              @input=${this._handleNameChange}
              label="显示名称"
              placeholder="如果不填，将使用实体友好名称"
              fullwidth
            ></ha-textfield>
          </div>
          
          <!-- 图标 -->
          <div class="form-field">
            <ha-icon-picker
              .value=${this._currentBlock.icon || ''}
              @value-changed=${this._handleIconChange}
              label="自定义图标"
              fullwidth
            ></ha-icon-picker>
          </div>
          
          <!-- 区域选择 -->
          <div class="form-field">
            ${this.cardDefinition?.blockType === 'preset' ? html`
              <div class="fixed-area-hint">
                <ha-icon icon="mdi:lock"></ha-icon>
                <span>固定为内容区域（预设卡片）</span>
              </div>
            ` : html`
              <ha-select
                .value=${this._currentBlock.area || 'content'}
                @closed=${e => e.stopPropagation()}
                @change=${e => this._handleAreaChange(e.target.value)}
                label="所属区域"
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

  _handleEntityChange(e) {
    const entityId = e.detail.value;
    
    // 更新当前块
    this._currentBlock = { ...this._currentBlock, entity: entityId };
    
    // 如果选择了有效实体，尝试自动填充
    if (entityId && this.hass?.states?.[entityId]) {
      const entity = this.hass.states[entityId];
      const updates = {};
      
      // 自动填充名称（如果名称为空或为默认值）
      const currentName = this._currentBlock.name || '';
      if (!currentName || currentName === '新块' || currentName === '实体块') {
        const friendlyName = entity.attributes?.friendly_name;
        if (friendlyName && friendlyName.trim()) {
          updates.name = friendlyName;
        }
      }
      
      // 自动填充图标（如果图标为空或为默认值）
      const currentIcon = this._currentBlock.icon || '';
      if (!currentIcon || currentIcon === 'mdi:cube-outline' || currentIcon === 'mdi:cube') {
        const domain = entityId.split('.')[0];
        const defaultIcon = entity.attributes?.icon || ENTITY_ICONS[domain] || 'mdi:cube';
        updates.icon = defaultIcon;
      }
      
      // 应用自动填充
      if (Object.keys(updates).length > 0) {
        this._currentBlock = { ...this._currentBlock, ...updates };
        this.requestUpdate();
      }
    }
    
    // 立即更新UI
    this.requestUpdate();
  }

  _handleEntityInput(e) {
    const entityId = e.target.value;
    this._currentBlock = { ...this._currentBlock, entity: entityId };
    this.requestUpdate();
  }

  _handleNameChange(e) {
    this._currentBlock = { ...this._currentBlock, name: e.target.value };
  }

  _handleIconChange(e) {
    this._currentBlock = { ...this._currentBlock, icon: e.detail.value };
  }

  _handleAreaChange(areaId) {
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset') {
      areaId = 'content';
    }
    
    this._currentBlock = { ...this._currentBlock, area: areaId };
  }

  _handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  _handleSave() {
    // 发送更新事件，包含当前块的所有修改
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: {
        field: 'all',
        value: '',
        updates: { ...this._currentBlock }
      }
    }));
    
    this.dispatchEvent(new CustomEvent('save'));
  }
}

if (!customElements.get('block-edit-form')) {
  customElements.define('block-edit-form', BlockEditForm);
}
