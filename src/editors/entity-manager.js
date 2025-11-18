// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    capabilities: { type: Object },
    _editingEntity: { state: true },
    _showAddDialog: { state: true },
    _newEntityData: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      .section {
        margin-bottom: var(--cf-spacing-xl);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-lg);
        padding-bottom: var(--cf-spacing-sm);
        border-bottom: 1px solid var(--divider-color);
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 1.1em;
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .add-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.3s;
      }

      .add-button:hover {
        background: var(--accent-color);
      }

      .entities-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .entity-item {
        display: flex;
        align-items: center;
        background: var(--card-background-color);
        border-radius: 4px;
        padding: 12px 16px;
        border: 1px solid var(--divider-color);
        transition: all 0.3s;
        min-height: 60px;
      }

      .entity-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .entity-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        border-radius: 50%;
        margin-right: 16px;
        color: white;
        font-size: 1.2em;
      }

      .entity-content {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 1em;
        margin-bottom: 4px;
      }

      .entity-source {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }

      .entity-preview {
        font-size: 0.8em;
        color: var(--success-color);
        margin-top: 4px;
      }

      .entity-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .entity-item:hover .entity-actions {
        opacity: 1;
      }

      .action-button {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;
      }

      .action-button:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text-color);
      }

      .empty-icon {
        font-size: 3em;
        margin-bottom: 16px;
        opacity: 0.5;
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
        padding: 24px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .dialog-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 1.3em;
      }

      .close-button {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;
      }

      .close-button:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 20px;
      }

      .form-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 0.95em;
      }

      .form-hint {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .cancel-button {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 0.95em;
        transition: all 0.3s;
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
        font-size: 0.95em;
        transition: background-color 0.3s;
      }

      .save-button:hover:not(:disabled) {
        background: var(--accent-color);
      }

      .save-button:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .dialog {
          padding: 16px;
          margin: 10px;
        }

        .entity-item {
          padding: 10px 12px;
        }

        .entity-icon {
          width: 32px;
          height: 32px;
          margin-right: 12px;
        }

        .dialog-actions {
          flex-direction: column;
        }
      }
    `
  ];

  constructor() {
    super();
    this._editingEntity = null;
    this._showAddDialog = false;
    this._newEntityData = null;
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderTitleSection()}
        ${this._renderContentSection()}
        ${this._renderFooterSection()}
        ${this._renderDialog()}
      </div>
    `;
  }

  _renderTitleSection() {
    if (!this.capabilities?.supportsTitle) return '';

    const titleEntities = this._getEntitiesByPosition('title');
    
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon icon="mdi:format-title"></ha-icon>
            标题配置
          </div>
          <button class="add-button" @click=${() => this._showAddEntityDialog('title')}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加标题
          </button>
        </div>
        
        ${this._renderEntitiesList(titleEntities, 'title')}
      </div>
    `;
  }

  _renderContentSection() {
    if (!this.capabilities?.supportsContent) return '';

    const contentEntities = this._getEntitiesByPosition('content');
    
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon icon="mdi:view-grid"></ha-icon>
            内容配置
          </div>
          <button class="add-button" @click=${() => this._showAddEntityDialog('content')}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加内容项
          </button>
        </div>
        
        ${this._renderEntitiesList(contentEntities, 'content')}
      </div>
    `;
  }

  _renderFooterSection() {
    if (!this.capabilities?.supportsFooter) return '';

    const footerEntities = this._getEntitiesByPosition('footer');
    
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon icon="mdi:page-layout-footer"></ha-icon>
            页脚配置
          </div>
          <button class="add-button" @click=${() => this._showAddEntityDialog('footer')}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加页脚
          </button>
        </div>
        
        ${this._renderEntitiesList(footerEntities, 'footer')}
      </div>
    `;
  }

  _getEntitiesByPosition(position) {
    const entities = [];
    
    Object.entries(this.entities || {}).forEach(([key, value]) => {
      if (!key.includes('_name') && !key.includes('_icon')) {
        const entityPosition = this._getEntityPosition(key);
        if (entityPosition === position) {
          entities.push({
            key,
            source: value,
            name: this.entities[`${key}_name`] || this._getDefaultName(key, value),
            icon: this.entities[`${key}_icon`] || this._getDefaultIcon(value)
          });
        }
      }
    });
    
    return entities;
  }

  _getEntityPosition(key) {
    // 根据布局字段判断位置
    if (this.requirements) {
      const requirement = this.requirements.find(req => req.key === key);
      if (requirement) {
        // 这里可以根据需求扩展更复杂的位置判断逻辑
        if (key === 'title') return 'title';
        if (key === 'footer') return 'footer';
        return 'content';
      }
    }
    
    // 默认逻辑
    if (key.includes('title') || key === 'title') return 'title';
    if (key.includes('footer') || key === 'footer') return 'footer';
    return 'content';
  }

  _renderEntitiesList(entities, position) {
    if (entities.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">🏷️</div>
          <div>暂无配置</div>
          <div style="font-size: 0.9em; margin-top: 8px; opacity: 0.8;">
            点击"添加${this._getPositionName(position)}"按钮来配置
          </div>
        </div>
      `;
    }

    return html`
      <div class="entities-list">
        ${entities.map(entity => this._renderEntityItem(entity, position))}
      </div>
    `;
  }

  _renderEntityItem(entity, position) {
    const preview = this._getEntityPreview(entity.source);

    return html`
      <div class="entity-item">
        <div class="entity-icon">
          <ha-icon .icon=${entity.icon}></ha-icon>
        </div>
        
        <div class="entity-content">
          <div class="entity-name">${entity.name}</div>
          <div class="entity-source">${entity.source}</div>
          ${preview ? html`<div class="entity-preview">预览: ${preview}</div>` : ''}
        </div>
        
        <div class="entity-actions">
          <button class="action-button" @click=${() => this._editEntity(entity.key)} title="编辑">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button class="action-button" @click=${() => this._removeEntity(entity.key)} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderDialog() {
    if (!this._showAddDialog && !this._editingEntity) return '';

    const isEditing = !!this._editingEntity;
    const entityData = isEditing ? this._getEntityData(this._editingEntity) : this._newEntityData;
    const position = isEditing ? this._getEntityPosition(this._editingEntity) : this._newEntityData?.position;

    return html`
      <div class="dialog-overlay" @click=${this._closeDialog}>
        <div class="dialog" @click=${e => e.stopPropagation()}>
          <div class="dialog-header">
            <div class="dialog-title">
              ${isEditing ? '编辑' : '添加'}${this._getPositionName(position)}
            </div>
            <button class="close-button" @click=${this._closeDialog}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="form-field">
            <label class="form-label">显示名称</label>
            <ha-textfield
              .value=${entityData?.name || ''}
              @input=${e => this._updateDialogData('name', e.target.value)}
              placeholder="例如：室内温度"
              outlined
              fullwidth
            ></ha-textfield>
          </div>
          
          <div class="form-field">
            <label class="form-label">图标</label>
            <ha-textfield
              .value=${entityData?.icon || ''}
              @input=${e => this._updateDialogData('icon', e.target.value)}
              placeholder="例如：mdi:thermometer"
              outlined
              fullwidth
            ></ha-textfield>
            <div class="form-hint">输入 Material Design Icons 名称</div>
          </div>
          
          <div class="form-field">
            <label class="form-label">数据源</label>
            ${this._renderEntityPicker(entityData)}
            <div class="form-hint">输入实体ID，例如：sensor.temperature</div>
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

  _renderEntityPicker(entityData) {
    if (customElements.get('ha-entity-picker')) {
      return html`
        <ha-entity-picker
          .hass=${this.hass}
          .value=${entityData?.source || ''}
          @value-changed=${e => {
            this._updateDialogData('source', e.detail.value);
            // 自动填充实体信息
            if (e.detail.value && (!entityData?.name || !entityData?.icon)) {
              const info = this._getEntityInfo(e.detail.value);
              if (info.name && !entityData?.name) {
                this._updateDialogData('name', info.name);
              }
              if (info.icon && (!entityData?.icon || entityData.icon === 'mdi:chart-box')) {
                this._updateDialogData('icon', info.icon);
              }
            }
          }}
          allow-custom-value
          fullwidth
        ></ha-entity-picker>
      `;
    } else {
      return html`
        <ha-textfield
          .value=${entityData?.source || ''}
          @input=${e => this._updateDialogData('source', e.target.value)}
          placeholder="输入实体ID"
          outlined
          fullwidth
        ></ha-textfield>
      `;
    }
  }

  _getEntityInfo(entityValue) {
    if (!entityValue || !this.hass?.states) {
      return { name: '', icon: 'mdi:chart-box' };
    }

    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      const entity = this.hass.states[entityValue];
      return {
        name: entity.attributes?.friendly_name || entityValue,
        icon: entity.attributes?.icon || this._getDefaultIcon(entityValue)
      };
    }

    return { name: '', icon: 'mdi:chart-box' };
  }

  _getEntityPreview(entityValue) {
    if (!entityValue || !this.hass?.states) return '';
    
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      return this.hass.states[entityValue].state;
    }
    
    return '';
  }

  _getDefaultName(key, source) {
    if (source.includes('.') && this.hass?.states?.[source]) {
      return this.hass.states[source].attributes?.friendly_name || source;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  _getDefaultIcon(source) {
    if (source.includes('.') && this.hass?.states?.[source]) {
      const domain = source.split('.')[0];
      const icons = {
        'light': 'mdi:lightbulb',
        'sensor': 'mdi:gauge',
        'switch': 'mdi:power-plug',
        'climate': 'mdi:thermostat',
        'media_player': 'mdi:television',
        'person': 'mdi:account'
      };
      return icons[domain] || 'mdi:tag';
    }
    return 'mdi:code-braces';
  }

  _getPositionName(position) {
    const names = {
      'title': '标题',
      'content': '内容项',
      'footer': '页脚'
    };
    return names[position] || '项目';
  }

  _getEntityData(key) {
    return {
      key,
      source: this.entities[key],
      name: this.entities[`${key}_name`] || this._getDefaultName(key, this.entities[key]),
      icon: this.entities[`${key}_icon`] || this._getDefaultIcon(this.entities[key])
    };
  }

  _showAddEntityDialog(position) {
    this._newEntityData = {
      position,
      name: '',
      icon: 'mdi:chart-box',
      source: ''
    };
    this._showAddDialog = true;
  }

  _editEntity(key) {
    this._editingEntity = key;
  }

  _removeEntity(key) {
    const newEntities = { ...this.entities };
    delete newEntities[key];
    delete newEntities[`${key}_name`];
    delete newEntities[`${key}_icon`];
    this._notifyEntitiesChange(newEntities);
  }

  _updateDialogData(field, value) {
    if (this._editingEntity) {
      // 编辑模式
      if (!this._newEntityData) {
        this._newEntityData = this._getEntityData(this._editingEntity);
      }
      this._newEntityData[field] = value;
    } else {
      // 新增模式
      this._newEntityData[field] = value;
    }
    this.requestUpdate();
  }

  _validateDialog() {
    const data = this._newEntityData;
    return data?.name && data?.source;
  }

  _saveEntity() {
    const isEditing = !!this._editingEntity;
    const entityData = this._newEntityData;
    
    if (!entityData?.name || !entityData?.source) return;

    const key = isEditing ? this._editingEntity : this._generateEntityKey(entityData.name, entityData.position);
    const newEntities = { ...this.entities };
    
    // 保存实体数据
    newEntities[key] = entityData.source;
    newEntities[`${key}_name`] = entityData.name;
    newEntities[`${key}_icon`] = entityData.icon;
    
    this._notifyEntitiesChange(newEntities);
    this._closeDialog();
  }

  _generateEntityKey(name, position) {
    const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${position}_${baseName}`;
  }

  _closeDialog() {
    this._showAddDialog = false;
    this._editingEntity = null;
    this._newEntityData = null;
  }

  _notifyEntitiesChange(newEntities) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }

  firstUpdated() {
    // 尝试动态加载 ha-entity-picker
    if (!customElements.get('ha-entity-picker')) {
      console.warn('ha-entity-picker 组件未加载，使用备用输入框');
    }
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}
