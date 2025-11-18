// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    capabilities: { type: Object },
    _editingItem: { state: true },
    _expandedSections: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      .config-section {
        background: var(--card-background-color);
        border-radius: 12px;
        margin-bottom: 12px;
        border: 1px solid var(--divider-color);
        overflow: hidden;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        cursor: pointer;
        min-height: 44px;
      }

      .section-title {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-count {
        background: var(--primary-color);
        color: white;
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 11px;
        margin-left: 6px;
      }

      .add-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
      }

      .entities-list {
        padding: 8px 0;
      }

      .entity-row {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--divider-color);
        min-height: 52px;
        cursor: pointer;
      }

      .entity-row:hover {
        background: var(--secondary-background-color);
      }

      .entity-row:last-child {
        border-bottom: none;
      }

      .entity-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        border-radius: 8px;
        margin-right: 12px;
        color: white;
      }

      .entity-content {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 2px;
      }

      .entity-value {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-family: monospace;
      }

      .entity-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .entity-row:hover .entity-actions {
        opacity: 1;
      }

      .empty-state {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }

      /* 编辑表单 */
      .edit-form {
        padding: 16px;
        background: var(--secondary-background-color);
        border-top: 1px solid var(--divider-color);
      }

      .form-field {
        margin-bottom: 16px;
      }

      .form-label {
        display: block;
        font-weight: 600;
        font-size: 12px;
        margin-bottom: 6px;
        color: var(--primary-text-color);
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }

      .entity-picker-btn {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        color: var(--primary-text-color);
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .entity-picker-btn:hover {
        background: var(--primary-color);
        color: white;
      }

      .icon-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        padding: 8px;
        background: var(--card-background-color);
        border-radius: 4px;
        border: 1px solid var(--divider-color);
      }

      .icon-preview-text {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      ha-entity-picker, ha-icon-picker {
        width: 100%;
      }

      ha-textfield {
        width: 100%;
      }
    `
  ];

  constructor() {
    super();
    this._editingItem = null;
    this._expandedSections = new Set(['content']);
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) {
      this.requestUpdate();
    }
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
    const isExpanded = this._expandedSections.has('title');
    const isEditing = this._editingItem?.position === 'title';

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection('title')}>
          <div class="section-title">
            <ha-icon icon="mdi:format-title"></ha-icon>
            标题配置
            ${titleEntities.length > 0 ? html`<span class="section-count">${titleEntities.length}</span>` : ''}
          </div>
          <button class="add-button" @click=${(e) => {
            e.stopPropagation();
            this._startAddItem('title');
          }}>
            添加
          </button>
        </div>
        
        ${isExpanded ? html`
          <div class="entities-list">
            ${titleEntities.length === 0 ? html`
              <div class="empty-state">暂无标题</div>
            ` : titleEntities.map((entity, index) => this._renderEntityRow(entity, index, 'title'))}
          </div>
        ` : ''}

        ${isEditing ? this._renderEditForm('title') : ''}
      </div>
    `;
  }

  _renderContentSection() {
    if (!this.capabilities?.supportsContent) return '';

    const contentEntities = this._getEntitiesByPosition('content');
    const isExpanded = this._expandedSections.has('content');
    const isEditing = this._editingItem?.position === 'content';

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection('content')}>
          <div class="section-title">
            <ha-icon icon="mdi:chart-box"></ha-icon>
            内容配置
            ${contentEntities.length > 0 ? html`<span class="section-count">${contentEntities.length}</span>` : ''}
          </div>
          <button class="add-button" @click=${(e) => {
            e.stopPropagation();
            this._startAddItem('content');
          }}>
            添加
          </button>
        </div>
        
        ${isExpanded ? html`
          <div class="entities-list">
            ${contentEntities.length === 0 ? html`
              <div class="empty-state">暂无内容项</div>
            ` : contentEntities.map((entity, index) => this._renderEntityRow(entity, index, 'content'))}
          </div>
        ` : ''}

        ${isEditing ? this._renderEditForm('content') : ''}
      </div>
    `;
  }

  _renderFooterSection() {
    if (!this.capabilities?.supportsFooter) return '';

    const footerEntities = this._getEntitiesByPosition('footer');
    const isExpanded = this._expandedSections.has('footer');
    const isEditing = this._editingItem?.position === 'footer';

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection('footer')}>
          <div class="section-title">
            <ha-icon icon="mdi:file-document"></ha-icon>
            页脚配置
            ${footerEntities.length > 0 ? html`<span class="section-count">${footerEntities.length}</span>` : ''}
          </div>
          <button class="add-button" @click=${(e) => {
            e.stopPropagation();
            this._startAddItem('footer');
          }}>
            添加
          </button>
        </div>
        
        ${isExpanded ? html`
          <div class="entities-list">
            ${footerEntities.length === 0 ? html`
              <div class="empty-state">暂无页脚</div>
            ` : footerEntities.map((entity, index) => this._renderEntityRow(entity, index, 'footer'))}
          </div>
        ` : ''}

        ${isEditing ? this._renderEditForm('footer') : ''}
      </div>
    `;
  }

  _renderEntityRow(entity, index, position) {
    const isEditing = this._editingItem?.position === position && this._editingItem?.index === index;

    if (isEditing) return '';

    return html`
      <div class="entity-row" @click=${() => this._startEditItem(position, index)}>
        <div class="entity-icon">
          <ha-icon .icon=${entity.icon}></ha-icon>
        </div>
        <div class="entity-content">
          <div class="entity-name">${entity.name}</div>
          <div class="entity-value">${entity.source}</div>
        </div>
        <div class="entity-actions">
          <button @click=${(e) => {
            e.stopPropagation();
            this._removeItem(entity.key);
          }}>删除</button>
        </div>
      </div>
    `;
  }

  _renderEditForm(position) {
    const editingItem = this._editingItem;
    if (!editingItem || editingItem.position !== position) return '';

    const entities = this._getEntitiesByPosition(position);
    const entity = entities[editingItem.index];
    if (!entity) return '';

    return html`
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">显示名称</label>
          <ha-textfield
            .value=${entity.name}
            @input=${e => this._updateEditingItem({ name: e.target.value })}
            placeholder="显示名称"
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-field">
          <label class="form-label">数据源</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${entity.source}
            @value-changed=${e => {
              const entityId = e.detail.value;
              if (entityId) {
                const entityInfo = this._getEntityInfo(entityId);
                this._updateEditingItem({ 
                  source: entityId,
                  name: entityInfo.name || entity.name,
                  icon: entityInfo.icon || entity.icon
                });
              }
            }}
            allow-custom-value
          ></ha-entity-picker>
          <button class="entity-picker-btn" @click=${this._showEntityPicker}>
            <ha-icon icon="mdi:magnify"></ha-icon>
            选择实体
          </button>
        </div>

        <div class="form-field">
          <label class="form-label">图标</label>
          <ha-icon-picker
            .hass=${this.hass}
            .value=${entity.icon}
            @value-changed=${e => this._updateEditingItem({ icon: e.detail.value })}
          ></ha-icon-picker>
          <div class="icon-preview">
            <ha-icon .icon=${entity.icon}></ha-icon>
            <span class="icon-preview-text">${entity.icon}</span>
          </div>
        </div>

        <div class="form-actions">
          <button @click=${this._cancelEdit}>取消</button>
          <button 
            @click=${this._saveEdit}
            ?disabled=${!entity.name.trim() || !entity.source.trim()}
          >保存</button>
        </div>
      </div>
    `;
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

  _showEntityPicker() {
    if (!this._editingItem) return;

    const entityPicker = this.shadowRoot?.querySelector('ha-entity-picker');
    if (entityPicker) {
      entityPicker.focus();
      entityPicker.select();
    }
  }

  _toggleSection(sectionType) {
    if (this._expandedSections.has(sectionType)) {
      this._expandedSections.delete(sectionType);
    } else {
      this._expandedSections.add(sectionType);
    }
    this.requestUpdate();
  }

  _startAddItem(position) {
    const entities = this._getEntitiesByPosition(position);
    this._editingItem = {
      position,
      index: entities.length,
      isNew: true,
      data: {
        key: `${position}_${Date.now()}`,
        name: '',
        source: '',
        icon: 'mdi:chart-box'
      }
    };
    this._expandedSections.add(position);
    this.requestUpdate();
  }

  _startEditItem(position, index) {
    const entities = this._getEntitiesByPosition(position);
    const entity = entities[index];
    if (!entity) return;

    this._editingItem = {
      position,
      index,
      isNew: false,
      data: { ...entity }
    };
    this.requestUpdate();
  }

  _updateEditingItem(updates) {
    if (!this._editingItem) return;
    
    this._editingItem.data = {
      ...this._editingItem.data,
      ...updates
    };
    this.requestUpdate();
  }

  _saveEdit() {
    if (!this._editingItem) return;
    
    const { position, index, isNew, data } = this._editingItem;
    
    if (!data.name.trim() || !data.source.trim()) {
      return;
    }

    const newEntities = { ...this.entities };
    
    if (isNew) {
      // 新增实体
      newEntities[data.key] = data.source;
      newEntities[`${data.key}_name`] = data.name;
      newEntities[`${data.key}_icon`] = data.icon;
    } else {
      // 更新现有实体
      const oldKey = Object.keys(this.entities || {}).find(key => 
        !key.includes('_name') && !key.includes('_icon') && 
        this._getEntityPosition(key) === position
      );
      
      if (oldKey) {
        // 删除旧数据
        delete newEntities[oldKey];
        delete newEntities[`${oldKey}_name`];
        delete newEntities[`${oldKey}_icon`];
        
        // 添加新数据
        newEntities[data.key] = data.source;
        newEntities[`${data.key}_name`] = data.name;
        newEntities[`${data.key}_icon`] = data.icon;
      }
    }
    
    this._editingItem = null;
    this._notifyEntitiesChange(newEntities);
  }

  _cancelEdit() {
    this._editingItem = null;
    this.requestUpdate();
  }

  _removeItem(key) {
    const newEntities = { ...this.entities };
    delete newEntities[key];
    delete newEntities[`${key}_name`];
    delete newEntities[`${key}_icon`];
    this._notifyEntitiesChange(newEntities);
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