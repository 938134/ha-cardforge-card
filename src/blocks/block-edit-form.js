// blocks/block-edit-form.js - 修复属性传递问题
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
    _currentBlock: { state: true },
    _userModifiedName: { state: true },
    _userModifiedIcon: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .edit-form {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-md);
        padding: 16px;
        border: 1px solid var(--cf-primary-color);
      }
      
      .form-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-primary-color);
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--cf-border);
        display: flex;
        align-items: center;
        gap: 8px;
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
      
      .form-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-secondary);
      }
      
      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 20px;
        padding-top: 16px;
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
      
      .auto-fill-hint {
        font-size: 0.8em;
        color: var(--cf-text-tertiary);
        margin-top: 2px;
        font-style: italic;
      }
      
      .field-required::after {
        content: " *";
        color: #f44336;
      }
      
      /* 错误状态 */
      .error-message {
        font-size: 0.8em;
        color: #f44336;
        margin-top: 4px;
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
    this._currentBlock = {};
    this._userModifiedName = false;
    this._userModifiedIcon = false;
  }

  willUpdate(changedProperties) {
    // 当 block 属性变化时，更新内部状态
    if (changedProperties.has('block')) {
      this._currentBlock = { ...this.block };
      
      // 重置用户修改标记
      const hasName = this.block.name && this.block.name.trim() !== '';
      const defaultName = !hasName || 
                         this.block.name === '新块' || 
                         this.block.name === '实体块';
      
      const hasIcon = this.block.icon && this.block.icon.trim() !== '';
      const defaultIcon = !hasIcon || 
                         this.block.icon === 'mdi:cube-outline' || 
                         this.block.icon === 'mdi:cube';
      
      this._userModifiedName = hasName && !defaultName;
      this._userModifiedIcon = hasIcon && !defaultIcon;
    }
    
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }
  }

  updated(changedProperties) {
    // 确保表单正确初始化
    if (changedProperties.has('block') && this.block) {
      console.log('BlockEditForm: 块数据更新', this.block);
    }
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

  render() {
    const isRequired = this.presetDef?.required || false;
    const blockName = this._currentBlock.name || '未命名块';
    const hasEntity = this._currentBlock.entity && this.hass?.states?.[this._currentBlock.entity];
    
    console.log('BlockEditForm: 渲染表单', {
      block: this._currentBlock,
      hasEntity,
      userModifiedName: this._userModifiedName,
      userModifiedIcon: this._userModifiedIcon
    });
    
    return html`
      <div class="edit-form">
        <div class="form-title">
          <ha-icon icon="mdi:pencil"></ha-icon>
          编辑块: ${blockName}
        </div>
        
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            <div class="form-label ${isRequired ? 'field-required' : ''}">选择实体</div>
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._currentBlock.entity || ''}
                @value-changed=${this._handleEntityChange}
                allow-custom-value
                label="实体ID"
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
            <div class="form-label">显示名称</div>
            <ha-textfield
              .value=${this._currentBlock.name || ''}
              @input=${this._handleNameChange}
              label="显示名称"
              placeholder="如果不填，将使用实体友好名称"
              fullwidth
            ></ha-textfield>
            <div class="auto-fill-hint">
              ${this._userModifiedName ? '用户输入的名称将优先保存' : '将自动使用实体友好名称'}
            </div>
          </div>
          
          <!-- 图标 -->
          <div class="form-field">
            <div class="form-label">自定义图标</div>
            <ha-icon-picker
              .value=${this._currentBlock.icon || ''}
              @value-changed=${this._handleIconChange}
              label="图标"
              fullwidth
            ></ha-icon-picker>
            <div class="auto-fill-hint">
              ${this._userModifiedIcon ? '用户选择的图标将优先保存' : '将自动使用实体默认图标'}
            </div>
          </div>
          
          <!-- 区域选择 -->
          <div class="form-field">
            <div class="form-label">所属区域</div>
            ${this.cardDefinition?.blockType === 'preset' ? html`
              <div style="
                padding: 8px 12px;
                background: rgba(var(--cf-primary-color-rgb), 0.05);
                border-radius: var(--cf-radius-sm);
                color: var(--cf-text-secondary);
                font-size: 0.9em;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <ha-icon icon="mdi:lock"></ha-icon>
                <span>固定为内容区域（预设卡片）</span>
              </div>
            ` : html`
              <ha-select
                .value=${this._currentBlock.area || 'content'}
                @closed=${e => e.stopPropagation()}
                @change=${e => this._handleAreaChange(e.target.value)}
                label="选择区域"
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

  _handleEntityChange(e) {
    const entityId = e.detail.value;
    console.log('BlockEditForm: 实体选择变化', entityId);
    
    // 更新当前块
    this._currentBlock = { ...this._currentBlock, entity: entityId };
    
    // 如果选择了有效实体，且用户没有修改过名称/图标，则自动填充
    if (entityId && this.hass?.states?.[entityId]) {
      const entity = this.hass.states[entityId];
      const updates = {};
      
      // 自动填充名称（仅当用户没有修改过且名称为空）
      if (!this._userModifiedName && (!this._currentBlock.name || 
          this._currentBlock.name === '新块' || 
          this._currentBlock.name === '实体块')) {
        const friendlyName = entity.attributes?.friendly_name;
        if (friendlyName && friendlyName.trim()) {
          updates.name = friendlyName;
          console.log('BlockEditForm: 自动填充名称', friendlyName);
        }
      }
      
      // 自动填充图标（仅当用户没有修改过且图标为默认值）
      if (!this._userModifiedIcon && (!this._currentBlock.icon || 
          this._currentBlock.icon === 'mdi:cube-outline' || 
          this._currentBlock.icon === 'mdi:cube')) {
        const domain = entityId.split('.')[0];
        const defaultIcon = entity.attributes?.icon || ENTITY_ICONS[domain] || 'mdi:cube';
        updates.icon = defaultIcon;
        console.log('BlockEditForm: 自动填充图标', defaultIcon);
      }
      
      // 应用自动填充
      if (Object.keys(updates).length > 0) {
        this._currentBlock = { ...this._currentBlock, ...updates };
      }
    }
    
    this.requestUpdate();
  }

  _handleEntityInput(e) {
    const entityId = e.target.value;
    this._currentBlock = { ...this._currentBlock, entity: entityId };
    this.requestUpdate();
  }

  _handleNameChange(e) {
    const newName = e.target.value;
    console.log('BlockEditForm: 名称变化', newName);
    this._currentBlock = { ...this._currentBlock, name: newName };
    
    // 标记用户已修改名称（只要不是空的且不是默认值）
    if (newName.trim() !== '' && 
        newName !== '新块' && 
        newName !== '实体块') {
      this._userModifiedName = true;
    } else {
      this._userModifiedName = false;
    }
  }

  _handleIconChange(e) {
    const newIcon = e.detail.value;
    console.log('BlockEditForm: 图标变化', newIcon);
    this._currentBlock = { ...this._currentBlock, icon: newIcon };
    
    // 标记用户已修改图标
    if (newIcon && newIcon !== 'mdi:cube-outline' && newIcon !== 'mdi:cube') {
      this._userModifiedIcon = true;
    } else {
      this._userModifiedIcon = false;
    }
  }

  _handleAreaChange(areaId) {
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset') {
      areaId = 'content';
    }
    
    this._currentBlock = { ...this._currentBlock, area: areaId };
  }

  _handleCancel() {
    console.log('BlockEditForm: 取消编辑');
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  _handleSave() {
    console.log('BlockEditForm: 保存编辑', this._currentBlock);
    
    // 最终保存逻辑：始终以用户输入为准
    const finalBlock = { ...this._currentBlock };
    
    // 如果名称为空，使用友好名称
    if (!finalBlock.name || finalBlock.name.trim() === '') {
      if (finalBlock.entity && this.hass?.states?.[finalBlock.entity]) {
        const entity = this.hass.states[finalBlock.entity];
        finalBlock.name = entity.attributes?.friendly_name || finalBlock.entity;
      } else {
        finalBlock.name = '新块';
      }
    }
    
    // 如果图标为空，使用默认图标
    if (!finalBlock.icon || finalBlock.icon.trim() === '') {
      if (finalBlock.entity) {
        const domain = finalBlock.entity.split('.')[0];
        finalBlock.icon = ENTITY_ICONS[domain] || 'mdi:cube';
      } else {
        finalBlock.icon = 'mdi:cube-outline';
      }
    }
    
    // 确保区域正确
    if (!finalBlock.area) {
      finalBlock.area = 'content';
    }
    
    console.log('BlockEditForm: 最终保存数据', finalBlock);
    
    // 发送更新事件
    this.dispatchEvent(new CustomEvent('field-change', {
      bubbles: true,
      composed: true,
      detail: {
        field: 'all',
        value: '',
        updates: finalBlock
      }
    }));
    
    this.dispatchEvent(new CustomEvent('save', {
      bubbles: true,
      composed: true
    }));
  }
}

if (!customElements.get('block-edit-form')) {
  customElements.define('block-edit-form', BlockEditForm);
}