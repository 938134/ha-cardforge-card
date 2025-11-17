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
    _editingEntity: { state: true },
    _searchQuery: { state: true },
    _showEntityList: { state: true },
    _dialogData: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      /* 参照官方 entities 卡片样式 */
      .entities-section {
        margin-bottom: var(--cf-spacing-xl);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-sm) 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 1.1em;
      }

      .add-entity-button {
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

      .add-entity-button:hover {
        background: var(--accent-color);
      }

      .add-entity-button ha-icon {
        --mdc-icon-size: 18px;
      }

      /* 实体列表样式 - 参照官方 */
      .entities-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .entity-row {
        display: flex;
        align-items: center;
        background: var(--card-background-color);
        border-radius: 4px;
        padding: 12px 16px;
        border: 1px solid var(--divider-color);
        transition: all 0.3s;
        min-height: 60px;
      }

      .entity-row:hover {
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .entity-source {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
      }

      .entity-action {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;
      }

      .entity-action:hover {
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

      .empty-text {
        font-size: 1.1em;
        margin-bottom: 8px;
      }

      .empty-hint {
        font-size: 0.9em;
        opacity: 0.8;
      }

      /* 对话框样式 - 参照官方 */
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
        font-size: 0.95em;
      }

      .form-hint {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      /* 实体选择器样式 */
      .entity-picker {
        position: relative;
      }

      .entity-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        margin-top: 4px;
      }

      .entity-suggestion {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.3s;
      }

      .entity-suggestion:hover {
        background: var(--secondary-background-color);
      }

      .entity-suggestion:last-child {
        border-bottom: none;
      }

      .suggestion-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 0.95em;
      }

      .suggestion-id {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .template-suggestion {
        border-top: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
      }

      .template-suggestion .suggestion-name {
        color: var(--primary-color);
      }

      /* 对话框操作按钮 */
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

      /* 必需实体标记 */
      .required-badge {
        background: var(--error-color);
        color: white;
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: 8px;
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .dialog {
          padding: 16px;
          margin: 10px;
        }

        .entity-row {
          padding: 10px 12px;
        }

        .entity-icon {
          width: 32px;
          height: 32px;
          margin-right: 12px;
          font-size: 1em;
        }

        .dialog-actions {
          flex-direction: column;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .entity-row {
          background: var(--dark-card-background-color);
          border-color: var(--dark-divider-color);
        }

        .entity-suggestions {
          background: var(--dark-card-background-color);
          border-color: var(--dark-divider-color);
        }

        .template-suggestion {
          background: var(--dark-secondary-background-color);
        }
      }
    `
  ];

  constructor() {
    super();
    this._dynamicEntities = [];
    this._showAddDialog = false;
    this._editingEntity = null;
    this._searchQuery = '';
    this._showEntityList = false;
    this._dialogData = {
      name: '',
      icon: 'mdi:tag',
      source: '',
      key: ''
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
      .filter(([key]) => !staticKeys.includes(key) && !key.includes('_name') && !key.includes('_icon'))
      .map(([key, source]) => ({
        key,
        source,
        name: this.entities[`${key}_name`] || this._getDefaultName(key, source),
        icon: this.entities[`${key}_icon`] || this._getDefaultIcon(source)
      }));
  }

  _getDefaultName(key, source) {
    if (source.includes('.') && this.hass?.states?.[source]) {
      return this.hass.states[source].attributes?.friendly_name || source;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  _getDefaultIcon(source) {
    if (source.includes('.') && this.hass?.states?.[source]) {
      const entity = this.hass.states[source];
      const domain = source.split('.')[0];
      
      // 参照官方的域图标映射
      const domainIcons = {
        'light': 'mdi:lightbulb',
        'sensor': 'mdi:gauge',
        'switch': 'mdi:power-plug',
        'climate': 'mdi:thermostat',
        'media_player': 'mdi:television',
        'person': 'mdi:account',
        'device_tracker': 'mdi:account',
        'binary_sensor': 'mdi:checkbox-marked-circle',
        'input_boolean': 'mdi:toggle-switch',
        'automation': 'mdi:robot',
        'script': 'mdi:script-text'
      };
      
      return domainIcons[domain] || 'mdi:tag';
    }
    return 'mdi:code-braces'; // Jinja模板图标
  }

  render() {
    const staticEntities = this._renderStaticEntities();
    const dynamicEntities = this._renderDynamicEntities();
    const dialog = this._renderDialog();

    return html`
      <div class="entity-manager">
        ${staticEntities}
        ${dynamicEntities}
        ${dialog}
      </div>
    `;
  }

  _renderStaticEntities() {
    const requirements = this.requirements || [];
    
    if (requirements.length === 0) {
      return '';
    }

    return html`
      <div class="entities-section">
        <div class="section-header">
          <div class="section-title">必需实体</div>
        </div>
        <div class="entities-list">
          ${requirements.map(req => this._renderEntityRow(req.key, {
            name: req.description,
            icon: this._getDefaultIcon(this.entities?.[req.key]),
            source: this.entities?.[req.key] || '',
            required: true
          }))}
        </div>
      </div>
    `;
  }

  _renderDynamicEntities() {
    return html`
      <div class="entities-section">
        <div class="section-header">
          <div class="section-title">自定义实体</div>
          <button class="add-entity-button" @click=${this._showAddEntityDialog}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加实体
          </button>
        </div>
        
        ${this._dynamicEntities.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-icon">🏷️</div>
            <div class="empty-text">暂无自定义实体</div>
            <div class="empty-hint">
              点击"添加实体"按钮来添加自定义实体或Jinja模板
            </div>
          </div>
        ` : html`
          <div class="entities-list">
            ${this._dynamicEntities.map(entity => 
              this._renderEntityRow(entity.key, {
                name: entity.name,
                icon: entity.icon,
                source: entity.source,
                required: false
              })
            )}
          </div>
        `}
      </div>
    `;
  }

  _renderEntityRow(key, entity) {
    const parser = getJinjaParser(this.hass);
    const preview = entity.source ? parser.parse(entity.source, '') : '';

    return html`
      <div class="entity-row">
        <div class="entity-icon">
          <ha-icon .icon=${entity.icon}></ha-icon>
        </div>
        
        <div class="entity-content">
          <div class="entity-name">
            ${entity.name}
            ${entity.required ? html`<span class="required-badge">必需</span>` : ''}
          </div>
          <div class="entity-source">${entity.source || '未配置'}</div>
          ${preview ? html`
            <div class="entity-preview">预览: ${preview}</div>
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
            <button class="close-button" @click=${this._closeDialog}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">实体名称</label>
              <ha-textfield
                .value=${this._dialogData.name}
                @input=${e => this._updateDialogData('name', e.target.value)}
                placeholder="例如：室内温度"
                outlined
                fullwidth
              ></ha-textfield>
            </div>
            
            <div class="form-field">
              <label class="form-label">图标</label>
              <ha-textfield
                .value=${this._dialogData.icon}
                @input=${e => this._updateDialogData('icon', e.target.value)}
                placeholder="例如：mdi:thermometer"
                outlined
                fullwidth
              ></ha-textfield>
              <div class="form-hint">输入 Material Design Icons 名称</div>
            </div>
            
            <div class="form-field">
              <label class="form-label">数据源</label>
              <div class="entity-picker">
                <ha-textfield
                  .value=${this._dialogData.source}
                  @input=${e => {
                    this._updateDialogData('source', e.target.value);
                    this._searchQuery = e.target.value;
                    this._showEntityList = true;
                  }}
                  @focus=${() => this._showEntityList = true}
                  placeholder="实体ID 或 Jinja模板，例如：sensor.temperature 或 {{ states('sensor.temp') }}"
                  outlined
                  fullwidth
                ></ha-textfield>
                
                ${this._showEntityList && this._searchQuery ? html`
                  <div class="entity-suggestions">
                    ${this._getFilteredEntities().map(entity => html`
                      <div class="entity-suggestion" @click=${() => this._selectEntity(entity.entity_id)}>
                        <div class="suggestion-name">${entity.friendly_name}</div>
                        <div class="suggestion-id">${entity.entity_id}</div>
                      </div>
                    `)}
                    
                    <div class="entity-suggestion template-suggestion" @click=${() => this._insertTemplate("{{ states('entity_id') }}")}>
                      <div class="suggestion-name">Jinja模板: 获取实体状态</div>
                      <div class="suggestion-id">{{ states('entity_id') }}</div>
                    </div>
                    
                    <div class="entity-suggestion template-suggestion" @click=${() => this._insertTemplate("{{ state_attr('entity_id', 'attribute') }}")}>
                      <div class="suggestion-name">Jinja模板: 获取实体属性</div>
                      <div class="suggestion-id">{{ state_attr('entity_id', 'attribute') }}</div>
                    </div>
                    
                    <div class="entity-suggestion template-suggestion" @click=${() => this._insertTemplate("{{ now().strftime('%H:%M') }}")}>
                      <div class="suggestion-name">Jinja模板: 当前时间</div>
                      <div class="suggestion-id">{{ now().strftime('%H:%M') }}</div>
                    </div>
                  </div>
                ` : ''}
              </div>
              <div class="form-hint">
                可以输入实体ID（如 sensor.temperature）或 Jinja2模板
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

  _getFilteredEntities() {
    if (!this.hass || !this._searchQuery) return [];
    
    const query = this._searchQuery.toLowerCase();
    return Object.entries(this.hass.states)
      .map(([entity_id, stateObj]) => ({
        entity_id,
        friendly_name: stateObj.attributes?.friendly_name || entity_id
      }))
      .filter(entity => 
        entity.entity_id.toLowerCase().includes(query) || 
        entity.friendly_name.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }

  _selectEntity(entityId) {
    this._updateDialogData('source', entityId);
    this._showEntityList = false;
    this._searchQuery = '';
  }

  _insertTemplate(template) {
    this._updateDialogData('source', template);
    this._showEntityList = false;
    this._searchQuery = '';
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
      icon: 'mdi:tag', 
      source: '', 
      key: '' 
    };
    this._showAddDialog = true;
    this._searchQuery = '';
    this._showEntityList = false;
  }

  _editEntity(key) {
    const entity = this._dynamicEntities.find(e => e.key === key);
    if (entity) {
      this._editingEntity = key;
      this._dialogData = { 
        name: entity.name, 
        icon: entity.icon, 
        source: entity.source, 
        key: entity.key 
      };
      this._searchQuery = '';
      this._showEntityList = false;
    }
  }

  _removeEntity(key) {
    const newEntities = { ...this.entities };
    
    // 移除实体相关数据
    delete newEntities[key];
    delete newEntities[`${key}_name`];
    delete newEntities[`${key}_icon`];
    
    this._notifyEntitiesChange(newEntities);
  }

  _saveEntity() {
    const isEditing = !!this._editingEntity;
    
    if (!this._dialogData.name || !this._dialogData.source) return;

    const key = isEditing ? this._editingEntity : this._generateEntityKey(this._dialogData.name);
    const newEntities = { ...this.entities };
    
    // 保存实体数据
    newEntities[key] = this._dialogData.source;
    newEntities[`${key}_name`] = this._dialogData.name;
    newEntities[`${key}_icon`] = this._dialogData.icon;
    
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
      icon: 'mdi:tag',
      source: '',
      key: ''
    };
    this._searchQuery = '';
    this._showEntityList = false;
  }

  _notifyEntitiesChange(newEntities) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this._showEntityList) {
      this.requestUpdate();
    }
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}