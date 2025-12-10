// blocks/block-edit-form.js - 修复表单显示问题
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
    _formReady: { state: true },
    _entityChangeTimer: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host {
        display: block;
        animation: fadeIn 0.2s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .edit-form {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-md);
        padding: 16px;
        border: 1px solid var(--cf-primary-color);
        box-shadow: var(--cf-shadow-md);
      }
      
      .form-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--cf-border);
      }
      
      .form-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-primary-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .form-subtitle {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .field-label.required::after {
        content: " *";
        color: #f44336;
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--cf-border);
      }
      
      .action-btn {
        padding: 10px 20px;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 500;
        min-width: 80px;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      
      .action-btn:hover {
        background: var(--cf-background);
        border-color: var(--cf-text-tertiary);
      }
      
      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }
      
      .action-btn.primary:hover {
        background: color-mix(in srgb, var(--cf-primary-color), black 10%);
        border-color: color-mix(in srgb, var(--cf-primary-color), black 10%);
      }
      
      /* 表单控件样式 */
      ha-combo-box, ha-textfield, ha-icon-picker, ha-select {
        width: 100%;
      }
      
      /* 预设块提示 */
      .preset-hint {
        padding: 10px 12px;
        background: rgba(var(--cf-primary-color-rgb), 0.08);
        border-radius: var(--cf-radius-sm);
        color: var(--cf-text-secondary);
        font-size: 0.85em;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }
      
      /* 加载状态 */
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: var(--cf-text-tertiary);
      }
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--cf-border);
        border-top-color: var(--cf-primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
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
    this._formReady = false;
    this._entityChangeTimer = null;
  }

  firstUpdated() {
    // 确保表单完全渲染后标记为就绪
    setTimeout(() => {
      this._formReady = true;
    }, 100);
  }

  willUpdate(changedProperties) {
    // 当 block 属性变化时，更新内部状态
    if (changedProperties.has('block')) {
      console.log('BlockEditForm: 收到块数据', this.block);
      this._currentBlock = { 
        entity: this.block.entity || '',
        name: this.block.name || '',
        icon: this.block.icon || 'mdi:cube-outline',
        area: this.block.area || 'content',
        ...this.block 
      };
      this._formReady = true;
    }
    
    // 当 hass 属性变化时，更新可用实体列表
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
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
    
    console.log('BlockEditForm: 可用实体数量', this._availableEntities.length);
  }

  render() {
    // 如果表单还没准备好，显示加载状态
    if (!this._formReady) {
      return html`
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <div>加载表单中...</div>
        </div>
      `;
    }
    
    const isRequired = this.presetDef?.required || false;
    const isPresetBlock = !!this.block.presetKey;
    const blockName = this._currentBlock.name || '未命名块';
    const blockIcon = this._currentBlock.icon || 'mdi:cube-outline';
    
    return html`
      <div class="edit-form">
        <!-- 表单头部 -->
        <div class="form-header">
          <div>
            <div class="form-title">
              <ha-icon .icon=${blockIcon}></ha-icon>
              编辑块: ${blockName}
            </div>
            ${isPresetBlock ? html`
              <div class="form-subtitle">
                预设块: ${this.presetDef?.defaultName || this.block.presetKey}
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- 表单内容 -->
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            <div class="field-label ${isRequired ? 'required' : ''}">
              <ha-icon icon="mdi:tag-outline" style="font-size: 0.9em;"></ha-icon>
              选择实体
            </div>
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._currentBlock.entity || ''}
                @value-changed=${this._handleEntityChange}
                allow-custom-value
                label="输入或选择实体ID"
                placeholder="例如: sensor.temperature"
                ?required=${isRequired}
                fullwidth
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this._currentBlock.entity || ''}
                @input=${this._handleEntityInput}
                label="实体ID"
                placeholder="例如: sensor.temperature"
                ?required=${isRequired}
                fullwidth
              ></ha-textfield>
            `}
          </div>
          
          <!-- 显示名称 -->
          <div class="form-field">
            <div class="field-label">
              <ha-icon icon="mdi:format-text" style="font-size: 0.9em;"></ha-icon>
              显示名称
            </div>
            <ha-textfield
              .value=${this._currentBlock.name || ''}
              @input=${this._handleNameChange}
              label="自定义显示名称"
              placeholder="留空将使用实体友好名称"
              fullwidth
            ></ha-textfield>
          </div>
          
          <!-- 图标 -->
          <div class="form-field">
            <div class="field-label">
              <ha-icon icon="mdi:palette" style="font-size: 0.9em;"></ha-icon>
              图标
            </div>
            <ha-icon-picker
              .value=${this._currentBlock.icon || ''}
              @value-changed=${this._handleIconChange}
              label="选择图标"
              fullwidth
            ></ha-icon-picker>
          </div>
          
          <!-- 区域选择 -->
          <div class="form-field">
            <div class="field-label">
              <ha-icon icon="mdi:view-grid" style="font-size: 0.9em;"></ha-icon>
              所属区域
            </div>
            ${this.cardDefinition?.blockType === 'preset' ? html`
              <div class="preset-hint">
                <ha-icon icon="mdi:lock"></ha-icon>
                <span>预设块固定为内容区域</span>
              </div>
            ` : html`
              <ha-select
                .value=${this._currentBlock.area || 'content'}
                @closed=${e => e.stopPropagation()}
                @change=${e => this._handleAreaChange(e.target.value)}
                label="选择显示区域"
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
        
        <!-- 表单操作 -->
        <div class="form-actions">
          <button class="action-btn" @click=${this._handleCancel}>
            <ha-icon icon="mdi:close"></ha-icon>
            取消
          </button>
          <button class="action-btn primary" @click=${this._handleSave}>
            <ha-icon icon="mdi:check"></ha-icon>
            保存
          </button>
        </div>
      </div>
    `;
  }

  _handleEntityChange(e) {
    const entityId = e.detail.value;
    console.log('BlockEditForm: 实体选择', entityId);
    
    // 清除之前的定时器
    if (this._entityChangeTimer) {
      clearTimeout(this._entityChangeTimer);
    }
    
    // 立即更新实体字段
    const updatedBlock = { 
      ...this._currentBlock, 
      entity: entityId 
    };
    
    // 如果有实体ID，自动填充名称和图标
    if (entityId && entityId.trim() && this.hass?.states?.[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 只有当当前名称为空或者是默认值时，才自动填充
      const currentName = this._currentBlock.name || '';
      const shouldAutoFillName = !currentName || 
                                currentName === '新块' || 
                                currentName === '实体块' ||
                                currentName === '';
      
      // 只有当当前图标是默认值时，才自动填充
      const currentIcon = this._currentBlock.icon || '';
      const shouldAutoFillIcon = !currentIcon || 
                                currentIcon === 'mdi:cube-outline' ||
                                currentIcon === 'mdi:cube';
      
      if (shouldAutoFillName) {
        // 使用实体友好名称
        updatedBlock.name = entity.attributes?.friendly_name || 
                          entityId.split('.')[1]?.replace(/_/g, ' ') || 
                          entityId;
      }
      
      if (shouldAutoFillIcon) {
        // 使用实体图标或根据域猜测图标
        const domain = entityId.split('.')[0];
        updatedBlock.icon = entity.attributes?.icon || 
                          ENTITY_ICONS[domain] || 
                          'mdi:cube';
      }
      
      console.log('BlockEditForm: 自动填充', {
        entityId,
        name: updatedBlock.name,
        icon: updatedBlock.icon,
        shouldAutoFillName,
        shouldAutoFillIcon
      });
    }
    
    // 更新本地状态
    this._currentBlock = updatedBlock;
    
    // 延迟触发配置更新，避免频繁更新
    this._entityChangeTimer = setTimeout(() => {
      this._fireFieldUpdate({ entity: entityId });
    }, 300);
    
    this.requestUpdate();
  }

  _handleEntityInput(e) {
    const entityId = e.target.value;
    const updatedBlock = { 
      ...this._currentBlock, 
      entity: entityId 
    };
    
    // 如果输入了有效的实体ID，尝试自动填充
    if (entityId && entityId.trim() && this.hass?.states?.[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 只有当当前名称为空或默认值时，才自动填充
      const currentName = this._currentBlock.name || '';
      if (!currentName || currentName === '新块' || currentName === '实体块') {
        updatedBlock.name = entity.attributes?.friendly_name || 
                          entityId.split('.')[1]?.replace(/_/g, ' ') || 
                          entityId;
      }
      
      // 只有当当前图标是默认值时，才自动填充
      const currentIcon = this._currentBlock.icon || '';
      if (!currentIcon || currentIcon === 'mdi:cube-outline' || currentIcon === 'mdi:cube') {
        const domain = entityId.split('.')[0];
        updatedBlock.icon = entity.attributes?.icon || 
                          ENTITY_ICONS[domain] || 
                          'mdi:cube';
      }
    }
    
    this._currentBlock = updatedBlock;
    this._fireFieldUpdate({ entity: entityId });
  }

  _handleNameChange(e) {
    const newName = e.target.value;
    console.log('BlockEditForm: 名称输入', newName);
    
    // 清除之前的定时器
    if (this._entityChangeTimer) {
      clearTimeout(this._entityChangeTimer);
    }
    
    const updatedBlock = { 
      ...this._currentBlock, 
      name: newName 
    };
    
    this._currentBlock = updatedBlock;
    
    // 延迟触发配置更新
    this._entityChangeTimer = setTimeout(() => {
      this._fireFieldUpdate({ name: newName });
    }, 300);
  }

  _handleIconChange(e) {
    const newIcon = e.detail.value;
    console.log('BlockEditForm: 图标选择', newIcon);
    
    // 清除之前的定时器
    if (this._entityChangeTimer) {
      clearTimeout(this._entityChangeTimer);
    }
    
    const updatedBlock = { 
      ...this._currentBlock, 
      icon: newIcon 
    };
    
    this._currentBlock = updatedBlock;
    
    // 延迟触发配置更新
    this._entityChangeTimer = setTimeout(() => {
      this._fireFieldUpdate({ icon: newIcon });
    }, 300);
  }

  _handleAreaChange(areaId) {
    console.log('BlockEditForm: 区域选择', areaId);
    
    // 清除之前的定时器
    if (this._entityChangeTimer) {
      clearTimeout(this._entityChangeTimer);
    }
    
    const updatedBlock = { 
      ...this._currentBlock, 
      area: areaId 
    };
    
    this._currentBlock = updatedBlock;
    
    // 延迟触发配置更新
    this._entityChangeTimer = setTimeout(() => {
      this._fireFieldUpdate({ area: areaId });
    }, 300);
  }

  _handleCancel() {
    console.log('BlockEditForm: 取消编辑');
    
    // 清除定时器
    if (this._entityChangeTimer) {
      clearTimeout(this._entityChangeTimer);
      this._entityChangeTimer = null;
    }
    
    this.dispatchEvent(new CustomEvent('cancel', {
      bubbles: true,
      composed: true
    }));
  }

  _handleSave() {
    console.log('BlockEditForm: 保存编辑', this._currentBlock);
    
    // 清除定时器
    if (this._entityChangeTimer) {
      clearTimeout(this._entityChangeTimer);
      this._entityChangeTimer = null;
    }
    
    // 准备保存的数据
    const savedBlock = { ...this._currentBlock };
    
    // 关键修复：优先使用用户输入的名称
    // 1. 如果用户输入了名称，使用它
    // 2. 如果用户清空了名称，但有实体，使用实体友好名称
    // 3. 否则使用默认名称
    
    const userEnteredName = savedBlock.name || '';
    const hasEntity = savedBlock.entity && this.hass?.states?.[savedBlock.entity];
    
    if (userEnteredName.trim() !== '') {
      // 使用用户输入的名称
      savedBlock.name = userEnteredName.trim();
    } else if (hasEntity) {
      // 用户清空了名称，但有实体，使用实体友好名称
      const entity = this.hass.states[savedBlock.entity];
      savedBlock.name = entity.attributes?.friendly_name || 
                       savedBlock.entity.split('.')[1]?.replace(/_/g, ' ') || 
                       savedBlock.entity;
    } else {
      // 既没有用户输入的名称，也没有实体，使用默认名称
      savedBlock.name = savedBlock.presetKey ? 
                       this.presetDef?.defaultName || '预设块' : 
                       '新块';
    }
    
    // 如果图标为空，提供默认值
    if (!savedBlock.icon || savedBlock.icon.trim() === '') {
      if (hasEntity) {
        const domain = savedBlock.entity.split('.')[0];
        savedBlock.icon = ENTITY_ICONS[domain] || 'mdi:cube-outline';
      } else {
        savedBlock.icon = 'mdi:cube-outline';
      }
    }
    
    // 确保区域有值
    if (!savedBlock.area) {
      savedBlock.area = this.cardDefinition?.blockType === 'preset' ? 'content' : 'content';
    }
    
    console.log('BlockEditForm: 最终保存的数据', savedBlock);
    
    // 发送保存事件
    this.dispatchEvent(new CustomEvent('field-change', {
      bubbles: true,
      composed: true,
      detail: {
        field: 'all',
        updates: savedBlock
      }
    }));
    
    this.dispatchEvent(new CustomEvent('save', {
      bubbles: true,
      composed: true
    }));
  }

  _fireFieldUpdate(updates) {
    this.dispatchEvent(new CustomEvent('field-change', {
      bubbles: true,
      composed: true,
      detail: {
        field: 'partial',
        updates
      }
    }));
  }
}

if (!customElements.get('block-edit-form')) {
  customElements.define('block-edit-form', BlockEditForm);
}