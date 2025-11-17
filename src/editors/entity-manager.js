// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';
import { getJinjaParser } from '../core/jinja-parser.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    _dynamicEntities: { state: true },
    _showAddDialog: { state: true },
    _editingEntity: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }

      .entity-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .entity-row {
        display: flex;
        align-items: center;
        background: var(--card-background-color);
        border-radius: 4px;
        padding: 12px 16px;
        border: 1px solid var(--divider-color);
        transition: all 0.2s ease;
      }

      .entity-row:hover {
        border-color: var(--primary-color);
      }

      .entity-info {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        margin-bottom: 4px;
      }

      .entity-source {
        font-size: 12px;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: var(--code-font-family, monospace);
        display: inline-block;
      }

      .entity-actions {
        display: flex;
        gap: 4px;
        margin-left: 12px;
      }

      .entity-action {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .entity-action:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      .add-entity-row {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color);
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--secondary-text-color);
      }

      .add-entity-row:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .add-entity-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text-color);
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.3;
      }

      .empty-text {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .empty-hint {
        font-size: 12px;
        opacity: 0.7;
      }

      /* 对话框样式 */
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .dialog {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 0;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid var(--divider-color);
      }

      .dialog-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 18px;
      }

      .dialog-content {
        padding: 24px;
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

      .form-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 16px 24px;
        border-top: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
      }

      .cancel-button {
        background: transparent;
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .cancel-button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .save-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s ease;
      }

      .save-button:hover:not(:disabled) {
        background: var(--accent-color);
      }

      .save-button:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .required-badge {
        background: var(--error-color);
        color: white;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: 8px;
        font-weight: 500;
      }
    `
  ];

  constructor() {
    super();
    this._dynamicEntities = [];
    this._showAddDialog = false;
    this._editingEntity = null;
    this._dialogData = {
      name: '',
      source: ''
    };
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) {
      this._updateDynamicEntities();
    }
  }

  _updateDynamicEntities() {
    if (!this.entities) {
      this._dynamicEntities = [];
      return;
    }

    // 提取动态实体（非静态需求的实体）
    const staticKeys = (this.requirements || []).map(req => req.key);
    this._dynamicEntities = Object.entries(this.entities)
      .filter(([key]) => !staticKeys.includes(key) && !key.includes('_name'))
      .map(([key, source]) => ({
        key,
        source,
        name: this.entities[`${key}_name`] || this._getDefaultName(key, source)
      }));
  }

  _getDefaultName(key, source) {
    if (source.includes('.') && this.hass?.states?.[source]) {
      return this.hass.states[source].attributes?.friendly_name || source;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  render() {
    return html`
      <div class="entity-manager">
        <div class="section-title">数据源配置</div>
        
        ${this._renderStaticEntities()}
        ${this._renderDynamicEntities()}
        ${this._renderDialog()}
      </div>
    `;
  }

  _renderStaticEntities() {
    const requirements = this.requirements || [];
    
    if (requirements.length === 0) {
      return '';
    }

    return html`
      <div class="entity-list">
        ${requirements.map(req => this._renderEntityRow(req.key, {
          name: req.description,
          source: this.entities?.[req.key] || '',
          required: true
        }))}
      </div>
    `;
  }

  _renderDynamicEntities() {
    return html`
      <div>
        <div class="section-title">自定义实体</div>
        
        ${this._dynamicEntities.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-icon">🏷️</div>
            <div class="empty-text">暂无自定义实体</div>
            <div class="empty-hint">点击"添加实体"按钮来添加自定义实体或Jinja模板</div>
          </div>
        ` : html`
          <div class="entity-list">
            ${this._dynamicEntities.map(entity => 
              this._renderEntityRow(entity.key, {
                name: entity.name,
                source: entity.source,
                required: false
              })
            )}
          </div>
        `}
        
        <div class="add-entity-row" @click=${this._showAddEntityDialog}>
          <div class="add-entity-content">
            <ha-icon icon="mdi:plus"></ha-icon>
            添加实体
          </div>
        </div>
      </div>
    `;
  }

  _renderEntityRow(key, entity) {
    const parser = getJinjaParser(this.hass);
    const preview = entity.source ? parser.parse(entity.source, '') : '';

    return html`
      <div class="entity-row">
        <div class="entity-info">
          <div class="entity-name">
            ${entity.name}
            ${entity.required ? html`<span class="required-badge">必填</span>` : ''}
          </div>
          <div class="entity-source">${entity.source || '未配置'}</div>
          ${preview ? html`
            <div style="font-size: 11px; color: var(--success-color); margin-top: 4px;">
              预览: ${preview}
            </div>
          ` : ''}
        </div>
        
        ${!entity.required ? html`
          <div class="entity-actions">
            <button class="entity-action" @click=${() => this._editEntity(key)} title="编辑">
              <ha-icon icon="mdi:pencil"></ha-icon>
            </button>
            <button class="entity-action" @click=${() => this._removeEntity(key)} title="删除">
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderDialog() {
    if (!this._showAddDialog && !this._editingEntity) return '';

    const isEditing = !!this._editingEntity;
    const title = isEditing ? '编辑实体' : '添加实体';

    return html`
      <div class="dialog-overlay" @click=${this._closeDialog}>
        <div class="dialog" @click=${e => e.stopPropagation()}>
          <div class="dialog-header">
            <div class="dialog-title">${title}</div>
            <button class="close-button" @click=${this._closeDialog} style="background: none; border: none; color: var(--secondary-text-color); cursor: pointer; padding: 8px; border-radius: 4px;">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="dialog-content">
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">实体名称</label>
                <input
                  class="text-input"
                  .value=${this._dialogData.name}
                  @input=${e => this._updateDialogData('name', e.target.value)}
                  placeholder="例如：备份管理器状态"
                  style="padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 14px;"
                >
              </div>
              
              <div class="form-field">
                <label class="form-label">数据源</label>
                <input
                  class="text-input"
                  .value=${this._dialogData.source}
                  @input=${e => this._updateDialogData('source', e.target.value)}
                  placeholder="实体ID 或 Jinja模板，例如：sensor.backup_status 或 {{ states('sensor.backup') }}"
                  style="padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 14px; font-family: var(--code-font-family, monospace);"
                >
                <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
                  可以输入实体ID（如 sensor.backup_status）或 Jinja2模板表达式
                </div>
              </div>
            </div>
          </div>
          
          <div class="dialog-actions">
            <button class="cancel-button" @click=${this._closeDialog}>取消</button>
            <button 
              class="save-button" 
              @click=${this._saveEntity}
              ?disabled=${!this._validateDialog()}
            >
              ${isEditing ? '更新' : '添加'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _updateDialogData(field, value) {
    this._dialogData = {
      ...this._dialogData,
      [field]: value
    };
  }

  _validateDialog() {
    return this._dialogData?.name && this._dialogData?.source;
  }

  _showAddEntityDialog() {
    this._dialogData = { 
      name: '', 
      source: ''
    };
    this._showAddDialog = true;
  }

  _editEntity(key) {
    const entity = this._dynamicEntities.find(e => e.key === key);
    if (entity) {
      this._editingEntity = key;
      this._dialogData = { 
        name: entity.name, 
        source: entity.source
      };
    }
  }

  _removeEntity(key) {
    const newEntities = { ...this.entities };
    delete newEntities[key];
    delete newEntities[`${key}_name`];
    this._notifyEntitiesChange(newEntities);
  }

  _saveEntity() {
    const isEditing = !!this._editingEntity;
    
    if (!this._dialogData.name || !this._dialogData.source) return;

    const key = isEditing ? this._editingEntity : this._generateEntityKey(this._dialogData.name);
    const newEntities = { ...this.entities };
    
    newEntities[key] = this._dialogData.source;
    newEntities[`${key}_name`] = this._dialogData.name;
    
    this._notifyEntitiesChange(newEntities);
    this._closeDialog();
  }

  _generateEntityKey(name) {
    return `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }

  _closeDialog() {
    this._showAddDialog = false;
    this._editingEntity = null;
    this._dialogData = {
      name: '',
      source: ''
    };
  }

  _notifyEntitiesChange(newEntities) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}