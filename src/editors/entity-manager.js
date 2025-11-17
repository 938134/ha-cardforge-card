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
        font-size: 16px;
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

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
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
            <span>${icon}</span>
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
      <div class="entity-row">
        <div class="entity-icon">${item.icon}</div>
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-value">${item.value}</div>
        </div>
        <div class="entity-actions">
          <button @click=${() => this._startEditItem(sectionType, index)}>编辑</button>
          <button @click=${() => this._removeItem(sectionType, index)}>删除</button>
        </div>
      </div>
    `;
  }

  _renderEditForm(sectionType) {
    const editingItem = this._editingItem;
    if (!editingItem || editingItem.sectionType !== sectionType) return '';

    const item = this._config[sectionType][editingItem.index] || { label: '', value: '', icon: '📊' };
    const entityInfo = this._getEntityInfo(item.value);

    return html`
      <div class="edit-form">
        <div class="form-field">
          <label>显示名称</label>
          <ha-textfield
            .value=${item.label}
            @input=${e => this._updateEditingItem({ label: e.target.value })}
            placeholder=${entityInfo.name || "显示名称"}
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-field">
          <label>数据源</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${item.value}
            @value-changed=${e => {
              const newValue = e.detail.value;
              this._updateEditingItem({ value: newValue });
              // 自动填充实体信息
              const entityInfo = this._getEntityInfo(newValue);
              if (entityInfo.name && !item.label) {
                this._updateEditingItem({ label: entityInfo.name });
              }
              if (entityInfo.icon && item.icon === '📊') {
                this._updateEditingItem({ icon: entityInfo.icon });
              }
            }}
            allow-custom-value
            fullwidth
          ></ha-entity-picker>
        </div>

        <div class="form-field">
          <label>图标</label>
          <ha-textfield
            .value=${item.icon}
            @input=${e => this._updateEditingItem({ icon: e.target.value })}
            placeholder="选择图标"
            fullwidth
          ></ha-textfield>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
            常用图标: 📊 🌡️ 💧 💡 ⚡ 🚪 👤 🕒 🏠 📱
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
    if (!entityValue || !this.hass) return { name: '', icon: '📊' };
    
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      const entity = this.hass.states[entityValue];
      return {
        name: entity.attributes?.friendly_name || entityValue,
        icon: this._getDefaultEntityIcon(entityValue)
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
      script: '📜'
    };
    return icons[domain] || '📊';
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
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}