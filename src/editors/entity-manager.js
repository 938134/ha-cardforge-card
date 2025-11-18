// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    capabilities: { type: Object },
    _editingKey: { state: true },
    _newEntityData: { state: true },
    _availableEntities: { state: true }
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
        gap: 12px;
      }

      .entity-item {
        display: flex;
        align-items: center;
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        transition: all 0.3s;
      }

      .entity-item.editing {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color), 0.1);
        flex-direction: column;
        align-items: stretch;
      }

      .entity-item:hover:not(.editing) {
        border-color: var(--primary-color);
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
        flex-shrink: 0;
      }

      .entity-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .entity-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 1em;
      }

      .entity-source {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
      }

      .entity-preview {
        font-size: 0.8em;
        color: var(--success-color);
        font-style: italic;
      }

      .entity-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
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

      /* 编辑表单样式 */
      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      }

      .form-row {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .form-field {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 0.9em;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 8px;
      }

      .save-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 0.9em;
        transition: background-color 0.3s;
      }

      .save-button:hover:not(:disabled) {
        background: var(--accent-color);
      }

      .save-button:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      .cancel-button {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.3s;
      }

      .cancel-button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        border-radius: 8px;
        border: 2px dashed var(--divider-color);
      }

      .empty-icon {
        font-size: 3em;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      /* 新增实体表单 */
      .new-entity-form {
        background: var(--secondary-background-color);
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        padding: 20px;
        margin-top: 16px;
      }

      .new-entity-form.active {
        border-color: var(--primary-color);
        border-style: solid;
      }

      /* 实体选择器样式 */
      .entity-select {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .entity-select:focus {
        border-color: var(--primary-color);
        outline: none;
      }

      .entity-option-group {
        font-weight: 600;
        color: var(--primary-color);
        background: var(--secondary-background-color);
      }

      .entity-option {
        padding: 8px 12px;
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
          gap: 12px;
        }

        .entity-item {
          padding: 12px;
        }

        .entity-actions {
          margin-left: 12px;
        }
      }
    `
  ];

  constructor() {
    super();
    this._editingKey = null;
    this._newEntityData = null;
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    const entities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        id: entityId,
        name: state.attributes?.friendly_name || entityId,
        domain: entityId.split('.')[0],
        state: state.state
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    this._availableEntities = entities;
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderTitleSection()}
        ${this._renderContentSection()}
        ${this._renderFooterSection()}
      </div>
    `;
  }

  _renderTitleSection() {
    if (!this.capabilities?.supportsTitle) return '';

    const titleEntities = this._getEntitiesByPosition('title');
    const isAdding = this._newEntityData?.position === 'title';
    
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon icon="mdi:format-title"></ha-icon>
            标题配置
          </div>
          <button 
            class="add-button" 
            @click=${() => this._startAddEntity('title')}
            ?disabled=${isAdding}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            添加标题
          </button>
        </div>
        
        ${this._renderEntitiesList(titleEntities, 'title')}
        ${isAdding ? this._renderNewEntityForm('title') : ''}
      </div>
    `;
  }

  _renderContentSection() {
    if (!this.capabilities?.supportsContent) return '';

    const contentEntities = this._getEntitiesByPosition('content');
    const isAdding = this._newEntityData?.position === 'content';
    
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon icon="mdi:view-grid"></ha-icon>
            内容配置
          </div>
          <button 
            class="add-button" 
            @click=${() => this._startAddEntity('content')}
            ?disabled=${isAdding}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            添加内容项
          </button>
        </div>
        
        ${this._renderEntitiesList(contentEntities, 'content')}
        ${isAdding ? this._renderNewEntityForm('content') : ''}
      </div>
    `;
  }

  _renderFooterSection() {
    if (!this.capabilities?.supportsFooter) return '';

    const footerEntities = this._getEntitiesByPosition('footer');
    const isAdding = this._newEntityData?.position === 'footer';
    
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon icon="mdi:page-layout-footer"></ha-icon>
            页脚配置
          </div>
          <button 
            class="add-button" 
            @click=${() => this._startAddEntity('footer')}
            ?disabled=${isAdding}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            添加页脚
          </button>
        </div>
        
        ${this._renderEntitiesList(footerEntities, 'footer')}
        ${isAdding ? this._renderNewEntityForm('footer') : ''}
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
    if (this.requirements) {
      const requirement = this.requirements.find(req => req.key === key);
      if (requirement) {
        if (key === 'title') return 'title';
        if (key === 'footer') return 'footer';
        return 'content';
      }
    }
    
    if (key.includes('title') || key === 'title') return 'title';
    if (key.includes('footer') || key === 'footer') return 'footer';
    return 'content';
  }

  _renderEntitiesList(entities, position) {
    if (entities.length === 0 && !this._newEntityData) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">🏷️</div>
          <div>暂无${this._getPositionName(position)}配置</div>
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
    const isEditing = this._editingKey === entity.key;
    const preview = this._getEntityPreview(entity.source);

    if (isEditing) {
      return this._renderEditForm(entity, position);
    }

    return html`
      <div class="entity-item">
        <div class="entity-icon">
          <ha-icon .icon=${entity.icon}></ha-icon>
        </div>
        
        <div class="entity-content">
          <div class="entity-name">${entity.name}</div>
          <div class="entity-source">${entity.source}</div>
          ${preview ? html`<div class="entity-preview">当前状态: ${preview}</div>` : ''}
        </div>
        
        <div class="entity-actions">
          <button class="action-button" @click=${() => this._startEditEntity(entity.key)} title="编辑">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button class="action-button" @click=${() => this._removeEntity(entity.key)} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderEditForm(entity, position) {
    const entityData = this._getEntityData(entity.key);

    return html`
      <div class="entity-item editing">
        <div class="edit-form">
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">显示名称</label>
              <ha-textfield
                .value=${entityData.name}
                @input=${e => this._updateEntityData('name', e.target.value)}
                placeholder="输入显示名称"
                outlined
              ></ha-textfield>
            </div>
            
            <div class="form-field">
              <label class="form-label">图标</label>
              <ha-textfield
                .value=${entityData.icon}
                @input=${e => this._updateEntityData('icon', e.target.value)}
                placeholder="例如：mdi:thermometer"
                outlined
              ></ha-textfield>
              <div style="font-size: 0.85em; color: var(--secondary-text-color);">
                输入 Material Design Icons 名称
              </div>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">数据源</label>
            ${this._renderEntitySelect(entityData, true)}
            ${this._getEntityPreview(entityData.source) ? 
              html`<div class="entity-preview">当前状态: ${this._getEntityPreview(entityData.source)}</div>` : ''}
          </div>

          <div class="form-actions">
            <button class="cancel-button" @click=${this._cancelEdit}>取消</button>
            <button 
              class="save-button" 
              @click=${this._saveEdit}
              ?disabled=${!entityData.name || !entityData.source}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderNewEntityForm(position) {
    const entityData = this._newEntityData;

    return html`
      <div class="new-entity-form active">
        <div class="edit-form">
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">显示名称</label>
              <ha-textfield
                .value=${entityData?.name || ''}
                @input=${e => this._updateNewEntityData('name', e.target.value)}
                placeholder="输入显示名称"
                outlined
              ></ha-textfield>
            </div>
            
            <div class="form-field">
              <label class="form-label">图标</label>
              <ha-textfield
                .value=${entityData?.icon || 'mdi:chart-box'}
                @input=${e => this._updateNewEntityData('icon', e.target.value)}
                placeholder="例如：mdi:thermometer"
                outlined
              ></ha-textfield>
              <div style="font-size: 0.85em; color: var(--secondary-text-color);">
                输入 Material Design Icons 名称
              </div>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">数据源</label>
            ${this._renderEntitySelect(entityData, false)}
            ${entityData?.source && this._getEntityPreview(entityData.source) ? 
              html`<div class="entity-preview">当前状态: ${this._getEntityPreview(entityData.source)}</div>` : ''}
          </div>

          <div class="form-actions">
            <button class="cancel-button" @click=${this._cancelAdd}>取消</button>
            <button 
              class="save-button" 
              @click=${() => this._saveNewEntity(position)}
              ?disabled=${!entityData?.name || !entityData?.source}
            >
              添加
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderEntitySelect(entityData, isEditing) {
    return html`
      <select 
        class="entity-select"
        .value=${entityData?.source || ''}
        @change=${e => {
          const value = e.target.value;
          if (isEditing) {
            this._onEntitySelectChange(value, entityData);
          } else {
            this._onNewEntitySelectChange(value);
          }
        }}
      >
        <option value="">-- 选择实体 --</option>
        
        <!-- 按域分组 -->
        ${this._getEntityGroups().map(group => html`
          <optgroup label="${group.domain}">
            ${group.entities.map(entity => html`
              <option value="${entity.id}" ?selected=${entity.id === entityData?.source}>
                ${entity.name} (${entity.id})
              </option>
            `)}
          </optgroup>
        `)}
        
        <!-- 自定义输入选项 -->
        <option value="custom" ?selected=${entityData?.source && !this._isValidEntityId(entityData.source)}>
          -- 自定义输入 --
        </option>
      </select>
      
      <!-- 自定义输入框 -->
      ${entityData?.source && !this._isValidEntityId(entityData.source) ? html`
        <ha-textfield
          .value=${entityData.source}
          @input=${e => isEditing ? 
            this._updateEntityData('source', e.target.value) : 
            this._updateNewEntityData('source', e.target.value)}
          placeholder="输入自定义实体ID或文本"
          outlined
          style="margin-top: 8px;"
        ></ha-textfield>
      ` : ''}
    `;
  }

  _getEntityGroups() {
    const domains = {};
    
    this._availableEntities.forEach(entity => {
      if (!domains[entity.domain]) {
        domains[entity.domain] = [];
      }
      domains[entity.domain].push(entity);
    });
    
    return Object.entries(domains)
      .map(([domain, entities]) => ({
        domain: this._getDomainName(domain),
        entities: entities.slice(0, 50) // 限制每个域显示的数量
      }))
      .sort((a, b) => a.domain.localeCompare(b.domain));
  }

  _getDomainName(domain) {
    const domainNames = {
      'sensor': '传感器',
      'binary_sensor': '二进制传感器',
      'light': '灯光',
      'switch': '开关',
      'climate': '气候',
      'media_player': '媒体播放器',
      'person': '人员',
      'device_tracker': '设备追踪',
      'cover': '窗帘',
      'lock': '锁'
    };
    return domainNames[domain] || domain;
  }

  _isValidEntityId(value) {
    return value.includes('.') && this._availableEntities.some(entity => entity.id === value);
  }

  _getEntityData(key) {
    return {
      key,
      source: this.entities[key],
      name: this.entities[`${key}_name`] || this._getDefaultName(key, this.entities[key]),
      icon: this.entities[`${key}_icon`] || this._getDefaultIcon(this.entities[key])
    };
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
    return 'mdi:chart-box';
  }

  _getPositionName(position) {
    const names = {
      'title': '标题',
      'content': '内容项',
      'footer': '页脚'
    };
    return names[position] || '项目';
  }

  _startAddEntity(position) {
    this._newEntityData = {
      position,
      name: '',
      icon: 'mdi:chart-box',
      source: ''
    };
  }

  _startEditEntity(key) {
    this._editingKey = key;
  }

  _removeEntity(key) {
    const newEntities = { ...this.entities };
    delete newEntities[key];
    delete newEntities[`${key}_name`];
    delete newEntities[`${key}_icon`];
    this._notifyEntitiesChange(newEntities);
  }

  _updateEntityData(field, value) {
    if (!this._editingKey) return;
    
    if (!this._newEntityData) {
      this._newEntityData = this._getEntityData(this._editingKey);
    }
    this._newEntityData[field] = value;
    this.requestUpdate();
  }

  _updateNewEntityData(field, value) {
    if (!this._newEntityData) return;
    this._newEntityData[field] = value;
    this.requestUpdate();
  }

  _onEntitySelectChange(entityId, currentData) {
    this._updateEntityData('source', entityId);
    
    // 自动填充实体信息
    if (entityId && entityId !== 'custom') {
      const info = this._getEntityInfo(entityId);
      if (info.name && (!currentData.name || currentData.name === this._getDefaultName(currentData.key, entityId))) {
        this._updateEntityData('name', info.name);
      }
      if (info.icon && (currentData.icon === 'mdi:chart-box' || currentData.icon === this._getDefaultIcon(currentData.source))) {
        this._updateEntityData('icon', info.icon);
      }
    }
  }

  _onNewEntitySelectChange(entityId) {
    this._updateNewEntityData('source', entityId);
    
    // 自动填充实体信息
    if (entityId && entityId !== 'custom') {
      const info = this._getEntityInfo(entityId);
      if (info.name && !this._newEntityData.name) {
        this._updateNewEntityData('name', info.name);
      }
      if (info.icon && this._newEntityData.icon === 'mdi:chart-box') {
        this._updateNewEntityData('icon', info.icon);
      }
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

  _saveEdit() {
    if (!this._editingKey || !this._newEntityData) return;

    const newEntities = { ...this.entities };
    newEntities[this._editingKey] = this._newEntityData.source;
    newEntities[`${this._editingKey}_name`] = this._newEntityData.name;
    newEntities[`${this._editingKey}_icon`] = this._newEntityData.icon;

    this._notifyEntitiesChange(newEntities);
    this._cancelEdit();
  }

  _saveNewEntity(position) {
    if (!this._newEntityData) return;

    const key = this._generateEntityKey(this._newEntityData.name, position);
    const newEntities = { ...this.entities };
    newEntities[key] = this._newEntityData.source;
    newEntities[`${key}_name`] = this._newEntityData.name;
    newEntities[`${key}_icon`] = this._newEntityData.icon;

    this._notifyEntitiesChange(newEntities);
    this._cancelAdd();
  }

  _generateEntityKey(name, position) {
    const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${position}_${baseName}`;
  }

  _cancelEdit() {
    this._editingKey = null;
    this._newEntityData = null;
    this.requestUpdate();
  }

  _cancelAdd() {
    this._newEntityData = null;
    this.requestUpdate();
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
