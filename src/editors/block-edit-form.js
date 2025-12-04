// src/editors/block-edit-form.js - 完整代码
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

export class BlockEditForm extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    areas: { type: Array },
    presetDef: { type: Object },
    _availableEntities: { state: true },
    _entityInfo: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host {
        display: block;
      }
      
      .edit-form {
        background: var(--cf-surface);
        border: 1px solid var(--cf-primary-color);
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
        gap: 8px;
      }
      
      .form-label {
        font-weight: 500;
        font-size: 0.85em;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .required-mark {
        color: #f44336;
        margin-left: 2px;
      }
      
      .form-hint {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
      }
      
      .entity-status {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
        padding: 4px 8px;
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-radius: var(--cf-radius-sm);
      }
      
      /* 区域选择器样式 */
      .area-selector {
        margin-top: 4px;
      }
      
      .area-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      
      .area-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        flex: 1;
        min-width: 100px;
      }
      
      .area-option:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .area-option.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }
      
      .area-option.selected ha-icon {
        color: white;
      }
      
      .area-option ha-icon {
        font-size: 1.2em;
      }
      
      .area-info {
        flex: 1;
      }
      
      .area-name {
        font-size: 0.85em;
        font-weight: 500;
      }
      
      .area-description {
        font-size: 0.75em;
        opacity: 0.8;
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
        background: var(--cf-primary-color);
        opacity: 0.9;
      }
      
      ha-combo-box, ha-select, ha-textfield, ha-icon-picker {
        width: 100%;
      }
      
      @media (max-width: 480px) {
        .edit-form {
          padding: 12px;
        }
        
        .form-grid {
          gap: 12px;
        }
        
        .area-options {
          flex-direction: column;
        }
        
        .area-option {
          min-width: 100%;
        }
        
        .form-actions {
          flex-direction: column;
        }
        
        .action-btn {
          width: 100%;
        }
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.hass = null;
    this.areas = [];
    this.presetDef = null;
    this._availableEntities = [];
    this._entityInfo = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('block')) {
      this._updateAvailableEntities();
      this._updateEntityInfo();
    }
  }

  render() {
    const isPreset = this.presetDef !== null;
    const isRequired = this.presetDef?.required || false;
    const fixedName = this.presetDef?.fixedName || false;
    
    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            <div class="form-label">
              实体
              ${isRequired ? html`<span class="required-mark">*</span>` : ''}
            </div>
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this.block.entity || ''}
                @value-changed=${this._handleEntityChange}
                allow-custom-value
                label="选择实体或输入ID"
                fullwidth
                ?disabled=${this.presetDef?.entityType === 'fixed'}
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this.block.entity || ''}
                @input=${this._handleEntityInput}
                label="实体ID"
                placeholder="例如: sensor.example"
                fullwidth
                ?disabled=${this.presetDef?.entityType === 'fixed'}
                ?required=${isRequired}
              ></ha-textfield>
            `}
            
            ${this._entityInfo ? html`
              <div class="entity-status">
                当前状态: ${this._entityInfo.state} ${this._entityInfo.unit ? this._entityInfo.unit : ''}
              </div>
            ` : ''}
            
            ${this.presetDef?.description ? html`
              <div class="form-hint">${this.presetDef.description}</div>
            ` : ''}
          </div>
          
          <!-- 显示名称 -->
          <div class="form-field">
            <div class="form-label">显示名称</div>
            <ha-textfield
              .value=${this.block.name || ''}
              @input=${this._handleNameChange}
              label="块显示名称"
              placeholder="如果不填，将使用实体友好名称"
              fullwidth
              ?disabled=${fixedName}
            ></ha-textfield>
            ${!fixedName ? html`
              <div class="form-hint">
                如果留空，将使用实体友好名称
              </div>
            ` : ''}
          </div>
          
          <!-- 图标 -->
          <div class="form-field">
            <div class="form-label">图标</div>
            <ha-icon-picker
              .value=${this.block.icon || ''}
              @value-changed=${this._handleIconChange}
              label="自定义图标"
              fullwidth
            ></ha-icon-picker>
            <div class="form-hint">
              如果留空，将使用实体图标或默认图标
            </div>
          </div>
          
          <!-- 区域选择 -->
          ${this.areas.length > 0 ? html`
            <div class="form-field">
              <div class="form-label">所属区域</div>
              <div class="area-options">
                ${this.areas.map(area => {
                  const isSelected = this.block.area === area.id || (!this.block.area && area.id === 'content');
                  return html`
                    <div 
                      class="area-option ${isSelected ? 'selected' : ''}"
                      @click=${() => this._handleAreaChange(area.id)}
                    >
                      <ha-icon icon="${this._getAreaIcon(area.id)}"></ha-icon>
                      <div class="area-info">
                        <div class="area-name">${area.label || area.id}</div>
                        ${area.maxBlocks ? html`
                          <div class="area-description">最多 ${area.maxBlocks} 个块</div>
                        ` : ''}
                      </div>
                    </div>
                  `;
                })}
              </div>
              <div class="form-hint">
                选择块显示的区域位置
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="form-actions">
          <slot name="actions">
            <button class="action-btn" @click=${this._handleCancel}>取消</button>
            <button class="action-btn primary" @click=${this._handleSave}>保存</button>
          </slot>
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

  _updateEntityInfo() {
    if (!this.block?.entity || !this.hass?.states?.[this.block.entity]) {
      this._entityInfo = null;
      return;
    }
    
    const entity = this.hass.states[this.block.entity];
    this._entityInfo = {
      state: entity.state,
      unit: entity.attributes?.unit_of_measurement || '',
      friendly_name: entity.attributes?.friendly_name || this.block.entity
    };
  }

  _getAreaIcon(areaId) {
    const iconMap = {
      header: 'mdi:format-header-1',
      content: 'mdi:view-grid',
      footer: 'mdi:page-layout-footer',
      sidebar: 'mdi:page-layout-sidebar-left'
    };
    return iconMap[areaId] || 'mdi:view-grid';
  }

  _handleEntityChange(e) {
    const entity = e.detail.value;
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'entity', value: entity }
    }));
    
    // 如果实体改变，自动填充名称和图标（如果未设置）
    if (entity && this.hass?.states?.[entity]) {
      const entityState = this.hass.states[entity];
      if (!this.block.name && !this.presetDef?.fixedName) {
        this.dispatchEvent(new CustomEvent('field-change', {
          detail: { field: 'name', value: entityState.attributes?.friendly_name || entity }
        }));
      }
      if (!this.block.icon) {
        const domain = entity.split('.')[0];
        const iconMap = {
          light: 'mdi:lightbulb',
          switch: 'mdi:power',
          sensor: 'mdi:gauge',
          binary_sensor: 'mdi:toggle-switch',
          climate: 'mdi:thermostat',
          cover: 'mdi:blinds',
          media_player: 'mdi:speaker',
          vacuum: 'mdi:robot-vacuum',
          text_sensor: 'mdi:text-box',
          person: 'mdi:account'
        };
        const suggestedIcon = entityState.attributes?.icon || iconMap[domain] || 'mdi:cube';
        this.dispatchEvent(new CustomEvent('field-change', {
          detail: { field: 'icon', value: suggestedIcon }
        }));
      }
    }
  }

  _handleEntityInput(e) {
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'entity', value: e.target.value }
    }));
  }

  _handleNameChange(e) {
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'name', value: e.target.value }
    }));
  }

  _handleIconChange(e) {
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'icon', value: e.detail.value }
    }));
  }

  _handleAreaChange(areaId) {
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'area', value: areaId }
    }));
  }

  _handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  _handleSave() {
    // 验证必填字段
    if (this.presetDef?.required && !this.block.entity) {
      this.dispatchEvent(new CustomEvent('validation-error', {
        detail: { message: '实体是必填字段' }
      }));
      return;
    }
    
    this.dispatchEvent(new CustomEvent('save'));
  }

  // 获取表单数据
  getFormData() {
    return {
      entity: this.block.entity || '',
      name: this.block.name || '',
      icon: this.block.icon || '',
      area: this.block.area || 'content'
    };
  }

  // 验证表单
  validate() {
    const errors = [];
    
    if (this.presetDef?.required && !this.block.entity) {
      errors.push('实体是必填字段');
    }
    
    if (this.block.entity && !this.hass?.states?.[this.block.entity]) {
      errors.push('实体不存在或不可用');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

if (!customElements.get('block-edit-form')) {
  customElements.define('block-edit-form', BlockEditForm);
}
