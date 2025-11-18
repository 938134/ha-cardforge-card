// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    entities: { type: Object },
    _config: { state: true },
    _expandedSections: { state: true },
    _editingItem: { state: true }
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

      .data-source-input {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }

      .data-source-input ha-textfield {
        flex: 1;
      }

      .entity-picker-btn {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        color: var(--primary-text-color);
        margin-top: 16px;
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
    `
  ];

  constructor() {
    super();
    this._config = { header: [], content: [], footer: [] };
    this._expandedSections = new Set(['content']);
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
    
    Object.keys(this.entities).forEach(key => {
      if (key.startsWith('header_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('header_', '');
        config.header.push({
          label: this.entities[`header_${index}_label`] || '标题',
          value: this.entities[key],
          icon: this.entities[`header_${index}_icon`] || 'mdi:format-title'
        });
      } else if (key.startsWith('content_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('content_', '');
        config.content.push({
          label: this.entities[`content_${index}_label`] || `项目 ${index}`,
          value: this.entities[key],
          icon: this.entities[`content_${index}_icon`] || 'mdi:chart-box'
        });
      } else if (key.startsWith('footer_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('footer_', '');
        config.footer.push({
          label: this.entities[`footer_${index}_label`] || '页脚',
          value: this.entities[key],
          icon: this.entities[`footer_${index}_icon`] || 'mdi:file-document'
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
        ${this._renderSection('header', 'mdi:format-title', '标题')}
        ${this._renderSection('content', 'mdi:chart-box', '内容项')}
        ${this._renderSection('footer', 'mdi:file-document', '页脚')}
      </div>
    `;
  }

  _renderSection(sectionType, icon, title) {
    const items = this._config[sectionType];
    const isExpanded = this._expandedSections.has(sectionType);
    const isEditing = this._editingItem?.sectionType === sectionType;

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection(sectionType)}>
          <div class="section-title">
            <ha-icon .icon=${icon}></ha-icon>
            ${title}
            ${items.length > 0 ? html`<span class="section-count">${items.length}</span>` : ''}
          </div>
          <button class="add-button" @click=${(e) => {
            e.stopPropagation();
            this._startAddItem(sectionType);
          }}>
            添加
          </button>
        </div>
        
        ${isExpanded ? html`
          <div class="entities-list">
            ${items.length === 0 ? html`
              <div class="empty-state">暂无${title}</div>
            ` : items.map((item, index) => this._renderEntityRow(item, index, sectionType))}
          </div>
        ` : ''}

        ${isEditing ? this._renderEditForm(sectionType) : ''}
      </div>
    `;
  }

  _renderEntityRow(item, index, sectionType) {
    const isEditing = this._editingItem?.sectionType === sectionType && this._editingItem?.index === index;

    if (isEditing) return '';

    return html`
      <div class="entity-row" @click=${() => this._startEditItem(sectionType, index)}>
        <div class="entity-icon">
          <ha-icon .icon=${item.icon}></ha-icon>
        </div>
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-value">${item.value}</div>
        </div>
        <div class="entity-actions">
          <button @click=${(e) => {
            e.stopPropagation();
            this._removeItem(sectionType, index);
          }}>删除</button>
        </div>
      </div>
    `;
  }

  _renderEditForm(sectionType) {
    const editingItem = this._editingItem;
    if (!editingItem || editingItem.sectionType !== sectionType) return '';

    const item = this._config[sectionType][editingItem.index] || { label: '', value: '', icon: 'mdi:chart-box' };
    const entityInfo = this._getEntityInfo(item.value);
    const currentIcon = item.icon || entityInfo.icon || 'mdi:chart-box';

    return html`
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">显示名称</label>
          <ha-textfield
            .value=${item.label}
            @input=${e => this._updateEditingItem({ label: e.target.value })}
            placeholder=${entityInfo.name || "显示名称"}
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-field">
          <label class="form-label">数据源</label>
          <div class="data-source-input">
            <ha-textfield
              .value=${item.value}
              @input=${e => {
                const newValue = e.target.value;
                this._updateEditingItem({ value: newValue });
                // 自动检测实体信息
                const entityInfo = this._getEntityInfo(newValue);
                if (entityInfo.name && !item.label) {
                  this._updateEditingItem({ label: entityInfo.name });
                }
                if (entityInfo.icon) {
                  this._updateEditingItem({ icon: entityInfo.icon });
                }
              }}
              placeholder="实体ID、Jinja模板或自定义文本"
              fullwidth
            ></ha-textfield>
          </div>
          <button class="entity-picker-btn" @click=${this._showEntityPicker}>
            <ha-icon icon="mdi:magnify"></ha-icon>
            选择实体
          </button>
        </div>

        <div class="form-field">
          <label class="form-label">图标</label>
          <div class="icon-preview">
            <ha-icon .icon=${currentIcon}></ha-icon>
            <span class="icon-preview-text">${currentIcon}</span>
          </div>
          <div style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px;">
            图标会根据数据源自动选择，也支持手动设置 mdi 图标名称
          </div>
        </div>

        <div class="form-actions">
          <button @click=${this._cancelEdit}>取消</button>
          <button 
            @click=${this._saveEdit}
            ?disabled=${!item.label.trim() || !item.value.trim()}
          >保存</button>
        </div>
      </div>
    `;
  }

  _getEntityInfo(entityValue) {
    if (!entityValue || !this.hass) return { name: '', icon: 'mdi:chart-box' };
    
    // 如果是实体ID
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      const entity = this.hass.states[entityValue];
      return {
        name: entity.attributes?.friendly_name || entityValue,
        icon: entity.attributes?.icon || this._getDefaultEntityIcon(entityValue)
      };
    }
    
    // 如果是Jinja模板，尝试提取实体
    const entityMatch = entityValue.match(/states\(['"]([^'"]+)['"]\)/) || 
                       entityValue.match(/state_attr\(['"]([^'"]+)['"]/) ||
                       entityValue.match(/states\.([^ }\.|]+)/);
    
    if (entityMatch && this.hass.states[entityMatch[1]]) {
      const entity = this.hass.states[entityMatch[1]];
      return {
        name: entity.attributes?.friendly_name || entityMatch[1],
        icon: entity.attributes?.icon || this._getDefaultEntityIcon(entityMatch[1])
      };
    }
    
    // 默认图标
    return { name: '', icon: 'mdi:chart-box' };
  }

  _getDefaultEntityIcon(entityId) {
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
      cover: 'mdi:window-open',
      fan: 'mdi:fan',
      lock: 'mdi:lock',
      vacuum: 'mdi:robot-vacuum',
      water_heater: 'mdi:water-boiler'
    };
    return icons[domain] || 'mdi:circle';
  }

  _showEntityPicker() {
    if (!this._editingItem) return;

    // 创建实体选择器
    const entityPicker = document.createElement('ha-entity-picker');
    entityPicker.hass = this.hass;
    entityPicker.allowCustomValue = true;
    
    // 监听实体选择
    entityPicker.addEventListener('value-changed', (e) => {
      const entityId = e.detail.value;
      if (entityId) {
        const entityInfo = this._getEntityInfo(entityId);
        this._updateEditingItem({ 
          value: entityId,
          label: entityInfo.name || entityId,
          icon: entityInfo.icon
        });
      }
      entityPicker.remove();
    });

    // 添加到页面
    document.body.appendChild(entityPicker);
    
    // 打开选择器
    setTimeout(() => {
      entityPicker.focus();
      entityPicker.select();
    }, 100);
  }

  _startAddItem(sectionType) {
    this._editingItem = {
      sectionType,
      index: this._config[sectionType].length,
      isNew: true
    };
    this._config[sectionType].push({ label: '', value: '', icon: 'mdi:chart-box' });
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
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}