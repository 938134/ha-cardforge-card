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

      .entity-section {
        margin-bottom: var(--cf-spacing-xl);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-lg);
      }

      .section-title {
        font-weight: 600;
        color: var(--cf-text-primary);
        font-size: 1.1em;
      }

      .add-button {
        background: var(--cf-primary-color);
        color: white;
        border: none;
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        cursor: pointer;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        transition: all var(--cf-transition-fast);
      }

      .add-button:hover {
        background: var(--cf-accent-color);
        transform: translateY(-1px);
      }

      .entity-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--cf-spacing-md);
        width: 100%;
      }

      .entity-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        transition: all var(--cf-transition-normal);
      }

      .entity-card:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
      }

      .entity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-sm);
      }

      .entity-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        flex: 1;
      }

      .entity-icon {
        font-size: 1.2em;
        width: 24px;
        text-align: center;
      }

      .entity-name {
        font-weight: 500;
        color: var(--cf-text-primary);
        font-size: 0.95em;
      }

      .entity-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
      }

      .action-button {
        background: none;
        border: none;
        padding: var(--cf-spacing-xs);
        cursor: pointer;
        border-radius: var(--cf-radius-sm);
        transition: background-color var(--cf-transition-fast);
        color: var(--cf-text-secondary);
      }

      .action-button:hover {
        background: rgba(var(--cf-rgb-primary), 0.1);
        color: var(--cf-primary-color);
      }

      .entity-source {
        background: rgba(var(--cf-rgb-primary), 0.05);
        padding: var(--cf-spacing-sm);
        border-radius: var(--cf-radius-sm);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        word-break: break-all;
        margin-top: var(--cf-spacing-sm);
      }

      .entity-preview {
        font-size: 0.8em;
        color: var(--cf-success-color);
        margin-top: var(--cf-spacing-xs);
        padding-left: var(--cf-spacing-sm);
        border-left: 2px solid var(--cf-success-color);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .empty-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-sm);
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
        padding: var(--cf-spacing-lg);
      }

      .dialog {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-xl);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--cf-shadow-xl);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-lg);
      }

      .dialog-title {
        font-weight: 600;
        color: var(--cf-text-primary);
        font-size: 1.2em;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-xs);
        border-radius: var(--cf-radius-sm);
      }

      .close-button:hover {
        background: rgba(var(--cf-rgb-primary), 0.1);
        color: var(--cf-primary-color);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--cf-spacing-lg);
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .form-label {
        font-weight: 500;
        color: var(--cf-text-primary);
        font-size: 0.9em;
      }

      .form-hint {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }

      .entity-picker {
        position: relative;
      }

      .entity-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        box-shadow: var(--cf-shadow-lg);
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        margin-top: var(--cf-spacing-xs);
      }

      .entity-option {
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        cursor: pointer;
        border-bottom: 1px solid rgba(var(--cf-rgb-primary), 0.1);
        transition: background-color var(--cf-transition-fast);
      }

      .entity-option:hover {
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .entity-option:last-child {
        border-bottom: none;
      }

      .entity-option-name {
        font-weight: 500;
        color: var(--cf-text-primary);
        font-size: 0.9em;
      }

      .entity-option-id {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }

      .dialog-actions {
        display: flex;
        gap: var(--cf-spacing-md);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-xl);
      }

      .cancel-button {
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        cursor: pointer;
        font-size: 0.9em;
        transition: all var(--cf-transition-fast);
      }

      .cancel-button:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
      }

      .save-button {
        background: var(--cf-primary-color);
        color: white;
        border: none;
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        cursor: pointer;
        font-size: 0.9em;
        transition: all var(--cf-transition-fast);
      }

      .save-button:hover {
        background: var(--cf-accent-color);
        transform: translateY(-1px);
      }

      .save-button:disabled {
        background: var(--cf-text-secondary);
        cursor: not-allowed;
        transform: none;
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .entity-card {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .entity-source {
          background: rgba(255, 255, 255, 0.05);
        }

        .dialog {
          background: var(--cf-dark-surface);
        }

        .entity-list {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .cancel-button {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
          color: var(--cf-dark-text);
        }
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .dialog {
          padding: var(--cf-spacing-lg);
          margin: var(--cf-spacing-md);
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--cf-spacing-md);
        }

        .dialog-actions {
          flex-direction: column;
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
      .filter(([key]) => !staticKeys.includes(key))
      .map(([key, source]) => ({
        key,
        source,
        name: this.entities[`${key}_name`] || this._getDefaultName(key, source),
        icon: this.entities[`${key}_icon`] || '🏷️'
      }));
  }

  _getDefaultName(key, source) {
    if (source.includes('.') && this.hass?.states?.[source]) {
      return this.hass.states[source].attributes?.friendly_name || source;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
      <div class="entity-section">
        <div class="section-header">
          <div class="section-title">必需实体</div>
        </div>
        <div class="entity-grid">
          ${requirements.map(req => this._renderEntityCard(req.key, {
            name: req.description,
            icon: '🔧',
            source: this.entities?.[req.key] || '',
            required: true
          }))}
        </div>
      </div>
    `;
  }

  _renderDynamicEntities() {
    return html`
      <div class="entity-section">
        <div class="section-header">
          <div class="section-title">自定义实体</div>
          <button class="add-button" @click=${this._showAddEntityDialog}>
            <span>+</span>
            <span>添加实体</span>
          </button>
        </div>
        
        ${this._dynamicEntities.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-icon">🏷️</div>
            <div class="cf-text-sm">暂无自定义实体</div>
            <div class="cf-text-xs cf-text-secondary cf-mt-sm">
              点击"添加实体"按钮来添加自定义实体或Jinja模板
            </div>
          </div>
        ` : html`
          <div class="entity-grid">
            ${this._dynamicEntities.map(entity => 
              this._renderEntityCard(entity.key, {
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

  _renderEntityCard(key, entity) {
    const parser = getJinjaParser(this.hass);
    const preview = entity.source ? parser.parse(entity.source, '') : '';

    return html`
      <div class="entity-card">
        <div class="entity-header">
          <div class="entity-info">
            <div class="entity-icon">${entity.icon}</div>
            <div class="entity-name">${entity.name}</div>
            ${entity.required ? html`<div class="cf-text-xs cf-error">必需</div>` : ''}
          </div>
          ${!entity.required ? html`
            <div class="entity-actions">
              <button class="action-button" @click=${() => this._editEntity(key)} title="编辑">
                ✏️
              </button>
              <button class="action-button" @click=${() => this._removeEntity(key)} title="删除">
                🗑️
              </button>
            </div>
          ` : ''}
        </div>
        
        <div class="entity-source">
          ${entity.source || '未配置'}
        </div>
        
        ${preview ? html`
          <div class="entity-preview">
            预览: ${preview}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderDialog() {
    if (!this._showAddDialog && !this._editingEntity) return '';

    const isEditing = !!this._editingEntity;
    const entity = isEditing ? 
      this._dynamicEntities.find(e => e.key === this._editingEntity) : 
      { key: '', name: '', icon: '🏷️', source: '' };

    return html`
      <div class="dialog-overlay" @click=${this._closeDialog}>
        <div class="dialog" @click=${e => e.stopPropagation()}>
          <div class="dialog-header">
            <div class="dialog-title">
              ${isEditing ? '编辑实体' : '添加实体'}
            </div>
            <button class="close-button" @click=${this._closeDialog}>×</button>
          </div>
          
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">实体名称</label>
              <ha-textfield
                .value=${entity.name}
                @input=${e => this._onDialogFieldChange('name', e.target.value)}
                placeholder="例如：室内温度"
                outlined
                fullwidth
              ></ha-textfield>
            </div>
            
            <div class="form-field">
              <label class="form-label">图标</label>
              <ha-textfield
                .value=${entity.icon}
                @input=${e => this._onDialogFieldChange('icon', e.target.value)}
                placeholder="例如：🌡️"
                outlined
                fullwidth
              ></ha-textfield>
              <div class="form-hint">输入一个emoji作为图标</div>
            </div>
            
            <div class="form-field">
              <label class="form-label">数据源</label>
              <div class="entity-picker">
                <ha-textfield
                  .value=${entity.source}
                  @input=${e => {
                    this._onDialogFieldChange('source', e.target.value);
                    this._searchQuery = e.target.value;
                    this._showEntityList = true;
                  }}
                  @focus=${() => this._showEntityList = true}
                  placeholder="实体ID 或 Jinja模板，例如：sensor.temperature 或 {{ states('sensor.temp') }}"
                  outlined
                  fullwidth
                ></ha-textfield>
                
                ${this._showEntityList && this._searchQuery ? html`
                  <div class="entity-list">
                    ${this._getFilteredEntities().map(entity => html`
                      <div class="entity-option" @click=${() => this._selectEntity(entity.entity_id)}>
                        <div class="entity-option-name">${entity.friendly_name}</div>
                        <div class="entity-option-id">${entity.entity_id}</div>
                      </div>
                    `)}
                    
                    <div class="entity-option" @click=${() => this._insertTemplate("{{ states('entity_id') }}")}>
                      <div class="entity-option-name">Jinja模板: 获取实体状态</div>
                      <div class="entity-option-id">{{ states('entity_id') }}</div>
                    </div>
                    
                    <div class="entity-option" @click=${() => this._insertTemplate("{{ state_attr('entity_id', 'attribute') }}")}>
                      <div class="entity-option-name">Jinja模板: 获取实体属性</div>
                      <div class="entity-option-id">{{ state_attr('entity_id', 'attribute') }}</div>
                    </div>
                    
                    <div class="entity-option" @click=${() => this._insertTemplate("{{ now().strftime('%H:%M') }}")}>
                      <div class="entity-option-name">Jinja模板: 当前时间</div>
                      <div class="entity-option-id">{{ now().strftime('%H:%M') }}</div>
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
      .slice(0, 10);
  }

  _selectEntity(entityId) {
    this._onDialogFieldChange('source', entityId);
    this._showEntityList = false;
    this._searchQuery = '';
  }

  _insertTemplate(template) {
    this._onDialogFieldChange('source', template);
    this._showEntityList = false;
    this._searchQuery = '';
  }

  _onDialogFieldChange(field, value) {
    if (!this._editingEntity) {
      // 新建实体
      this._newEntity = {
        ...this._newEntity,
        [field]: value
      };
    } else {
      // 编辑现有实体
      this._editingEntityData = {
        ...this._editingEntityData,
        [field]: value
      };
    }
  }

  _validateDialog() {
    const entity = this._editingEntity ? this._editingEntityData : this._newEntity;
    return entity?.name && entity?.source;
  }

  _showAddEntityDialog() {
    this._newEntity = { name: '', icon: '🏷️', source: '' };
    this._showAddDialog = true;
    this._searchQuery = '';
    this._showEntityList = false;
  }

  _editEntity(key) {
    const entity = this._dynamicEntities.find(e => e.key === key);
    if (entity) {
      this._editingEntity = key;
      this._editingEntityData = { ...entity };
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
    const entityData = isEditing ? this._editingEntityData : this._newEntity;
    
    if (!entityData.name || !entityData.source) return;

    const key = isEditing ? this._editingEntity : this._generateEntityKey(entityData.name);
    const newEntities = { ...this.entities };
    
    // 保存实体数据
    newEntities[key] = entityData.source;
    newEntities[`${key}_name`] = entityData.name;
    newEntities[`${key}_icon`] = entityData.icon;
    
    this._notifyEntitiesChange(newEntities);
    this._closeDialog();
  }

  _generateEntityKey(name) {
    return `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }

  _closeDialog() {
    this._showAddDialog = false;
    this._editingEntity = null;
    this._editingEntityData = null;
    this._newEntity = null;
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
