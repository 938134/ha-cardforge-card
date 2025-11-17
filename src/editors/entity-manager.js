// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';
import { getJinjaParser } from '../core/jinja-parser.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    _config: { state: true },
    _draggingIndex: { state: true },
    _showEntityPicker: { state: true },
    _currentPickerField: { state: true },
    _searchQuery: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      /* 参照官方多实体卡片设计 */
      .config-section {
        background: var(--card-background-color);
        border-radius: var(--card-border-radius, 12px);
        padding: 0;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        box-shadow: var(--card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
        overflow: hidden;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-icon {
        font-size: 20px;
      }

      .add-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.3s;
      }

      .add-button:hover {
        background: var(--accent-color);
      }

      .add-button ha-icon {
        --mdc-icon-size: 18px;
      }

      /* 实体列表样式 - 参照官方 */
      .entities-list {
        padding: 0;
      }

      .entity-row {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.3s;
        min-height: 60px;
      }

      .entity-row:hover {
        background: var(--secondary-background-color);
      }

      .entity-row:last-child {
        border-bottom: none;
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
        font-size: 18px;
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
        font-size: 14px;
      }

      .entity-value {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
        word-break: break-all;
      }

      .entity-preview {
        font-size: 11px;
        color: var(--success-color);
        margin-top: 2px;
      }

      .entity-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
        flex-shrink: 0;
      }

      .entity-action {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
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
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 16px;
        margin-bottom: 8px;
      }

      /* 内联编辑样式 */
      .edit-form {
        padding: 16px;
        background: var(--secondary-background-color);
        border-top: 1px solid var(--divider-color);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 12px;
        align-items: start;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .field-with-preview {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-inputs {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .field-inputs ha-textfield {
        flex: 1;
      }

      .entity-picker-btn {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        color: var(--primary-text-color);
        transition: all 0.3s;
        min-width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .entity-picker-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .field-preview {
        font-size: 11px;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        padding: 4px 8px;
        border-radius: 4px;
        min-height: 16px;
        font-family: var(--code-font-family, monospace);
      }

      .icon-picker {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .icon-display {
        font-size: 20px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
      }

      .icon-select {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px;
        color: var(--primary-text-color);
        min-width: 80px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .cancel-button {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
      }

      .save-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
      }

      .save-button:hover:not(:disabled) {
        background: var(--accent-color);
      }

      /* 实体选择器样式 */
      .entity-picker-overlay {
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

      .entity-picker-dialog {
        background: var(--card-background-color);
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
      }

      .picker-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 18px;
      }

      .close-button {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
      }

      .search-box {
        padding: 0 20px 16px;
      }

      .entity-list {
        flex: 1;
        overflow-y: auto;
        max-height: 400px;
      }

      .entity-item {
        padding: 12px 20px;
        cursor: pointer;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .entity-item:hover {
        background: var(--secondary-background-color);
      }

      .entity-item:last-child {
        border-bottom: none;
      }

      .entity-info {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        margin-bottom: 2px;
      }

      .entity-id {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
      }

      .template-option {
        border-top: 2px solid var(--divider-color);
        background: var(--secondary-background-color);
      }

      .template-option .entity-name {
        color: var(--primary-color);
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .entity-picker-dialog {
          margin: 10px;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .config-section {
          background: var(--dark-card-background-color);
          border-color: var(--dark-divider-color);
        }

        .section-header {
          background: var(--dark-secondary-background-color);
        }

        .entity-row:hover {
          background: var(--dark-secondary-background-color);
        }

        .edit-form {
          background: var(--dark-secondary-background-color);
        }
      }
    `
  ];

  constructor() {
    super();
    this._config = {
      header: [],
      content: [],
      footer: []
    };
    this._draggingIndex = -1;
    this._showEntityPicker = false;
    this._currentPickerField = null;
    this._searchQuery = '';
    this._editingItem = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) {
      this._parseConfigFromEntities();
    }
  }

  _parseConfigFromEntities() {
    if (!this.entities) {
      this._config = { header: [], content: [], footer: [] };
      return;
    }

    const config = { header: [], content: [], footer: [] };
    
    // 解析标题项
    if (this.entities.header) {
      config.header.push({
        label: '标题',
        value: this.entities.header,
        icon: this.entities.header_icon || '🏷️'
      });
    }
    
    // 解析内容项
    let index = 1;
    while (this.entities[`content_${index}`]) {
      config.content.push({
        label: this.entities[`content_${index}_label`] || `项目 ${index}`,
        value: this.entities[`content_${index}`],
        icon: this.entities[`content_${index}_icon`] || '📊'
      });
      index++;
    }
    
    // 解析页脚项
    if (this.entities.footer) {
      config.footer.push({
        label: '页脚',
        value: this.entities.footer,
        icon: this.entities.footer_icon || '📄'
      });
    }
    
    this._config = config;
  }

  _getEntitiesFromConfig() {
    const entities = {};
    
    // 标题项
    this._config.header.forEach((item, index) => {
      const key = `header_${index + 1}`;
      entities[key] = item.value;
      entities[`${key}_label`] = item.label;
      entities[`${key}_icon`] = item.icon;
    });
    
    // 内容项
    this._config.content.forEach((item, index) => {
      const key = `content_${index + 1}`;
      entities[key] = item.value;
      entities[`${key}_label`] = item.label;
      entities[`${key}_icon`] = item.icon;
    });
    
    // 页脚项
    this._config.footer.forEach((item, index) => {
      const key = `footer_${index + 1}`;
      entities[key] = item.value;
      entities[`${key}_label`] = item.label;
      entities[`${key}_icon`] = item.icon;
    });
    
    return entities;
  }

  _notifyEntitiesChange() {
    const entities = this._getEntitiesFromConfig();
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderSection('header', '🏷️', '标题', '添加标题项')}
        ${this._renderSection('content', '📊', '内容项', '添加内容项')}
        ${this._renderSection('footer', '📄', '页脚', '添加页脚项')}
        ${this._renderEntityPicker()}
      </div>
    `;
  }

  _renderSection(sectionType, icon, title, addButtonText) {
    const items = this._config[sectionType];
    const isEditing = this._editingItem?.sectionType === sectionType;

    return html`
      <div class="config-section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon">${icon}</span>
            ${title}
          </div>
          <button class="add-button" @click=${() => this._startAddItem(sectionType)}>
            <ha-icon icon="mdi:plus"></ha-icon>
            ${addButtonText}
          </button>
        </div>
        
        <div class="entities-list">
          ${items.length === 0 ? html`
            <div class="empty-state">
              <div class="empty-icon">${icon}</div>
              <div class="empty-text">暂无${title}</div>
            </div>
          ` : items.map((item, index) => 
            this._renderEntityRow(item, index, sectionType)
          )}
        </div>

        ${isEditing ? this._renderEditForm(sectionType) : ''}
      </div>
    `;
  }

  _renderEntityRow(item, index, sectionType) {
    const preview = this._getFieldPreview(item.value);
    const isEditing = this._editingItem?.sectionType === sectionType && this._editingItem?.index === index;

    if (isEditing) return '';

    return html`
      <div class="entity-row">
        <div class="entity-icon">${item.icon}</div>
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-value">${item.value}</div>
          ${preview ? html`<div class="entity-preview">预览: ${preview}</div>` : ''}
        </div>
        <div class="entity-actions">
          <button 
            class="entity-action" 
            @click=${() => this._startEditItem(sectionType, index)}
            title="编辑"
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button 
            class="entity-action" 
            @click=${() => this._removeItem(sectionType, index)}
            title="删除"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderEditForm(sectionType) {
    const editingItem = this._editingItem;
    if (!editingItem || editingItem.sectionType !== sectionType) return '';

    const item = this._config[sectionType][editingItem.index] || { label: '', value: '', icon: '📊' };
    const preview = this._getFieldPreview(item.value);

    return html`
      <div class="edit-form">
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">标签</label>
            <ha-textfield
              .value=${item.label}
              @input=${e => this._updateEditingItem({ label: e.target.value })}
              placeholder="显示名称"
              fullwidth
            ></ha-textfield>
          </div>

          <div class="form-field">
            <label class="form-label">数据源</label>
            <div class="field-with-preview">
              <div class="field-inputs">
                <ha-textfield
                  .value=${item.value}
                  @input=${e => this._updateEditingItem({ value: e.target.value })}
                  placeholder="实体ID或模板"
                  fullwidth
                ></ha-textfield>
                <button 
                  class="entity-picker-btn" 
                  @click=${() => this._showEntityPickerFor(sectionType)}
                  title="选择实体"
                >
                  <ha-icon icon="mdi:magnify"></ha-icon>
                </button>
              </div>
              <div class="field-preview">${preview || '(空值)'}</div>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">图标</label>
            <div class="icon-picker">
              <div class="icon-display">${item.icon}</div>
              <select 
                class="icon-select"
                .value=${item.icon}
                @change=${e => this._updateEditingItem({ icon: e.target.value })}
              >
                ${this._getCommonIcons().map(icon => html`
                  <option value=${icon}>${icon}</option>
                `)}
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-button" @click=${this._cancelEdit}>取消</button>
          <button class="save-button" @click=${this._saveEdit}>保存</button>
        </div>
      </div>
    `;
  }

  _renderEntityPicker() {
    if (!this._showEntityPicker) return '';

    const entities = this._getFilteredEntities();
    const templates = [
      { name: '当前时间', value: "{{ now().strftime('%H:%M') }}" },
      { name: '今日日期', value: "{{ now().strftime('%Y-%m-%d') }}" },
      { name: '实体状态', value: "{{ states('entity_id') }}" },
      { name: '实体属性', value: "{{ state_attr('entity_id', 'attribute') }}" }
    ];

    return html`
      <div class="entity-picker-overlay" @click=${this._hideEntityPicker}>
        <div class="entity-picker-dialog" @click=${e => e.stopPropagation()}>
          <div class="picker-header">
            <div class="picker-title">选择实体或模板</div>
            <button class="close-button" @click=${this._hideEntityPicker}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="search-box">
            <ha-textfield
              label="搜索实体..."
              .value=${this._searchQuery}
              @input=${e => this._searchQuery = e.target.value}
              fullwidth
              autofocus
            ></ha-textfield>
          </div>
          
          <div class="entity-list">
            ${entities.map(entity => html`
              <div class="entity-item" @click=${() => this._selectEntity(entity.entity_id)}>
                <ha-icon class="entity-icon" icon=${this._getEntityIcon(entity.entity_id)}></ha-icon>
                <div class="entity-info">
                  <div class="entity-name">${entity.friendly_name}</div>
                  <div class="entity-id">${entity.entity_id}</div>
                </div>
              </div>
            `)}
            
            ${templates.map(template => html`
              <div class="entity-item template-option" @click=${() => this._selectEntity(template.value)}>
                <ha-icon class="entity-icon" icon="mdi:code-braces"></ha-icon>
                <div class="entity-info">
                  <div class="entity-name">${template.name}</div>
                  <div class="entity-id">${template.value}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  _getCommonIcons() {
    return ['📊', '🌡️', '💧', '💡', '⚡', '🚪', '👤', '🕒', '🏠', '📱', '🏷️', '📄', '🔔', '⭐'];
  }

  _getAvailableEntities() {
    if (!this.hass) return [];
    return Object.entries(this.hass.states)
      .map(([entity_id, stateObj]) => ({
        entity_id,
        friendly_name: stateObj.attributes?.friendly_name || entity_id,
        domain: entity_id.split('.')[0]
      }));
  }

  _getFilteredEntities() {
    const entities = this._getAvailableEntities();
    if (!this._searchQuery) return entities.slice(0, 30);
    
    const query = this._searchQuery.toLowerCase();
    return entities.filter(entity => 
      entity.entity_id.toLowerCase().includes(query) || 
      entity.friendly_name.toLowerCase().includes(query)
    ).slice(0, 30);
  }

  _getEntityIcon(entityId) {
    const domain = entityId.split('.')[0];
    const icons = {
      light: 'mdi:lightbulb',
      sensor: 'mdi:gauge',
      switch: 'mdi:power-plug',
      climate: 'mdi:thermostat',
      media_player: 'mdi:television',
      person: 'mdi:account',
      binary_sensor: 'mdi:checkbox-marked-circle',
      input_boolean: 'mdi:toggle-switch',
      automation: 'mdi:robot',
      script: 'mdi:script-text'
    };
    return icons[domain] || 'mdi:circle';
  }

  _getFieldPreview(value) {
    if (!value) return '';
    const parser = getJinjaParser(this.hass);
    return parser.parse(value, '');
  }

  _startAddItem(sectionType) {
    this._editingItem = {
      sectionType,
      index: this._config[sectionType].length,
      isNew: true
    };
    this._config[sectionType].push({ label: '', value: '', icon: '📊' });
  }

  _startEditItem(sectionType, index) {
    this._editingItem = { sectionType, index, isNew: false };
  }

  _updateEditingItem(updates) {
    if (!this._editingItem) return;
    
    const { sectionType, index } = this._editingItem;
    this._config[sectionType][index] = {
      ...this._config[sectionType][index],
      ...updates
    };
    this.requestUpdate();
  }

  _saveEdit() {
    if (!this._editingItem) return;
    
    const { sectionType, index, isNew } = this._editingItem;
    const item = this._config[sectionType][index];
    
    // 验证必填字段
    if (!item.label.trim() || !item.value.trim()) {
      return;
    }
    
    this._editingItem = null;
    this._notifyEntitiesChange();
  }

  _cancelEdit() {
    if (!this._editingItem) return;
    
    const { sectionType, index, isNew } = this._editingItem;
    
    if (isNew) {
      // 如果是新增项，取消时删除
      this._config[sectionType].splice(index, 1);
    }
    
    this._editingItem = null;
    this.requestUpdate();
  }

  _removeItem(sectionType, index) {
    this._config[sectionType].splice(index, 1);
    this._notifyEntitiesChange();
  }

  _showEntityPickerFor(sectionType) {
    this._currentPickerField = sectionType;
    this._showEntityPicker = true;
    this._searchQuery = '';
  }

  _hideEntityPicker() {
    this._showEntityPicker = false;
    this._currentPickerField = null;
    this._searchQuery = '';
  }

  _selectEntity(entityValue) {
    if (this._editingItem && this._currentPickerField) {
      this._updateEditingItem({ value: entityValue });
    }
    this._hideEntityPicker();
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}