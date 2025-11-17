// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    _dynamicEntities: { state: true },
    _showEntityPicker: { state: true },
    _editingEntity: { state: true },
    _entityPickerConfig: { state: true }
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
        position: relative;
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

      .required-badge {
        background: var(--cf-error-color);
        color: white;
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        font-size: 0.7em;
        font-weight: 500;
      }

      .optional-badge {
        background: var(--cf-text-secondary);
        color: white;
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        font-size: 0.7em;
        font-weight: 500;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }

      .empty-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-sm);
        opacity: 0.5;
      }

      .empty-text {
        font-size: 0.9em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .empty-hint {
        font-size: 0.8em;
        opacity: 0.7;
      }

      /* 实体选择器对话框 */
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
        padding: 0;
        width: 100%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: var(--cf-shadow-xl);
        display: flex;
        flex-direction: column;
      }

      .dialog-header {
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
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

      .dialog-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--cf-spacing-lg);
      }

      .dialog-actions {
        padding: var(--cf-spacing-lg);
        border-top: 1px solid var(--cf-border);
        display: flex;
        gap: var(--cf-spacing-md);
        justify-content: flex-end;
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

      /* 表单样式 */
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

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .entity-card {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .entity-source {
          background: rgba(255, 255, 255, 0.05);
        }

        .empty-state {
          border-color: var(--cf-dark-border);
        }

        .dialog {
          background: var(--cf-dark-surface);
        }

        .dialog-header {
          border-bottom-color: var(--cf-dark-border);
        }

        .dialog-actions {
          border-top-color: var(--cf-dark-border);
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
          margin: var(--cf-spacing-md);
          max-height: 90vh;
        }

        .dialog-header,
        .dialog-content,
        .dialog-actions {
          padding: var(--cf-spacing-md);
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
    this._showEntityPicker = false;
    this._editingEntity = null;
    this._entityPickerConfig = null;
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
      .filter(([key]) => !staticKeys.includes(key) && !key.endsWith('_name') && !key.endsWith('_icon'))
      .map(([key, source]) => ({
        key,
        source,
        name: this.entities[`${key}_name`] || this._getDefaultName(key, source),
        icon: this.entities[`${key}_icon`] || '🏷️'
      }));
  }

  _getDefaultName(key, source) {
    // 从实体ID生成友好名称
    if (source.includes('.') && this.hass?.states?.[source]) {
      const entity = this.hass.states[source];
      return entity.attributes?.friendly_name || source;
    }
    
    // 从key生成友好名称
    return key.replace(/_/g, ' ')
             .replace(/\b\w/g, l => l.toUpperCase())
             .replace(/Custom /, '');
  }

  render() {
    const staticEntities = this._renderStaticEntities();
    const dynamicEntities = this._renderDynamicEntities();
    const entityPicker = this._renderEntityPicker();

    return html`
      <div class="entity-manager">
        ${staticEntities}
        ${dynamicEntities}
        ${entityPicker}
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
          ${requirements.map(req => this._renderEntityCard(req, true))}
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
            <div class="empty-text">暂无自定义实体</div>
            <div class="empty-hint">
              点击"添加实体"按钮来配置自定义实体数据源
            </div>
          </div>
        ` : html`
          <div class="entity-grid">
            ${this._dynamicEntities.map(entity => 
              this._renderEntityCard(entity, false)
            )}
          </div>
        `}
      </div>
    `;
  }

  _renderEntityCard(entityInfo, isRequired) {
    const source = isRequired ? 
      (this.entities?.[entityInfo.key] || '') : 
      entityInfo.source;
    
    const name = isRequired ? 
      entityInfo.description : 
      entityInfo.name;
    
    const icon = isRequired ? '🔧' : entityInfo.icon;

    return html`
      <div class="entity-card">
        <div class="entity-header">
          <div class="entity-info">
            <div class="entity-icon">${icon}</div>
            <div class="entity-name">${name}</div>
            ${isRequired ? 
              html`<div class="required-badge">必需</div>` :
              html`<div class="optional-badge">可选</div>`
            }
          </div>
          ${!isRequired ? html`
            <div class="entity-actions">
              <button class="action-button" @click=${() => this._editEntity(entityInfo.key)} title="编辑">
                ✏️
              </button>
              <button class="action-button" @click=${() => this._removeEntity(entityInfo.key)} title="删除">
                🗑️
              </button>
            </div>
          ` : ''}
        </div>
        
        <div class="entity-source">
          ${source || '未配置'}
        </div>
        
        ${source && this.hass ? html`
          <div class="entity-preview">
            当前值: ${this._getEntityPreview(source)}
          </div>
        ` : ''}
        
        ${entityInfo.hint ? html`
          <div class="form-hint">${entityInfo.hint}</div>
        ` : ''}
      </div>
    `;
  }

  _getEntityPreview(source) {
    if (!source || !this.hass) return '';
    
    // 实体ID预览
    if (source.includes('.') && this.hass.states[source]) {
      const entity = this.hass.states[source];
      const unit = entity.attributes?.unit_of_measurement;
      return `${entity.state}${unit ? ` ${unit}` : ''}`;
    }
    
    // Jinja模板预览（简化）
    if (source.includes('{{')) {
      return 'Jinja2模板';
    }
    
    return '文本内容';
  }

  _renderEntityPicker() {
    if (!this._showEntityPicker) return '';

    const isEditing = !!this._editingEntity;
    const entity = isEditing ? 
      this._dynamicEntities.find(e => e.key === this._editingEntity) : 
      { key: '', name: '', icon: '🏷️', source: '' };

    return html`
      <div class="dialog-overlay" @click=${this._closeEntityPicker}>
        <div class="dialog" @click=${e => e.stopPropagation()}>
          <div class="dialog-header">
            <div class="dialog-title">
              ${isEditing ? '编辑实体' : '添加实体'}
            </div>
            <button class="close-button" @click=${this._closeEntityPicker}>×</button>
          </div>
          
          <div class="dialog-content">
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">显示名称</label>
                <ha-textfield
                  .value=${entity.name}
                  @input=${e => this._onEntityFieldChange('name', e.target.value)}
                  placeholder="例如：室内温度"
                  outlined
                  fullwidth
                ></ha-textfield>
                <div class="form-hint">实体在卡片中显示的名称</div>
              </div>
              
              <div class="form-field">
                <label class="form-label">图标</label>
                <ha-textfield
                  .value=${entity.icon}
                  @input=${e => this._onEntityFieldChange('icon', e.target.value)}
                  placeholder="例如：🌡️"
                  outlined
                  fullwidth
                ></ha-textfield>
                <div class="form-hint">输入一个emoji作为图标</div>
              </div>
              
              <div class="form-field">
                <label class="form-label">数据源</label>
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${entity.source?.includes('.') ? entity.source : ''}
                  @value-changed=${e => this._onEntityFieldChange('source', e.detail.value)}
                  allow-custom-entity
                  .includeDomains=${['sensor', 'binary_sensor', 'device_tracker', 'person']}
                  placeholder="选择实体或输入实体ID"
                  fullwidth
                ></ha-entity-picker>
                <div class="form-hint">
                  或者输入 Jinja2 模板，例如: {{ states('sensor.temperature') }}
                </div>
                
                <ha-textfield
                  .value=${entity.source?.includes('{{') ? entity.source : ''}
                  @input=${e => this._onEntityFieldChange('source', e.target.value)}
                  placeholder="或输入 Jinja2 模板"
                  outlined
                  fullwidth
                  style="margin-top: var(--cf-spacing-sm);"
                ></ha-textfield>
              </div>
            </div>
          </div>
          
          <div class="dialog-actions">
            <button class="cancel-button" @click=${this._closeEntityPicker}>取消</button>
            <button 
              class="save-button" 
              @click=${this._saveEntity}
              ?disabled=${!this._validateEntityForm()}
            >
              ${isEditing ? '更新' : '添加'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _onEntityFieldChange(field, value) {
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

  _validateEntityForm() {
    const entity = this._editingEntity ? this._editingEntityData : this._newEntity;
    return entity?.name && entity?.source;
  }

  _showAddEntityDialog() {
    this._newEntity = { name: '', icon: '🏷️', source: '' };
    this._showEntityPicker = true;
    this._editingEntity = null;
  }

  _editEntity(key) {
    const entity = this._dynamicEntities.find(e => e.key === key);
    if (entity) {
      this._editingEntity = key;
      this._editingEntityData = { ...entity };
      this._showEntityPicker = true;
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
    this._closeEntityPicker();
  }

  _generateEntityKey(name) {
    return `custom_${name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')}`;
  }

  _closeEntityPicker() {
    this._showEntityPicker = false;
    this._editingEntity = null;
    this._editingEntityData = null;
    this._newEntity = null;
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
