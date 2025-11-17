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
    _showEntityPicker: { state: true },
    _currentPickerField: { state: true },
    _searchQuery: { state: true },
    _filteredEntities: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      /* 紧凑的卡片设计 */
      .config-section {
        background: var(--card-background-color, #ffffff);
        border-radius: 12px;
        padding: 0;
        margin-bottom: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .config-section:last-child {
        margin-bottom: 0;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--secondary-background-color, #f8f9fa);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        min-height: 52px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .section-header:hover {
        background: var(--primary-color, #03a9f4);
        color: white;
      }

      .section-header:hover .section-title,
      .section-header:hover .section-icon {
        color: white;
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: color 0.2s ease;
      }

      .section-icon {
        font-size: 16px;
        opacity: 0.8;
        transition: color 0.2s ease;
      }

      .section-count {
        background: var(--primary-color, #03a9f4);
        color: white;
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        margin-left: 6px;
      }

      .add-button {
        background: transparent;
        color: var(--primary-color, #03a9f4);
        border: 1px solid var(--primary-color, #03a9f4);
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
        min-height: 32px;
      }

      .add-button:hover {
        background: var(--primary-color, #03a9f4);
        color: white;
        transform: translateY(-1px);
      }

      /* 实体列表 - 紧凑设计 */
      .entities-list {
        padding: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .section-expanded .entities-list {
        max-height: 1000px;
        padding: 8px 0;
      }

      .entity-row {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--divider-color, #f5f5f5);
        transition: all 0.2s ease;
        min-height: 52px;
        cursor: pointer;
      }

      .entity-row:hover {
        background: var(--secondary-background-color, #f8f9fa);
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
        background: linear-gradient(135deg, var(--primary-color, #03a9f4), var(--accent-color, #ff4081));
        border-radius: 8px;
        margin-right: 12px;
        color: white;
        font-size: 14px;
        flex-shrink: 0;
      }

      .entity-content {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 13px;
        margin-bottom: 2px;
        line-height: 1.3;
      }

      .entity-value {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        word-break: break-all;
        line-height: 1.2;
        opacity: 0.8;
      }

      .entity-preview {
        font-size: 10px;
        color: var(--success-color, #4caf50);
        margin-top: 2px;
        font-weight: 500;
      }

      .entity-actions {
        display: flex;
        gap: 4px;
        margin-left: 8px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .entity-row:hover .entity-actions {
        opacity: 1;
      }

      .entity-action {
        background: transparent;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        color: var(--secondary-text-color, #757575);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        min-height: 28px;
      }

      .entity-action:hover {
        background: var(--error-color, #f44336);
        color: white;
        border-color: var(--error-color, #f44336);
      }

      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 20px 16px;
        color: var(--secondary-text-color, #757575);
      }

      .empty-icon {
        font-size: 32px;
        margin-bottom: 8px;
        opacity: 0.4;
      }

      .empty-text {
        font-size: 13px;
        margin-bottom: 4px;
      }

      .empty-hint {
        font-size: 11px;
        opacity: 0.6;
      }

      /* 编辑表单 - 紧凑布局 */
      .edit-form {
        padding: 12px 16px;
        background: var(--secondary-background-color, #f8f9fa);
        border-top: 1px solid var(--divider-color, #e0e0e0);
        animation: slideDown 0.2s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: start;
        margin-bottom: 12px;
      }

      .form-row:last-child {
        margin-bottom: 0;
      }

      .label-icon-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: start;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-label {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .field-input {
        position: relative;
      }

      .field-input ha-textfield {
        width: 100%;
        --mdc-text-field-fill-color: var(--card-background-color, #ffffff);
        --mdc-text-field-label-ink-color: var(--secondary-text-color, #757575);
      }

      .entity-picker-btn {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        background: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        padding: 4px 6px;
        cursor: pointer;
        color: var(--primary-text-color, #212121);
        transition: all 0.2s ease;
        z-index: 2;
        min-width: 32px;
        min-height: 32px;
      }

      .entity-picker-btn:hover {
        background: var(--primary-color, #03a9f4);
        color: white;
        border-color: var(--primary-color, #03a9f4);
      }

      .field-preview {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        background: var(--card-background-color, #ffffff);
        padding: 4px 8px;
        border-radius: 4px;
        margin-top: 4px;
        border: 1px solid var(--divider-color, #f0f0f0);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }

      .icon-picker {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .icon-display {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.2s ease;
      }

      .icon-select {
        background: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        padding: 6px 8px;
        color: var(--primary-text-color, #212121);
        font-size: 12px;
        min-width: 80px;
        transition: all 0.2s ease;
      }

      .icon-select:focus {
        border-color: var(--primary-color, #03a9f4);
        outline: none;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .cancel-button {
        background: transparent;
        color: var(--secondary-text-color, #757575);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .cancel-button:hover {
        background: var(--secondary-background-color, #f8f9fa);
        color: var(--primary-text-color, #212121);
      }

      .save-button {
        background: var(--primary-color, #03a9f4);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 6px 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .save-button:hover:not(:disabled) {
        background: var(--accent-color, #ff4081);
        transform: translateY(-1px);
      }

      .save-button:disabled {
        background: var(--disabled-color, #bdbdbd);
        cursor: not-allowed;
        transform: none;
      }

      /* 实体选择器 - 紧凑设计 */
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
        padding: 16px;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .entity-picker-dialog {
        background: var(--card-background-color, #ffffff);
        border-radius: 12px;
        width: 100%;
        max-width: 480px;
        max-height: 60vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        animation: scaleIn 0.2s ease-out;
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      .picker-title {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 16px;
      }

      .close-button {
        background: none;
        border: none;
        color: var(--secondary-text-color, #757575);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .close-button:hover {
        background: var(--secondary-background-color, #f8f9fa);
        color: var(--primary-text-color, #212121);
      }

      .search-box {
        padding: 0 20px 12px;
      }

      .entity-list {
        flex: 1;
        overflow-y: auto;
        max-height: 300px;
        padding: 0;
      }

      .entity-item {
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 1px solid var(--divider-color, #f0f0f0);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .entity-item:hover {
        background: var(--secondary-background-color, #f8f9fa);
      }

      .entity-item:last-child {
        border-bottom: none;
      }

      .entity-info {
        flex: 1;
        min-width: 0;
      }

      .entity-picker-name {
        font-weight: 500;
        color: var(--primary-text-color, #212121);
        font-size: 13px;
        margin-bottom: 2px;
        line-height: 1.3;
      }

      .entity-picker-id {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        line-height: 1.2;
      }

      .template-option {
        border-top: 2px solid var(--divider-color, #e0e0e0);
        background: var(--secondary-background-color, #f8f9fa);
      }

      .template-option .entity-picker-name {
        color: var(--primary-color, #03a9f4);
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .label-icon-row {
          grid-template-columns: 1fr;
        }

        .entity-picker-dialog {
          margin: 8px;
          max-height: 70vh;
        }
      }

      /* 深色模式 */
      @media (prefers-color-scheme: dark) {
        .config-section {
          background: var(--dark-card-background-color, #1e1e1e);
          border-color: var(--dark-divider-color, #2a2a2a);
        }

        .section-header {
          background: var(--dark-secondary-background-color, #2a2a2a);
        }

        .entity-row:hover {
          background: var(--dark-secondary-background-color, #2a2a2a);
        }

        .edit-form {
          background: var(--dark-secondary-background-color, #2a2a2a);
        }

        .entity-picker-dialog {
          background: var(--dark-card-background-color, #1e1e1e);
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
    this._showEntityPicker = false;
    this._currentPickerField = null;
    this._searchQuery = '';
    this._filteredEntities = [];
    this._editingItem = null;
    this._expandedSections = new Set(['content']); // 默认展开内容区域
    this._entityCache = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities') && this.entities !== changedProperties.get('entities')) {
      this._parseConfigFromEntities();
    }

    if (changedProperties.has('_searchQuery') || changedProperties.has('hass')) {
      this._updateFilteredEntities();
    }
  }

  _getAvailableEntities() {
    if (!this._entityCache && this.hass) {
      this._entityCache = Object.entries(this.hass.states)
        .map(([entity_id, stateObj]) => ({
          entity_id,
          friendly_name: stateObj.attributes?.friendly_name || entity_id,
          domain: entity_id.split('.')[0],
          icon: stateObj.attributes?.icon || this._getDefaultEntityIcon(entity_id)
        }))
        .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));
    }
    return this._entityCache || [];
  }

  _updateFilteredEntities() {
    const entities = this._getAvailableEntities();
    if (!this._searchQuery) {
      this._filteredEntities = entities.slice(0, 40);
    } else {
      const query = this._searchQuery.toLowerCase();
      this._filteredEntities = entities
        .filter(entity => 
          entity.entity_id.toLowerCase().includes(query) || 
          entity.friendly_name.toLowerCase().includes(query)
        )
        .slice(0, 40);
    }
  }

  _parseConfigFromEntities() {
    if (!this.entities) {
      this._config = { header: [], content: [], footer: [] };
      return;
    }

    const config = { header: [], content: [], footer: [] };
    
    Object.keys(this.entities).forEach(key => {
      if (key.startsWith('header_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('header_', '');
        config.header.push({
          label: this.entities[`header_${index}_label`] || '标题',
          value: this.entities[key],
          icon: this.entities[`header_${index}_icon`] || '🏷️'
        });
      } else if (key.startsWith('content_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('content_', '');
        config.content.push({
          label: this.entities[`content_${index}_label`] || `项目 ${index}`,
          value: this.entities[key],
          icon: this.entities[`content_${index}_icon`] || '📊'
        });
      } else if (key.startsWith('footer_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('footer_', '');
        config.footer.push({
          label: this.entities[`footer_${index}_label`] || '页脚',
          value: this.entities[key],
          icon: this.entities[`footer_${index}_icon`] || '📄'
        });
      }
    });

    this._config = config;
  }

  _getEntitiesFromConfig() {
    const entities = {};
    
    ['header', 'content', 'footer'].forEach(sectionType => {
      this._config[sectionType].forEach((item, index) => {
        const baseKey = `${sectionType}_${index + 1}`;
        entities[baseKey] = item.value;
        entities[`${baseKey}_label`] = item.label;
        entities[`${baseKey}_icon`] = item.icon;
      });
    });
    
    return entities;
  }

  _notifyEntitiesChange() {
    const entities = this._getEntitiesFromConfig();
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }

  _toggleSection(sectionType) {
    if (this._expandedSections.has(sectionType)) {
      this._expandedSections.delete(sectionType);
    } else {
      this._expandedSections.add(sectionType);
    }
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderSection('header', '🏷️', '标题')}
        ${this._renderSection('content', '📊', '内容项')}
        ${this._renderSection('footer', '📄', '页脚')}
        ${this._renderEntityPicker()}
      </div>
    `;
  }

  _renderSection(sectionType, icon, title) {
    const items = this._config[sectionType];
    const isExpanded = this._expandedSections.has(sectionType);
    const isEditing = this._editingItem?.sectionType === sectionType;

    return html`
      <div class="config-section ${isExpanded ? 'section-expanded' : ''}">
        <div class="section-header" @click=${() => this._toggleSection(sectionType)}>
          <div class="section-title">
            <span class="section-icon">${icon}</span>
            ${title}
            ${items.length > 0 ? html`<span class="section-count">${items.length}</span>` : ''}
          </div>
          <button class="add-button" @click=${(e) => {
            e.stopPropagation();
            this._startAddItem(sectionType);
          }}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加
          </button>
        </div>
        
        <div class="entities-list">
          ${items.length === 0 ? this._renderEmptyState(icon, title) : 
            items.map((item, index) => this._renderEntityRow(item, index, sectionType))
          }
        </div>

        ${isEditing ? this._renderEditForm(sectionType) : ''}
      </div>
    `;
  }

  _renderEmptyState(icon, title) {
    return html`
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <div class="empty-text">暂无${title}</div>
        <div class="empty-hint">点击"添加"按钮创建</div>
      </div>
    `;
  }

  _renderEntityRow(item, index, sectionType) {
    const preview = this._getFieldPreview(item.value);
    const isEditing = this._editingItem?.sectionType === sectionType && this._editingItem?.index === index;

    if (isEditing) return '';

    return html`
      <div class="entity-row" @click=${() => this._startEditItem(sectionType, index)}>
        <div class="entity-icon">${item.icon}</div>
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-value">${item.value}</div>
          ${preview ? html`<div class="entity-preview">${preview}</div>` : ''}
        </div>
        <div class="entity-actions">
          <button class="entity-action" @click=${(e) => {
            e.stopPropagation();
            this._removeItem(sectionType, index);
          }} title="删除">
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
    const isValid = item.label.trim() && item.value.trim();

    // 自动检测实体信息
    const entityInfo = this._getEntityInfo(item.value);

    return html`
      <div class="edit-form">
        <div class="form-row">
          <div class="label-icon-row">
            <div class="form-field">
              <label class="form-label">标签</label>
              <div class="field-input">
                <ha-textfield
                  .value=${item.label}
                  @input=${e => this._updateEditingItem({ label: e.target.value })}
                  placeholder=${entityInfo.name || "显示名称"}
                  fullwidth
                ></ha-textfield>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">图标</label>
              <div class="icon-picker">
                <div class="icon-display">${item.icon}</div>
                <select class="icon-select" .value=${item.icon} @change=${e => this._updateEditingItem({ icon: e.target.value })}>
                  ${this._getCommonIcons().map(icon => html`<option value=${icon}>${icon}</option>`)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label class="form-label">数据源</label>
            <div class="field-input">
              <ha-textfield
                .value=${item.value}
                @input=${e => {
                  const newValue = e.target.value;
                  this._updateEditingItem({ value: newValue });
                  // 自动更新标签和图标
                  const entityInfo = this._getEntityInfo(newValue);
                  if (entityInfo.name && !item.label) {
                    this._updateEditingItem({ label: entityInfo.name });
                  }
                  if (entityInfo.icon && item.icon === '📊') {
                    this._updateEditingItem({ icon: entityInfo.icon });
                  }
                }}
                placeholder="实体ID或模板"
                fullwidth
              ></ha-textfield>
              <button class="entity-picker-btn" @click=${() => this._showEntityPickerFor(sectionType)} title="选择实体">
                <ha-icon icon="mdi:magnify"></ha-icon>
              </button>
            </div>
            <div class="field-preview">${preview || '请输入实体或模板'}</div>
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-button" @click=${this._cancelEdit}>取消</button>
          <button class="save-button" ?disabled=${!isValid} @click=${this._saveEdit}>保存</button>
        </div>
      </div>
    `;
  }

  _renderEntityPicker() {
    if (!this._showEntityPicker) return '';

    const templates = [
      { name: '当前时间', value: "{{ now().strftime('%H:%M') }}", icon: '🕒' },
      { name: '今日日期', value: "{{ now().strftime('%Y-%m-%d') }}", icon: '📅' },
      { name: '实体状态', value: "{{ states('entity_id') }}", icon: '📊' },
      { name: '实体属性', value: "{{ state_attr('entity_id', 'attribute') }}", icon: '🔧' }
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
            ${this._filteredEntities.map(entity => html`
              <div class="entity-item" @click=${() => this._selectEntity(entity)}>
                <ha-icon class="entity-icon" icon=${entity.icon}></ha-icon>
                <div class="entity-info">
                  <div class="entity-picker-name">${entity.friendly_name}</div>
                  <div class="entity-picker-id">${entity.entity_id}</div>
                </div>
              </div>
            `)}
            
            ${templates.map(template => html`
              <div class="entity-item template-option" @click=${() => this._selectEntity(template)}>
                <div class="entity-icon">${template.icon}</div>
                <div class="entity-info">
                  <div class="entity-picker-name">${template.name}</div>
                  <div class="entity-picker-id">${template.value}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  _getEntityInfo(entityValue) {
    if (!entityValue || !this.hass) return { name: '', icon: '📊' };
    
    // 如果是实体ID
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      const entity = this.hass.states[entityValue];
      return {
        name: entity.attributes?.friendly_name || entityValue,
        icon: this._getDefaultEntityIcon(entityValue)
      };
    }
    
    // 如果是模板，尝试提取实体信息
    const entityMatch = entityValue.match(/states\(['"]([^'"]+)['"]\)/) || 
                       entityValue.match(/state_attr\(['"]([^'"]+)['"]/) ||
                       entityValue.match(/states\.([^ }\.|]+)/);
    
    if (entityMatch && this.hass.states[entityMatch[1]]) {
      const entity = this.hass.states[entityMatch[1]];
      return {
        name: entity.attributes?.friendly_name || entityMatch[1],
        icon: this._getDefaultEntityIcon(entityMatch[1])
      };
    }
    
    return { name: '', icon: '📊' };
  }

  _getDefaultEntityIcon(entityId) {
    const domain = entityId.split('.')[0];
    const icons = {
      light: '💡',
      sensor: '📊',
      switch: '🔌',
      climate: '🌡️',
      media_player: '📺',
      person: '👤',
      binary_sensor: '🔲',
      input_boolean: '⚙️',
      automation: '🤖',
      script: '📜',
      device_tracker: '📍',
      camera: '📷',
      cover: '🪟',
      fan: '💨',
      lock: '🔒',
      vacuum: '🧹',
      water_heater: '🔥'
    };
    return icons[domain] || '📊';
  }

  _getCommonIcons() {
    return ['📊', '🌡️', '💧', '💡', '⚡', '🚪', '👤', '🕒', '🏠', '📱', '🏷️', '📄', '🔔', '⭐', '🎯', '📈', '🔋', '📡', '🔒', '🛏️'];
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
    this._expandedSections.add(sectionType);
    this.requestUpdate();
  }

  _startEditItem(sectionType, index) {
    this._editingItem = { sectionType, index, isNew: false };
    this.requestUpdate();
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
    
    const { sectionType, index } = this._editingItem;
    const item = this._config[sectionType][index];
    
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

  _selectEntity(entity) {
    if (this._editingItem && this._currentPickerField) {
      const entityInfo = typeof entity === 'string' ? 
        this._getEntityInfo(entity) : 
        { name: entity.friendly_name, icon: this._getDefaultEntityIcon(entity.entity_id) };
      
      const newItem = {
        value: typeof entity === 'string' ? entity : entity.entity_id,
        label: entityInfo.name,
        icon: entityInfo.icon
      };
      
      this._updateEditingItem(newItem);
    }
    this._hideEntityPicker();
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}