// 块编辑表单 - 支持预设卡片权限控制
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { AREAS, ENTITY_ICONS } from './block-config.js';

export class BlockEditForm extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    cardDefinition: { type: Object },
    presetDef: { type: Object },
    _availableEntities: { state: true }
  };

  static styles = [
    designSystem,
    css`
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
      }
      
      .form-hint {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
      }
      
      .fixed-area-hint {
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9em;
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
      }
      
      .area-option.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }
      
      .area-option.selected ha-icon {
        color: white;
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
      
      ha-combo-box, ha-textfield, ha-icon-picker {
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
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }
  }

  render() {
    const isRequired = this.presetDef?.required || false;
    const blockType = this.cardDefinition?.blockType || 'none';
    const isPresetCard = blockType === 'preset';
    
    return html`
      <div class="edit-form">
        <div class="form-grid">
          <!-- 实体选择 -->
          <div class="form-field">
            <div class="form-label">
              实体 ${isRequired ? '*' : ''}
            </div>
            ${this._availableEntities.length > 0 ? html`
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this.block.entity || ''}
                @value-changed=${this._handleEntityChange}
                allow-custom-value
                label="选择实体或输入ID"
                fullwidth
              ></ha-combo-box>
            ` : html`
              <ha-textfield
                .value=${this.block.entity || ''}
                @input=${this._handleEntityInput}
                label="实体ID"
                placeholder="例如: sensor.example"
                fullwidth
              ></ha-textfield>
            `}
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
            ></ha-textfield>
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
          </div>
          
          <!-- 区域选择 -->
          <div class="form-field">
            <div class="form-label">所属区域</div>
            ${isPresetCard ? html`
              <div class="fixed-area-hint">
                <ha-icon icon="mdi:lock"></ha-icon>
                <span>固定为内容区域（预设卡片）</span>
              </div>
            ` : html`
              <div class="area-options">
                ${Object.values(AREAS).map(area => {
                  const isSelected = this.block.area === area.id || (!this.block.area && area.id === 'content');
                  return html`
                    <div 
                      class="area-option ${isSelected ? 'selected' : ''}"
                      @click=${() => this._handleAreaChange(area.id)}
                    >
                      <ha-icon icon="${this._getAreaIcon(area.id)}"></ha-icon>
                      <span>${area.label}</span>
                    </div>
                  `;
                })}
              </div>
              <div class="form-hint">
                选择块显示的区域位置
              </div>
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

  _getAreaIcon(areaId) {
    const iconMap = {
      header: 'mdi:format-header-1',
      content: 'mdi:view-grid',
      footer: 'mdi:page-layout-footer'
    };
    return iconMap[areaId] || 'mdi:view-grid';
  }

  _handleEntityChange(e) {
    const entity = e.detail.value;
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'entity', value: entity }
    }));
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
    // 如果是预设卡片，忽略区域变化
    const blockType = this.cardDefinition?.blockType || 'none';
    if (blockType === 'preset') {
      areaId = 'content';
    }
    
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { field: 'area', value: areaId }
    }));
  }

  _handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  _handleSave() {
    this.dispatchEvent(new CustomEvent('save'));
  }
}

if (!customElements.get('block-edit-form')) {
  customElements.define('block-edit-form', BlockEditForm);
}
