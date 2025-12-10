// blocks/block-edit-form.js - 修复数据清空和名称保存问题
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
      
      .field-required::after {
        content: " *";
        color: #f44336;
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
  }

  willUpdate(changedProperties) {
    // 当 block 属性变化时，更新内部状态
    if (changedProperties.has('block')) {
      console.log('BlockEditForm: block 属性变化', this.block);
      this._currentBlock = { ...this.block };
    }
    
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
  }

  render() {
    const isRequired = this.presetDef?.required || false;
    const blockName = this._currentBlock.name || '未命名块';
    
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
    
    // 只更新实体ID，不自动填充名称
    this._currentBlock = { 
      ...this._currentBlock, 
      entity: entityId 
    };
    
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
  }

  _handleIconChange(e) {
    const newIcon = e.detail.value;
    console.log('BlockEditForm: 图标变化', newIcon);
    this._currentBlock = { ...this._currentBlock, icon: newIcon };
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
    
    // 最终保存逻辑：使用用户输入的值
    const finalBlock = { ...this._currentBlock };
    
    // 确保有必要的字段
    if (!finalBlock.name || finalBlock.name.trim() === '') {
      finalBlock.name = '新块';
    }
    
    if (!finalBlock.icon || finalBlock.icon.trim() === '') {
      finalBlock.icon = 'mdi:cube-outline';
    }
    
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
        updates: finalBlock
      }
    }));
    
    this.dispatchEvent(new CustomEvent('save', {
      bubbles: true,
      composed: true
    }));
  }
}