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

      /* 简洁的卡片设计 */
      .config-section {
        background: var(--card-background-color, #ffffff);
        border-radius: 12px;
        padding: 0;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow: hidden;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: var(--secondary-background-color, #f8f9fa);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .section-icon {
        font-size: 20px;
        opacity: 0.8;
      }

      .add-button {
        background: var(--primary-color, #03a9f4);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        min-height: 36px;
      }

      .add-button:hover {
        background: var(--accent-color, #ff4081);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }

      .add-button:active {
        transform: translateY(0);
      }

      /* 实体列表 */
      .entities-list {
        padding: 0;
      }

      .entity-row {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color, #f0f0f0);
        transition: all 0.2s ease;
        min-height: 68px;
        cursor: pointer;
      }

      .entity-row:hover {
        background: var(--secondary-background-color, #f8f9fa);
        transform: translateX(4px);
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
        background: linear-gradient(135deg, var(--primary-color, #03a9f4), var(--accent-color, #ff4081));
        border-radius: 10px;
        margin-right: 16px;
        color: white;
        font-size: 18px;
        flex-shrink: 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .entity-content {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 14px;
        margin-bottom: 4px;
        line-height: 1.3;
      }

      .entity-value {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        word-break: break-all;
        line-height: 1.4;
        opacity: 0.8;
      }

      .entity-preview {
        font-size: 11px;
        color: var(--success-color, #4caf50);
        margin-top: 4px;
        font-weight: 500;
      }

      .entity-actions {
        display: flex;
        gap: 4px;
        margin-left: 12px;
        flex-shrink: 0;
      }

      .entity-action {
        background: transparent;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 6px;
        padding: 8px;
        cursor: pointer;
        color: var(--secondary-text-color, #757575);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        min-height: 36px;
      }

      .entity-action:hover {
        background: var(--primary-color, #03a9f4);
        color: white;
        border-color: var(--primary-color, #03a9f4);
        transform: scale(1.05);
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text-color, #757575);
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.4;
      }

      .empty-text {
        font-size: 15px;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .empty-hint {
        font-size: 13px;
        opacity: 0.7;
      }

      /* 编辑表单 */
      .edit-form {
        padding: 20px;
        background: var(--secondary-background-color, #f8f9fa);
        border-top: 1px solid var(--divider-color, #e0e0e0);
        animation: slideDown 0.2s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 16px;
        align-items: start;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-label {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .field-input {
        position: relative;
      }

      .field-input ha-textfield {
        width: 100%;
      }

      .entity-picker-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        padding: 6px 8px;
        cursor: pointer;
        color: var(--primary-text-color, #212121);
        transition: all 0.2s ease;
        z-index: 2;
      }

      .entity-picker-btn:hover {
        background: var(--primary-color, #03a9f4);
        color: white;
        border-color: var(--primary-color, #03a9f4);
      }

      .field-preview {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        background: var(--card-background-color, #ffffff);
        padding: 6px 10px;
        border-radius: 6px;
        margin-top: 6px;
        border: 1px solid var(--divider-color, #f0f0f0);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }

      .icon-picker {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .icon-display {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, #ffffff);
        border: 2px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        font-size: 20px;
        transition: all 0.2s ease;
      }

      .icon-display:hover {
        border-color: var(--primary-color, #03a9f4);
        transform: scale(1.05);
      }

      .icon-select {
        background: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 6px;
        padding: 10px 12px;
        color: var(--primary-text-color, #212121);
        font-size: 14px;
        min-width: 100px;
        transition: all 0.2s ease;
      }

      .icon-select:focus {
        border-color: var(--primary-color, #03a9f4);
        outline: none;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .cancel-button {
        background: transparent;
        color: var(--secondary-text-color, #757575);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 6px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
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
        border-radius: 6px;
        padding: 10px 24px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .save-button:hover:not(:disabled) {
        background: var(--accent-color, #ff4081);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .save-button:disabled {
        background: var(--disabled-color, #bdbdbd);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      /* 实体选择器 */
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
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .entity-picker-dialog {
        background: var(--card-background-color, #ffffff);
        border-radius: 16px;
        width: 100%;
        max-width: 500px;
        max-height: 70vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: scaleIn 0.2s ease-out;
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
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
        padding: 20px 24px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      .picker-title {
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        font-size: 18px;
      }

      .close-button {
        background: none;
        border: none;
        color: var(--secondary-text-color, #757575);
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .close-button:hover {
        background: var(--secondary-background-color, #f8f9fa);
        color: var(--primary-text-color, #212121);
      }

      .search-box {
        padding: 0 24px 16px;
      }

      .entity-list {
        flex: 1;
        overflow-y: auto;
        max-height: 400px;
        padding: 0;
      }

      .entity-item {
        padding: 14px 24px;
        cursor: pointer;
        border-bottom: 1px solid var(--divider-color, #f0f0f0);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .entity-item:hover {
        background: var(--secondary-background-color, #f8f9fa);
        transform: translateX(4px);
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
        font-size: 14px;
        margin-bottom: 2px;
        line-height: 1.3;
      }

      .entity-picker-id {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        line-height: 1.4;
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
        .form-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .entity-picker-dialog {
          margin: 10px;
          max-height: 80vh;
        }

        .section-header {
          padding: 14px 16px;
        }

        .entity-row {
          padding: 14px 16px;
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
    this._entityCache = null;
    this._entityCacheTime = 0;
  }

  willUpdate(changedProperties) {
    // 性能优化：只在 entities 真正变化时解析
    if (changedProperties.has('entities') && this.entities !== changedProperties.get('entities')) {
      this._parseConfigFromEntities();
    }

    // 优化实体搜索
    if (changedProperties.has('_searchQuery') || changedProperties.has('hass')) {
      this._updateFilteredEntities();
    }
  }

  // 性能优化：缓存实体列表
  _getAvailableEntities() {
    const now = Date.now();
    if (!this._entityCache || now - this._entityCacheTime > 5000) { // 5秒缓存
      this._entityCache = this.hass ? Object.entries(this.hass.states)
        .map(([entity_id, stateObj]) => ({
          entity_id,
          friendly_name: stateObj.attributes?.friendly_name || entity_id,
          domain: entity_id.split('.')[0]
        }))
        .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name)) : [];
      this._entityCacheTime = now;
    }
    return this._entityCache;
  }

  _updateFilteredEntities() {
    const entities = this._getAvailableEntities();
    if (!this._searchQuery) {
      this._filteredEntities = entities.slice(0, 50); // 限制数量
    } else {
      const query = this._searchQuery.toLowerCase();
      this._filteredEntities = entities
        .filter(entity => 
          entity.entity_id.toLowerCase().includes(query) || 
          entity.friendly_name.toLowerCase().includes(query)
        )
        .slice(0, 50);
    }
  }

  _parseConfigFromEntities() {
    if (!this.entities) {
      this._config = { header: [], content: [], footer: [] };
      return;
    }

    const config = { header: [], content: [], footer: [] };
    
    // 使用更高效的方式解析
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
    
    // 使用更简洁的序列化方式
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

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderSection('header', '🏷️', '标题', '添加标题')}
        ${this._renderSection('content', '📊', '内容项', '添加内容')}
        ${this._renderSection('footer', '📄', '页脚', '添加页脚')}
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
        <div class="empty-hint">点击上方按钮添加</div>
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

    return html`
      <div class="edit-form">
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">标签</label>
            <div class="field-input">
              <ha-textfield
                .value=${item.label}
                @input=${e => this._updateEditingItem({ label: e.target.value })}
                placeholder="显示名称"
                fullwidth
              ></ha-textfield>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">数据源</label>
            <div class="field-input">
              <ha-textfield
                .value=${item.value}
                @input=${e => this._updateEditingItem({ value: e.target.value })}
                placeholder="实体ID或模板"
                fullwidth
              ></ha-textfield>
              <button class="entity-picker-btn" @click=${() => this._showEntityPickerFor(sectionType)} title="选择实体">
                <ha-icon icon="mdi:magnify"></ha-icon>
              </button>
            </div>
            <div class="field-preview">${preview || '请输入实体或模板'}</div>
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
            ${this._filteredEntities.map(entity => html`
              <div class="entity-item" @click=${() => this._selectEntity(entity.entity_id)}>
                <ha-icon class="entity-icon" icon=${this._getEntityIcon(entity.entity_id)}></ha-icon>
                <div class="entity-info">
                  <div class="entity-picker-name">${entity.friendly_name}</div>
                  <div class="entity-picker-id">${entity.entity_id}</div>
                </div>
              </div>
            `)}
            
            ${templates.map(template => html`
              <div class="entity-item template-option" @click=${() => this._selectEntity(template.value)}>
                <ha-icon class="entity-icon" icon="mdi:code-braces"></ha-icon>
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

  _getCommonIcons() {
    return ['📊', '🌡️', '💧', '💡', '⚡', '🚪', '👤', '🕒', '🏠', '📱', '🏷️', '📄', '🔔', '⭐', '🎯', '📈', '🔋', '🌡️'];
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
      script: 'mdi:script-text',
      device_tracker: 'mdi:account',
      camera: 'mdi:camera',
      cover: 'mdi:window-open'
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